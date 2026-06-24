/**
 * YouTube Data API v3 client.
 *
 * Quota matters: each search.list costs 100 of your 10,000 daily units
 * (~100 searches/day). So results are cached by the courses library, and we
 * fetch a batch of videos in ONE search, then enrich them all with a single
 * cheap videos.list call (1 unit) for duration + view counts.
 */

function decodeHtml(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

// "PT1H2M3S" -> "1:02:03" ; "PT5M21S" -> "5:21"
function parseDuration(iso) {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] || "0", 10);
  const mi = parseInt(m[2] || "0", 10);
  const s = parseInt(m[3] || "0", 10);
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(mi)}:${pad(s)}` : `${mi}:${pad(s)}`;
}

export async function searchYouTube({
  query,
  maxResults = 9,
  relevanceLanguage = "en",
}) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YouTube API key is not set.");

  // 1) Search (costs 100 units)
  const sp = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: query,
    maxResults: String(maxResults),
    safeSearch: "strict", // keep it appropriate for students
    relevanceLanguage, // bias results toward the chosen language
    videoEmbeddable: "true",
    key,
  });
  const sres = await fetch(
    `https://www.googleapis.com/youtube/v3/search?${sp.toString()}`
  );
  if (!sres.ok) {
    const t = await sres.text();
    throw new Error(`YouTube ${sres.status}: ${t.slice(0, 160)}`);
  }
  const sdata = await sres.json();
  const items = Array.isArray(sdata.items) ? sdata.items : [];
  const ids = items.map((i) => i.id?.videoId).filter(Boolean);
  if (!ids.length) return [];

  // 2) Enrich with duration + views (costs just 1 unit total)
  const details = {};
  try {
    const vp = new URLSearchParams({
      part: "contentDetails,statistics,snippet",
      id: ids.join(","),
      key,
    });
    const vres = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${vp.toString()}`
    );
    if (vres.ok) {
      const vdata = await vres.json();
      for (const v of vdata.items || []) details[v.id] = v;
    }
  } catch {
    // enrichment is optional; we still have the basics from search
  }

  return ids.map((id) => {
    const base = items.find((i) => i.id?.videoId === id);
    const d = details[id];
    const sn = d?.snippet || base?.snippet || {};
    const thumb =
      sn.thumbnails?.medium?.url || sn.thumbnails?.default?.url || "";
    return {
      id,
      title: decodeHtml(sn.title || ""),
      channel: decodeHtml(sn.channelTitle || ""),
      thumbnail: thumb,
      duration: parseDuration(d?.contentDetails?.duration),
      views: d?.statistics?.viewCount ? Number(d.statistics.viewCount) : null,
      url: `https://www.youtube.com/watch?v=${id}`,
    };
  });
}