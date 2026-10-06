import assert from "node:assert/strict";
import { test } from "node:test";
import { clipInk, eraseInk } from "../app/whiteboard/erase-geometry.ts";
test("a point eraser cuts the middle of a sparse segment and preserves both ends", () => {
  const runs = clipInk([[.1,.5],[.9,.5]],[[.5,.5]],16);
  assert.equal(runs.length,2);assert.deepEqual(runs[0][0],[.1,.5]);assert.deepEqual(runs[1].at(-1),[.9,.5]);
  assert.ok(Math.abs(runs[0].at(-1)[0]-.49)<1e-9);assert.ok(Math.abs(runs[1][0][0]-.51)<1e-9);
});
test("a fast eraser sweep removes the corridor between samples without gaps", () => {
  const runs=clipInk([[.1,.5],[.9,.5]],[[.3,.5],[.7,.5]],16);
  assert.equal(runs.length,2);assert.ok(runs[0].at(-1)[0]<.3);assert.ok(runs[1][0][0]>.7);
  assert.deepEqual(clipInk([[.2,.2],[.8,.2]],[[.5,.5]],16),[[[.2,.2],[.8,.2]]]);
});
test("crossing, dots and other authors retain correct geometry",()=>{
  assert.equal(clipInk([[.5,.2],[.5,.8]],[[.2,.5],[.8,.5]],16).length,2);
  assert.deepEqual(clipInk([[.5,.5]],[[.5,.5]],16),[]);
  const ink={id:"original",owner:"me",color:"#4d6b6f",width:3,points:[[.1,.5],[.9,.5]]};
  const change=eraseInk([ink,{...ink,id:"other",owner:"them"}],[[.5,.5]],16,"operation","me");
  assert.deepEqual(change.removed,["original"]);assert.equal(change.added.length,2);assert.ok(change.added.every(s=>s.owner==="me"));
});
