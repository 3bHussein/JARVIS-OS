/** Public examples only. No personal records, model calls or conversation memory. */
export const savedQuestions=[
 {id:'priorities',group:'day',en:'What should I start with?',ar:'أبدأ بإيه؟'},
 {id:'calories',group:'nutrition',en:'How many calories are left?',ar:'فاضل كام سعر؟'},
 {id:'next-workout',group:'day',en:'When is my next workout?',ar:'التمرين امتى؟'},
 {id:'day',group:'day',en:'Summarize my day',ar:'لخص يومي'},
 {id:'next',group:'day',en:'My next appointment',ar:'موعدي الجاي'},
 {id:'notes',group:'day',en:'Show my notes',ar:'ملاحظاتي'},
 {id:'sleep',group:'health',en:'How many hours did I sleep?',ar:'نمت كام ساعة؟'},
 {id:'recovery',group:'health',en:'My recovery and HRV',ar:'الاستشفاء وHRV'},
 {id:'energy',group:'health',en:'Calories burned',ar:'حرقت كام؟'},
 {id:'protein',group:'nutrition',en:'Protein today',ar:'البروتين النهارده'},
 {id:'nutrition',group:'nutrition',en:'My macros today',ar:'ماكروز النهارده'},
 {id:'exercise-history',group:'health',en:'Recent exercises',ar:'آخر تمارين'},
 {id:'weight',group:'health',en:'My weight trend',ar:'اتجاه الوزن'},
] as const;
export function normalizeSavedQuestion(value:string){return value.normalize('NFKC').toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\p{L}\p{N}\s]/gu,' ').replace(/\s+/g,' ').trim();}
const searchAliases:Record<string,string>={sleep:'sleep نوم النوم',nutrition:'food nutrition اكل الأكل ماكروز كارب دهون',calories:'food calories اكل سعرات',protein:'protein food بروتين اكل',recovery:'recovery استشفاء تعافي',notes:'notes نوت ملاحظه'};
export function findSavedQuestions(search:string){const words=normalizeSavedQuestion(search).slice(0,100).split(' ').filter(Boolean);return savedQuestions.filter(q=>words.every(word=>normalizeSavedQuestion(q.en+' '+q.ar+' '+(searchAliases[q.id]||'')).includes(word)));}
