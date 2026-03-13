#!/bin/bash
# ============================================
# 章节一测试脚本
# 版本：v1.0.0
# ============================================

echo "🧪 开始测试章节一：项目初始化与基础框架搭建"
echo "============================================"

PROJECT_DIR="/root/.openclaw/workspace/projects/末日防线"
ERRORS=0

# 1. 检查文件结构
echo ""
echo "📁 检查文件结构..."
files=(
    "index.html"
    "styles/main.css"
    "scripts/save-manager.js"
    "scripts/game-data.js"
    "scripts/main.js"
)

for file in "${files[@]}"; do
    if [ -f "$PROJECT_DIR/$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
        ((ERRORS++))
    fi
done

# 2. 检查 HTML 语法
echo ""
echo "🔍 检查 HTML 结构..."
if grep -q '<!DOCTYPE html>' "$PROJECT_DIR/index.html"; then
    echo "  ✅ DOCTYPE 声明"
else
    echo "  ❌ DOCTYPE 声明缺失"
    ((ERRORS++))
fi

if grep -q '<canvas id="game-canvas"' "$PROJECT_DIR/index.html"; then
    echo "  ✅ 游戏画布元素"
else
    echo "  ❌ 游戏画布元素缺失"
    ((ERRORS++))
fi

# 3. 检查 CSS
echo ""
echo "🎨 检查 CSS 样式..."
if grep -q ':root' "$PROJECT_DIR/styles/main.css"; then
    echo "  ✅ CSS 变量定义"
else
    echo "  ❌ CSS 变量定义缺失"
    ((ERRORS++))
fi

if grep -q '#game-canvas' "$PROJECT_DIR/styles/main.css"; then
    echo "  ✅ 画布样式"
else
    echo "  ❌ 画布样式缺失"
    ((ERRORS++))
fi

# 4. 检查 JavaScript 语法
echo ""
echo "🔧 检查 JavaScript 语法..."

# 检查 save-manager.js
if node -c "$PROJECT_DIR/scripts/save-manager.js" 2>/dev/null; then
    echo "  ✅ save-manager.js 语法正确"
else
    echo "  ❌ save-manager.js 语法错误"
    ((ERRORS++))
fi

# 检查 game-data.js
if node -c "$PROJECT_DIR/scripts/game-data.js" 2>/dev/null; then
    echo "  ✅ game-data.js 语法正确"
else
    echo "  ❌ game-data.js 语法错误"
    ((ERRORS++))
fi

# 检查 main.js
if node -c "$PROJECT_DIR/scripts/main.js" 2>/dev/null; then
    echo "  ✅ main.js 语法正确"
else
    echo "  ❌ main.js 语法错误"
    ((ERRORS++))
fi

# 5. 检查版本号
echo ""
echo "📌 检查版本号..."
HTML_VERSION=$(grep -oP 'v\d+\.\d+\.\d+' "$PROJECT_DIR/index.html" | head -1)
echo "  HTML 版本：$HTML_VERSION"

if grep -q "this.version = '1.0.0'" "$PROJECT_DIR/scripts/save-manager.js"; then
    echo "  ✅ SaveManager 版本：1.0.0"
else
    echo "  ❌ SaveManager 版本不一致"
    ((ERRORS++))
fi

if grep -q "version = '1.0.0'" "$PROJECT_DIR/scripts/game-data.js"; then
    echo "  ✅ GameData 版本：1.0.0"
else
    echo "  ❌ GameData 版本不一致"
    ((ERRORS++))
fi

# 6. 检查关键功能
echo ""
echo "⚙️  检查关键功能实现..."

if grep -q 'class SaveManager' "$PROJECT_DIR/scripts/save-manager.js"; then
    echo "  ✅ SaveManager 类"
else
    echo "  ❌ SaveManager 类缺失"
    ((ERRORS++))
fi

if grep -q 'save(' "$PROJECT_DIR/scripts/save-manager.js"; then
    echo "  ✅ 存档保存功能"
else
    echo "  ❌ 存档保存功能缺失"
    ((ERRORS++))
fi

if grep -q 'load(' "$PROJECT_DIR/scripts/save-manager.js"; then
    echo "  ✅ 存档加载功能"
else
    echo "  ❌ 存档加载功能缺失"
    ((ERRORS++))
fi

if grep -q 'class GameData' "$PROJECT_DIR/scripts/game-data.js"; then
    echo "  ✅ GameData 类"
else
    echo "  ❌ GameData 类缺失"
    ((ERRORS++))
fi

if grep -q 'init()' "$PROJECT_DIR/scripts/game-data.js"; then
    echo "  ✅ 数据初始化功能"
else
    echo "  ❌ 数据初始化功能缺失"
    ((ERRORS++))
fi

# 总结
echo ""
echo "============================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ 测试全部通过！章节一完成。"
    echo ""
    echo "📊 项目统计:"
    echo "  - 文件数：$(find "$PROJECT_DIR" -type f | wc -l)"
    echo "  - 代码行数：$(find "$PROJECT_DIR" -name '*.js' -o -name '*.css' -o -name '*.html' | xargs wc -l | tail -1)"
    echo "  - 版本号：v1.0.0"
    exit 0
else
    echo "❌ 发现 $ERRORS 个错误，请修复后重试。"
    exit 1
fi
