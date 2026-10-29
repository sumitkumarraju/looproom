import {useEffect,useRef,useState} from 'react';
import {Plus,ArrowsOutSimple,ArrowsInSimple,SpotifyLogo,ArrowUpRight} from '@phosphor-icons/react';
import {IconButton} from './ui';
import KineticText from './KineticText';
import TypeStorm from './TypeStorm';

const themes={apple:'flow',storm:'type storm'};
function savedTheme(){try{return localStorage.getItem('looproom-lyric-theme')==='storm'?'storm':'apple'}catch{return 'apple'}}

// Synced lyrics only time whole lines, so each word gets a share of the line's sung time in
// proportion to its length (a rough syllable count). Each word then lights up left to right
// with a soft glowing edge as it is sung (see .sung-word).
function SungLine({text,start,end,time}){
 const words=text.split(/\s+/).filter(Boolean),weights=words.map(w=>Math.max(2,w.replace(/[^\p{L}\p{N}]/gu,'').length));
 const total=weights.reduce((a,b)=>a+b,0),span=Math.max(.8,Math.min(end-start,8)*.85);
 let at=start;
 return <span><span className="sr-only">{text}</span><span aria-hidden="true">{words.map((w,i)=>{
  const from=at,to=at+span*weights[i]/total;at=to;
  const p=Math.min(1,Math.max(0,(time-from)/(to-from)));
  return <span key={i}>{i>0&&' '}<span className="kinetic-word sung-word" style={{'--p':`${(p*100).toFixed(1)}%`,'--glow':p.toFixed(2),animationDelay:`${i*.05}s`}}>{w}</span></span>;
 })}</span></span>;
}

// Apple Music–style lyrics: the active line pops in and is sung word by word, the rest blur
// with distance, and lines glide into place with a staggered spring (see .lyric-line).
export default function LyricWindow({current,mood,lines,lyricsStatus,activeLine,time,duration,playing,focus,setFocus,seek,lyricInput}){
 const list=useRef(null);
 const [theme,setTheme]=useState(savedTheme);
 function pickTheme(next){setTheme(next);try{localStorage.setItem('looproom-lyric-theme',next)}catch{}}
 useEffect(()=>{
  const el=list.current;if(!el||!lines.length)return;
  const line=el.children[activeLine];
  if(line)el.style.setProperty('--shift',`${Math.round(el.parentElement.clientHeight*.3-line.offsetTop)}px`);
 },[activeLine,current.id,lines.length,theme]);
 const eyebrow={own:'live lyrics · synced',found:'live lyrics · lrclib',loading:'finding lyrics…',none:current.spotify?'just you & the music':'no synced lyrics found',demo:'a little daydream · demo'}[lyricsStatus];
 const foot={own:'Tap a line to jump there.',found:'Synced lyrics from LRCLIB · tap a line to jump there.',loading:'Looking up synced lyrics…',none:current.spotify?'Enjoy the whole track.':'Add a timed .lrc file to follow along.',demo:'Original visual poem · instrumental audio'}[lyricsStatus];
 return <section className="lyrics" aria-label="Lyrics">
  <div className="lyrics-head"><span className="eyebrow">{eyebrow}</span>
   <span className="flex items-center gap-1">{lines.length>0&&<span className="theme-switch" role="group" aria-label="Lyric animation">{Object.entries(themes).map(([id,label])=><button key={id} aria-pressed={theme===id} onClick={()=>pickTheme(id)}>{label}</button>)}</span>}{!current.spotify&&<IconButton label="Import timed lyrics" onClick={()=>lyricInput.current.click()}><Plus size={16}/></IconButton>}<IconButton label={focus?'Exit focus view':'Focus view'} onClick={()=>setFocus(!focus)}>{focus?<ArrowsInSimple size={16}/>:<ArrowsOutSimple size={16}/>}</IconButton></span></div>
  {lines.length&&theme==='storm'?<TypeStorm lines={lines} activeLine={activeLine} time={time} duration={duration} bpm={current.bpm} mood={mood} playing={playing} seek={seek}/>
  :lines.length?<div className="lyrics-viewport"><div ref={list} className="lyric-lines">{lines.map((l,i)=>{const d=i-activeLine;return <button key={`${current.id}-${i}`} className={'lyric-line '+(d===0?'current':d<0?'past':'future')} style={{'--d':Math.min(Math.abs(d),5)}} onClick={()=>seek(l.time)}>{d===0?<SungLine key={'on'+i} text={l.text} start={l.time} end={lines[i+1]?.time??l.time+5} time={time}/>:l.text}</button>})}</div></div>
  :lyricsStatus==='loading'?<div className="lyrics-empty"><KineticText as="h2" text="Finding the words…"/><p>Looking up synced lyrics for {current.title}.</p></div>
  :current.spotify?<div className="lyrics-empty"><SpotifyLogo size={40}/><KineticText as="h2" text="Make yourself at home."/><p>No synced lyrics for this one. Let the music do the talking.</p><a className="chip" href={current.url||'https://open.spotify.com'} target="_blank" rel="noreferrer">listen on spotify <ArrowUpRight size={14}/></a></div>
  :<div className="lyrics-empty"><KineticText as="h2" text="Your words, in time."/><p>{lyricsStatus==='none'?'No synced lyrics found online. ':''}Add a timed .lrc file to follow along.</p><button className="chip" onClick={()=>lyricInput.current.click()}>add lyrics <Plus size={14}/></button></div>}
  <p className="lyrics-foot">{foot}</p>
 </section>
}
