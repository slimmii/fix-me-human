import { describe, expect, it } from 'vitest';
import { finale, generate, lessons, sourceFor, validate, type Exercise } from '../src/content';
import { campaignDone, decode, endlessUnlocked, fresh, lessonDone, unlocked } from '../src/progression';
const solve=(e:Exercise)=>Object.fromEntries(e.slots.map(s=>[s.name,s.answer]));
describe('authored curriculum',()=>{
 it('has 11 lessons, two exercises each, and five checkpoints',()=>{expect(lessons).toHaveLength(11);lessons.forEach(l=>expect(l.exercises).toHaveLength(2));expect(finale).toHaveLength(5);});
 for(const e of [...lessons.flatMap(l=>l.exercises),...finale])it(`${e.id}: accepts its solution, rejects omissions and known bugs`,()=>{
 expect(validate(e,solve(e)).every(c=>c.pass)).toBe(true);expect(sourceFor(e,solve(e))).not.toContain('{{');expect(validate(e,{}).every(c=>c.pass)).toBe(false);
 for(const s of e.slots)for(const c of s.choices.filter(c=>c.id!==s.answer)){const result=validate(e,{...solve(e),[s.name]:c.id});expect(result.some(r=>!r.pass)).toBe(true);expect(result.find(r=>!r.pass)?.message.length).toBeGreaterThan(15);}
 expect(e.hints.length).toBeGreaterThanOrEqual(3);
 });
});
describe('progression and persistence',()=>{
 it('locks future work and unlocks the ending only after all checkpoints',()=>{const s=fresh();expect(unlocked(s,1)).toBe(false);expect(endlessUnlocked(s)).toBe(false);s.completed.push(lessons[0].exercises[0].id);expect(unlocked(s,1)).toBe(false);s.completed.push(lessons[0].exercises[1].id);expect(lessonDone(s,0)).toBe(true);expect(unlocked(s,1)).toBe(true);s.completed=lessons.flatMap(l=>l.exercises.map(e=>e.id));expect(campaignDone(s)).toBe(true);expect(endlessUnlocked(s)).toBe(false);s.checkpoints=finale.map(e=>e.id);expect(endlessUnlocked(s)).toBe(true);});
 it('round trips current answers and all saved settings',()=>{const s=fresh();s.phase='exercise';s.answers={'0-0':{attribute:'correct'}};s.settings.mute=true;expect(decode(JSON.stringify(s))).toEqual(s);});
 it('recovers from corrupt and incompatible storage',()=>{for(const bad of ['{', 'null','[]','{"version":99}','{"version":1,"answers":[],"lesson":99,"phase":"ending","completed":["10-0"]}']){const s=decode(bad);expect(s.lesson).toBe(0);expect(endlessUnlocked(s)).toBe(false);}});
 it('retains completed checkpoints and rejects nonsequential checkpoint saves',()=>{const s=fresh();s.completed=lessons.flatMap(l=>l.exercises.map(e=>e.id));s.checkpoints=finale.slice(0,3).map(e=>e.id);s.phase='finale';expect(decode(JSON.stringify(s)).checkpoints).toEqual(s.checkpoints);s.checkpoints=[finale[3].id];expect(decode(JSON.stringify(s)).checkpoints).toEqual([]);});
});
describe('seeded endless exercises',()=>{
 it('generates reproducible, soluble exercises for every topic, level, and family',()=>{const families=new Set<string>();for(let topic=0;topic<11;topic++)for(let difficulty=1;difficulty<=3;difficulty++)for(let seed=1;seed<=40;seed++){
 const e=generate(seed*7919,topic,difficulty);families.add(`${topic}-${e.kind}`);expect(generate(seed*7919,topic,difficulty)).toEqual(e);expect(validate(e,solve(e)).every(c=>c.pass)).toBe(true);expect(sourceFor(e,solve(e))).not.toContain('{{');expect(e.hints.length).toBeGreaterThanOrEqual(3);expect(e.slots.every(s=>s.choices.some(c=>c.id===s.answer))).toBe(true);expect(e.preview).toBeTruthy();
 }expect(families.size).toBe(33);});
 it('does not immediately repeat the previous template family',()=>{for(let seed=1;seed<100;seed++)for(let previous=0;previous<3;previous++)expect(generate(seed,'mixed',2,previous).kind).not.toBe(['completion','repair','ordering'][previous]);});
});
