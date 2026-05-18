// content.js — 将 extension 存储的微信读书 Cookie 传递给 LUCERNA 页面

const STORAGE_KEY = 'wereadCookie'

function pollStorage() {
  chrome.storage.local.get(STORAGE_KEY, (result) => {
    const cookie = result[STORAGE_KEY]
    if (!cookie) return

    // 发送给页面中的 React 应用
    window.dispatchEvent(
      new CustomEvent('lucerna:weread-cookie', { detail: { cookie } })
    )

    // 监听页面处理完成的信号，然后清除 storage
    window.addEventListener('lucerna:weread-cookie-processed', () => {
      chrome.storage.local.remove(STORAGE_KEY)
    }, { once: true })
  })
}

// 初始检查
pollStorage()

// 监听 storage 变化（popup 写入时触发）
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) {
    pollStorage()
  }
})
