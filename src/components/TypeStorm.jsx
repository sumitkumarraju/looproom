// "Type storm" lyric theme: words of the active line slam in one at a time across the
// line's duration, each with its own size, tilt, colour and entrance, with a doodle.
// It sits straight on the album gradient; inks come from the album palette (see .storm).
// The doodle or symbol is chosen from the line's words and feeling (see lyricSymbols.js).
// Motion pulses on the track's BPM.
import {symbolFor} from '../lyricSymbols';
import Glyph from './Glyph';

const inks=['#fff','var(--storm-a)','var(--storm-b)','#fff','var(--storm-c)'];
const entrances=['slam','drop','squash','swing','glitch'];
const sizes=['xl','lg','md','lg','xl','sm'];

function hash(text){let h=2166136261;for(const c of text)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}

function Doodle({kind,seed}){
 const corner=['tl','tr','bl','br'][seed%4];
 if(kind==='eyes')return <svg className={'doodle doodle-eyes '+corner} viewBox="0 0 200 70" aria-hidden="true">{[50,145].map(x=><g key={x}><ellipse className="ink-light" cx={x} cy="35" rx="44" ry="28"/><circle className="pupil ink-dark" cx={x} cy="38" r="15"/></g>)}</svg>;
 if(kind==='coins')return <svg className={'doodle doodle-coins '+corner} viewBox="0 0 200 80" aria-hidden="true">{[20,62,104,146,184].map((x,i)=><circle key={x} className="coin" style={{animationDelay:`calc(var(--beat) * ${i*.2})`}} cx={x} cy="50" r="15" strokeWidth="3"/>)}</svg>;
 if(kind==='smile')return <svg className={'doodle doodle-smile '+corner} viewBox="0 0 100 100" aria-hidden="true"><circle className="face" cx="50" cy="50" r="44" strokeWidth="4"/><circle className="ink-dark" cx="36" cy="40" r="6"/><circle className="ink-dark" cx="64" cy="40" r="6"/><path className="mouth" d="M28 60q22 22 44 0" fill="none" strokeWidth="5" strokeLinecap="round"/></svg>;
 if(kind==='steps')return <svg className={'doodle doodle-steps '+corner} viewBox="0 0 220 120" aria-hidden="true">{Array.from({length:9},(_,i)=><ellipse key={i} style={{animationDelay:`${i*.12}s`}} cx={14+i*24} cy={100-i*9+(i%2?14:0)} rx="7" ry="11" className="ink-light"/>)}</svg>;
 return <svg className={'doodle doodle-scribble '+corner} viewBox="0 0 300 80" aria-hidden="true"><path pathLength="1" d="M8 52c40-38 70 28 110-6s60-30 92 4 50 10 82-20" fill="none" strokeWidth="9" strokeLinecap="round"/></svg>;
}

// A few of the line's symbols scattered around the words, popping in and bobbing on the beat.
const spots=[[8,14],[78,10],[86,68],[12,72],[48,6],[52,84]];
function GlyphCloud({glyphs,seed}){
 return <span className="glyph-cloud" aria-hidden="true">{spots.slice(0,4+seed%3).map(([x,y],i)=>{const [dx,dy]=spots[(seed+i)%spots.length];return <span key={i} className="glyph-spot" style={{left:`${(x+dx)/2}%`,top:`${(y+dy)/2}%`,'--i':i,'--r':`${(seed>>>i)%30-15}deg`}}><Glyph name={glyphs[i%glyphs.length]}/></span>})}</span>;
}

export default function TypeStorm({lines,activeLine,time,duration,bpm,mood,playing,seek}){
 const line=lines[activeLine]||lines[0];
 const end=lines[activeLine+1]?.time??Math.max(line.time+4,duration||0);
 const words=line.text.split(/\s+/).filter(Boolean);
 const span=Math.max(.6,(end-line.time)*.85);
 const shown=Math.min(words.length,Math.max(1,Math.floor((time-line.time)/span*words.length)+1));
 const seed=hash(line.text+activeLine);
 const symbol=symbolFor(line.text,lines,mood);
 return <button key={activeLine} className={'storm '+(playing?'':'is-paused')} style={{'--beat':`${60/(bpm||100)}s`}} onClick={()=>seek(line.time)} aria-label={`Lyric: ${line.text}. Replay this line.`}>
  {symbol.doodle?<Doodle kind={symbol.doodle} seed={seed>>>4}/>:<GlyphCloud glyphs={symbol.glyphs} seed={seed>>>4}/>}
  <span className="storm-line" aria-hidden="true">{words.slice(0,shown).map((word,i)=>{
   const h=hash(word+i+seed);
   return <span key={i} className={`storm-word size-${sizes[h%sizes.length]} enter-${entrances[(h>>>3)%entrances.length]}${h%4===0?' is-italic':''}${i===shown-1?' is-new':''}`} style={{color:inks[(h>>>5)%inks.length],'--tilt':`${((h>>>7)%9)-4}deg`}}>{word}</span>;
  })}</span>
 </button>;
}
