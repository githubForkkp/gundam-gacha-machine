# 将高达扭蛋机推送到GitHub仓库

## 方法一：使用Git命令行（推荐）

### 前提条件
1. 确保您的系统已安装Git
   - 下载地址：https://git-scm.com/download/windows
   - 安装后重启命令行

### 步骤

#### 1. 初始化Git仓库
```bash
cd d:\download\xDrQckc
git init
```

#### 2. 配置Git用户信息（如果还没配置）
```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

#### 3. 添加所有文件到暂存区
```bash
git add .
```

#### 4. 创建初始提交
```bash
git commit -m "feat: 完整的高达扭蛋机游戏

- 实现完整的抽卡系统（单抽/十连，保底机制）
- 添加商店系统（代币包、折扣券、保底券）
- 实现成就系统（7种不同类型成就）
- 完善机库管理和统计功能
- 添加每日签到系统
- 实现音效和背景音乐系统
- 完善错误处理和容错机制
- 添加完整的测试套件
- 支持响应式设计和移动端
- 包含37个高达机体，4个稀有度等级"
```

#### 5. 在GitHub上创建新仓库
1. 访问 https://github.com/new
2. 仓库名称：`gundam-gacha-machine`
3. 描述：`一个功能完整的高达主题扭蛋机游戏`
4. 选择 Public（公开）
5. 不要初始化README、.gitignore或license（因为我们已经有了）
6. 点击 "Create repository"

#### 6. 连接到远程仓库
```bash
git remote add origin https://github.com/您的用户名/gundam-gacha-machine.git
```

#### 7. 推送代码到GitHub
```bash
git branch -M main
git push -u origin main
```

## 方法二：使用GitHub Desktop（图形界面）

### 步骤
1. 下载并安装 GitHub Desktop：https://desktop.github.com/
2. 登录您的GitHub账户
3. 点击 "File" > "Add Local Repository"
4. 选择项目文件夹：`d:\download\xDrQckc`
5. 如果提示不是Git仓库，点击 "create a repository"
6. 填写仓库信息：
   - Name: `gundam-gacha-machine`
   - Description: `一个功能完整的高达主题扭蛋机游戏`
7. 点击 "Create Repository"
8. 在左侧文件列表中，确保所有文件都被选中
9. 在底部输入提交信息：
   ```
   feat: 完整的高达扭蛋机游戏

   - 实现完整的抽卡系统（单抽/十连，保底机制）
   - 添加商店系统（代币包、折扣券、保底券）
   - 实现成就系统（7种不同类型成就）
   - 完善机库管理和统计功能
   - 添加每日签到系统
   - 实现音效和背景音乐系统
   - 完善错误处理和容错机制
   - 添加完整的测试套件
   - 支持响应式设计和移动端
   - 包含37个高达机体，4个稀有度等级
   ```
10. 点击 "Commit to main"
11. 点击 "Publish repository"
12. 确认仓库设置并点击 "Publish Repository"

## 方法三：手动上传（最简单）

### 步骤
1. 访问 https://github.com/new
2. 创建新仓库：
   - 仓库名称：`gundam-gacha-machine`
   - 描述：`一个功能完整的高达主题扭蛋机游戏`
   - 选择 Public
   - 不要初始化任何文件
3. 创建仓库后，点击 "uploading an existing file"
4. 将项目文件夹中的所有文件拖拽到页面上
5. 在提交信息中输入：
   ```
   feat: 完整的高达扭蛋机游戏
   
   包含完整的游戏功能、测试套件和文档
   ```
6. 点击 "Commit changes"

## 推荐的仓库设置

### 仓库描述
```
🤖 一个功能完整的高达主题扭蛋机游戏，使用HTML5、CSS3和JavaScript开发
```

### Topics（标签）
```
gundam, gacha, game, html5, javascript, css3, pixel-art, web-game, mobile-friendly
```

### README徽章（可选）
在README.md顶部添加：
```markdown
![GitHub stars](https://img.shields.io/github/stars/您的用户名/gundam-gacha-machine)
![GitHub forks](https://img.shields.io/github/forks/您的用户名/gundam-gacha-machine)
![GitHub issues](https://img.shields.io/github/issues/您的用户名/gundam-gacha-machine)
![License](https://img.shields.io/github/license/您的用户名/gundam-gacha-machine)
```

## 部署到GitHub Pages

推送代码后，您可以启用GitHub Pages来在线托管游戏：

1. 进入仓库设置页面
2. 滚动到 "Pages" 部分
3. 在 "Source" 下选择 "Deploy from a branch"
4. 选择 "main" 分支
5. 点击 "Save"
6. 几分钟后，游戏将在以下地址可用：
   ```
   https://您的用户名.github.io/gundam-gacha-machine/
   ```

## 文件清单

确保以下文件都被包含在仓库中：

### 核心文件
- ✅ `index.html` - 主游戏页面
- ✅ `main.js` - 游戏逻辑
- ✅ `gacha_data.js` - 奖池数据
- ✅ `style.css` - 样式文件

### 测试和文档
- ✅ `test.html` - 测试页面
- ✅ `README.md` - 项目文档
- ✅ `DEPLOYMENT.md` - 部署说明

### 配置文件
- ✅ `package.json` - 项目配置
- ✅ `vercel.json` - Vercel部署配置
- ✅ `.gitignore` - Git忽略文件

### 可选文件
- ✅ `test_audio.html` - 音频测试页面
- ✅ `deploy.bat` - 部署脚本
- ✅ `gemini_workflow.json` - 工作流配置

## 注意事项

1. **确保所有文件都被提交**：检查是否有遗漏的文件
2. **检查文件大小**：GitHub有100MB的单文件限制
3. **验证功能**：推送后测试游戏是否正常工作
4. **更新文档**：确保README中的链接和信息是正确的

## 后续维护

### 更新代码
```bash
git add .
git commit -m "描述您的更改"
git push origin main
```

### 创建发布版本
1. 在GitHub仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 输入版本号（如 v1.0.0）
4. 添加发布说明
5. 点击 "Publish release"
