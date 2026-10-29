import {memoIgnoringClock} from '../memo';
import {moods} from '../logic';

function MoodList({mood,genre,genres,mode,run,chooseMood,chooseGenre}){
 return <aside className="side-copy">
  <p className="eyebrow">how’s your world today?</p>
  <ul className="mood-stack">{moods.map((m,i)=><li key={m}><button className="mood" aria-pressed={mood===m} onClick={()=>run(()=>chooseMood(m))}><span className="mood-n">0{i+1}</span>{m.toLowerCase()}</button></li>)}</ul>
  <label className="genre"><span className="eyebrow">a little more specific?</span><select value={genre} onChange={e=>run(()=>chooseGenre(e.target.value))}><option value="All genres">choose a genre…</option>{genres.map(g=><option key={g} value={g}>{g}</option>)}</select></label>
  <p className="side-note">{mode==='spotify'?'Pick a mood or genre to find songs on Spotify.':'Your next song follows your mood — less scrolling, more listening.'}</p>
 </aside>
}

export default memoIgnoringClock(MoodList);
