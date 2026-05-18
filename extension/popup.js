// popup.js — 微信读书 Cookie 读取 → 写入 extension storage → 通知 LUCERNA 页面

const STORAGE_KEY = 'wereadCookie'
const LUCERNA_URL = 'http://localhost:5173'

function buildCookieString(cookies) {
  return cookies.map(c => `${c.name}=${c.value}`).join('; ')
}

function setStatus(el, text, cls) {
  el.className = 'status ' + cls
  el.textContent = text
}

async function checkLogin() {
  const statusEl = document.getElementById('status')
  const btn = document.getElementById('btn-import')

  const cookies = await chrome.cookies.getAll({ domain: 'weread.qq.com' })
  const hasAuth = cookies.some(c => c.name === 'wr_skey' || c.name === 'weread_skey')

  if (!hasAuth || cookies.length === 0) {
    setStatus(statusEl, '请先在浏览器登录 weread.qq.com（需打开过书架页）', 'status-warn')
    btn.disabled = true
    return false
  }

  setStatus(statusEl, `已检测到微信读书登录态（${cookies.length} 个 Cookie）`, 'status-ok')
  btn.disabled = false
  return true
}

async function sendCookie() {
  const statusEl = document.getElementById('status')
  const resultEl = document.getElementById('result')
  const btn = document.getElementById('btn-import')

  btn.disabled = true
  setStatus(statusEl, '正在发送 Cookie...', 'status-warn')

  try {
    const cookies = await chrome.cookies.getAll({ domain: 'weread.qq.com' })
    const cookieStr = buildCookieString(cookies)

    // 写入 extension storage，由 content script 传递给页面
    await chrome.storage.local.set({ [STORAGE_KEY]: cookieStr })

    // 确保 LUCERNA 页面已打开，并focus它
    const tabs = await chrome.tabs.query({ url: LUCERNA_URL + '/*' })
    if (tabs.length > 0) {
      await chrome.tabs.update(tabs[0].id, { active: true })
    } else {
      await chrome.tabs.create({ url: LUCERNA_URL })
    }

    setStatus(statusEl, 'Cookie 已发送！请在 LUCERNA 页面确认导入。', 'status-ok')
    resultEl.textContent = '切换到 LUCERNA 页面查看同步进度'
  } catch (e) {
    setStatus(statusEl, '发送失败', 'status-err')
    resultEl.textContent = '错误：' + e.message
  } finally {
    btn.disabled = false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkLogin()
  document.getElementById('btn-import').addEventListener('click', sendCookie)
})
