// Open-licensed music from the Internet Archive's netlabels collection
// (Creative Commons releases). Public, CORS-enabled APIs; no key needed.
const ARCHIVE='https://archive.org';

export const moodTerms={'Daydream':'dream pop','Focus':'ambient','Golden hour':'indie','After hours':'downtempo','Energy':'electronic'};

async function json(url){
 const r=await fetch(url,{signal:AbortSignal.timeout(15000)});
 if(!r.ok)throw Error(`Open music request failed (${r.status}).`);
 return r.json();
}
const seconds=length=>{const parts=String(length||'').split(':').map(Number);return parts.some(isNaN)?0:parts.reduce((a,b)=>a*60+b,0)};

async function firstTrack(doc,mood){
 const meta=await json(`${ARCHIVE}/metadata/${encodeURIComponent(doc.identifier)}`);
 const file=(meta.files||[]).find(f=>/\.mp3$/i.test(f.name));
 if(!file)return null;
 return {
  id:`ia-${doc.identifier}-${file.name}`,
  title:file.title||file.name.replace(/\.mp3$/i,'').replace(/[-_]+/g,' '),
  artist:[].concat(meta.metadata?.creator||doc.creator||'Unknown artist')[0],
  album:[].concat(meta.metadata?.title||doc.title||'Internet Archive')[0],
  cover:`${ARCHIVE}/services/img/${encodeURIComponent(doc.identifier)}`,
  src:`${ARCHIVE}/download/${encodeURIComponent(doc.identifier)}/${encodeURIComponent(file.name)}`,
  url:`${ARCHIVE}/details/${encodeURIComponent(doc.identifier)}`,
  license:meta.metadata?.licenseurl,
  seconds:seconds(file.length),
  genre:'Open music',moods:[mood],open:true,
 };
}

// One track from each of up to 8 popular matching releases, in random order.
export async function searchOpenMusic(query,mood){
 const words=String(query).replace(/[^\p{L}\p{N}\s]/gu,' ').trim();
 if(!words)return [];
 const q=`collection:netlabels AND mediatype:audio AND (subject:(${words}) OR title:(${words}) OR creator:(${words}))`;
 const params=new URLSearchParams({q,'fl[]':'identifier','sort[]':'downloads desc',rows:'40',output:'json'});
 ['title','creator'].forEach(f=>params.append('fl[]',f));
 const docs=(await json(`${ARCHIVE}/advancedsearch.php?${params}`)).response?.docs||[];
 const picks=docs.sort(()=>Math.random()-.5).slice(0,8);
 const tracks=await Promise.allSettled(picks.map(d=>firstTrack(d,mood)));
 return tracks.map(r=>r.status==='fulfilled'?r.value:null).filter(Boolean);
}
