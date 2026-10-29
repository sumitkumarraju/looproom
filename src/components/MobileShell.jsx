import {useState} from 'react';
import {Disc,Quotes,SquaresFour,Sparkle,Play,Pause,SkipForward,ArrowUpRight,CornersOut,CornersIn} from '@phosphor-icons/react';
import {IconButton} from './ui';
import {catalog} from '../catalog';
import * as spotify from '../spotify';
import PlayerDevice from './PlayerDevice';
import LyricWindow from './LyricWindow';
import Collection from './Collection';
import MoodList from './MoodList';

const tabs=[['now','now playing',Disc],['lyrics','lyrics',Quotes],['library','library',SquaresFour],['moods','moods',Sparkle]];

// Phone layout: an app-style shell (like Apple Music) with a bottom tab bar and a mini player,
// dressed as the same retro handheld. Every desktop feature is reachable from the four tabs.
export default function MobileShell({s,genres}){
 const [tab,setTab]=useState('now');
 const {current,playing,lines,activeLine,connected,clientId,run,toggle,next,setModal,fullscreen,toggleFullscreen}=s;
 return <div className="m-shell">
  <header className="m-top">
   <span className="brand">looproom</span>
   <span className="flex items-center gap-2">{<IconButton label={fullscreen?'Exit full screen':'Full screen'} onClick={()=>run(toggleFullscreen)}>{fullscreen?<CornersIn size={18}/>:<CornersOut size={18}/>}</IconButton>}
   <button className="chip" onClick={()=>connected?setModal('spotify'):run(()=>spotify.authorize(clientId))}><span className={'led '+(connected?'on':'')}/>{connected?'spotify':'connect'}</button></span>
  </header>
  <main className={'m-view m-view-'+tab}>
   {tab==='now'&&<>
    <PlayerDevice {...s}/>
    {lines.length>0&&<button className="m-lyric-peek" onClick={()=>setTab('lyrics')} aria-label="Open lyrics"><span className="eyebrow">lyrics</span><strong key={activeLine}>{lines[activeLine]?.text}</strong><ArrowUpRight size={16}/></button>}
   </>}
   {tab==='lyrics'&&<LyricWindow {...s}/>}
   {tab==='library'&&<Collection {...s}/>}
   {tab==='moods'&&<MoodList {...s} genres={genres}/>}
  </main>
  {tab!=='now'&&<div className="m-mini">
   <button className="m-mini-track" onClick={()=>setTab('now')} aria-label={`Now playing: ${current.title}. Open player.`}><img src={current.cover||catalog[0].cover} alt=""/><span><strong>{current.title}</strong><small>{current.artist}</small></span></button>
   <button className="m-mini-btn" aria-label={playing?'Pause':'Play'} onClick={()=>run(toggle)}>{playing?<Pause size={20} weight="fill"/>:<Play size={20} weight="fill"/>}</button>
   <button className="m-mini-btn" aria-label="Next track" onClick={()=>run(()=>next())}><SkipForward size={20} weight="fill"/></button>
  </div>}
  <nav className="m-tabs" aria-label="Sections">{tabs.map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}><Icon size={22} weight={tab===id?'fill':'regular'}/><span>{label}</span></button>)}</nav>
 </div>
}
