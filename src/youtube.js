// YouTube as a music source: search goes through the site's /api/youtube-search function (the API
// key stays on the server) and playback uses YouTube's official IFrame Player, which must stay
// visible while it plays (see YouTubeStage). YouTube pays rightsholders; nothing is downloaded.

const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};
export const decode=s=>String(s||'').replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi,(m,e)=>e[0]==='#'?String.fromCodePoint(e[1].toLowerCase()==='x'?parseInt(e.slice(2),16):+e.slice(1)):entities[e.toLowerCase()]??m);

// Video titles carry extras ("(Official Video)", "[Lyrics]") and are often "Artist - Song".
const extras=/\s*[([][^)\]]*\b(official|video|audio|lyrics?|visuali[sz]er|hd|4k|m\/?v|remaster(ed)?)\b[^)\]]*[)\]]/gi;
export function parseVideo(v,mood){
 let title=decode(v.title).replace(extras,'').replace(/\s+/g,' ').trim();
 let artist=decode(v.channel).replace(/\s*-\s*Topic$/i,'').replace(/VEVO$/i,'').trim();
 const split=title.match(/^(.+?)\s+[-–—|]\s+(.+)$/);
 if(split){artist=split[1].trim();title=split[2].trim()}
 return {id:`yt-${v.id}`,youtube:v.id,title,artist,album:'YouTube',cover:v.thumb,seconds:v.seconds,genre:'YouTube',moods:[mood],url:`https://www.youtube.com/watch?v=${v.id}`};
}

export async function isConfigured(){
 try{const r=await fetch('/api/youtube-search?status=1',{signal:AbortSignal.timeout(8000)});return r.ok&&(await r.json()).configured===true}catch{return false}
}
export async function search(query,mood){
 const r=await fetch(`/api/youtube-search?${new URLSearchParams({q:query})}`,{signal:AbortSignal.timeout(15000)});
 const data=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(r.status===429?'YouTube search limit reached for today. Try the free mixes.':data.error||'YouTube search failed.');
 return (data.items||[]).map(v=>parseVideo(v,mood));
}

let apiReady=null;
function loadApi(){
 if(window.YT?.Player)return Promise.resolve();
 apiReady??=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('The YouTube player did not load.')),20000);
  const previous=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{clearTimeout(timer);previous?.();resolve()};
  const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>{clearTimeout(timer);apiReady=null;reject(Error('The YouTube player did not load.'))};
  document.head.append(s);
 });
 return apiReady;
}

// Creates the player inside `mount` (an element YouTube replaces with its iframe).
export async function createPlayer(mount,{onState,onError}){
 await loadApi();
 return new Promise(resolve=>{
  const player=new window.YT.Player(mount,{width:'100%',height:'100%',playerVars:{playsinline:1,rel:0,iv_load_policy:3,modestbranding:1,controls:1},
   events:{onReady:()=>resolve(player),onStateChange:e=>onState(e.data),onError:e=>onError(e.data)}});
 });
}
