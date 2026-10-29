import {useLooproom} from './useLooproom';
import {useAlbumColors} from './useAlbumColors';
import {catalog} from './catalog';
import RetroGradient from './components/RetroGradient';
import MusicCursor from './components/MusicCursor';
import KineticText from './components/KineticText';
import TopBar from './components/TopBar';
import MoodList from './components/MoodList';
import PlayerDevice from './components/PlayerDevice';
import LyricWindow from './components/LyricWindow';
import Collection from './components/Collection';
import Dialogs from './components/Dialogs';
import {Footer,Toast} from './components/Chrome';
import MobileShell from './components/MobileShell';
import {useEffect,useState} from 'react';

const PHONE='(max-width: 760px)';
function useIsPhone(){
 const [phone,setPhone]=useState(()=>matchMedia(PHONE).matches);
 useEffect(()=>{const m=matchMedia(PHONE),update=()=>setPhone(m.matches);m.addEventListener('change',update);return()=>m.removeEventListener('change',update)},[]);
 return phone;
}

export default function App(){
 const s=useLooproom();
 const {current,focus,audio,backgroundMotion,tracks,fileInput,lyricInput,artInput,run,importAudio,importLyrics,importArt,message,setMessage}=s;
 useAlbumColors(current.cover,current.colors);
 const phone=useIsPhone();
 return <div id="top" className={'site '+(focus?'focus-mode ':'')+(s.fullscreen?'is-fullscreen':'')}>
  <RetroGradient enabled={backgroundMotion}/>
  <MusicCursor/>
  {phone?<MobileShell s={s}/>:<>
  <TopBar {...s}/>
  <main>
   <section className="hero"><p className="eyebrow">your own little corner of the internet</p><KineticText as="h1" text="good music. no hurry." stagger={.09}/></section>
   <section className="stage">
    <MoodList {...s}/>
    <PlayerDevice {...s}/>
    <LyricWindow {...s}/>
   </section>
   <Collection {...s}/>
  </main>
  <Footer {...s}/>
  </>}
  <audio ref={audio} src={catalog[0].src} preload="metadata" {...s.audioEvents}/>
  <input ref={fileInput} className="hidden" type="file" accept="audio/*,.flac,.m4a" multiple onChange={e=>{run(()=>importAudio([...e.target.files]));e.target.value=''}}/><input ref={lyricInput} className="hidden" type="file" accept=".lrc,text/plain" onChange={e=>{run(()=>importLyrics(e.target.files[0]));e.target.value=''}}/><input ref={artInput} className="hidden" type="file" accept="image/*" onChange={e=>{importArt(e.target.files[0]);e.target.value=''}}/>
  <Toast message={message} onDismiss={()=>setMessage('')}/>
  <Dialogs s={s}/>
 </div>
}
