import test from 'node:test';
import assert from 'node:assert/strict';
import {savedQuestions,findSavedQuestions} from '../packages/personal/src/questions.ts';
import {answerPersonalQuery,personalIntent} from '../packages/personal/src/queries.ts';
test('QUESTIONS-01 every public Arabic/English example routes to its named capability',()=>{
 assert.equal(new Set(savedQuestions.map(q=>q.id)).size,savedQuestions.length);
 for(const q of savedQuestions){assert.equal(personalIntent(q.en),q.id,q.en);assert.equal(personalIntent(q.ar),q.id,q.ar);}
});
test('QUESTIONS-02 local bilingual search is bounded, normalized and does not invent capabilities',()=>{
 assert.ok(findSavedQuestions('بُروتين').some(q=>q.id==='protein'));assert.ok(findSavedQuestions('HRV').some(q=>q.id==='recovery'));assert.equal(findSavedQuestions('launch missiles').length,0);assert.equal(findSavedQuestions('   ').length,savedQuestions.length);assert.ok(findSavedQuestions('نوم').some(q=>q.id==='sleep'));
});
test('QUESTIONS-03 capability help needs no private context and promises no sync or model',()=>{
 const en=answerPersonalQuery('what can I ask',null,new Date(),'Africa/Cairo','en')!;assert.match(en,/My macros today/);assert.match(en,/No model, source refresh or write/);
 assert.match(answerPersonalQuery('مساعدة',null,new Date(),'Africa/Cairo','ar')!,/ماكروز النهارده/);
});
