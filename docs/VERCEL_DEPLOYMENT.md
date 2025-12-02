# Vercel 部署指南

## 📋 部署前准备

### 1. 注册 Vercel 账号
- 访问 [vercel.com](https://vercel.com)
- 使用 GitHub 账号登录（推荐）

### 2. 准备 PostgreSQL 数据库（推荐方案）

#### 方案 A: Vercel Postgres（最简单）
1. 在 Vercel 项目中点击 "Storage" 标签
2. 点击 "Create Database" → 选择 "Postgres"
3. 自动获取 `DATABASE_URL`

#### 方案 B: Neon（推荐，免费额度更高）
1. 访问 [neon.tech](https://neon.tech)
2. 创建免费项目
3. 复制连接字符串（格式：`postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`）

#### 方案 C: Supabase
1. 访问 [supabase.com](https://supabase.com)
2. 创建项目
3. 在 Settings → Database 复制连接字符串

---

## 🚀 部署步骤

### 步骤 1: 推送代码到 GitHub

```bash
# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: ready for Vercel deployment"

# 创建 GitHub 仓库后关联
git remote add origin https://github.com/你的用户名/creatorbridge.git

# 推送
git push -u origin main
```

---

### 步骤 2: 在 Vercel 创建项目

1. **登录 Vercel**
   - 访问 [vercel.com/dashboard](https://vercel.com/dashboard)

2. **导入 Git 仓库**
   - 点击 "Add New..." → "Project"
   - 选择你的 GitHub 仓库 `creatorbridge`
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `.`（默认）
   - **Build Command**: `prisma generate && next build`（已在 package.json 配置）
   - **Output Directory**: `.next`（默认）

---

### 步骤 3: 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

#### 必需变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL 连接字符串 |
| `STORY_RPC_URL` | `https://aeneid.storyrpc.io` | Story Protocol RPC |
| `STORY_PRIVATE_KEY` | `0x你的私钥` | ⚠️ 测试钱包私钥 |
| `NEXT_PUBLIC_CDP_CLIENT_API_KEY` | `你的API密钥` | Coinbase CDP |
| `NEXTAUTH_SECRET` | `随机32位字符串` | NextAuth 密钥 |
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` | 部署后的域名 |

#### 可选变量

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GOLDSKY_API_KEY` | `你的密钥` | Goldsky 索引器 |
| `GOLDSKY_ENDPOINT` | `https://api.goldsky.com/...` | Goldsky 端点 |

#### 详细添加步骤：

**⚠️ 重要：环境变量必须是 Plain Text，不能选择 Secret！**

1. **进入项目设置**
   - 访问 Vercel Dashboard
   - 选择你的项目
   - 点击顶部 **Settings** 标签

2. **打开环境变量页面**
   - 左侧菜单选择 **Environment Variables**

3. **添加 DATABASE_URL（关键步骤）**
   - 点击 **Add New** 按钮
   - **Name**: 输入 `DATABASE_URL`
   - **Value**: 粘贴你的 Neon 连接字符串
     ```
     postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Environment**: 全选（Production、Preview、Development）
   - ⚠️ **不要勾选** "Sensitive" 或选择 Secret
   - 点击 **Save**

4. **添加其他变量**（重复上述步骤）
   - `STORY_RPC_URL`: `https://aeneid.storyrpc.io`
   - `STORY_PRIVATE_KEY`: `0x你的私钥`
   - `NEXT_PUBLIC_CDP_CLIENT_API_KEY`: `你的API密钥`
   - `NEXTAUTH_SECRET`: （使用步骤 4 生成的密钥）
   - `NEXTAUTH_URL`: `https://你的项目名.vercel.app`

5. **验证配置**
   - 确保所有变量显示为 **Plain Text**
   - 确认环境选择正确（至少包含 Production）

---

### 步骤 4: 生成 NEXTAUTH_SECRET

在本地终端运行：

```bash
# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# Linux/Mac
openssl rand -base64 32
```

复制生成的字符串到 Vercel 环境变量 `NEXTAUTH_SECRET`

---

### 步骤 5: 初始化数据库

#### 方法 A: 使用 Vercel CLI（推荐）

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 拉取环境变量
vercel env pull

# 运行数据库迁移
npx prisma db push

# 部署
vercel --prod
```

#### 方法 B: 使用 Prisma Data Platform

1. 在 Vercel 项目设置中找到 `DATABASE_URL`
2. 复制连接字符串
3. 在本地 `.env` 文件中临时设置
4. 运行 `npx prisma db push`
5. 删除本地 `.env` 中的生产数据库连接

---

### 步骤 6: 部署项目

1. **自动部署**
   - 点击 Vercel 项目中的 "Deploy" 按钮
   - 或者推送代码到 GitHub，自动触发部署

2. **查看部署状态**
   - 在 Vercel Dashboard 查看构建日志
   - 等待部署完成（通常 2-5 分钟）

3. **访问网站**
   - 部署成功后，点击 "Visit" 按钮
   - 或访问 `https://你的项目名.vercel.app`

---

## ✅ 部署后检查清单

- [ ] 网站能正常访问
- [ ] Coinbase 钱包能连接
- [ ] 能创建 IP 资产（检查链上注册）
- [ ] 能购买许可证
- [ ] 能创建衍生作品
- [ ] 收益数据正常显示
- [ ] 交易哈希链接正常跳转

---

## 🔧 常见问题

### 问题 1: 构建失败 - Prisma 错误

**错误信息**: `Cannot find Prisma Client`

**解决方案**:
```bash
# 确保 package.json 中有
"postinstall": "prisma generate"
```

### 问题 2: 数据库连接失败

**错误信息**: `Can't reach database server`

**解决方案**:
1. 检查 `DATABASE_URL` 格式是否正确
2. 确保 PostgreSQL 数据库已创建
3. 检查 SSL 模式：`?sslmode=require`

### 问题 3: NEXTAUTH_URL 错误

**错误信息**: `[next-auth][error][INVALID_URL]`

**解决方案**:
1. 确保 `NEXTAUTH_URL` 是完整域名
2. 格式：`https://your-app.vercel.app`（不要末尾斜杠）

### 问题 4: 环境变量未生效

**解决方案**:
1. 检查变量名是否正确（区分大小写）
2. 重新部署项目（Settings → Deployments → Redeploy）
3. 确保选择了正确的环境（Production/Preview/Development）

---

## 🎯 生产环境优化建议

### 1. 数据库优化
- 使用 PostgreSQL 而非 SQLite
- 启用连接池：在 `DATABASE_URL` 添加 `?pgbouncer=true`
- 定期备份数据库

### 2. 性能优化
- 启用 Vercel Analytics
- 配置 CDN 缓存
- 使用图片优化（Next.js Image 组件）

### 3. 安全优化
- 定期轮换 `NEXTAUTH_SECRET`
- 使用环境变量管理敏感信息
- 启用 HTTPS（Vercel 自动配置）

### 4. 监控
- 配置 Vercel Log Drains
- 集成错误追踪（如 Sentry）
- 设置健康检查端点

---

## 📚 相关文档

- [Vercel 部署文档](https://vercel.com/docs/deployments/overview)
- [Next.js 部署指南](https://nextjs.org/docs/deployment)
- [Prisma 部署指南](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js 生产环境](https://next-auth.js.org/deployment)

---

## 🆘 获取帮助

如果遇到问题：
1. 查看 Vercel 构建日志
2. 检查浏览器控制台错误
3. 查阅 Story Protocol 文档
4. 提交 GitHub Issue
