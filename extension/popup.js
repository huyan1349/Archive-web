// popup.js — 直接通过 weread 页面调用 API 验证登录状态
// 🖋 @huyan

console.log('[Popup] 已加载')

var currentCookie = null

function $(id) { return document.getElementById(id) }

// ========== 核心：让 weread 页面内的 content script 直接调 API ==========
function callAPIOnPage(callback) {
  chrome.tabs.query({ url: 'https://weread.qq.com/*' }, function(tabs) {
    if (!tabs || tabs.length === 0) {
      callback(null, '没有 weread.qq.com 标签页')
      return
    }

    chrome.tabs.sendMessage(tabs[0].id, { type: 'call-weread-api' }, function(response) {
      if (chrome.runtime.lastError) {
        callback(null, '通信失败: ' + chrome.runtime.lastError.message + '。请刷新 weread.qq.com 页面')
        return
      }

      if (response && response.apiResult) {
        callback(response.apiResult, null, response.docCookie)
      } else {
        callback(null, 'content script 无响应')
      }
    })
  })
}

// ========== 展示结果 ==========
function showUI(cookie, msg, isOk) {
  currentCookie = cookie

  if (cookie) {
    $('cookie-text').value = cookie
    $('cookie-area').className = 'cookie-area visible'
    $('no-cookie-hint').style.display = 'none'
  } else {
    $('cookie-text').value = ''
    $('cookie-area').className = 'cookie-area'
    $('no-cookie-hint').style.display = 'block'
  }

  $('status').textContent = msg
  $('status').className = 'status ' + (isOk ? 'status-ok' : 'status-err')
}

// ========== 主流程 ==========
function main() {
  showUI(null, '正在验证登录状态...', false)

  callAPIOnPage(function(apiResult, err, docCookie) {
    if (err) {
      // content script 通信失败，给退出方案
      showUI(null, err, false)
      return
    }

    if (apiResult.status === 200) {
      // API 通了！用户的 cookie 有效
      var cookie = docCookie || '(无 document.cookie)'
      showUI(cookie, '✓ 登录有效！已从页面获取 Cookie，可直接粘贴到 LUCERNA', true)
      return
    }

    if (apiResult.status === 401) {
      // API 返回 401 - 登录过期或 cookie 不对
      // 给用户提供手动方案
      showUI(null, '✗ 页面内 API 调用也返回 401，说明登录已过期。请退出重新登录 weread.qq.com', false)
      return
    }

    // 其他错误
    showUI(null, 'API 返回 HTTP ' + apiResult.status + (apiResult.body ? ': ' + apiResult.body.substring(0, 100) : ''), false)
  })
}

// ========== 复制 ==========
$('btn-copy').addEventListener('click', function() {
  if (!currentCookie) return
  var btn = $('btn-copy')
  navigator.clipboard.writeText(currentCookie).then(function() {
    btn.textContent = '已复制 ✓'
    btn.className = 'btn-copy copied'
    setTimeout(function() {
      btn.textContent = '复制 Cookie'
      btn.className = 'btn-copy'
    }, 2000)
  }).catch(function() {
    $('cookie-text').select()
    document.execCommand('copy')
    btn.textContent = '已复制 ✓'
    setTimeout(function() { btn.textContent = '复制 Cookie' }, 2000)
  })
})

$('btn-refresh').addEventListener('click', main)

// ========== 启动 ==========
main()
