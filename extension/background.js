// background.js — 微信读书 Cookie 助手
// 🖋 @huyan
// 功能1: webRequest 拦截请求头中的 Cookie
// 功能2: 验证 Cookie 是否可用

var STORAGE_KEY = 'wereadCookie'

// ========== 功能1: webRequest 拦截请求头中的 Cookie ==========
// 这是最准确的方式，拿到的是浏览器实际发送的 Cookie 字符串
chrome.webRequest.onBeforeSendHeaders.addListener(
  function(details) {
    var cookieHeader = null
    if (!details.requestHeaders) return
    for (var i = 0; i < details.requestHeaders.length; i++) {
      if (details.requestHeaders[i].name.toLowerCase() === 'cookie') {
        cookieHeader = details.requestHeaders[i].value
        break
      }
    }
    if (cookieHeader && (cookieHeader.indexOf('wr_skey') >= 0 || cookieHeader.indexOf('wr_vid') >= 0)) {
      console.log('[BG][webRequest] 捕获到 Cookie，长度:', cookieHeader.length)
      chrome.storage.local.set({ wereadCookie: cookieHeader })
    }
  },
  { urls: ['https://weread.qq.com/*', 'https://i.weread.qq.com/*'] },
  ['requestHeaders', 'extraHeaders']
)

// ========== 功能2: 验证 Cookie 是否可用 ==========
// popup 读到 cookie 后发过来，background 直接调用 weread API 验证
// 这是最准确的测试方式——跟 WeReadClient 做同样的事
function testCookieDirect(cookieStr, callback) {
  var url = 'https://i.weread.qq.com/user/notebooks'
  console.log('[BG] 正在直接测试 Cookie，长度:', cookieStr.length)
  console.log('[BG] Cookie 前 100 字符:', cookieStr.substring(0, 100))

  fetch(url, {
    method: 'GET',
    headers: {
      'Cookie': cookieStr,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Referer': 'https://weread.qq.com/',
    },
    credentials: 'omit',
  }).then(function(res) {
    // 读取原始响应文本
    return res.text().then(function(text) {
      console.log('[BG] 测试结果: HTTP', res.status)
      return {
        status: res.status,
        ok: res.ok,
        body: text.substring(0, 200),  // 只取前 200 字符，避免太大
        headers: getSummaryHeaders(res.headers),
      }
    })
  }).then(function(result) {
    callback(result)
  }).catch(function(err) {
    console.log('[BG] 测试失败:', err.message)
    callback({ status: 0, ok: false, error: err.message })
  })
}

function getSummaryHeaders(headers) {
  var important = ['set-cookie', 'content-type', 'x-request-id']
  var map = {}
  important.forEach(function(name) {
    if (headers.get(name)) {
      var val = headers.get(name)
      map[name] = val.length > 80 ? val.substring(0, 80) + '...' : val
    }
  })
  return map
}

// ========== 消息处理 ==========
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // weread 页面 content script 发来的 cookie
  if (request.type === 'weread-page-cookie') {
    console.log('[BG][content] 收到 weread 页面 cookie，长度:', (request.cookie || '').length)
    if (request.cookie && request.cookie.length > 10) {
      chrome.storage.local.set({ wereadCookie: request.cookie })
    }
    sendResponse({ ok: true })
  }

  // 查询存储的 cookie
  if (request.type === 'get-weread-cookie') {
    chrome.storage.local.get(STORAGE_KEY, function(result) {
      sendResponse({ cookie: result[STORAGE_KEY] || null })
    })
    return true
  }

  // 验证 cookie（核心功能）
  if (request.type === 'test-weread-cookie') {
    testCookieDirect(request.cookie, function(result) {
      sendResponse(result)
    })
    return true  // 异步响应
  }

  // 主动触发一次 webRequest 捕获
  // 方法：访问 weread.qq.com 的一个页面，触发请求
  if (request.type === 'trigger-cookie-capture') {
    fetch('https://weread.qq.com/', {
      method: 'HEAD',
      credentials: 'include',
    }).then(function() {
      // 等一小会儿让 webRequest 处理
      setTimeout(function() {
        chrome.storage.local.get(STORAGE_KEY, function(result) {
          sendResponse({ captured: !!result[STORAGE_KEY] })
        })
      }, 500)
    }).catch(function() {
      sendResponse({ captured: false, error: 'fetch failed' })
    })
    return true
  }
})

// ========== 启动时尝试用 cookies API 读取 ==========
chrome.runtime.onInstalled.addListener(function() {
  console.log('[BG] 扩展已安装/更新')
})

console.log('[BG] 服务已启动')
