// lucerna-content.js — 在 LUCERNA 页面中运行，接收 extension 传来的微信读书 Cookie
// 🖋 @huyan
//
// 关键：Chrome 扩展 content script 运行在"隔离世界"，
// 直接 dispatchEvent / 设置 window 属性 → 页面 JavaScript 收不到！
// 解决方案：通过注入 <script> 标签到页面上下文来发送事件

var STORAGE_KEY = 'wereadCookie'

// ====== 核心：在页面上下文中发送事件 ======
function sendToPage(cookie) {
  if (!cookie) return
  console.log('[LucernaContent] 准备发送 cookie 到页面，长度：', cookie.length)

  // 方法1: 注入 <script> 标签到页面上下文（最可靠，绕过隔离世界）
  // 这样 CustomEvent 在页面 JavaScript 的执行环境中触发
  try {
    // 转义 cookie 字符串中的特殊字符，防止注入问题
    var escapedCookie = cookie.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '')
    var code = [
      '(function() {',
      '  try {',
      '    var cookie = "' + escapedCookie + '";',
      '    window.__wereadCookie = cookie;',
      '    window.dispatchEvent(new CustomEvent("lucerna:weread-cookie", { detail: { cookie: cookie } }));',
      '    console.log("[Page] 已接收 extension 传来的 cookie，长度: " + cookie.length);',
      '  } catch(e) {',
      '    console.error("[Page] 接收 cookie 失败:", e);',
      '  }',
      '})();'
    ].join('\n')

    var script = document.createElement('script')
    script.textContent = code
    ;(document.head || document.documentElement).appendChild(script)
    script.remove()
    console.log('[LucernaContent] ✓ 已通过注入脚本发送 cookie')
  } catch (e) {
    console.error('[LucernaContent] 注入脚本失败:', e)

    // 方法2 兜底: 用 postMessage
    window.postMessage({ type: 'lucerna:weread-cookie', cookie: cookie }, '*')
    console.log('[LucernaContent] 已通过 postMessage 发送 cookie（兜底）')
  }
}

// 监听 storage 变化（popup/background 写入时触发）
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'local' && changes[STORAGE_KEY]) {
    var newVal = changes[STORAGE_KEY].newValue
    if (newVal) {
      console.log('[LucernaContent] 检测到 storage 变化，准备发送')
      sendToPage(newVal)
    }
  }
})

// 监听页面发出的 ready 信号
window.addEventListener('lucerna:ready', function() {
  console.log('[LucernaContent] 收到 lucerna:ready 信号')
  chrome.storage.local.get(STORAGE_KEY, function(result) {
    if (result[STORAGE_KEY]) {
      sendToPage(result[STORAGE_KEY])
    }
  })
})

// 监听页面处理完成的信号，清除 storage
window.addEventListener('lucerna:weread-cookie-processed', function() {
  chrome.storage.local.remove(STORAGE_KEY, function() {
    console.log('[LucernaContent] storage 已清除')
  })
}, { once: true })

// 监听来自 popup 的直接消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === 'weread-cookie' && request.cookie) {
    console.log('[LucernaContent] 收到 popup 直接消息')
    sendToPage(request.cookie)
    sendResponse({ ok: true })
  }
})

// 初始检查
chrome.storage.local.get(STORAGE_KEY, function(result) {
  if (result[STORAGE_KEY]) {
    console.log('[LucernaContent] 初始检查发现 storage 中有 cookie')
    sendToPage(result[STORAGE_KEY])
  }
})

console.log('[LucernaContent] 已加载（注入脚本通信模式）')
