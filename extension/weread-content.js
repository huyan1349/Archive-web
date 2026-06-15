// weread-content.js — 在 weread.qq.com 页面中运行
// 🖋 @huyan
// 核心功能：直接调用 WeRead API，浏览器自动处理 cookie

(function() {
  console.log('[WereadContent] 已加载到 weread.qq.com')

  // ========== 核心：直接调用 WeRead API ==========
  // 从 weread.qq.com 页面直接请求 i.weread.qq.com API
  // 浏览器会自动带上正确的 cookie（包括 httpOnly，不包括 SameSite=Strict 的）
  function callWereadAPI(callback) {
    var apiUrl = 'https://i.weread.qq.com/user/notebooks'
    console.log('[WereadContent] 直接请求 API:', apiUrl)

    fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
      },
    }).then(function(res) {
      // 先读 Set-Cookie（如果有新的 wr_skey）
      var setCookie = res.headers.get('set-cookie')
      return res.text().then(function(text) {
        console.log('[WereadContent] API 结果: HTTP', res.status, '响应长度:', text.length)
        if (setCookie) {
          console.log('[WereadContent] Set-Cookie:', setCookie.substring(0, 100))
        }
        callback({
          status: res.status,
          ok: res.ok,
          body: text.substring(0, 500),
          setCookie: setCookie ? setCookie.substring(0, 200) : null,
        })
      })
    }).catch(function(err) {
      console.log('[WereadContent] API 请求失败:', err.message)
      callback({ status: 0, ok: false, error: err.message })
    })
  }

  // ========== 页面加载后自动尝试 ==========
  // 自动调用一次唤醒会话
  setTimeout(function() {
    callWereadAPI(function(result) {
      console.log('[WereadContent] 预请求结果:', result.status)
    })
  }, 500)

  // ========== 监听消息 ==========
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'get-doc-cookie') {
      sendResponse({ cookie: document.cookie })
    }

    if (request.type === 'call-weread-api') {
      callWereadAPI(function(result) {
        sendResponse({
          apiResult: result,
          docCookie: document.cookie,
        })
      })
      return true
    }

    if (request.type === 'trigger-capture') {
      // 发一个同域请求让 webRequest 捕获 cookie
      fetch('https://weread.qq.com/web/user/notebooks', {
        credentials: 'include'
      }).catch(function() {}).then(function() {
        // 延迟一下等 webRequest 处理完
        setTimeout(function() {
          chrome.storage.local.get('wereadCookie', function(storage) {
            sendResponse({
              storedCookie: storage.wereadCookie || null,
              docCookie: document.cookie,
            })
          })
        }, 300)
      })
      return true
    }
  })
})()
