# AhriKnow WPA

一个支持手机和电脑的渐进式Web应用（PWA）

## 功能特性

- 📱 **响应式设计** - 完美适配手机、平板和电脑
- 🔄 **离线支持** - Service Worker支持离线访问
- 📝 **数据收集** - 支持笔记、想法、任务等分类收集
- 🌙 **深色模式** - 支持深色/浅色主题切换
- 📊 **数据统计** - 实时显示收集统计信息
- 💾 **本地存储** - 数据保存在本地，保护隐私

## 技术栈

- HTML5
- CSS3（CSS Variables, Flexbox, Grid）
- Vanilla JavaScript（ES6+）
- Service Worker
- Web App Manifest

## 项目结构

```
ahriknow-wpa/
├── index.html          # 主页面
├── manifest.json       # PWA配置文件
├── sw.js              # Service Worker
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── app.js         # 应用逻辑
├── icons/             # 应用图标
└── README.md          # 项目说明
```

## 快速开始

### 本地运行

1. 克隆项目到本地
2. 使用本地服务器运行（需要HTTPS或localhost）

```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx serve

# 使用VS Code Live Server扩展
# 右键 index.html -> Open with Live Server
```

3. 访问 `http://localhost:8000`

### 部署

将项目文件上传到任何支持HTTPS的静态服务器即可。

## 使用说明

1. **收集数据** - 点击"收集"标签页，填写标题和内容，选择分类后保存
2. **查看列表** - 在收集页面可以查看所有收集的内容
3. **筛选分类** - 使用筛选按钮按分类查看
4. **深色模式** - 在设置中切换深色/浅色主题
5. **安装应用** - 在支持的浏览器中可以安装到主屏幕

## 浏览器支持

- Chrome 67+
- Firefox 67+
- Safari 11.1+
- Edge 79+

## 许可证

MIT License
