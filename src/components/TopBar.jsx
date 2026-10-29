import {ArrowUpRight,CornersOut,CornersIn} from '@phosphor-icons/react';
import {themedIcon} from '../icon';

import * as spotify from '../spotify';
import {memoIgnoringClock} from '../memo';

function TopBar({tracks,backgroundMotion,setBackgroundMotion,connected,setModal,clientId,run,fullscreen,toggleFullscreen}){
 return <header className="topnav">
  <nav className="nav-group" aria-label="Main"><a href="#top" className="brand"><span className="brand-mark" dangerouslySetInnerHTML={{__html:themedIcon}}/>looproom</a><a href="#room" className="nav-secondary">your room ({tracks.length})</a><button className="nav-secondary" onClick={()=>setModal('about')}>about</button></nav>
  <div className="nav-group">{<button onClick={()=>run(toggleFullscreen)} aria-pressed={fullscreen} title="Full screen (F)">{fullscreen?<CornersIn size={15}/>:<CornersOut size={15}/>}{fullscreen?'exit full screen':'full screen'}</button>}<button className="nav-secondary" aria-pressed={backgroundMotion} onClick={()=>setBackgroundMotion(v=>!v)}>motion {backgroundMotion?'on':'off'}</button><button onClick={()=>connected?setModal('spotify'):run(()=>spotify.authorize(clientId))}><span className={'led '+(connected?'on':'')}/>{connected?'spotify connected':'connect spotify'}<ArrowUpRight size={13}/></button></div>
 </header>
}

export default memoIgnoringClock(TopBar);
