// Audius (audius.co): a free, artist-uploaded music network whose public API allows apps to
// stream full tracks with no key or sign-in. app_name identifies Looproom to the API.
const API='https://api.audius.co/v1';
const APP='app_name=looproom';

async function json(path){
 const r=await fetch(`${API}${path}${path.includes('?')?'&':'?'}${APP}`,{signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error(`Audius request failed (${r.status}).`);
 return (await r.json()).data||[];
}

export function mapTrack(t,mood){
 return {
  id:`au-${t.id}`,title:t.title,artist:t.user?.name||'Audius artist',album:t.genre||'Audius',
  cover:t.artwork?.['480x480']||t.artwork?.['1000x1000'],
  src:`${API}/tracks/${t.id}/stream?${APP}`,url:`https://audius.co${t.permalink}`,
  seconds:t.duration,genre:t.genre||'Audius',moods:[mood],audius:true,
 };
}
const playable=list=>list.filter(t=>t.is_streamable!==false&&t.duration>45);

export async function trending(genre,mood,limit=20){return playable(await json(`/tracks/trending?${new URLSearchParams({time:'week',limit:String(limit),...(genre?{genre}:{})})}`)).map(t=>mapTrack(t,mood))}
export async function search(query,mood){return playable(await json(`/tracks/search?${new URLSearchParams({query,limit:'20'})}`)).map(t=>mapTrack(t,mood))}
