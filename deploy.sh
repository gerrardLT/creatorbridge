#!/bin/bash

# CreatorBridge Vercel 快速部署脚本

echo "🚀 CreatorBridge Vercel 部署脚本"
echo "=================================="
echo ""

# 检查 Git 状态
echo "📋 步骤 1/6: 检查 Git 状态..."
if [ ! -d ".git" ]; then
    echo "❌ 错误: 未找到 Git 仓库"
    echo "运行: git init"
    exit 1
fi
echo "✅ Git 仓库已初始化"
echo ""

# 检查环境变量
echo "📋 步骤 2/6: 检查环境变量文件..."
if [ ! -f ".env" ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "请创建 .env 文件并配置必要的环境变量"
fi
echo ""

# 运行测试
echo "📋 步骤 3/6: 运行测试..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ 测试失败，请修复后再部署"
    exit 1
fi
echo "✅ 所有测试通过"
echo ""

# 构建检查
echo "📋 步骤 4/6: 检查构建..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ 构建失败，请检查错误日志"
    exit 1
fi
echo "✅ 构建成功"
echo ""

# 提交代码
echo "📋 步骤 5/6: 提交代码..."
git add .
read -p "输入提交信息: " commit_message
git commit -m "$commit_message"
echo "✅ 代码已提交"
echo ""

# 推送到 GitHub
echo "📋 步骤 6/6: 推送到 GitHub..."
git push
if [ $? -ne 0 ]; then
    echo "⚠️  推送失败，可能需要设置远程仓库"
    echo "运行: git remote add origin https://github.com/你的用户名/creatorbridge.git"
    exit 1
fi
echo "✅ 代码已推送到 GitHub"
echo ""

echo "🎉 部署准备完成！"
echo ""
echo "接下来："
echo "1. 访问 https://vercel.com/dashboard"
echo "2. 点击 'Add New...' → 'Project'"
echo "3. 导入你的 GitHub 仓库"
echo "4. 配置环境变量（参考 .env.production.example）"
echo "5. 点击 'Deploy'"
echo ""
echo "📚 详细步骤请查看: docs/VERCEL_DEPLOYMENT.md"
