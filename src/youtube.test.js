import test from 'node:test';import assert from 'node:assert/strict';import {parseVideo,decode} from './youtube.js';
test('video titles become clean song + artist',()=>{
 const v=parseVideo({id:'abc',title:'The Weeknd - Blinding Lights (Official Video)',channel:'TheWeekndVEVO',thumb:'t',seconds:263},'Energy');
 assert.equal(v.title,'Blinding Lights');assert.equal(v.artist,'The Weeknd');assert.equal(v.youtube,'abc');
 const t=parseVideo({id:'x',title:'Espresso [Lyrics]',channel:'Sabrina Carpenter - Topic',seconds:175},'Energy');
 assert.equal(t.title,'Espresso');assert.equal(t.artist,'Sabrina Carpenter');
});
test('HTML entities from the API are decoded',()=>{assert.equal(decode('Rock &amp; Roll &#39;n&quot;'),'Rock & Roll \'n"')});
