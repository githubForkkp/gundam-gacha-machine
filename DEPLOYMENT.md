# 部署到 Claw.cloud 详细指南

## 准备工作

1. **确保项目文件完整**：
   - `index.html` - 主页面
   - `main.js` - 主要JavaScript逻辑
   - `style.css` - 样式文件
   - `gacha_data.js` - 扭蛋数据
   - `README.md` - 项目说明
   - `package.json` - 项目配置
   - `vercel.json` - 部署配置

2. **检查文件结构**：
   ```
   xDrQckc/
   ├── index.html
   ├── main.js
   ├── style.css
   ├── gacha_data.js
   ├── test_audio.html
   ├── README.md
   ├── package.json
   ├── vercel.json
   └── .gitignore
   ```

## 部署步骤

### 方法一：通过 Claw.cloud 控制台部署

1. **登录 Claw.cloud**
   - 访问 https://claw.cloud
   - 使用您的账户登录

2. **创建新项目**
   - 点击"新建项目"
   - 选择"从Git仓库导入"或"上传文件"

3. **配置项目**
   - 项目名称：`gundam-gacha-machine`
   - 框架：选择"静态网站"或"其他"
   - 构建命令：留空（静态网站无需构建）
   - 输出目录：`./`（根目录）

4. **部署设置**
   - 环境变量：无需设置
   - 域名：可选择自定义域名

5. **开始部署**
   - 点击"部署"按钮
   - 等待部署完成

### 方法二：通过 Git 仓库部署

1. **创建 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Gundam Gacha Machine"
   ```

2. **推送到 GitHub/GitLab**
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **在 Claw.cloud 中连接仓库**
   - 选择"从Git仓库导入"
   - 授权访问您的Git仓库
   - 选择对应的仓库分支

### 方法三：直接上传文件

1. **压缩项目文件**
   - 选择所有项目文件
   - 创建ZIP压缩包

2. **上传到 Claw.cloud**
   - 选择"上传文件"
   - 上传ZIP压缩包
   - 系统会自动解压并部署

## 部署后配置

1. **域名设置**
   - 在项目设置中配置自定义域名
   - 或使用Claw.cloud提供的默认域名

2. **HTTPS 配置**
   - Claw.cloud 自动提供 HTTPS 证书
   - 无需额外配置

3. **缓存设置**
   - 静态资源会自动缓存
   - 如需更新，重新部署即可

## 验证部署

1. **访问网站**
   - 使用提供的域名访问网站
   - 检查所有功能是否正常

2. **功能测试**
   - 测试扭蛋机功能
   - 检查音效和动画
   - 验证响应式设计

3. **性能检查**
   - 检查页面加载速度
   - 验证移动端兼容性

## 常见问题

### Q: 部署后页面显示空白？
A: 检查 `index.html` 中的路径是否正确，确保所有资源文件都已上传。

### Q: 音效无法播放？
A: 确认音频文件路径正确，检查浏览器是否允许自动播放音频。

### Q: 移动端显示异常？
A: 检查CSS中的响应式设计，确保viewport设置正确。

### Q: 如何更新网站？
A: 修改代码后重新部署即可，Claw.cloud 会自动更新。

## 维护建议

1. **定期备份**
   - 定期备份项目文件
   - 保存重要的游戏数据

2. **性能优化**
   - 压缩图片和音频文件
   - 优化JavaScript代码

3. **功能更新**
   - 定期添加新的高达机体
   - 优化用户体验

## 技术支持

如果遇到部署问题，可以：
- 查看 Claw.cloud 官方文档
- 检查项目控制台错误信息
- 联系技术支持团队 