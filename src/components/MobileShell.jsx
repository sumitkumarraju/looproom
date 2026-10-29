import {useState} from 'react';
import {Disc,SquaresFour,Sparkle,Play,Pause,SkipForward,Export,X,DownloadSimple} from '@phosphor-icons/react';
import {useInstall,isStandalone,isIOS} from '../install';
import {catalog} from '../catalog';
import * as spotify from '../spotify';
import PlayerDevice from './PlayerDevice';
import LyricWindow from './LyricWindow';
import Collection from './Collection';
import MoodList from './MoodList';

// Invites phone browsers to install Looproom as a full-screen home-screen app.
function InstallHint(){
 const install=useInstall();
 const [hidden,setHidden]=useState(()=>{try{return isStandalone()||localStorage.getItem('looproom-install-dismissed')==='1'}catch{return isStandalone()}});
 const ios=isIOS();
 if(hidden||(!ios&&!install.canPrompt))return null;
 function dismiss(){setHidden(true);try{localStorage.setItem('looproom-install-dismissed','1')}catch{}}
 return <div className="m-install" role="note">
  <img src="/icons/icon-192.png" alt=""/>
  <span><strong>Get the app</strong><small>{ios?<>Tap <Export size={12} weight="bold"/> Share, then “Add to Home Screen” for full screen.</>:'Install Looproom for a full-screen app on your home screen.'}</small></span>
  {!ios&&<button className="m-install-btn" onClick={()=>install.prompt()}><DownloadSimple size={14} weight="bold"/> install</button>}
  <button className="m-mini-btn" aria-label="Dismiss" onClick={dismiss}><X size={16}/></button>
 </div>;
}

const tabs=[['now','now playing',Disc],['library','library',SquaresFour],['moods','moods',Sparkle]];

// Phone layout: an app-style shell (like Apple Music) with a bottom tab bar and a mini player,
// dressed as the same retro handheld. Now playing shows the player with live lyrics right under it;
// every desktop feature is reachable from the three tabs.
export default function MobileShell({s}){
 const [tab,setTab]=useState('now');
 const {current,playing,connected,clientId,run,toggle,next,setModal}=s;
 return <div className="m-shell">
  <header className="m-top">
   <span className="brand"><img className="brand-mark" src="/icons/logo-64.png" alt=""/>looproom</span>
   <span className="flex items-center gap-2">
   <button className="chip" onClick={()=>connected?setModal('spotify'):run(()=>spotify.authorize(clientId))}><span className={'led '+(connected?'on':'')}/>{connected?'spotify':'connect'}</button></span>
  </header>
  <main className={'m-view m-view-'+tab}>
   {tab==='now'&&<>
    <InstallHint/>
    <PlayerDevice {...s}/>
    <LyricWindow {...s}/>
   </>}
   {tab==='library'&&<Collection {...s}/>}
   {tab==='moods'&&<MoodList {...s}/>}
  </main>
  {tab!=='now'&&<div className="m-mini">
   <button className="m-mini-track" onClick={()=>setTab('now')} aria-label={`Now playing: ${current.title}. Open player.`}><img src={current.cover||catalog[0].cover} alt=""/><span><strong>{current.title}</strong><small>{current.artist}</small></span></button>
   <button className="m-mini-btn" aria-label={playing?'Pause':'Play'} onClick={()=>run(toggle)}>{playing?<Pause size={20} weight="fill"/>:<Play size={20} weight="fill"/>}</button>
   <button className="m-mini-btn" aria-label="Next track" onClick={()=>run(()=>next())}><SkipForward size={20} weight="fill"/></button>
  </div>}
  <nav className="m-tabs" aria-label="Sections">{tabs.map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} onClick={()=>setTab(id)}><Icon size={22} weight={tab===id?'fill':'regular'}/><span>{label}</span></button>)}</nav>
 </div>
}
