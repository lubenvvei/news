/**
 * state.js — 全局状态管理
 * 单一状态对象，通过 setState 更新并触发 UI 重绘
 */

const state = {
    category: 'general',
    country: 'cn',
    page: 1,
    keyword: '',
    articles: [],
    totalResults: 0,
    loading: false,
    darkMode: false,
    error: null
};

/** 订阅者列表 — 每次 setState 后依次调用 */
const listeners = [];

function onStateChange(fn) {
    listeners.push(fn);
}

/**
 * 合并更新状态，然后通知所有订阅者
 */
function setState(patch) {
    Object.assign(state, patch);
    listeners.forEach((fn) => fn(state));
}
