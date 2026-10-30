import {Heart,Plus,ArrowRight,ArrowUpRight,SpotifyLogo} from '@phosphor-icons/react';
import {catalog} from '../catalog';
import {formatTime} from '../logic';
import {useEffect,useState} from 'react';
import KineticText from './KineticText';
import Glyph from './Glyph';
import {mixes} from '../mixes';
import {memoIgnoringClock} from '../memo';

const PAGE=24;
const headings={'Room':'your mix.','Up next':'up next.','Favorites':'favorites.'};

function Collection({ytEnabled,mix,loadMix,mood,tracks,queue,visibleTracks,current,playing,mode,activeTab,setActiveTab,auto,setAuto,busy,connected,search,setSearch,run,select,searchMusic,setModal,fileInput}){
 const shown=activeTab==='Up next'?queue:visibleTracks;
 // Long mixes are shown a page at a time; a new mix or tab starts from the top again.
 const [limit,setLimit]=useState(PAGE);
 useEffect(()=>setLimit(PAGE),[mix,activeTab,mode]);
 const heading=activeTab==='Room'&&mode!=='spotify'?(mix==='search'?'search results.':mix.startsWith('genre:')?`${mix.slice(6).toLowerCase()}.`:`${(mixes.find(m=>m.id===mix)?.name||'your mix').toLowerCase()}.`):headings[activeTab];
 return <section className="collection" id="room">
  <div className="collection-head">
   <div><p className="eyebrow">{mode==='spotify'?'spotify picks':'free to play · no sign-in'}</p><KineticText key={heading} as="h2" text={heading}/></div>
   <div className="collection-actions">
    <div className="tabs" role="tablist" aria-label="Music collection">{Object.keys(headings).map(tab=><button key={tab} role="tab" aria-selected={activeTab===tab} onClick={()=>setActiveTab(tab)}>{tab==='Room'?'your room':tab.toLowerCase()}{tab==='Favorites'&&<Heart size={12}/>}</button>)}</div>
    <label className="auto-label"><input type="checkbox" checked={auto} onChange={e=>setAuto(e.target.checked)}/><span className="toggle-track"/>autopilot</label>
    <button className="chip" onClick={()=>mode==='spotify'?setModal('spotify'):fileInput.current.click()}>{mode==='spotify'?<SpotifyLogo size={15}/>:<Plus size={15}/>} {mode==='spotify'?'spotify settings':'add your music'}</button>
   </div>
  </div>
  {mode!=='spotify'&&<div className="mix-row" role="list" aria-label="Mixes">{mixes.filter(m=>!m.youtube||ytEnabled).map(m=><button key={m.id} role="listitem" className={'mix-card'+(mix===m.id?' is-active':'')} style={{'--tint':m.tint}} aria-pressed={mix===m.id} onClick={()=>run(()=>loadMix(m.id,m.mood||mood,true))}><span className="mix-art"><Glyph name={m.glyph}/></span><strong>{m.name}</strong><small>{m.note}</small></button>)}</div>}
  <form className="search-form" onSubmit={e=>{e.preventDefault();run(()=>searchMusic(search))}}><label className="sr-only" htmlFor="search">{'Search all music'}</label><input id="search" placeholder={ytEnabled||connected?'Search any song or artist…':'Search free music: artist, song, genre…'} value={search} onChange={e=>setSearch(e.target.value)}/><button className="chip" disabled={busy}>{busy?'finding songs…':'search'}<ArrowRight size={15}/></button></form>
  <div className="track-grid">{busy?Array.from({length:4},(_,i)=><div key={i} className="track-skeleton"/>):shown.slice(0,limit).map((t,i)=><button key={t.id} className={'album-card '+(current.id===t.id?'is-current':'')} style={{'--i':i}} onClick={()=>run(()=>select(t))}>
   <img src={t.cover||catalog[0].cover} alt=""/>
   <strong>{t.title}</strong><small>{activeTab==='Up next'?t.reason:t.album}</small>
   <span className="card-meta">{current.id===t.id?(playing?'▶ playing':'❚❚ paused'):t.genre} · {t.seconds?formatTime(t.seconds):'local'}</span>
  </button>)}</div>
  {!busy&&shown.length>limit&&<button className="chip show-more" onClick={()=>setLimit(l=>l+PAGE)}>show more · {shown.length-limit} left</button>}
  {!busy&&shown.length===0&&<p className="side-note">{activeTab==='Favorites'?'Heart a song and it will feel at home here.':'No songs here yet. Try another filter or add your music.'}</p>}
  <div className="collection-foot"><span><span className="led on"/>{auto?'The next good song is already on its way.':'Your collection, in order.'}</span><button onClick={()=>setModal('about')}>how autopilot works <ArrowUpRight size={13}/></button></div>
 </section>
}

export default memoIgnoringClock(Collection);
