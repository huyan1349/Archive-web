# LUCERNA · 微信读书一键导入扩展

## 安装步骤

1. 打开 Chrome / Edge 浏览器
2. 地址栏输入：`chrome://extensions`（Edge 用 `edge://extensions`）
3. 右上角打开「开发者模式」
4. 点击「加载已解压的扩展」
5. 选择本项目下的 `extension/` 文件夹
6. 扩展安装完成，工具栏会出现 LUCERNA 图标

## 使用步骤

1. 在浏览器中打开 [weread.qq.com](https://weread.qq.com) 并登录
2. 打开 LUCERNA 应用（`npm run dev` 后访问 localhost）
3. 点击浏览器工具栏中的 LUCERNA 扩展图标
4. 在弹出的窗口中点击「导入到 LUCERNA」
5. 等待同步完成，数据会自动写入 LUCERNA

## 原理

扩展读取你在 weread.qq.com 的登录 Cookie，
通过 `chrome.storage.local` 传递给 LUCERNA 页面，
页面收到后自动启动同步，无需手动粘贴 Cookie。

## 常见问题

**扩展显示「请先登录」：**
→ 确保已在 weread.qq.com 登录，且打开过书架页面（触发 Cookie 写入）。

**点击导入后没反应：**
→ 确保 LUCERNA 本地服务正在运行（`npm run dev`）。

**同步报错：**
→ 微信读书的 Cookie 可能已过期，重新登录 weread.qq.com 后再试。
