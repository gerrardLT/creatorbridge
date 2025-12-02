# 🚀 Vercel 部署快速参考

## 一、准备工作（5分钟）

### 1.1 注册账号
```
Vercel: https://vercel.com (用 GitHub 登录)
```

### 1.2 准备数据库（选一个）
```
✅ Neon (推荐): https://neon.tech
✅ Vercel Postgres: 在 Vercel 项目中直接创建
✅ Supabase: https://supabase.com
```

---

## 二、快速部署（10分钟）

### 2.1 推送代码到 GitHub
```bash
git add .
git commit -m "feat: ready for deployment"
git push
```

### 2.2 在 Vercel 导入项目
1. 访问 https://vercel.com/dashboard
2. 点击 "Add New..." → "Project"
3. 选择 GitHub 仓库 `creatorbridge`
4. 点击 "Import"

### 2.3 配置环境变量（复制粘贴）
在 Vercel 项目 Settings → Environment Variables 添加：

| 变量名 | 示例值 |
|--------|--------|
| `DATABASE_URL` | `postgresql://user:pass@host/db` |
| `STORY_RPC_URL` | `https://aeneid.storyrpc.io` |
| `STORY_PRIVATE_KEY` | `0x你的私钥` |
| `NEXT_PUBLIC_CDP_CLIENT_API_KEY` | `你的Coinbase密钥` |
| `NEXTAUTH_SECRET` | 运行 `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://你的域名.vercel.app` |

### 2.4 部署
点击 "Deploy" 按钮，等待 2-5 分钟

---

## 三、验证部署（2分钟）

### 3.1 访问网站
```
https://你的项目名.vercel.app
```

### 3.2 测试功能
- [ ] 钱包连接正常
- [ ] 能创建 IP
- [ ] 能购买许可证
- [ ] 能创建衍生作品

---

## 四、数据库初始化

### 方式 A: 使用 Vercel CLI
```bash
npm i -g vercel
vercel login
vercel env pull
npx prisma db push
```

### 方式 B: 本地临时连接
```bash
# 复制 Vercel 的 DATABASE_URL
# 在本地 .env 临时设置
npx prisma db push
# 删除本地 .env 中的生产数据库连接
```

---

## 五、常见问题快速修复

### 问题：构建失败
```bash
# 检查 package.json
确保有: "postinstall": "prisma generate"
```

### 问题：数据库连接失败
```bash
# 检查 DATABASE_URL 格式
postgresql://user:password@host:5432/database?sslmode=require
```

### 问题：环境变量不生效
```
Settings → Environment Variables → Redeploy
```

---

## 六、更新部署

### 自动部署
```bash
git push  # 推送到 GitHub，自动触发部署
```

### 手动部署
```
Vercel Dashboard → Deployments → Redeploy
```

---

## 七、域名绑定（可选）

1. Vercel 项目 → Settings → Domains
2. 添加自定义域名
3. 配置 DNS（按 Vercel 提示）
4. 更新 `NEXTAUTH_URL` 环境变量

---

## 八、监控和日志

### 查看日志
```
Vercel Dashboard → 你的项目 → Logs
```

### 查看分析
```
Vercel Dashboard → 你的项目 → Analytics
```

---

## 九、回滚部署

```
Deployments → 选择之前的版本 → Promote to Production
```

---

## 📞 需要帮助？

- 📚 完整文档: `docs/VERCEL_DEPLOYMENT.md`
- 🌐 Vercel 支持: https://vercel.com/support
- 💬 GitHub Issues: 提交问题

---

**预计总时间: 15-20 分钟** ⏱️
