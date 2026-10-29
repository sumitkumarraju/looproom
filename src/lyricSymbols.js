// Picks the decoration for a lyric line from what the line says.
// 1. Imagery: the first word in the line that matches a topic (e.g. "fire", "ocean", "eyes").
// 2. Emotion: otherwise the line's strongest feeling (love, sad, happy, angry, hype, calm).
// 3. Song: otherwise the feeling that dominates the whole song's lyrics.
// 4. Mood: otherwise the listener's chosen mood.
// Returns {doodle:name} for an animated doodle (see TypeStorm) or {glyphs:[...]} for drawn symbols (see Glyph).

// Whole words; inflections are folded by stems() (dancing → dance, tears → tear, crying → cry).
const topics=[
 {roots:['eye','see','saw','look','watch','stare','sight','glance','vision'],symbol:{doodle:'eyes'}},
 {roots:['money','cash','gold','rich','dollar','pay','paid','coin','bank','diamond'],symbol:{doodle:'coins'}},
 {roots:['walk','run','step','road','street','follow','chase','way','journey','home'],symbol:{doodle:'steps'}},
 {roots:['smile','laugh','happy','joy','fun'],symbol:{doodle:'smile'}},
 {roots:['heartbreak','broke','broken','shatter'],symbol:{glyphs:['brokenHeart']}},
 {roots:['love','lover','heart','kiss','baby','darling'],symbol:{glyphs:['heart','sparkle']}},
 {roots:['fire','burn','flame','hot','heat','blaze'],symbol:{glyphs:['flame']}},
 {roots:['star','shine','sparkle','glow','light'],symbol:{glyphs:['star','sparkle']}},
 {roots:['moon','night','midnight','dark','dream','sleep'],symbol:{glyphs:['moon','sparkle']}},
 {roots:['sun','summer','morning','day','golden'],symbol:{glyphs:['sun','cloud']}},
 {roots:['rain','cry','tear','storm','thunder'],symbol:{glyphs:['cloud','drop']}},
 {roots:['sky','fly','high','cloud','wing','bird','free'],symbol:{glyphs:['cloud','sparkle']}},
 {roots:['ocean','sea','wave','water','river','tide','swim'],symbol:{glyphs:['wave','drop']}},
 {roots:['dance','music','song','sing','beat','rhythm','radio'],symbol:{glyphs:['note','sparkle']}},
 {roots:['flower','rose','bloom','garden','spring'],symbol:{glyphs:['flower']}},
 {roots:['time','clock','hour','minute','forever','wait'],symbol:{glyphs:['clock']}},
 {roots:['drive','car','ride','highway','speed','fast'],symbol:{glyphs:['speed']}},
 {roots:['phone','call','text','ring'],symbol:{glyphs:['bubble']}},
 {roots:['king','queen','crown','throne'],symbol:{glyphs:['crown','sparkle']}},
 {roots:['party','drink','celebrate','celebration','champagne'],symbol:{glyphs:['confetti','sparkle']}},
 {roots:['world','earth','planet','universe','space'],symbol:{glyphs:['planet','star']}},
];

const feelings={
 love:{roots:['need','want','hold','touch','yours','mine','together','close','miss'],symbol:{glyphs:['heart','flower']}},
 sad:{roots:['alone','lonely','lost','goodbye','sorry','pain','hurt','cold','empty','gone','never','leave','fall'],symbol:{glyphs:['drop','cloud']}},
 happy:{roots:['good','great','alive','yeah','better','best','sweet','wonderful','bright'],symbol:{doodle:'smile'}},
 angry:{roots:['hate','fight','mad','scream','war','kill','enemy','rage'],symbol:{glyphs:['bolt']}},
 hype:{roots:['go','up','loud','bigger','faster','max','jump','wild','crazy','now'],symbol:{glyphs:['bolt','flame']}},
 calm:{roots:['slow','soft','quiet','still','breathe','easy','gentle','peace','rest'],symbol:{glyphs:['leaf','cloud']}},
};

const moodSymbols={'Daydream':{glyphs:['cloud','sparkle']},'Focus':{doodle:'scribble'},'Golden hour':{glyphs:['sun']},'After hours':{glyphs:['moon','sparkle']},'Energy':{glyphs:['bolt','flame']}};

const words=text=>String(text).toLowerCase().match(/[a-z']+/g)||[];
// The word plus crude stems, enough for lyric vocabulary without false prefix hits (start ≠ star).
const stems=w=>{const s=w.replace(/'$/,'g');return [s,s.replace(/(ing|ed|es|s|ly|y)$/,''),s.replace(/(ing|ed)$/,'e'),s.replace(/(ies|ied)$/,'y')]};
const matches=(w,roots)=>stems(w).some(s=>roots.includes(s));
const hits=(list,roots)=>list.filter(w=>matches(w,roots)).length;

function topicFor(list){
 for(const w of list){const topic=topics.find(t=>matches(w,t.roots));if(topic)return topic.symbol}
 return null;
}
function strongestFeeling(list){
 let best=null,score=0;
 for(const [name,f] of Object.entries(feelings)){const s=hits(list,f.roots);if(s>score){best=name;score=s}}
 return best;
}

export function symbolFor(line,allLines=[],mood='Daydream'){
 const list=words(line);
 const topic=topicFor(list);
 if(topic)return topic;
 const feeling=strongestFeeling(list)||strongestFeeling(words(allLines.map(l=>l.text).join(' ')));
 if(feeling)return feelings[feeling].symbol;
 return moodSymbols[mood]||moodSymbols.Daydream;
}
