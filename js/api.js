/**
 * api.js — NewsAPI 请求封装
 * 内存缓存、错误处理、数据清洗
 */

const cache = new Map();

/**
 * 带超时的 fetch 封装
 */
function fetchWithTimeout(url, timeoutMs = CONFIG.FETCH_TIMEOUT) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * 生成缓存键
 */
function cacheKey(country, category, page, keyword) {
    return `${country}|${category}|${page}|${keyword}`;
}

/**
 * 检查缓存是否有效
 */
function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.time > CONFIG.CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function cacheSet(key, data) {
    cache.set(key, { data, time: Date.now() });
}

/**
 * 清洗单篇文章
 */
function cleanArticle(raw) {
    return {
        title:       raw.title         || '无标题',
        description: raw.description   || '',
        url:         raw.url           || '#',
        urlToImage:  raw.urlToImage    || '',
        source:      (raw.source && raw.source.name) || '未知来源',
        publishedAt: formatDate(raw.publishedAt),
        author:      raw.author        || ''
    };
}

/**
 * 过滤并清洗文章列表
 * - 排除标题为 "[Removed]" 的条目
 * - 截断过长摘要
 * - 补充缺省图片
 */
function cleanArticles(articles) {
    return articles
        .filter((a) => a.title !== '[Removed]')
        .map(cleanArticle)
        .map((a) => {
            if (a.description && a.description.length > 200) {
                a.description = a.description.slice(0, 200) + '…';
            }
            return a;
        });
}

/**
 * 请求头条新闻
 * @param {string} country  国家代码
 * @param {string} category 分类
 * @param {number} page     页码
 */
async function fetchTopHeadlines(country, category, page = 1) {
    const key = cacheKey(country, category, page, '');
    const cached = cacheGet(key);
    if (cached) return cached;

    const params = new URLSearchParams({
        apiKey:   CONFIG.API_KEY,
        country:  country,
        category: category,
        pageSize: CONFIG.PAGE_SIZE,
        page:     page
    });

    try {
        const res = await fetchWithTimeout(`${CONFIG.BASE_URL}/top-headlines?${params}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const articles = cleanArticles(json.articles || []);

        // 头条为空时，自动降级
        const lang = CONFIG.COUNTRY_LANG[country];
        const kw = CONFIG.COUNTRY_KEYWORD[country];
        if (articles.length === 0) {
            if (lang) {
                return await fetchEverythingByLang(lang, category, page);
            }
            if (kw) {
                return await fetchEverythingByKeyword(kw, category, page);
            }
        }

        const result = {
            articles,
            totalResults: json.totalResults || 0
        };
        cacheSet(key, result);
        return result;
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求超时 — NewsAPI 可能在国内无法直连，请尝试使用代理或 VPN');
        }
        throw e;
    }
}

/**
 * 按语言搜索新闻（无关键词，用 sortBy 拉最新）
 */
async function fetchEverythingByLang(lang, category = 'general', page = 1) {
    const key = cacheKey('lang', lang, page, category);
    const cached = cacheGet(key);
    if (cached) return cached;

    // 用分类关键词 + 语言过滤
    const catKw = (CONFIG.CATEGORY_KW[category] && CONFIG.CATEGORY_KW[category][lang]) || 'news';
    const params = new URLSearchParams({
        apiKey:   CONFIG.API_KEY,
        q:        catKw,
        language: lang,
        sortBy:   'publishedAt',
        pageSize: CONFIG.PAGE_SIZE,
        page:     page
    });

    try {
        const res = await fetchWithTimeout(`${CONFIG.BASE_URL}/everything?${params}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const result = {
            articles:     cleanArticles(json.articles || []),
            totalResults: json.totalResults || 0
        };
        cacheSet(key, result);
        return result;
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求超时 — NewsAPI 可能在国内无法直连，请尝试使用代理或 VPN');
        }
        throw e;
    }
}

/**
 * 按关键词搜索（用于不支持语言的兜底，如日语韩语）
 */
async function fetchEverythingByKeyword(keyword, category = 'general', page = 1) {
    const key = cacheKey('kw', keyword, page, category);
    const cached = cacheGet(key);
    if (cached) return cached;

    // 国家关键词 + 分类关键词合并搜索
    const catKw = (CONFIG.CATEGORY_KW[category] && CONFIG.CATEGORY_KW[category]['en']) || 'news';
    const q = `${keyword} ${catKw}`;
    const params = new URLSearchParams({
        apiKey:   CONFIG.API_KEY,
        q:        q,
        sortBy:   'publishedAt',
        pageSize: CONFIG.PAGE_SIZE,
        page:     page
    });

    try {
        const res = await fetchWithTimeout(`${CONFIG.BASE_URL}/everything?${params}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const result = {
            articles:     cleanArticles(json.articles || []),
            totalResults: json.totalResults || 0
        };
        cacheSet(key, result);
        return result;
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求超时 — NewsAPI 可能在国内无法直连，请尝试使用代理或 VPN');
        }
        throw e;
    }
}

/**
 * 搜索新闻（关键词 + 分类 + 国家）
 */
async function fetchEverything(keyword, country, page = 1) {
    const key = cacheKey(country, '', page, keyword);
    const cached = cacheGet(key);
    if (cached) return cached;

    let q = keyword;
    // 帮搜索补上国家限定（NewsAPI 不支持 country + q 同时用，所以嵌入到 q 里）
    if (country && country !== 'cn') {
        // 对于非中文源，不加多余限定
    }

    const params = new URLSearchParams({
        apiKey:   CONFIG.API_KEY,
        q:        q,
        pageSize: CONFIG.PAGE_SIZE,
        page:     page,
        sortBy:   'publishedAt',
        language: country === 'cn' ? 'zh' : 'en'
    });

    try {
        const res = await fetchWithTimeout(`${CONFIG.BASE_URL}/everything?${params}`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }
        const json = await res.json();
        const result = {
            articles:     cleanArticles(json.articles || []),
            totalResults: json.totalResults || 0
        };
        cacheSet(key, result);
        return result;
    } catch (e) {
        if (e.name === 'AbortError') {
            throw new Error('请求超时 — NewsAPI 可能在国内无法直连，请尝试使用代理或 VPN');
        }
        throw e;
    }
}
