import type { Box, Job } from './types';

export const SCAN_START=.55;
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
const ease=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
export const mediaProgress=(progress:number)=>clamp((progress-SCAN_START)/(1-SCAN_START));

/** The cursor and the visible selection share the exact same moving handle. */
export function toolBox(job:Job):Box{
  const {task,progress:p}=job,r=task.rect;
  if(task.operation==='duplicate'){
    const source=job.source??{...r,x:r.x-28,y:r.y-20},t=ease((p-.12)/.43),size=clamp(p/.12);
    return{x:mix(source.x,r.x,t),y:mix(source.y,r.y,t),width:mix(source.width,r.width,t)*size,height:mix(source.height,r.height,t)*size};
  }
  const size=clamp(p/.48),offset=task.operation==='align'?1-ease(p/.55):0;
  return{x:r.x+offset*24,y:r.y-offset*16,width:r.width*size,height:r.height*size};
}

export function dimensionBadge(box:Box,width:number,height:number,labelWidth:number):Box{
  const w=Math.min(labelWidth,width-16),h=25;
  const preferred=box.y>42?box.y-h-10:box.y+box.height+11;
  return{x:Math.max(8,Math.min(width-w-8,box.x+box.width*.5-w*.5)),y:Math.max(12,Math.min(height-125,preferred)),width:w,height:h};
}
