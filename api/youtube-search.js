// Vercel serverless function: YouTube music search for Looproom.
// The YouTube Data API key stays on the server (env YOUTUBE_API_KEY, restricted to the YouTube
// Data API in Google Cloud). Results are cached at Vercel's edge for a day, so repeated searches
// (and the Top Hits mix) don't use more of the daily quota.
//   GET /api/youtube-search?status=1  -> {configured}
//   GET /api/youtube-search?q=...     -> {items:[{id,title,channel,thumb,seconds}]}
const API='https://www.googleapis.com/youtube/v3';

const seconds=iso=>{const m=/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso||'');return m?(+(m[1]||0))*3600+(+(m[2]||0))*60+(+(m[3]||0)):0};

export default async function handler(req,res){
 const key=process.env.YOUTUBE_API_KEY;
 if(req.query.status){res.setHeader('Cache-Control','no-store');return res.status(200).json({configured:!!key})}
 const q=String(req.query.q||'').trim().slice(0,120);
 if(!key)return res.status(501).json({error:'YouTube search is not configured on this site.'});
 if(!q)return res.status(400).json({error:'Missing search text.'});
 try{
  // Music category, embeddable videos only (the site plays them in YouTube's embedded player).
  const search=await fetch(`${API}/search?${new URLSearchParams({part:'snippet',type:'video',videoCategoryId:'10',videoEmbeddable:'true',maxResults:'25',q,key})}`);
  const found=await search.json();
  if(!search.ok)return res.status(search.status===403?429:502).json({error:found.error?.message||'YouTube search failed.'});
  const ids=(found.items||[]).map(i=>i.id.videoId).filter(Boolean);
  if(!ids.length){res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');return res.status(200).json({items:[]})}
  const details=await (await fetch(`${API}/videos?${new URLSearchParams({part:'contentDetails,status',id:ids.join(','),key})}`)).json();
  const info=Object.fromEntries((details.items||[]).map(v=>[v.id,v]));
  const items=(found.items||[]).filter(i=>info[i.id.videoId]?.status?.embeddable!==false).map(i=>({
   id:i.id.videoId,title:i.snippet.title,channel:i.snippet.channelTitle,
   thumb:i.snippet.thumbnails?.high?.url||i.snippet.thumbnails?.medium?.url,
   seconds:seconds(info[i.id.videoId]?.contentDetails?.duration),
  })).filter(v=>v.seconds>60&&v.seconds<15*60);
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({items});
 }catch{return res.status(502).json({error:'Could not reach YouTube. Try again.'})}
}
