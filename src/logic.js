export const moods = ['Daydream','Focus','Golden hour','After hours','Energy'];
export function parseLrc(text) {
 const lines=[]; let offset=Number(text.match(/\[offset:([+-]?\d+)\]/)?.[1]||0)/1000;
 for(const line of text.split(/\r?\n/)) { const stamps=[...line.matchAll(/\[(\d+):(\d{2})(?:\.(\d{1,3}))?\]/g)]; const content=line.replace(/\[[^\]]*\]/g,'').replace(/<\d+:\d+(?:\.\d+)?>/g,'').replace(/\s+/g,' ').trim(); for(const m of stamps) if(content) lines.push({time:Math.max(0,Number(m[1])*60+Number(m[2])+Number('0.'+(m[3]||0))+offset),text:content}); }
 return lines.sort((a,b)=>a.time-b.time);
}
export function rankTracks(tracks,current,mood,genre,prefs={},recent=[]) {
 return tracks.filter(t=>t.id!==current && (genre==='All genres'||t.genre===genre)).map(t=>{
 const pref=prefs[t.id]||{};
 const score=(t.moods?.includes(mood)?4:0)+(pref.liked?3:0)-(pref.skips||0)*1.2+(pref.completed||0)*.3-(recent.includes(t.id)?5:0);
 return {...t,score,reason:pref.liked?'A favorite of yours':t.moods?.includes(mood)?`Fits ${mood.toLowerCase()}`:'A little discovery'};
 }).sort((a,b)=>b.score-a.score);
}
export const formatTime=s=>`${Math.floor((s||0)/60)}:${String(Math.floor((s||0)%60)).padStart(2,'0')}`;
export function readPrefs(){try{return JSON.parse(localStorage.getItem('looproom-prefs')||'{}')}catch{return {}}}
