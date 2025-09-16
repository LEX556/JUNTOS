// /api/ig.js  ← ルート直下に api フォルダを作って配置
export default async function handler(req, res) {
  const IG_USER_ID = process.env.IG_USER_ID;        // 例: 1784xxxxxxxxxxxx
  const IG_TOKEN   = process.env.IG_ACCESS_TOKEN;   // 60日長期トークン（環境変数から）

  if (!IG_USER_ID || !IG_TOKEN) {
    return res.status(500).json({ error: "Missing IG_USER_ID or IG_ACCESS_TOKEN" });
  }

  const fields = [
    "id","caption","media_url","permalink",
    "thumbnail_url","media_type","timestamp","username"
  ].join(",");

  const url = `https://graph.facebook.com/v23.0/${IG_USER_ID}/media?fields=${fields}&access_token=${IG_TOKEN}`;

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).send(await r.text());
    const data = await r.json();

    // 同一ドメイン想定ならCORSヘッダは不要。別ドメインから叩くなら下記を有効化。
    // res.setHeader("Access-Control-Allow-Origin", "*");

    // 5分キャッシュ（CDN）
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=60");

    return res.status(200).json({ data: (data.data || []).slice(0, 9) });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
