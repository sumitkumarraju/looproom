// Synced lyrics from LRCLIB (lrclib.net), a free, keyless, CORS-enabled lyrics database.
import {parseLrc} from './logic';

const API='https://lrclib.net/api';
const cache=new Map();

async function json(url){
 const r=await fetch(url,{signal:AbortSignal.timeout(12000)});
 if(r.status===404)return null;
 if(!r.ok)throw Error(`Lyrics lookup failed (${r.status}).`);
 return r.json();
}
const clean=text=>String(text||'').replace(/\s*[([].*?(remaster|version|edit|live|feat|mix).*?[)\]]/gi,'').replace(/\s+-\s+.*$/,'').trim();

// Resolves to parsed lines, or null when no synced lyrics exist.
export function findLyrics({id,title,artist,seconds}){
 if(!cache.has(id))cache.set(id,lookup(clean(title),String(artist||'').split(',')[0].trim(),seconds).catch(e=>{cache.delete(id);throw e}));
 return cache.get(id);
}

async function lookup(title,artist,seconds){
 if(!title)return null;
 const exact=artist&&seconds?await json(`${API}/get?${new URLSearchParams({track_name:title,artist_name:artist,duration:String(Math.round(seconds))})}`):null;
 let synced=exact?.syncedLyrics;
 if(!synced){
  const results=await json(`${API}/search?${new URLSearchParams(artist?{track_name:title,artist_name:artist}:{q:title})}`)||[];
  const close=results.filter(r=>r.syncedLyrics&&(!seconds||Math.abs(r.duration-seconds)<10));
  synced=(close[0]||results.find(r=>r.syncedLyrics))?.syncedLyrics;
 }
 const lines=synced?parseLrc(synced):[];
 return lines.length?lines:null;
}
