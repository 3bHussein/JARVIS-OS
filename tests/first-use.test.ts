import {test} from 'node:test';
import assert from 'node:assert/strict';
import {firstUseStatus} from '../packages/personal/src/first-use.ts';
import {emptyData} from '../packages/personal/src/model.ts';
test('FIRST-01 empty context stays unknown and storage choice does not invent health or entries',()=>{
 const data=emptyData(),empty=firstUseStatus(data,{persistent:false,sessionAcknowledged:false,sleep:null,food:null});assert.equal(empty.completed,0);assert.equal(empty.total,5);const chosen=firstUseStatus(data,{persistent:false,sessionAcknowledged:true,sleep:null,food:null});assert.equal(chosen.completed,1);assert.equal(chosen.steps.find(s=>s.id==='storage')?.done,true);assert.equal(data.profile,null);assert.equal(data.notes.length,0);
});
test('FIRST-02 recorded zero is known; only actual profile/entry/persistence complete their steps',()=>{
 const data={...emptyData(),profile:{name:'Synthetic',goal:'',interests:'',sleepTarget:8,calorieTarget:null,dayStart:'08:00',dayEnd:'22:00'},notes:[{id:'one',text:'Synthetic',kind:'note' as const,at:null,minutes:30,done:false}]};assert.equal(firstUseStatus(data,{persistent:true,sessionAcknowledged:false,sleep:0,food:0}).completed,5);assert.equal(firstUseStatus(data,{persistent:false,sessionAcknowledged:false,sleep:null,food:0}).completed,3);
});
