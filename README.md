# 高达扭蛋机 (Gundam Gacha Machine)

一个功能完整的基于Web的高达主题扭蛋机游戏，使用HTML5、CSS3和JavaScript开发。

## 🎮 功能特性

### 核心游戏功能
- 🎯 **抽卡系统**: 单次抽取和十连抽取，支持保底机制
- 🏪 **个人机库**: 收集和管理你的高达机体
- � **商店系统**: 购买代币包、折扣券和特殊道具
- 🏆 **成就系统**: 完成各种挑战获得奖励
- 📊 **统计系统**: 详细的游戏数据统计
- 📅 **签到系统**: 每日签到获得代币奖励

### 用户体验
- 🎵 **音效系统**: 高达风格的背景音乐和音效
- 🎨 **像素风格**: 复古像素艺术设计
- 📱 **响应式设计**: 完美支持移动端和桌面端
- ⚙️ **设置面板**: 自定义音效、动画等选项
- 🔄 **数据持久化**: 自动保存游戏进度

### 技术特性
- 🛡️ **错误处理**: 完善的错误处理和容错机制
- 💾 **数据安全**: 安全的本地存储和数据验证
- ⚡ **性能优化**: 流畅的动画和快速响应
- 🧪 **测试覆盖**: 完整的功能测试套件

## 🛠️ 技术栈

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **样式**: Tailwind CSS + 自定义像素风格CSS
- **音频**: Web Audio API
- **存储**: localStorage
- **字体**: Google Fonts (Press Start 2P)

## 🚀 快速开始

### 方法一：直接运行
1. 克隆或下载项目文件
2. 在浏览器中打开 `index.html`
3. 开始游戏！

### 方法二：本地服务器
```bash
# 使用Node.js http-server
npm install
npm start

# 或者使用Python
python -m http.server 3000

# 或者使用任何其他静态文件服务器
```

## 🎯 游戏说明

### 基础玩法
- **初始代币**: 1000
- **单次抽取**: 100代币
- **十连抽取**: 1000代币 (包含保底机制)
- **每日签到**: 200代币奖励

### 稀有度系统
- **SSR (5%)**: 传说级高达 - 金色边框
- **SR (10%)**: 精英级高达 - 紫色边框
- **R (25%)**: 稀有级高达 - 蓝色边框
- **N (60%)**: 普通级机体 - 灰色边框

### 商店系统
- **代币包**: 购买额外代币
- **折扣券**: 降低抽取费用
- **保底券**: 保证下次十连出SSR
- **每日限购**: 防止过度消费

### 成就系统
- **抽取成就**: 完成一定次数的抽取
- **收集成就**: 收集特定数量的机体
- **签到成就**: 连续签到奖励
- **收藏成就**: 收集不同稀有度的机体

## 🧪 测试

项目包含完整的测试套件，访问 `test.html` 进行功能测试：

```bash
# 在浏览器中打开
open test.html
```

测试覆盖：
- ✅ 本地存储功能
- ✅ 音频系统
- ✅ 奖池数据完整性
- ✅ 抽取概率
- ✅ 界面响应性
- ✅ 游戏逻辑
- ✅ 性能测试

## 📁 项目结构

```
gundam-gacha-machine/
├── index.html          # 主游戏页面
├── test.html           # 测试页面
├── main.js             # 主要游戏逻辑
├── gacha_data.js       # 奖池数据
├── style.css           # 样式文件
├── package.json        # 项目配置
├── README.md           # 项目文档
├── DEPLOYMENT.md       # 部署说明
└── vercel.json         # Vercel部署配置
```

## 🌐 部署

本项目可以部署到任何静态网站托管服务：

### Vercel (推荐)
```bash
npm install -g vercel
vercel
```

### Netlify
1. 将项目上传到GitHub
2. 连接Netlify到你的仓库
3. 自动部署

### GitHub Pages
1. 推送代码到GitHub
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源

### 其他平台
- Claw.cloud
- Firebase Hosting
- AWS S3
- 任何支持静态文件的服务器

## 🔧 自定义配置

### 修改奖池
编辑 `gacha_data.js` 文件添加新的机体：

```javascript
{
    id: 'new_mecha',
    name: '新机体名称',
    model: '型号',
    rarity: 'SSR', // SSR, SR, R, N
    image_url: '图片URL'
}
```

### 调整概率
在 `main.js` 中修改 `rarityProbabilities` 对象：

```javascript
const rarityProbabilities = {
    SSR: 5,   // 5%
    SR: 10,   // 10%
    R: 25,    // 25%
    N: 60     // 60%
};
```

### 自定义商店物品
在 `main.js` 中修改 `shopItems` 数组添加新商品。

## 🐛 问题反馈

如果遇到问题，请检查：

1. **浏览器兼容性**: 建议使用现代浏览器 (Chrome, Firefox, Safari, Edge)
2. **JavaScript支持**: 确保浏览器启用了JavaScript
3. **本地存储**: 确保浏览器支持localStorage
4. **音频权限**: 某些浏览器需要用户交互才能播放音频

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交GitHub Issue
- 发送邮件到项目维护者

---

**享受你的高达收集之旅！** 🤖✨