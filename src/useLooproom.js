import {useState,useEffect,useRef,useMemo} from 'react';
import {catalog,demoLines} from './catalog';
import {rankTracks,parseLrc,readPrefs} from './logic';
import * as spotify from './spotify';
import {moodTerms} from './openMusic';
import {loadMix as fetchMix,searchAll,moodMix,mixes,genres} from './mixes';
import {findLyrics} from './lyrics';

const EMPTY=[];
// Spotify's names for the library genres that differ.
const spotifyGenres={'Hip-Hop/Rap':'hip hop','R&B/Soul':'r&b','Drum & Bass':'drum and bass','Lo-Fi':'lo-fi','Deep House':'deep house'};

// All player state and behaviour. Components receive slices of this as props.
// Every function returned is a stable wrapper around its latest version, so memoised components
// (see memoIgnoringClock) can skip the ~12 renders a second that the playback clock causes.
export function useLooproom(){
 const latest=useRef({}),stable=useRef({});
 const [backgroundMotion,setBackgroundMotion]=useState(true);
 const [tracks,setTracks]=useState(catalog),[current,setCurrent]=useState(catalog[0]),[playing,setPlaying]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(catalog[0].seconds),[volume,setVolume]=useState(.65),[mood,setMood]=useState('Daydream'),[genre,setGenre]=useState('All genres'),[prefs,setPrefs]=useState(readPrefs),[recent,setRecent]=useState([]),[repeat,setRepeat]=useState(false),[auto,setAuto]=useState(true),[focus,setFocus]=useState(false),[activeTab,setActiveTab]=useState('Room'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[connected,setConnected]=useState(false),[device,setDevice]=useState(''),[search,setSearch]=useState(''),[modal,setModal]=useState(null),[clientId,setClientId]=useState(()=>localStorage.getItem('looproom-client')||spotify.DEFAULT_CLIENT_ID),[spotifyTracks,setSpotifyTracks]=useState([]),[mode,setMode]=useState('demo'),[mix,setMix]=useState('daily');
 const audio=useRef(null),player=useRef(null),dialog=useRef(null),fileInput=useRef(null),lyricInput=useRef(null),artInput=useRef(null),urls=useRef([]),live=useRef({}),authStarted=useRef(false),selection=useRef(0),clock=useRef({pos:0,at:0});
 const queue=useMemo(()=>rankTracks(mode==='spotify'?spotifyTracks:tracks,current.id,mood,mode==='spotify'?'All genres':genre,prefs,recent),[tracks,spotifyTracks,current,mood,genre,prefs,recent,mode]);
 // Real songs (Spotify, open music, uploads) get synced lyrics looked up online; demo tracks keep their visual poem.
 const [found,setFound]=useState({});
 const lookupLyrics=!current.lyrics&&(current.spotify||current.open||current.audius||current.upload);
 const lyricsStatus=current.lyrics?'own':!lookupLyrics?'demo':current.id in found?(found[current.id]?'found':'none'):'loading';
 const lines=current.lyrics||(lookupLyrics?found[current.id]||EMPTY:demoLines);
 // Streamed library tracks (Audius mixes, archive.org) as opposed to the bundled demo and uploads.
 const remote=t=>t.audius||t.open;
 useEffect(()=>{if(!lookupLyrics||current.id in found)return;let active=true;const id=current.id;findLyrics(current).then(l=>{if(active)setFound(f=>({...f,[id]:l}))},()=>{if(active)setFound(f=>({...f,[id]:null}))});return()=>{active=false}},[current.id,lookupLyrics]);
 // Small lead so a line is on screen as it is sung, not after its entrance animation.
 const activeLine=Math.max(0,lines.findLastIndex(l=>l.time<=time+.15));
 live.current={current,queue,repeat,auto,mode,time,prefs,mood,spotifyTracks,tracks,entered:live.current.entered};
 function notify(text){setMessage(text)}
 async function run(fn){try{await fn()}catch(e){notify(e.message||'Something went wrong. Please try again.')}}
 function preference(id,change){setPrefs(p=>{const next={...p,[id]:{...p[id],...change}};try{localStorage.setItem('looproom-prefs',JSON.stringify(next))}catch{}return next})}
 function like(){preference(current.id,{liked:!prefs[current.id]?.liked})}
 async function select(t,shouldPlay=true){
  const request=++selection.current;
  setRecent(r=>[...r.slice(-3),current.id]);setCurrent(t);setTime(0);setDuration(t.seconds||0);setPlaying(false);
  if(t.spotify){setMode('spotify');audio.current.pause();if(!device)throw Error('Spotify is still connecting. Wait for “Spotify ready” and try again.');await player.current?.activateElement();const rest=auto?rankTracks(spotifyTracks,t.id,mood,'All genres',prefs,[]):spotifyTracks.filter(x=>x.id!==t.id);await spotify.api('/me/player/play?device_id='+device,'PUT',{uris:[t.uri,...rest.slice(0,9).map(x=>x.uri)]});await spotify.api('/me/player/repeat?state=context&device_id='+device,'PUT');}
  else{setMode('demo');if(player.current)await player.current.pause().catch(()=>{});audio.current.src=t.src;audio.current.load();if(shouldPlay){try{await audio.current.play()}catch(e){if(request===selection.current&&e.name!=='AbortError')throw Error('Tap play to start this track. If it still fails, try another audio file.')}}}
 }
 async function next(skipped=true){const s=live.current;if(skipped)preference(s.current.id,{skips:(s.prefs[s.current.id]?.skips||0)+1});if(s.mode==='spotify'){if(s.current.spotify&&!s.auto)await player.current.nextTrack();else if(s.queue.length)await select(s.queue[0]);else await startSpotify();return}let nextTrack=s.queue[0];if(!s.auto)nextTrack=tracks[(tracks.findIndex(t=>t.id===s.current.id)+1)%tracks.length];if(nextTrack)await select(nextTrack);else{audio.current.currentTime=0;await audio.current.play()}}
 // The Spotify device has no queue until Looproom starts a track on it; play/next would fail with "no list was loaded".
 async function startSpotify(){const s=live.current,first=s.queue[0]||s.spotifyTracks[0];if(!first)throw Error('Search for a song or pick a mood to start Spotify.');await select(first)}
 async function toggle(){if(current.spotify){if(!player.current)throw Error('Connect Spotify first.');await player.current.activateElement();await player.current.togglePlay()}else if(mode==='spotify')await startSpotify();else{if(audio.current.paused)await audio.current.play();else audio.current.pause()}}
 async function previous(){if(current.spotify)return player.current.previousTrack();if(time>3){audio.current.currentTime=0;return}const id=recent.at(-1);await select(tracks.find(t=>t.id===id)||tracks[(tracks.findIndex(t=>t.id===current.id)-1+tracks.length)%tracks.length])}
 function seek(seconds){setTime(seconds);syncClock(seconds);run(async()=>{if(current.spotify)await player.current.seek(seconds*1000);else audio.current.currentTime=seconds})}
 async function changeVolume(v){setVolume(v);audio.current.volume=v;if(player.current)await player.current.setVolume(v)}
 async function searchSpotify(query,requestedMood=mood,playFirst=false){if(!query.trim())return;setBusy(true);try{const data=await spotify.api('/search?'+new URLSearchParams({q:query,type:'track',limit:'10'}));const found=(data.tracks?.items||[]).filter(Boolean).map(t=>spotify.mapTrack(t,requestedMood));setSpotifyTracks(found);if(!found.length)notify('No songs found. Try another artist or song.');if(playFirst&&found.length){await select(found[0]);}}finally{setBusy(false)}}
 async function chooseMood(m){setMood(m);if(mode==='spotify'&&connected){await searchSpotify(moodTerms[m],m,false);notify('Fresh picks are ready. Choose a track to start your new mood.')}else{await loadMix(moodMix[m],m);notify(`${m}: ${mixes.find(x=>x.id===moodMix[m]).name} is in your room.`)}}
 // Loads a library mix (or search results) in place of the previous one; demo tracks and uploads stay.
 // Once the listener has entered, a fresh list starts playing if nothing streamed was playing yet.
 function applyResults(found,playFirst){if(!found.length)throw Error('No songs found for that. Try another word.');setTracks(ts=>[...found,...ts.filter(t=>!remote(t))]);const s=live.current;if(playFirst||(s.entered&&!remote(s.current)&&s.mode!=='spotify'))return select(found[0])}
 async function loadMix(id,requestedMood=live.current.mood,playFirst=false){setMix(id);if(!id.startsWith('genre:'))setGenre('All genres');setBusy(true);try{await applyResults(await fetchMix(id,requestedMood),playFirst)}finally{setBusy(false)}}
 // Picking a genre plays that genre: Spotify's genre search when signed in, otherwise the free
 // library's trending tracks for it.
 function chooseGenre(g){setGenre(g);if(g==='All genres')return;if(mode==='spotify')return searchSpotify(`genre:"${spotifyGenres[g]||g.toLowerCase()}"`,mood,true);return loadMix('genre:'+g,mood,true)}
 async function searchMusic(query){if(!query.trim())return;if(mode==='spotify')return searchSpotify(query);setMix('search');setBusy(true);try{await applyResults(await searchAll(query,mood),true)}finally{setBusy(false)}}
 // Called from the intro's "tap to enter" (a user gesture, so the browser allows sound).
 function enter(){live.current.entered=true;if(live.current.mode==='spotify')return run(toggle);const first=live.current.tracks.find(remote);run(()=>first?select(first):audio.current.play())}
 async function spotifyFallback(e){player.current?.disconnect();player.current=null;setConnected(false);setDevice('');setSpotifyTracks([]);setMode('demo');notify(`${e.message} Playing the free library instead.`);await run(()=>loadMix(moodMix[live.current.mood],live.current.mood,true))}
 useEffect(()=>{audio.current.volume=.65;const start=()=>enter();addEventListener('looproom:enter',start);return()=>{removeEventListener('looproom:enter',start);urls.current.forEach(URL.revokeObjectURL)}},[]);
 // Playback clock: timeupdate (~4 Hz) and Spotify polling are too coarse for lyrics, so while playing
 // time is read every ~80 ms; Spotify position is interpolated from its last reported state.
 function syncClock(pos){clock.current={pos,at:performance.now()}}
 useEffect(()=>{if(!playing)return;let frame=0,last=0;const tick=now=>{frame=requestAnimationFrame(tick);if(now-last<80)return;last=now;setTime(live.current.mode==='spotify'?clock.current.pos+(now-clock.current.at)/1000:audio.current.currentTime)};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame)},[playing]);
 // Full screen: an immersive layout (player + lyrics, no chrome) plus the browser's Fullscreen API
 // where it is allowed. iPhone Safari and embedded browsers refuse page full screen; they keep the layout.
 const [fullscreen,setFullscreen]=useState(false);
 function immersive(on){setFullscreen(on);setFocus(on)}
 async function toggleFullscreen(){
  if(document.fullscreenElement||document.webkitFullscreenElement)return (document.exitFullscreen||document.webkitExitFullscreen).call(document);
  if(fullscreen)return immersive(false);
  immersive(true);
  const el=document.documentElement,request=el.requestFullscreen||el.webkitRequestFullscreen;
  try{await request?.call(el)}catch{/* Refused: the immersive layout still applies. */}
 }
 useEffect(()=>{const sync=()=>immersive(!!(document.fullscreenElement||document.webkitFullscreenElement));document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);return()=>{document.removeEventListener('fullscreenchange',sync);document.removeEventListener('webkitfullscreenchange',sync)}},[]);
 useEffect(()=>{if(!message)return;const id=setTimeout(()=>setMessage(''),8000);return()=>clearTimeout(id)},[message]);
 useEffect(()=>{if(modal)dialog.current?.showModal();else dialog.current?.close()},[modal]);
 useEffect(()=>{if(authStarted.current)return;authStarted.current=true;(async()=>{
  let signedIn=false;
  try{
   signedIn=await spotify.finishAuth()||spotify.restore();
   if(!signedIn){await loadMix('daily');return}
   audio.current.pause();setBusy(true);setMode('spotify');
   player.current=await spotify.connectPlayer(state=>{if(!state||live.current.mode!=='spotify')return;setPlaying(!state.paused);syncClock(state.position/1000);setTime(state.position/1000);setDuration(state.duration/1000);const t=state.track_window.current_track;if(t)setCurrent(old=>old.id===t.id?old:spotify.mapTrack(t,live.current.mood||'Daydream'))},(e,fatal)=>fatal?spotifyFallback(e):notify(/no list was loaded/i.test(e.message)?'Spotify is ready. Press play or pick a song to start.':e.message),id=>{setDevice(id);setConnected(true);notify('Spotify ready. Search for a song, or select a mood.');setModal(null)});
   await searchSpotify('dream pop');
  }catch(e){signedIn?spotifyFallback(e):notify(e.message)}
  finally{setBusy(false)}
 })()},[]);
 useEffect(()=>{if(!connected)return;const id=setInterval(()=>{if(live.current.mode!=='spotify')return;player.current?.getCurrentState().then(s=>{if(s){syncClock(s.position/1000);setPlaying(!s.paused)}}).catch(()=>{})},750);return()=>clearInterval(id)},[connected]);
 useEffect(()=>{function key(e){if(['INPUT','TEXTAREA','BUTTON','SELECT'].includes(e.target.tagName)||dialog.current?.open)return;if(e.code==='Space'){e.preventDefault();run(toggle)}if(e.key==='ArrowRight')run(()=>next());if(e.key==='ArrowLeft')run(previous);if(e.key.toLowerCase()==='f'&&!e.metaKey&&!e.ctrlKey&&!e.altKey)run(toggleFullscreen);if(e.key==='Escape'&&fullscreen)immersive(false)}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)});
 async function importAudio(files){const added=[];for(const f of files){if(!f.type.startsWith('audio/')&&!/\.(mp3|wav|ogg|m4a|flac)$/i.test(f.name))continue;const url=URL.createObjectURL(f);urls.current.push(url);added.push({id:crypto.randomUUID(),title:f.name.replace(/\.[^.]+$/,''),artist:'Your collection',album:'Local files',genre:genre==='All genres'?'Lo-fi':genre,moods:[mood],cover:catalog[0].cover,src:url,upload:true})}if(!added.length)throw Error('Choose an audio file such as MP3, WAV, or M4A.');setTracks(t=>[...t,...added]);await select(added[0]);notify('Added to this session. Add an .lrc file to bring the lyrics to life.')}
 async function importLyrics(f){if(!f)return;const lyrics=parseLrc(await f.text());if(!lyrics.length)throw Error('No timed lyrics found. Use an .lrc file with [00:12.50] timestamps.');const updated={...current,lyrics};setCurrent(updated);setTracks(ts=>ts.map(t=>t.id===current.id?updated:t));notify('Lyrics synced. Tap any line to jump to it.')}
 function importArt(f){if(!f)return;if(!f.type.startsWith('image/'))return notify('Choose an image file.');const cover=URL.createObjectURL(f);urls.current.push(cover);setCurrent(t=>({...t,cover}));setTracks(ts=>ts.map(t=>t.id===current.id?{...t,cover}:t))}
 async function disconnect(){player.current?.disconnect();player.current=null;spotify.disconnect();setConnected(false);setDevice('');setSpotifyTracks([]);setMode('demo');await select(catalog[0],false);notify('Spotify disconnected. Sign in again whenever you like.')}
 const visibleTracks=useMemo(()=>{const list=mode==='spotify'?spotifyTracks:tracks;return activeTab==='Favorites'?list.filter(t=>prefs[t.id]?.liked):list},[activeTab,mode,spotifyTracks,tracks,prefs]);
 const audioEvents=useMemo(()=>({onPlay:()=>setPlaying(true),onPause:()=>{if(live.current.mode!=='spotify')setPlaying(false)},onTimeUpdate:()=>{if(live.current.mode!=='spotify')setTime(audio.current.currentTime)},onLoadedMetadata:()=>{if(live.current.mode!=='spotify')setDuration(audio.current.duration)},onEnded:()=>latest.current.run(async()=>{const s=live.current;latest.current.preference(s.current.id,{completed:(s.prefs[s.current.id]?.completed||0)+1});if(s.repeat){audio.current.currentTime=0;await audio.current.play()}else await latest.current.next(false)}),onError:()=>{if(live.current.mode!=='spotify')latest.current.notify('This audio could not be played. Try another track or a supported audio file.')}}),[]);
 const api={backgroundMotion,setBackgroundMotion,tracks,current,playing,time,duration,volume,mood,genre,setGenre,prefs,setPrefs,repeat,setRepeat,auto,setAuto,focus,setFocus,activeTab,setActiveTab,message,setMessage,busy,connected,search,setSearch,modal,setModal,clientId,setClientId,mode,audio,dialog,fileInput,lyricInput,artInput,queue,lines,activeLine,notify,run,preference,like,select,next,toggle,previous,seek,changeVolume,searchSpotify,chooseMood,importAudio,importLyrics,importArt,disconnect,visibleTracks,searchMusic,mix,loadMix,chooseGenre,genres,lyricsStatus,fullscreen,toggleFullscreen,audioEvents};
 for(const [k,v] of Object.entries(api))if(typeof v==='function'){latest.current[k]=v;stable.current[k]??=(...args)=>latest.current[k](...args);api[k]=stable.current[k]}
 return api;
}
