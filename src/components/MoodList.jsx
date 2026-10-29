import {moods} from '../logic';

export default function MoodList({mood,genre,setGenre,genres,mode,run,chooseMood}){
 return <aside className="side-copy">
  <p className="eyebrow">how’s your world today?</p>
  <ul className="mood-stack">{moods.map((m,i)=><li key={m}><button className="mood" aria-pressed={mood===m} onClick={()=>run(()=>chooseMood(m))}><span className="mood-n">0{i+1}</span>{m.toLowerCase()}</button></li>)}</ul>
  <label className="genre"><span className="eyebrow">a little more specific?</span><select value={genre} disabled={mode==='spotify'} onChange={e=>setGenre(e.target.value)}>{genres.map(g=><option key={g}>{g}</option>)}</select></label>
  <p className="side-note">{mode==='spotify'?'Pick a mood to find songs on Spotify.':'Your next song follows your mood — less scrolling, more listening.'}</p>
 </aside>
}
