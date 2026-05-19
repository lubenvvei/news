# DailyNews

纯前端全球新闻聚合站，零依赖，一个文件夹拖进浏览器就能跑。

## 快速开始

1. 注册 [NewsAPI](https://newsapi.org/register) 免费账号，获取 API Key
2. 打开 `js/config.js`，将 `YOUR_API_KEY_HERE` 替换为你的 Key
3. 启动本地服务：

```bash
cd news-site
python -m http.server 8080
```

4. 浏览器打开 `http://localhost:8080`

## 项目结构

```
news-site/
├── index.html              # 入口
├── css/
│   └── style.css           # 全局样式 + 暗色模式 + 响应式
└── js/
    ├── config.js           # API Key / 分类 / 国家 配置
    ├── utils.js            # 日期格式化、防抖、localStorage
    ├── state.js            # 全局状态管理
    ├── api.js              # NewsAPI 请求 + 内存缓存
    ├── components.js       # UI 渲染（导航栏、卡片、骨架屏、错误页）
    └── app.js              # 主控逻辑
```

## 技术栈

- 原生 HTML / CSS / JavaScript
- 无框架、无构建工具、无 npm 依赖
- NewsAPI v2 作为数据源
- 本地预览：`python -m http.server`

## 功能

- 7 个新闻分类：综合 / 科技 / 商业 / 体育 / 科学 / 健康 / 娱乐
- 7 个国家 / 地区新闻源
- 关键词搜索
- 暗色 / 浅色模式切换
- 骨架屏加载动画
- 错误重试机制
- 响应式布局（手机 / 平板 / 桌面）
