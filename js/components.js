/**
 * components.js — UI 渲染
 * 导航栏、新闻卡片网格、骨架屏、错误状态
 */

/* ================================================================
 * 导航栏
 * ================================================================ */

function renderNav() {
    const cats = CONFIG.CATEGORIES
        .map((c) => {
            const active = c.key === state.category ? ' class="active"' : '';
            return `<button${active} data-category="${c.key}">${c.label}</button>`;
        })
        .join('');

    const countries = CONFIG.COUNTRIES
        .map((c) => {
            const sel = c.code === state.country ? ' selected' : '';
            return `<option value="${c.code}"${sel}>${c.label}</option>`;
        })
        .join('');

    return `
        <nav class="navbar">
            <div class="nav-top">
                <div class="logo">DailyNews</div>
                <div class="nav-actions">
                    <div class="search-box">
                        <input type="text" id="searchInput" placeholder="搜索新闻…" value="${escapeHtml(state.keyword)}" />
                    </div>
                    <select id="countrySelect">${countries}</select>
                    <button id="themeToggle" class="theme-btn" aria-label="切换主题">
                        ${state.darkMode ? '☀' : '☾'}
                    </button>
                </div>
            </div>
            <div class="nav-categories">${cats}</div>
        </nav>
    `;
}

/* ================================================================
 * 新闻卡片
 * ================================================================ */

function renderCards(articles) {
    if (!articles.length) {
        return `<div class="empty-state">暂无新闻</div>`;
    }
    return `<div class="card-grid">${articles.map(cardHTML).join('')}</div>`;
}

function cardHTML(a) {
    const img = a.urlToImage
        ? `<div class="card-img" style="background-image:url('${escapeAttr(a.urlToImage)}')"></div>`
        : `<div class="card-img placeholder-img"><span>No Image</span></div>`;

    return `
        <article class="card">
            ${img}
            <div class="card-body">
                <h3 class="card-title">
                    <a href="${escapeAttr(a.url)}" target="_blank" rel="noopener">${escapeHtml(a.title)}</a>
                </h3>
                ${a.description ? `<p class="card-desc">${escapeHtml(a.description)}</p>` : ''}
                <div class="card-meta">
                    <span class="card-source">${escapeHtml(a.source)}</span>
                    <span class="card-date">${a.publishedAt}</span>
                </div>
            </div>
        </article>
    `;
}

/* ================================================================
 * 骨架屏（加载中占位）
 * ================================================================ */

function renderSkeletons(count = 6, statusText = '正在加载…') {
    let html = `<div class="skeleton-status">${escapeHtml(statusText)}</div><div class="card-grid">`;
    for (let i = 0; i < count; i++) {
        html += `
            <div class="card skeleton">
                <div class="skeleton-img shimmer"></div>
                <div class="card-body">
                    <div class="skeleton-line shimmer" style="width:80%"></div>
                    <div class="skeleton-line shimmer" style="width:60%"></div>
                    <div class="skeleton-line shimmer" style="width:40%"></div>
                </div>
            </div>`;
    }
    html += '</div>';
    return html;
}

/* ================================================================
 * 错误状态
 * ================================================================ */

function renderError(msg) {
    return `
        <div class="error-state">
            <div class="error-icon">!</div>
            <p class="error-msg">${escapeHtml(msg)}</p>
            <button class="btn-retry" id="btnRetry">重试</button>
        </div>
    `;
}

/* ================================================================
 * 加载更多按钮
 * ================================================================ */

function renderLoadMore() {
    const loaded = state.articles.length;
    if (loaded >= state.totalResults) return '';
    return `
        <div class="load-more-wrap">
            <button class="btn-load-more" id="btnLoadMore">加载更多</button>
            <span class="load-count">${loaded} / ${state.totalResults}</span>
        </div>
    `;
}

/* ================================================================
 * HTML 转义
 * ================================================================ */

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
