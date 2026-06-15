#!/bin/bash
# 启动 Chrome 并自动加载 LUCERNA 微信读书扩展
# 只需要运行一次，之后 Chrome 会记住这个扩展

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXT_PATH="$SCRIPT_DIR/extension"

echo "🍃 LUCERNA · 启动 Chrome（含微信读书扩展）"
echo "   扩展路径: $EXT_PATH"
echo ""

# 检查扩展目录是否存在
if [ ! -d "$EXT_PATH" ]; then
  echo "❌ 扩展目录不存在: $EXT_PATH"
  exit 1
fi

# macOS: 用 --load-extension 启动 Chrome（需要关闭所有 Chrome 实例）
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [ ! -f "$CHROME_BIN" ]; then
  echo "❌ 找不到 Chrome，请确认安装路径"
  exit 1
fi

echo "⚠️  请确保 Chrome 已完全退出（包括后台进程）"
echo "   可以先运行: pkill -x 'Google Chrome'"
echo ""
read -p "按回车继续（或 Ctrl+C 取消）..."

# 启动 Chrome，加载扩展
"$CHROME_BIN" \
  --load-extension="$EXT_PATH" \
  --disable-extensions-except="$EXT_PATH" \
  --new-window "http://localhost:5173" 2>/dev/null &

echo "✅ Chrome 已启动，扩展已加载"
echo "   扩展图标应出现在工具栏右上角"
