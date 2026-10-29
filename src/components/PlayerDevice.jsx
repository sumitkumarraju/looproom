import {useEffect,useRef} from 'react';
import {Play,Pause,SkipBack,SkipForward,Shuffle,Repeat,Check,X,SpeakerHigh,ArrowUpRight,Heart} from '@phosphor-icons/react';
import {catalog} from '../catalog';
import {formatTime} from '../logic';
import * as spotify from '../spotify';
import KineticText from './KineticText';
import {useSnapDrag} from '../useSnapDrag';

// The player as a retro handheld: LCD screen, confirm/cancel keys and a play knob.
export default function PlayerDevice({current,prefs,playing,time,duration,volume,mood,mode,repeat,setRepeat,queue,like,seek,run,next,previous,toggle,select,changeVolume}){
 const tilt=useRef(null),grab=useRef(null);
 useSnapDrag(grab);
 const liked=!!prefs[current.id]?.liked;
 useEffect(()=>{
  const el=tilt.current;
  if(!matchMedia('(pointer: fine)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let x=0,y=0,tx=0,ty=0,frame=0;
  const move=e=>{tx=e.clientX/innerWidth-.5;ty=e.clientY/innerHeight-.5};
  // Eases back to flat while the player is being dragged, and skips style writes once settled.
  const tick=()=>{frame=requestAnimationFrame(tick);const moving=grab.current?.classList.contains('is-moving'),gx=moving?0:tx,gy=moving?0:ty;if(Math.abs(gx-x)+Math.abs(gy-y)<.0005)return;x+=(gx-x)*.06;y+=(gy-y)*.06;el.style.setProperty('--ry',`${(x*22).toFixed(2)}deg`);el.style.setProperty('--rx',`${(-y*14).toFixed(2)}deg`)};
  addEventListener('pointermove',move);frame=requestAnimationFrame(tick);
  return()=>{cancelAnimationFrame(frame);removeEventListener('pointermove',move)};
 },[]);
 return <section className="device-wrap" aria-label="Player">
  <div ref={grab} className="device-drag" title="Hold and drag me"><div className="device-float"><div ref={tilt} className={'device '+(playing?'is-playing':'')}>
   <div className="device-shoulders">
    <button className="shoulder" aria-label="Previous track" title="Previous track" onClick={()=>run(previous)}><SkipBack size={12} weight="fill"/></button>
    <button className="shoulder" aria-label="Surprise me" title="Surprise me" onClick={()=>run(()=>{if(!queue.length)return next();return select(queue[Math.floor(Math.random()*queue.length)])})}><Shuffle size={12} weight="bold"/></button>
    <button className={'shoulder '+(repeat?'is-active':'')} aria-label={repeat?'Repeat one on':'Repeat one off'} aria-pressed={repeat} title="Repeat one" onClick={()=>run(async()=>{setRepeat(!repeat);if(current.spotify)await spotify.api('/me/player/repeat?state='+(!repeat?'track':'context'),'PUT')})}><Repeat size={12} weight="bold"/></button>
    <button className="shoulder" aria-label="Next track" title="Next track" onClick={()=>run(()=>next())}><SkipForward size={12} weight="fill"/></button>
   </div>
   <div className="device-body">
    <div className="lcd">
     <div className="lcd-status"><span>{mode==='spotify'?'spotify':current.open?'open fm':'radio'}</span><span>{current.bpm?current.bpm+' bpm':'stereo'}</span><span>{Math.round(volume*100)}% ▮</span></div>
     <div className="lcd-main" key={current.id}>
      <img src={current.cover||catalog[0].cover} alt={current.album+' album cover'}/>
      <div><span className="lcd-meta">♪ {playing?'now playing':'paused'}</span><strong className="lcd-title">{current.title}</strong><span className="lcd-meta">{current.artist}</span><span className="lcd-meta lcd-album">{current.album}</span>{liked&&<span className="lcd-meta"><Heart size={10} weight="fill"/> fav</span>}</div>
     </div>
     <div className="lcd-progress">
      <label className="sr-only" htmlFor="seek">Track position</label>
      <input id="seek" type="range" min="0" max={duration||1} step=".1" value={Math.min(time,duration||1)} onChange={e=>seek(Number(e.target.value))} style={{'--progress':`${duration?time/duration*100:0}%`}}/>
      <div className="lcd-times"><span>{formatTime(time)}</span><span>{formatTime(duration)}</span></div>
     </div>
    </div>
    <div className="device-controls">
     <button className={'hw-key '+(liked?'is-active':'')} aria-label={liked?'Remove from favorites':'Add to favorites'} aria-pressed={liked} onClick={like}><Check size={44} weight="bold"/><span>favorite</span></button>
     <button className="knob" aria-label={playing?'Pause':'Play'} onClick={()=>run(toggle)}>{playing?<Pause size={22} weight="fill"/>:<Play size={22} weight="fill"/>}</button>
     <button className="hw-key" aria-label="Skip track" onClick={()=>run(()=>next())}><X size={44} weight="bold"/><span>skip</span></button>
    </div>
   </div>
  </div></div></div>
  <div className="device-under">
   <KineticText key={current.id} className="now-title" text={current.title}/>
   <div className="device-tags"><span className="chip">{current.genre}</span><span className="chip">{mood.toLowerCase()}</span>{current.open&&<a className="chip" href={current.license||current.url} target="_blank" rel="noreferrer">open license · archive.org <ArrowUpRight size={12}/></a>}{current.spotify&&<a className="chip" href={current.url||'https://open.spotify.com'} target="_blank" rel="noreferrer">open in spotify <ArrowUpRight size={12}/></a>}
    <label className="volume"><SpeakerHigh size={16}/><span className="sr-only">Volume</span><input aria-label="Volume" type="range" min="0" max="1" step=".01" value={volume} onChange={e=>run(()=>changeVolume(Number(e.target.value)))} style={{'--progress':`${volume*100}%`}}/></label></div>
  </div>
 </section>
}
