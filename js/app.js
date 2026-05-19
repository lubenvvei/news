/**
 * app.js — 主控逻辑
 * 事件绑定、页面初始化、状态驱动渲染
 */

const app = {
    /** 主渲染入口 — 根据 state 决定显示什么 */
    render() {
        const main = document.getElementById('mainContent');

        // 先更新导航栏（不依赖异步数据）
        document.getElementById('appNav').innerHTML = renderNav();
        this._rebindNav();

        if (state.loading) {
            main.innerHTML = renderSkeletons(CONFIG.PAGE_SIZE, '正在连接 NewsAPI…');
        } else if (state.error) {
            main.innerHTML = renderError(state.error);
            this._rebindRetry();
        } else {
            main.innerHTML = renderCards(state.articles) + renderLoadMore();
            this._rebindLoadMore();
        }
    },

    /** 加载数据 */
    async loadNews(resetPage = true) {
        if (resetPage) state.page = 1;
        setState({ loading: true, error: null, articles: [] });
        this.render();

        try {
            let result;
            if (state.keyword) {
                result = await fetchEverything(state.keyword, state.country, state.page);
            } else {
                result = await fetchTopHeadlines(state.country, state.category, state.page);
            }
            setState({
                loading: false,
                articles: result.articles,
                totalResults: result.totalResults,
                error: null
            });
            this.render();
        } catch (e) {
            setState({
                loading: false,
                error: e.message || '网络请求失败，请检查网络后重试'
            });
            this.render();
        }
    },

    /** 加载更多（追加模式） */
    async loadMore() {
        state.page += 1;
        setState({ loading: true, error: null });

        try {
            let result;
            if (state.keyword) {
                result = await fetchEverything(state.keyword, state.country, state.page);
            } else {
                result = await fetchTopHeadlines(state.country, state.category, state.page);
            }
            setState({
                loading: false,
                articles: [...state.articles, ...result.articles],
                error: null
            });
            this.render();
        } catch (e) {
            setState({
                loading: false,
                error: e.message || '加载失败'
            });
            this.render();
        }
    },

    /* ---- 事件绑定 ---- */

    _rebindNav() {
        // 分类切换
        document.querySelectorAll('.nav-categories button').forEach((btn) => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.category;
                if (cat !== state.category) {
                    setState({ category: cat, keyword: '' });
                    this.loadNews(true);
                }
            });
        });

        // 国家切换
        const cs = document.getElementById('countrySelect');
        if (cs) {
            cs.addEventListener('change', () => {
                setState({ country: cs.value, keyword: '' });
                document.getElementById('searchInput').value = '';
                this.loadNews(true);
            });
        }

        // 搜索（防抖）
        const si = document.getElementById('searchInput');
        if (si) {
            si.addEventListener('input', debounce((e) => {
                setState({ keyword: e.target.value.trim() });
                this.loadNews(true);
            }, 500));
        }

        // 主题切换
        const tt = document.getElementById('themeToggle');
        if (tt) {
            tt.addEventListener('click', () => this.toggleTheme());
        }
    },

    _rebindRetry() {
        const btn = document.getElementById('btnRetry');
        if (btn) {
            btn.addEventListener('click', () => this.loadNews(false));
        }
    },

    _rebindLoadMore() {
        const btn = document.getElementById('btnLoadMore');
        if (btn) {
            btn.addEventListener('click', () => this.loadMore());
        }
    },

    /* ---- 主题 ---- */

    toggleTheme() {
        const next = !state.darkMode;
        setState({ darkMode: next });
        document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
        storage.set('darkMode', next);
        // 更新导航栏里的图标
        document.getElementById('appNav').innerHTML = renderNav();
        this._rebindNav();
    },

    initTheme() {
        const saved = storage.get('darkMode', false);
        if (saved) {
            setState({ darkMode: true });
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    },

    /* ---- 启动 ---- */

    init() {
        this.initTheme();
        onStateChange(() => {}); // 占位，实际渲染由 app 自己控制
        this.loadNews(true);
    }
};

// 启动
document.addEventListener('DOMContentLoaded', () => app.init());
