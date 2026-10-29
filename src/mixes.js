// The library: Spotify-style mixes built from free sources (Audius trending by genre, plus the
// Internet Archive's Creative Commons netlabels). No sign-in; every track streams in full.
import * as audius from './audius';
import {searchOpenMusic} from './openMusic';

export const mixes=[
 {id:'daily',name:'Daily Mix',note:'fresh every day',glyph:'sun',tint:'#f2b06b'},
 {id:'party',name:'Party Mix',note:'house · dance · hip-hop',glyph:'confetti',tint:'#e2577a',genres:['House','Electronic','Hip-Hop/Rap'],mood:'Energy'},
 {id:'chill',name:'Chill Mix',note:'lo-fi · downtempo',glyph:'cloud',tint:'#7fa7c9',genres:['Lo-Fi','Downtempo','Ambient'],mood:'Daydream'},
 {id:'focus',name:'Focus Mix',note:'ambient · classical',glyph:'leaf',tint:'#7fae86',genres:['Ambient','Classical','Lo-Fi'],mood:'Focus'},
 {id:'hiphop',name:'Hip-Hop Mix',note:'rap · trap',glyph:'crown',tint:'#c9a347',genres:['Hip-Hop/Rap','Trap'],mood:'Energy'},
 {id:'pop',name:'Pop & Soul',note:'pop · r&b',glyph:'heart',tint:'#d9809a',genres:['Pop','R&B/Soul'],mood:'Golden hour'},
 {id:'night',name:'After Hours',note:'deep house · downtempo',glyph:'moon',tint:'#7c6fb0',genres:['Deep House','Downtempo','R&B/Soul'],mood:'After hours'},
 {id:'trending',name:'Trending Now',note:'top of the week',glyph:'flame',tint:'#e46a45',genres:[null],mood:'Energy'},
 {id:'archive',name:'Open Archive',note:'creative commons',glyph:'planet',tint:'#8d9a6c',archive:'dream pop',mood:'Daydream'},
];
export const moodMix={'Daydream':'chill','Focus':'focus','Golden hour':'pop','After hours':'night','Energy':'party'};

// Daily Mix: three genres picked from today's date, so it changes daily but stays stable all day.
const dailyPool=['Lo-Fi','House','Pop','Hip-Hop/Rap','R&B/Soul','Electronic','Downtempo','Alternative','Funk','Jazz','Ambient','Deep House'];
function dailyGenres(){const day=Math.floor(Date.now()/864e5);return [0,1,2].map(i=>dailyPool[(day*7+i*5)%dailyPool.length])}

const shuffle=list=>list.map(t=>[Math.random(),t]).sort((a,b)=>a[0]-b[0]).map(([,t])=>t);
const unique=list=>[...new Map(list.map(t=>[t.id,t])).values()];

export async function loadMix(id,mood){
 const mix=mixes.find(m=>m.id===id)||mixes[0];
 const m=mix.mood||mood;
 if(mix.archive)return searchOpenMusic(mix.archive,m);
 const genres=mix.id==='daily'?dailyGenres():mix.genres;
 const lists=await Promise.allSettled(genres.map(g=>audius.trending(g,m,14)));
 const tracks=unique(lists.flatMap(r=>r.status==='fulfilled'?r.value:[]));
 // Audius unreachable: fall back to the archive so music still plays.
 return tracks.length?shuffle(tracks).slice(0,24):searchOpenMusic(mix.archive||'electronic',m);
}

export async function searchAll(query,mood){
 const found=await audius.search(query,mood).catch(()=>[]);
 return found.length?found:searchOpenMusic(query,mood);
}
