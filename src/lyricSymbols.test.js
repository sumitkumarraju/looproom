import test from 'node:test';import assert from 'node:assert/strict';import {symbolFor} from './lyricSymbols.js';
test('imagery in the line picks its symbol, with inflections',()=>{
 assert.deepEqual(symbolFor('I see you everywhere'),{doodle:'eyes'});
 assert.deepEqual(symbolFor('We were dancing all night').glyphs,['note','sparkle']);
 assert.deepEqual(symbolFor('Crying in the rain').glyphs,['cloud','drop']);
 assert.deepEqual(symbolFor('Set the world on fire').glyphs,['planet','star']);
});
test('no false prefix hits',()=>{
 assert.deepEqual(symbolFor('Nowhere to be.',[],'Focus'),{doodle:'scribble'});
 assert.notDeepEqual(symbolFor('Start again').glyphs,['star','sparkle']);
});
test('falls back to line feeling, then song feeling, then mood',()=>{
 assert.deepEqual(symbolFor('So alone and lost').glyphs,['drop','cloud']);
 assert.deepEqual(symbolFor('Again and again',[{text:'I hate this fight'}]).glyphs,['bolt']);
 assert.deepEqual(symbolFor('La la la',[],'After hours').glyphs,['moon','sparkle']);
});
