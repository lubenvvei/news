/**
 * config.js — 全局常量与配置
 * 修改 API_KEY 即可接入 NewsAPI
 */
const CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE',   // ← 填入你的 NewsAPI Key（Vercel 部署用环境变量 NEWSAPI_KEY）
    BASE_URL: 'https://newsapi.org/v2',
    PAGE_SIZE: 20,

    CATEGORIES: [
        { key: 'general',       label: '综合' },
        { key: 'technology',    label: '科技' },
        { key: 'business',      label: '商业' },
        { key: 'sports',        label: '体育' },
        { key: 'science',       label: '科学' },
        { key: 'health',        label: '健康' },
        { key: 'entertainment', label: '娱乐' }
    ],

    COUNTRIES: [
        { code: 'cn', label: '🇨🇳 中国' },
        { code: 'us', label: '🇺🇸 美国' },
        { code: 'gb', label: '🇬🇧 英国' },
        { code: 'jp', label: '🇯🇵 日本' },
        { code: 'kr', label: '🇰🇷 韩国' },
        { code: 'de', label: '🇩🇪 德国' },
        { code: 'fr', label: '🇫🇷 法国' }
    ],

    // 内存缓存过期时间（毫秒）
    CACHE_TTL: 5 * 60 * 1000,

    // 请求超时（毫秒）
    FETCH_TIMEOUT: 8000,

    // 国家 → 语言映射（NewsAPI 非英语国家头条少，自动降级用语言搜）
    // NewsAPI 支持的 language 值：zh, en, de, fr, ar, es, it, nl, no, pt, ru, sv
    // 日语 (ja) 和韩语 (ko) 不支持，降级为英文搜索 + 国家名关键词
    COUNTRY_LANG: {
        cn: 'zh', de: 'de', fr: 'fr',
        us: 'en', gb: 'en'
    },

    // 国家 → 英文搜索词（用于不支持语言的兜底）
    COUNTRY_KEYWORD: {
        jp: 'japan',
        kr: 'south korea'
    },

    // 分类 → 各语种关键词（降级搜索时嵌入 query）
    CATEGORY_KW: {
        general:       { zh: '新闻',     en: 'news',         de: 'Nachrichten',  fr: 'actualités' },
        technology:    { zh: '科技',     en: 'technology',   de: 'Technologie',  fr: 'technologie' },
        business:      { zh: '商业',     en: 'business',     de: 'Wirtschaft',   fr: 'affaires' },
        sports:        { zh: '体育',     en: 'sports',       de: 'Sport',        fr: 'sport' },
        science:       { zh: '科学',     en: 'science',      de: 'Wissenschaft', fr: 'science' },
        health:        { zh: '健康',     en: 'health',       de: 'Gesundheit',   fr: 'santé' },
        entertainment: { zh: '娱乐',     en: 'entertainment',de: 'Unterhaltung', fr: 'divertissement' }
    }
};
