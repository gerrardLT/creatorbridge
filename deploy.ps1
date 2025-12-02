# CreatorBridge Vercel 快速部署脚本 (PowerShell)

Write-Host "🚀 CreatorBridge Vercel 部署脚本" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 状态
Write-Host "📋 步骤 1/6: 检查 Git 状态..." -ForegroundColor Yellow
if (-Not (Test-Path ".git")) {
    Write-Host "❌ 错误: 未找到 Git 仓库" -ForegroundColor Red
    Write-Host "运行: git init" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git 仓库已初始化" -ForegroundColor Green
Write-Host ""

# 检查环境变量
Write-Host "📋 步骤 2/6: 检查环境变量文件..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  警告: 未找到 .env 文件" -ForegroundColor Yellow
    Write-Host "请创建 .env 文件并配置必要的环境变量" -ForegroundColor Yellow
}
Write-Host ""

# 运行测试
Write-Host "📋 步骤 3/6: 运行测试..." -ForegroundColor Yellow
npm run test
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 测试失败，请修复后再部署" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 所有测试通过" -ForegroundColor Green
Write-Host ""

# 构建检查
Write-Host "📋 步骤 4/6: 检查构建..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败，请检查错误日志" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 构建成功" -ForegroundColor Green
Write-Host ""

# 提交代码
Write-Host "📋 步骤 5/6: 提交代码..." -ForegroundColor Yellow
git add .
$commitMessage = Read-Host "输入提交信息"
git commit -m "$commitMessage"
Write-Host "✅ 代码已提交" -ForegroundColor Green
Write-Host ""

# 推送到 GitHub
Write-Host "📋 步骤 6/6: 推送到 GitHub..." -ForegroundColor Yellow
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  推送失败，可能需要设置远程仓库" -ForegroundColor Yellow
    Write-Host "运行: git remote add origin https://github.com/你的用户名/creatorbridge.git" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 代码已推送到 GitHub" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 部署准备完成！" -ForegroundColor Green
Write-Host ""
Write-Host "接下来：" -ForegroundColor Cyan
Write-Host "1. 访问 https://vercel.com/dashboard"
Write-Host "2. 点击 'Add New...' → 'Project'"
Write-Host "3. 导入你的 GitHub 仓库"
Write-Host "4. 配置环境变量（参考 .env.production.example）"
Write-Host "5. 点击 'Deploy'"
Write-Host ""
Write-Host "📚 详细步骤请查看: docs/VERCEL_DEPLOYMENT.md" -ForegroundColor Cyan
