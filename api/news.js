/**
 * Vercel Serverless Function — NewsAPI 代理
 * 前端调 /api/news?endpoint=... 实际由本函数用服务端 Key 请求 NewsAPI
 */
export default async function handler(req, res) {
    // 只允许 GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { endpoint, ...params } = req.query;

    if (!endpoint) {
        return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // 白名单 — 只代理这两个 NewsAPI 端点
    const allowed = ['top-headlines', 'everything'];
    if (!allowed.includes(endpoint)) {
        return res.status(400).json({ error: 'Invalid endpoint' });
    }

    // 注入服务端 API Key
    params.apiKey = process.env.NEWSAPI_KEY;

    const url = `https://newsapi.org/v2/${endpoint}?${new URLSearchParams(params)}`;

    try {
        const upstream = await fetch(url);
        const data = await upstream.json();

        if (!upstream.ok) {
            return res.status(upstream.status).json(data);
        }

        // 设置缓存头（Vercel Edge 缓存 60 秒）
        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
        return res.status(200).json(data);
    } catch (e) {
        return res.status(502).json({ error: 'Upstream unreachable', detail: e.message });
    }
}
