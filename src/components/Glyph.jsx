// Hand-drawn sticker symbols for the type storm lyrics, inked from the album palette
// (.ink-fill / .ink-line / .ink-light in style.css) so they match the current song.
const shapes={
 heart:<path className="ink-fill" d="M50 86C20 64 8 46 14 30c6-16 26-18 36-4 10-14 30-12 36 4 6 16-6 34-36 56z"/>,
 brokenHeart:<><path className="ink-fill" d="M50 86C20 64 8 46 14 30c6-16 26-18 36-4 10-14 30-12 36 4 6 16-6 34-36 56z"/><path className="ink-crack" d="M50 26l-7 17 11 9-9 14 5 18"/></>,
 flame:<><path className="ink-fill" d="M50 92c-20 0-32-14-30-32 2-16 14-22 16-42 12 10 15 21 13 30 6-4 9-12 8-19 15 12 25 27 23 41-2 14-12 22-30 22z"/><path className="ink-light" d="M50 84c-9 0-14-7-13-15 1-8 8-11 9-20 7 6 15 12 15 21 0 8-4 14-11 14z"/></>,
 star:<polygon className="ink-fill" points="50,8 61,38 93,38 67,57 77,89 50,70 23,89 33,57 7,38 39,38"/>,
 sparkle:<path className="ink-light" d="M50 6c4 26 18 40 44 44-26 4-40 18-44 44-4-26-18-40-44-44 26-4 40-18 44-44z"/>,
 moon:<path className="ink-fill" d="M62 8a42 42 0 1 0 30 70A36 36 0 0 1 62 8z"/>,
 sun:<><g className="ink-ray">{[0,45,90,135,180,225,270,315].map(a=><line key={a} x1="50" y1="8" x2="50" y2="20" transform={`rotate(${a} 50 50)`}/>)}</g><circle className="ink-fill" cx="50" cy="50" r="22"/></>,
 cloud:<path className="ink-light" d="M28 76h48a16 16 0 0 0 0-32 22 22 0 0 0-42-6 19 19 0 0 0-6 38z"/>,
 drop:<path className="ink-fill" d="M50 8C38 32 24 46 24 64a26 26 0 0 0 52 0c0-18-14-32-26-56z"/>,
 wave:<g className="ink-ray"><path d="M6 46c11-14 22-14 33 0s22 14 33 0 16-12 22-8"/><path d="M6 68c11-14 22-14 33 0s22 14 33 0 16-12 22-8"/></g>,
 note:<><path className="ink-ray" d="M42 76V20l40-10v54"/><circle className="ink-fill" cx="30" cy="76" r="13"/><circle className="ink-fill" cx="70" cy="66" r="13"/></>,
 flower:<>{[0,72,144,216,288].map(a=><circle key={a} className="ink-light" cx="50" cy="26" r="17" transform={`rotate(${a} 50 50)`}/>)}<circle className="ink-fill" cx="50" cy="50" r="13"/></>,
 clock:<><circle className="ink-light" cx="50" cy="50" r="40"/><path className="ink-ray" d="M50 24v26l16 12"/></>,
 speed:<g className="ink-ray"><path d="M8 30h50M20 50h66M8 70h50"/><path d="M70 36l16 14-16 14"/></g>,
 bubble:<path className="ink-light" d="M12 18h76v48H46L26 86V66H12z"/>,
 crown:<path className="ink-fill" d="M12 78L16 28l22 24 12-32 12 32 22-24 4 50z"/>,
 confetti:<>{[[18,22,20],[62,14,-30],[78,48,40],[30,58,-15],[56,78,25],[14,84,60]].map(([x,y,r],i)=><rect key={i} className={i%2?'ink-fill':'ink-light'} x={x} y={y} width="14" height="8" rx="2" transform={`rotate(${r} ${x+7} ${y+4})`}/>)}</>,
 planet:<><circle className="ink-fill" cx="50" cy="50" r="24"/><ellipse className="ink-ray" cx="50" cy="52" rx="44" ry="12" transform="rotate(-18 50 52)"/></>,
 bolt:<path className="ink-fill" d="M58 6L18 56h26l-8 38 44-54H54z"/>,
 leaf:<><path className="ink-fill" d="M16 84C16 42 44 16 86 14c0 42-26 70-70 70z"/><path className="ink-ray" d="M16 84l42-42"/></>,
};

export default function Glyph({name}){
 return <svg className="glyph" viewBox="0 0 100 100" aria-hidden="true">{shapes[name]||shapes.sparkle}</svg>;
}
