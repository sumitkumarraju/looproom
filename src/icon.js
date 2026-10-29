// The Looproom handheld logo as SVG, coloured from the current album. Colours are plain CSS
// values: CSS variables for the inline header logo (so it cross-fades with the theme), or
// concrete rgb() values for the browser-tab icon, which can't read the page's variables.
export function iconSvg({bg,bgLight,body,bodyDark,hill,hill2,knob},id='lr-icon'){
 const ink='#463430';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:${bgLight}"/><stop offset="1" style="stop-color:${bg}"/></linearGradient></defs>
<rect width="64" height="64" rx="15" fill="url(#${id})"/>
<g style="fill:${bodyDark}"><rect x="14" y="15.5" width="7" height="5" rx="2"/><rect x="23" y="15.5" width="7" height="5" rx="2"/><rect x="32" y="15.5" width="7" height="5" rx="2"/></g>
<rect x="9" y="19" width="46" height="30" rx="7" style="fill:${bodyDark}" transform="translate(1.5 2)"/>
<rect x="9" y="19" width="46" height="30" rx="7" style="fill:${body}"/>
<rect x="13" y="23" width="27" height="22" rx="3.5" fill="${ink}"/>
<rect x="14.5" y="24.5" width="24" height="19" rx="2" fill="#f4eedd"/>
<path d="M25 27h3v1h1v2h-1v1h-3v-1h-1v-2h1z" fill="#f5be54"/>
<path d="M14.5 38.5l6-5.5 5 3.5 6-6.5 7.5 5.5v8h-24.5z" style="fill:${hill}"/>
<path d="M14.5 41.5l9-4 15 3v2.5a2 2 0 0 1-2 2h-20a2 2 0 0 1-2-2z" style="fill:${hill2}"/>
<path d="M44 25.5l2 2 4-4" fill="none" stroke="${ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="47" cy="34" r="4.5" style="fill:${knob}" stroke="${ink}" stroke-width="1"/><path d="M46 32.2v3.6l3-1.8z" fill="${ink}"/>
<path d="M44.5 40.5l4 4M48.5 40.5l-4 4" stroke="${ink}" stroke-width="2" stroke-linecap="round"/>
</svg>`;
}

// Inline (header) version: follows the album colours through CSS variables.
export const themedIcon=iconSvg({
 bg:'color-mix(in srgb,var(--accent) 80%,#000)',bgLight:'color-mix(in srgb,var(--accent) 60%,#fff)',
 body:'color-mix(in srgb,var(--album-vivid) 80%,#fff)',bodyDark:'color-mix(in srgb,var(--album-vivid) 70%,#000)',
 hill:'var(--album-vivid)',hill2:'var(--accent)',knob:'color-mix(in srgb,var(--album-vivid) 45%,#fff)',
});

const rgb=c=>{const s=String(c).trim();if(s.startsWith('#')){const h=s.slice(1);return h.length===3?[...h].map(x=>parseInt(x+x,16)):[0,2,4].map(i=>parseInt(h.slice(i,i+2),16))}return (s.match(/[\d.]+/g)||[0,0,0]).slice(0,3).map(Number)};
const mix=(a,b,t)=>`rgb(${rgb(a).map((v,i)=>Math.round(v*t+rgb(b)[i]*(1-t)))})`;

// Browser-tab icon: redrawn with the song's concrete colours whenever the theme changes.
export function setTabIcon(accent,vivid){
 const svg=iconSvg({bg:mix(accent,'#000',.8),bgLight:mix(accent,'#fff',.6),body:mix(vivid,'#fff',.8),bodyDark:mix(vivid,'#000',.7),hill:mix(vivid,vivid,1),hill2:mix(accent,accent,1),knob:mix(vivid,'#fff',.45)},'t');
 let link=document.querySelector('link[rel="icon"]');
 if(!link){link=document.createElement('link');link.rel='icon';document.head.append(link)}
 link.type='image/svg+xml';link.removeAttribute('sizes');
 link.href='data:image/svg+xml,'+encodeURIComponent(svg);
}
