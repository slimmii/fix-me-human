import { finale, lessons } from './content';
export type Phase = 'onboarding'|'briefing'|'example'|'exercise'|'review'|'finale'|'ending'|'endless';
export type Save = {version:2;phase:Phase;lesson:number;exercise:number;completed:string[];answers:Record<string,Record<string,string>>;checkpoints:string[];settings:{mute:boolean;reducedMotion:boolean;crt:boolean};endless:{seed:number;solved:number;topic:number|'mixed';difficulty:number;previousFamily:number}};
export const fresh = ():Save=>({version:2,phase:'onboarding',lesson:0,exercise:0,completed:[],answers:{},checkpoints:[],settings:{mute:false,reducedMotion:typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches,crt:false},endless:{seed:1,solved:0,topic:'mixed',difficulty:1,previousFamily:-1}});
export const KEY='please-fix-human:v2';
export const lessonDone=(s:Save,i:number)=>lessons[i].exercises.every(e=>s.completed.includes(e.id));
export const unlocked=(s:Save,i:number)=>lessons[i].prerequisites.every(p=>lessonDone(s,p));
export const campaignDone=(s:Save)=>lessons.every((_,i)=>lessonDone(s,i));
export const endlessUnlocked=(s:Save)=>campaignDone(s)&&finale.every(e=>s.checkpoints.includes(e.id));
export function decode(raw:string|null):Save {
 const d=fresh();if(!raw)return d;
 try{const v=JSON.parse(raw);if(v.version!==2)return d;
 const known=lessons.flatMap(l=>l.exercises.map(e=>e.id));
 d.completed=Array.isArray(v.completed)?v.completed.filter((id:unknown)=>typeof id==='string'&&known.includes(id)):[];
 // Remove impossible progress beyond a locked lesson.
 for(let i=0;i<lessons.length;i++)if(!unlocked(d,i))d.completed=d.completed.filter(id=>!lessons[i].exercises.some(e=>e.id===id));
 d.lesson=Number.isInteger(v.lesson)&&v.lesson>=0&&v.lesson<11&&unlocked(d,v.lesson)?v.lesson:0;
 d.exercise=v.exercise===1?1:0;
 if(v.answers&&typeof v.answers==='object'&&!Array.isArray(v.answers))for(const [id,a] of Object.entries(v.answers)){if(a&&typeof a==='object'&&!Array.isArray(a))d.answers[id]=Object.fromEntries(Object.entries(a).filter(([k,val])=>k!=='__proto__'&&typeof val==='string'));}
 d.checkpoints=campaignDone(d)&&Array.isArray(v.checkpoints)?finale.map(e=>e.id).filter((id,i,ids)=>ids.slice(0,i+1).every(x=>v.checkpoints.includes(x))):[];
 for(const k of ['mute','reducedMotion','crt'] as const)if(typeof v.settings?.[k]==='boolean')d.settings[k]=v.settings[k];
 if(v.endless){const e=v.endless;d.endless={seed:Number.isSafeInteger(e.seed)&&e.seed>0?e.seed:1,solved:Number.isSafeInteger(e.solved)&&e.solved>=0?e.solved:0,topic:e.topic==='mixed'||Number.isInteger(e.topic)&&e.topic>=0&&e.topic<11?e.topic:'mixed',difficulty:[1,2,3].includes(e.difficulty)?e.difficulty:1,previousFamily:[-1,0,1,2].includes(e.previousFamily)?e.previousFamily:-1};}
 if(['onboarding','briefing','example','exercise','review','finale','ending','endless'].includes(v.phase))d.phase=v.phase;
 if((d.phase==='finale'&&!campaignDone(d))||(['ending','endless'].includes(d.phase)&&!endlessUnlocked(d)))d.phase='briefing';
 if(d.phase==='review'&&!d.completed.includes(lessons[d.lesson].exercises[d.exercise].id))d.phase='exercise';
 return d;
 }catch{return d;}
}
export function loadSave():Save {try{return decode(localStorage.getItem(KEY));}catch{return fresh();}}
export function persist(s:Save):boolean {try{localStorage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
