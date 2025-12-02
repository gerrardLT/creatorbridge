# 🎉 新功能指南

## 功能更新总结

本次更新添加了三个重要功能：

1. ✅ **音频文件支持**
2. ✅ **AI 图片生成**
3. ✅ **许可证模板保存（已优化）**

---

## 一、音频文件支持 🎵

### 功能说明

现在可以上传和注册**音频作品**作为 IP 资产！

### 支持的音频格式

```
✅ MP3  (.mp3)
✅ WAV  (.wav)
✅ OGG  (.ogg)
✅ FLAC (.flac)
✅ M4A  (.m4a)
✅ AAC  (.aac)
```

### 使用方法

#### **创建原创音频 IP**

1. 访问 `/create` 页面
2. 上传音频文件（拖拽或点击上传）
3. 系统自动识别为音频类型
4. 填写标题和描述
5. 选择许可证类型
6. 提交注册

#### **创建音频衍生作品**

1. 找到一个允许衍生的音频 IP
2. 点击 "Create Derivative Work"
3. 上传你的混音/改编版本
4. 系统支持音频上传
5. 提交链上注册

---

### 前端展示

#### **上传界面**

```
┌────────────────────────────────────┐
│ Asset File        [AI Generate]    │  ← 可切换 AI 生成
├────────────────────────────────────┤
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
│ ┆                                ┆ │
│ ┆         🎵                     ┆ │  ← 音频图标
│ ┆    Drop your masterpiece      ┆ │
│ ┆    Images & Audio - Max 50MB  ┆ │
│ ┆                                ┆ │
│ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │
└────────────────────────────────────┘
```

#### **预览界面（音频）**

```
┌────────────────────────────────────┐
│                                    │
│            🎵 (大图标)              │
│         song.mp3                   │
│                                    │
│    [━━━━━━━━━━ 🔊]                │  ← 音频播放器
│    0:00 ────────── 3:45            │
│                                    │
└────────────────────────────────────┘
```

---

### 应用场景

#### **音乐人**
```
原创歌曲 → 注册为 IP
├─ License: Commercial Remix
├─ Minting Fee: 0.5 WIP
└─ Revenue Share: 15%

DJ 购买许可并混音
├─ 上传混音版本（MP3）
├─ 链上注册衍生关系
└─ 原创音乐人自动获得 15% 分成
```

#### **Podcast 创作者**
```
播客片段 → 注册为 IP
├─ License: Non-Commercial
└─ 允许教育使用和二创

其他创作者采样使用
├─ 免费获取许可证
└─ 必须注明原作者
```

#### **音效设计师**
```
音效库 → 注册为 IP
├─ License: Commercial Use
├─ Minting Fee: 0.1 WIP/音效
└─ 游戏开发者购买使用
```

---

## 二、AI 图片生成 ✨

### 功能说明

集成 **Pollinations AI**，支持免费生成高质量图片！

### 使用方法

#### **生成 AI 图片**

1. 访问 `/create` 页面
2. 点击 **"AI Generate"** 按钮
3. 输入文字描述（英文效果更好）
   ```
   例如：
   - "a futuristic cyberpunk city at night"
   - "abstract art with purple and gold colors"
   - "cute cartoon cat wearing sunglasses"
   ```
4. 点击 **"Generate with AI"**
5. 等待 3-5 秒
6. AI 生成的图片自动加载到预览区
7. 继续填写标题、描述和许可证信息
8. 提交注册

---

### 界面展示

#### **AI 生成器界面**

```
┌────────────────────────────────────┐
│ Asset File        [Upload File]    │  ← 切换回上传
├────────────────────────────────────┤
│                                    │
│ Describe the image...              │
│ ┌────────────────────────────────┐ │
│ │ a futuristic cyberpunk city    │ │  ← 输入提示词
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │  ✨ Generate with AI           │ │  ← 生成按钮
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

#### **生成中状态**

```
┌────────────────────────────────────┐
│  🔄 Generating...                  │  ← 加载动画
│                                    │
│  Please wait while AI creates      │
│  your image...                     │
└────────────────────────────────────┘
```

#### **生成完成**

```
┌────────────────────────────────────┐
│  ✅ AI image generated!            │
│                                    │
│  [生成的图片自动显示在预览区]        │
│                                    │
│  继续填写标题和描述...               │
└────────────────────────────────────┘
```

---

### AI 提示词技巧

#### **基础模板**

```
主体 + 风格 + 细节 + 质量

例如：
"a majestic dragon, digital art, vibrant colors, 4k quality"
```

#### **常用风格关键词**

| 风格 | 英文关键词 |
|------|-----------|
| 赛博朋克 | cyberpunk, neon, futuristic |
| 水彩画 | watercolor, soft colors, artistic |
| 3D 渲染 | 3d render, octane render, realistic |
| 卡通 | cartoon, cute, colorful |
| 抽象 | abstract, geometric, modern |
| 油画 | oil painting, classic, artistic |

#### **高质量提示词示例**

```
1. "a serene Japanese garden with cherry blossoms, sunset lighting, photorealistic"

2. "abstract geometric shapes, gold and purple gradient, minimalist design"

3. "cute robot character, Pixar style, colorful, white background"

4. "fantasy landscape with floating islands, magical atmosphere, concept art"

5. "modern architecture, glass and steel, minimalist, black and white"
```

---

### 技术细节

#### **使用的 API**

- **Pollinations AI** (免费)
- 图片尺寸：1024x1024
- 无水印
- 无需 API Key

#### **生成流程**

```typescript
const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1024&height=1024&nologo=true`;

// 自动下载并转换为文件
const response = await fetch(imageUrl);
const blob = await response.blob();
const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
```

---

## 三、许可证模板保存（优化） 💾

### 功能说明

**Save License as Template** 功能已经完整实现，并优化了用户体验。

### 使用方法

#### **保存模板**

1. 在 `/create` 页面配置许可证
   - 选择许可证类型
   - 设置 Minting Fee
   - 设置 Revenue Share（如果适用）

2. 点击 **"Save License as Template"** 按钮

3. 输入模板名称
   ```
   例如：
   - "My Standard License"
   - "Music Remix 15%"
   - "Free Educational Use"
   ```

4. 查看模板预览
   ```
   Template will save:
   - License Type: Commercial Remix
   - Minting Fee: 0.1 WIP
   - Revenue Share: 10%
   ```

5. 点击 **"Save Template"**

6. 看到成功提示 ✅
   ```
   ✅ Template "My Standard License" saved successfully!
   ```

---

#### **加载模板**

1. 下次创建 IP 时，在表单顶部看到 **"Load from Template"** 下拉框

2. 点击下拉框，选择已保存的模板

3. 许可证配置自动填充
   - License Type 自动选择
   - Minting Fee 自动填写
   - Revenue Share 自动设置

4. 可以微调参数后提交

---

### 界面展示

#### **保存模板按钮**

```
┌────────────────────────────────────┐
│ [Minting Fee 配置区]               │
│ [Revenue Share 配置区]             │
├────────────────────────────────────┤
│                                    │
│ ┌────────────────────────────────┐ │
│ │  💾 Save License as Template   │ │  ← 点击打开弹窗
│ └────────────────────────────────┘ │
└────────────────────────────────────┘
```

---

#### **保存模板弹窗**

```
┌─────────────────────────────────────┐
│ Save as Template                ✕  │
├─────────────────────────────────────┤
│                                     │
│ Template Name                       │
│ ┌─────────────────────────────────┐ │
│ │ My License Template             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Template will save:                 │
│ ┌─────────────────────────────────┐ │
│ │ License Type: Commercial Remix  │ │
│ │ Minting Fee: 0.1 WIP            │ │
│ │ Revenue Share: 10%              │ │
│ └─────────────────────────────────┘ │
│                                     │
│    [Cancel]  [💾 Save Template]    │
└─────────────────────────────────────┘
```

---

#### **加载模板下拉框**

```
┌────────────────────────────────────┐
│ Load from Template                 │
│ ┌────────────────────────────────┐ │
│ │ Select a template...        ▼  │ │  ← 点击展开
│ └────────────────────────────────┘ │
└────────────────────────────────────┘

点击后展开：

┌────────────────────────────────────┐
│ My Standard License                │  ← 模板 1
│ Commercial Remix                   │
│ 0.1 WIP · 10% rev share            │
├────────────────────────────────────┤
│ Music Remix 15%                    │  ← 模板 2
│ Commercial Remix                   │
│ 0.2 WIP · 15% rev share            │
├────────────────────────────────────┤
│ Free Educational Use               │  ← 模板 3
│ Non-Commercial                     │
└────────────────────────────────────┘
```

---

### 特殊功能

#### **重名检测**

```
如果模板名称已存在：

┌─────────────────────────────────────┐
│ ⚠️ Template already exists          │
│                                     │
│ A template named "My Template"      │
│ already exists.                     │
│ Do you want to overwrite it?        │
│                                     │
│    [Cancel]  [Overwrite]            │
└─────────────────────────────────────┘
```

---

### 优化点

1. ✅ **成功提示**
   - 保存成功后显示绿色通知
   - 通知内容包含模板名称

2. ✅ **错误处理**
   - 空名称提示
   - 重名确认
   - 保存失败提示

3. ✅ **用户体验**
   - 实时预览配置
   - 加载动画
   - 自动关闭弹窗

---

## 四、使用场景示例

### 场景 1：音乐人工作流

```
1. 创建原创歌曲
   ├─ 上传 MP3 文件
   ├─ 选择 Commercial Remix
   ├─ 设置 15% Revenue Share
   └─ 保存为模板 "Music Remix 15%"

2. 下次发布新歌
   ├─ 点击 "Load from Template"
   ├─ 选择 "Music Remix 15%"
   ├─ 上传新歌曲
   └─ 一键提交（配置已自动填充）

3. DJ 创建混音版
   ├─ 找到原创歌曲
   ├─ 购买 Commercial Remix 许可
   ├─ 上传混音版本（支持音频）
   ├─ 链上注册衍生关系
   └─ 原音乐人自动获得 15% 分成
```

---

### 场景 2：AI 艺术家

```
1. 生成 AI 插画
   ├─ 点击 "AI Generate"
   ├─ 输入："cyberpunk city, neon lights, 4k"
   ├─ 等待 AI 生成
   └─ 图片自动加载

2. 注册为 IP
   ├─ 填写标题："Neon City #001"
   ├─ 选择 Non-Commercial（推广作品）
   └─ 免费分享给社区

3. 后续创作
   ├─ 继续用 AI 生成同风格图片
   ├─ 注册为衍生作品
   └─ 建立完整的创作谱系
```

---

### 场景 3：设计师模板复用

```
1. 第一次创建 IP
   ├─ 配置许可证：Commercial Use
   ├─ 设置 Minting Fee: 0.05 WIP
   └─ 保存为模板 "Design Assets Standard"

2. 批量上传设计素材
   ├─ 素材 1：加载模板 → 上传 → 提交
   ├─ 素材 2：加载模板 → 上传 → 提交
   ├─ 素材 3：加载模板 → 上传 → 提交
   └─ 节省大量配置时间

3. 特殊项目
   ├─ 加载现有模板
   ├─ 微调 Minting Fee（0.05 → 0.1）
   ├─ 保存为新模板 "Premium Design"
   └─ 下次直接使用
```

---

## 五、技术实现细节

### 文件类型检测

```typescript
const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
const audioExtensions = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac'];
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

if (audioExtensions.includes(fileExtension || '')) {
  setFileType('audio');
} else if (imageExtensions.includes(fileExtension || '')) {
  setFileType('image');
}
```

---

### AI 图片生成

```typescript
const handleAIGenerate = async () => {
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiPrompt)}?width=1024&height=1024&nologo=true`;
  
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], `ai-generated-${Date.now()}.png`, { type: 'image/png' });
  
  setFile(file);
  setPreview(imageUrl);
  setFileType('image');
};
```

---

### 模板保存通知

```typescript
const handleSaveTemplate = async (name: string) => {
  // ... 保存逻辑
  
  // 显示成功通知
  addNotification('success', `✅ Template "${name}" saved successfully!`);
};
```

---

## 六、常见问题 FAQ

### Q1: AI 生成的图片有版权吗？
A: AI 生成的图片版权归生成者所有。注册为 IP 后，你拥有完整的所有权和商业使用权。

---

### Q2: 音频文件有大小限制吗？
A: 是的，最大 50MB。如果文件超过限制，建议压缩或使用更高效的格式（如 OGG）。

---

### Q3: 模板可以跨设备使用吗？
A: 模板绑定到你的用户账号，只要登录同一个钱包地址，任何设备都可以使用。

---

### Q4: AI 生成速度慢怎么办？
A: Pollinations AI 是免费服务，高峰期可能较慢。建议：
- 使用简洁的提示词
- 避免高峰时段（美国白天）
- 如果失败，等待几秒后重试

---

### Q5: 音频预览支持所有格式吗？
A: 浏览器原生支持 MP3、WAV、OGG。部分格式（如 FLAC）可能需要下载后播放。

---

## 七、快捷键与技巧

### 快捷键

| 操作 | 快捷键 |
|------|--------|
| 上传文件 | 点击上传区域 |
| AI 生成 | Enter（在提示词输入框中） |
| 保存模板 | 无（点击按钮） |

---

### 工作流技巧

#### **音乐人批量上传**
```
1. 准备多首歌曲
2. 创建并保存通用模板
3. 逐首上传，使用模板快速配置
4. 建立完整的音乐作品集
```

#### **AI 艺术家系列创作**
```
1. 确定风格关键词
2. 批量生成多张图片
3. 选择最佳作品注册
4. 建立统一的艺术风格系列
```

#### **设计师模板管理**
```
1. 为不同项目类型创建不同模板
   - "Logo Design" (0.5 WIP)
   - "Icon Pack" (0.1 WIP)
   - "Illustration" (0.3 WIP)
2. 根据客户类型选择模板
3. 快速交付，统一定价
```

---

## 八、未来计划 🚀

### 即将推出

- 📹 **视频文件支持**（MP4, MOV）
- 🎨 **更多 AI 模型**（Stable Diffusion, DALL-E）
- 📝 **文档支持**（PDF, DOCX）
- 🎮 **3D 模型支持**（OBJ, FBX, GLTF）
- ⚙️ **批量上传**（一次上传多个文件）
- 🔄 **模板导入导出**（跨账号共享模板）

---

## 总结

### 🎉 三大新功能

1. **音频支持** 🎵
   - 6 种音频格式
   - 音频播放器预览
   - 完整的衍生作品支持

2. **AI 生成** ✨
   - 免费无限生成
   - 1024x1024 高质量
   - 无水印

3. **模板优化** 💾
   - 成功通知
   - 完善的错误处理
   - 流畅的用户体验

---

### 📊 关键数据

| 功能 | 文件 | 代码行数 |
|------|------|---------|
| 音频支持 | create/page.tsx | +25 |
| AI 生成 | create/page.tsx | +40 |
| 模板通知 | create/page.tsx | +3 |
| 衍生音频 | create/derivative/page.tsx | +20 |

---

**开始使用这些新功能，创造更多可能！** 🚀
