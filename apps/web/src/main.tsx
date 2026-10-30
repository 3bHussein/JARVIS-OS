import React, {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {briefing, clock, freshness, type CoreState, type Locale} from '../../../packages/core/src/index.ts';
import {manifests} from '../../../packages/connectors/src/contracts.ts';
import {repositories, type GitHubSummary, type Resource} from '../../../packages/connectors/src/github.ts';
import type {ConnectorResult,ConnectorView} from '../../../packages/connectors/src/contracts.ts';
import {readPreferences,savePreferences,defaultPreferences} from '../../../packages/core/src/preferences.ts';
import {SpeechInput} from './SpeechInput.tsx';
import {AIChat} from './AIChat.tsx';
import {ProgressImport} from './ProgressImport.tsx';
import {PersonalHome} from './PersonalHome.tsx';
import './style.css';
const words = {
 en:{overview:'Overview',projects:'Projects',voice:'Voice lab',settings:'Settings',briefing:'YOUR DAY, IN FOCUS',welcome:'Your world. One command.',intro:'A quieter way to stay connected to everything that matters.',ask:'Ask JARVIS',placeholder:'Ask about time, connections, or project access…',sources:'Connected intelligence',noTasks:'No verified tasks available',noTasksText:'Connect a trusted task source to build your daily briefing.',launch:'Open app',disconnected:'Not connected',signin:'Unlock local workspace',password:'Local workspace password',logout:'Lock workspace',privacy:'Private by design',mode:'Personal workspace · external reads only',listen:'Start microphone test',stop:'Stop microphone',clear:'Clear conversation',quiet:'Silent startup',motion:'Motion',language:'Language',zone:'Timezone',send:'Send',working:'Working',status:'Awaiting connections',auth:'Personal local authentication',mic:'Audio remains in this browser session. No recording is saved or uploaded. This activity test does not transcribe speech.',voiceTitle:'Make yourself heard.',voiceSub:'Review speech transcripts, test microphone activity and choose a system voice. Accuracy and voice quality have not been evaluated.',speak:'Test system voice',cancel:'Stop speaking',notAI:'Local command router · AI provider not connected',security:'External write tools and Windows operations are disabled.',today:'Today',close:'Dismiss',refresh:'Read GitHub',loading:'Reading source…'},
 ar:{overview:'الرئيسية',projects:'المشاريع',voice:'معمل الصوت',settings:'الإعدادات',briefing:'يومك، بوضوح',welcome:'عالمك. في أمر واحد.',intro:'مكان هادي يجمع البرامج والمعلومات اللي تهمك.',ask:'اسأل جارفس',placeholder:'اسأل عن الوقت أو الربط أو الوصول للمشاريع…',sources:'مصادر المعلومات',noTasks:'مفيش مهام مؤكدة متاحة',noTasksText:'وصّل مصدر مهام موثوق علشان نجهّز ملخص يومك.',launch:'افتح البرنامج',disconnected:'غير متصل',signin:'افتح مساحة العمل المحلية',password:'كلمة مرور مساحة العمل',logout:'اقفل مساحة العمل',privacy:'خصوصيتك أولًا',mode:'مساحة شخصية · قراءة البرامج الخارجية فقط',listen:'ابدأ اختبار الميكروفون',stop:'اقفل الميكروفون',clear:'امسح المحادثة',quiet:'بداية صامتة',motion:'الحركة',language:'اللغة',zone:'المنطقة الزمنية',send:'إرسال',working:'جاري المعالجة',status:'في انتظار الربط',auth:'مصادقة شخصية محلية',mic:'الصوت بيُقاس في جلسة المتصفح فقط. مفيش تسجيل أو رفع. اختبار النشاط ده مش بيحوّل الكلام لنص.',voiceTitle:'صوتك، بداية التفاعل.',voiceSub:'راجع نص الكلام واختبر نشاط الميكروفون وصوت النظام. دقة فهم الكلام وجودة الصوت لسه ما اتقاستش.',speak:'اختبر صوت النظام',cancel:'وقف الصوت',notAI:'أوامر محلية محدودة · محرك الذكاء الاصطناعي غير متصل',security:'تعديل البرامج الخارجية وأوامر ويندوز متوقف.',today:'النهارده',close:'إغلاق',refresh:'اقرأ GitHub',loading:'جاري قراءة المصدر…'}
};
type Tab = 'overview'|'projects'|'voice'|'settings';
type ChatMessage={role:'user'|'assistant';text:string};
function devicePreferences(){try{return readPreferences(localStorage);}catch{return {...defaultPreferences};}}
function App(){
 const [initialPreferences]=useState(devicePreferences);
 const [locale,setLocale]=useState<Locale>(initialPreferences.locale),[zone,setZone]=useState(initialPreferences.zone),[now,setNow]=useState(new Date());
 const [tab,setTab]=useState<Tab>('overview'),[core,setCore]=useState<CoreState>('booting'),[motion,setMotion]=useState<string>(initialPreferences.motion);
 const [quiet,setQuiet]=useState(initialPreferences.quiet),[notice,setNotice]=useState(''),[password,setPassword]=useState(''),[authenticated,setAuthenticated]=useState(false);
 const [health,setHealth]=useState(''),[busy,setBusy]=useState(false),[chat,setChat]=useState<ChatMessage[]>([]),[input,setInput]=useState('');
 const [repo,setRepo]=useState<string>(repositories[0]),[resource,setResource]=useState<Resource>('repository'),[github,setGithub]=useState<ConnectorResult<GitHubSummary>|null>(null);
 const [micOn,setMicOn]=useState(false),[level,setLevel]=useState(0),[voiceName,setVoiceName]=useState(''),[voices,setVoices]=useState<SpeechSynthesisVoice[]>([]);
 const audio=useRef<{stream:MediaStream;ctx:AudioContext;frame:number}|null>(null),mounted=useRef(true),micPending=useRef(false),micGeneration=useRef(0),csrf=useRef('');
 const [sources,setSources]=useState<ConnectorView[]>([]),[sourceError,setSourceError]=useState(false),[online,setOnline]=useState(navigator.onLine);
 const [personalMessage,setPersonalMessage]=useState(''),[voiceDraft,setVoiceDraft]=useState(''),[voiceStop,setVoiceStop]=useState(0);
 const sessionEpoch=useRef(0);
 const t=words[locale],c=clock(now,zone,locale),b=briefing([],now,zone,locale);
 useEffect(()=>{const timer=setInterval(()=>setNow(new Date()),1000);const boot=setTimeout(()=>setCore('idle'),1100);return()=>{clearInterval(timer);clearTimeout(boot)}},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr'},[locale]);
 useEffect(()=>{let ok=false;try{ok=savePreferences(localStorage,{locale,zone,motion,quiet});}catch{}if(!ok)setNotice(locale==='ar'?'تعذّر حفظ الإعدادات على الجهاز.':'Device preferences could not be saved.');},[locale,zone,motion,quiet]);
 useEffect(()=>{const update=()=>setOnline(navigator.onLine);window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update);};},[]);
 useEffect(()=>{
  if(!authenticated){setSources([]);return;}
  const refresh=()=>{void updateSources();};refresh();
  const timer=setInterval(refresh,60000);window.addEventListener('focus',refresh);
  return()=>{clearInterval(timer);window.removeEventListener('focus',refresh);};
 },[authenticated]);
 async function updateSources(){
  const epoch=sessionEpoch.current;
  try{const r=await fetch('/api/connectors');if(epoch!==sessionEpoch.current)return;
   if(r.status===401){clearWorkspace();setNotice(locale==='ar'?'الجلسة انتهت. سجّل دخول تاني.':'Session expired. Sign in again.');return;}
   if(!r.ok)throw Error();const data=await r.json();if(epoch!==sessionEpoch.current)return;
   if(!Array.isArray(data.connectors))throw Error();setSources(data.connectors);setSourceError(false);
  }catch{if(epoch===sessionEpoch.current)setSourceError(true);}
 }
 function clearWorkspace(){
  sessionEpoch.current++;csrf.current='';setAuthenticated(false);setGithub(null);setSources([]);setChat([]);setPassword('');setInput('');setPersonalMessage('');setVoiceDraft('');stopMic();if('speechSynthesis'in window)window.speechSynthesis.cancel();setCore('idle');setBusy(false);
 }
 function statusLabel(id:string){
  const source=sources.find(s=>s.id===id);
  const state=source?.status==='ready'&&freshness({connector:id,observedAt:source.lastSuccessfulSync,maxAgeMs:source.maxAgeMs},now)==='stale'?'stale':source?.status||(id==='autel'?'blocked':!authenticated?'locked':'unavailable');
  const labels:Record<string,[string,string]>={ready:['Connected','متصل'],configured:['Configured · not read yet','مُعدّ · لسه ما اتقراش'],stale:['Stale data','بيانات قديمة'],error:['Read failed','القراءة فشلت'],disconnected:['Not connected','غير متصل'],blocked:['Blocked','محظور'],locked:['Sign in to check','سجّل دخول علشان تفحص'],unavailable:['Status unavailable','الحالة غير متاحة']};
  return labels[state]?.[locale==='ar'?1:0]||state;
 }
 function sourceTime(id:string){const at=sources.find(s=>s.id===id)?.lastSuccessfulSync;return at?new Intl.DateTimeFormat(locale==='ar'?'ar-EG':'en-GB',{timeZone:zone,dateStyle:'short',timeStyle:'short'}).format(new Date(at)):'—';}

 useEffect(()=>{
  let active=true;const epoch=sessionEpoch.current;
  fetch('/api/health').then(r=>r.ok?r.json():Promise.reject()).then(d=>{if(active)setHealth(d.configured?'ready':'setup')}).catch(()=>{if(active)setHealth('offline')});
  fetch('/api/session').then(async r=>{if(r.ok){const d=await r.json();if(active&&epoch===sessionEpoch.current){sessionEpoch.current++;csrf.current=d.csrf;setAuthenticated(true)}}}).catch(()=>{});
  return()=>{active=false};
 },[]);
 useEffect(()=>{
  if(!('speechSynthesis'in window))return;
  const update=()=>setVoices(window.speechSynthesis.getVoices());update();window.speechSynthesis.addEventListener('voiceschanged',update);
  return()=>window.speechSynthesis.removeEventListener('voiceschanged',update);
 },[]);
 useEffect(()=>()=>{mounted.current=false;micGeneration.current++;stopMic();if('speechSynthesis'in window)window.speechSynthesis.cancel()},[]);
 function stopMic(){
  micGeneration.current++;const a=audio.current;if(a){cancelAnimationFrame(a.frame);a.stream.getTracks().forEach(t=>t.stop());void a.ctx.close();audio.current=null;}
  if(mounted.current){setMicOn(false);setLevel(0);setCore('idle')}
 }
 async function microphone(){
  setVoiceStop(v=>v+1);
  if(micOn){stopMic();return}if(micPending.current)return;
  if(!navigator.mediaDevices?.getUserMedia){setNotice('Microphone unavailable in this browser/context.');return}
  micPending.current=true;const generation=++micGeneration.current;
  let stream:MediaStream|null=null;let ctx:AudioContext|null=null;
  try{
   if('speechSynthesis'in window)window.speechSynthesis.cancel();
   stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
   if(!mounted.current||generation!==micGeneration.current){stream.getTracks().forEach(t=>t.stop());return;}
   ctx=new AudioContext();await ctx.resume();if(!mounted.current||generation!==micGeneration.current){stream.getTracks().forEach(t=>t.stop());void ctx.close();return;}const analyser=ctx.createAnalyser();analyser.fftSize=256;
   ctx.createMediaStreamSource(stream).connect(analyser);const values=new Uint8Array(analyser.fftSize);
   const state={stream,ctx,frame:0};audio.current=state;setMicOn(true);setCore('listening');
   const tick=()=>{if(audio.current!==state)return;analyser.getByteTimeDomainData(values);const rms=Math.sqrt(values.reduce((sum,v)=>sum+((v-128)/128)**2,0)/values.length);setLevel(Math.min(1,rms*5));state.frame=requestAnimationFrame(tick)};tick();
   stream.getTracks().forEach(track=>track.onended=()=>stopMic());
  }catch{stream?.getTracks().forEach(t=>t.stop());if(ctx)void ctx.close();setNotice(locale==='ar'?'الميكروفون غير متاح أو الإذن مرفوض.':'Microphone unavailable or permission denied.');setCore('idle')}
  finally{micPending.current=false}
 }
 function speakText(text:string){
  setVoiceStop(v=>v+1);stopMic();if(!('speechSynthesis'in window)){setNotice('System speech is unavailable.');return;}
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text.slice(0,12000));utterance.lang=locale==='ar'?'ar-EG':'en-US';
  utterance.voice=voices.find(v=>v.name===voiceName)||null;utterance.onstart=()=>setCore('speaking');utterance.onend=()=>setCore('idle');utterance.onerror=e=>{setCore('idle');if(e.error!=='canceled'&&e.error!=='interrupted')setNotice('System voice could not play.')};window.speechSynthesis.speak(utterance);
 }
 function speak(){speakText(authenticated&&personalMessage?personalMessage:`${c.greeting}. ${b.message}`);}
 async function login(event:React.FormEvent){event.preventDefault();setBusy(true);try{
  const r=await fetch('/api/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});setPassword('');
  const d=await r.json();if(!r.ok)throw Error(d.error);sessionEpoch.current++;csrf.current=d.csrf;setAuthenticated(true);setNotice('Local workspace unlocked.');
 }catch(e){setNotice(e instanceof Error?e.message:'Unable to sign in')}finally{setBusy(false)}}
 async function logout(){stopMic();if('speechSynthesis'in window)window.speechSynthesis.cancel();try{
  const r=await fetch('/api/logout',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf.current},body:'{}'});
  if(!r.ok&&r.status!==401)throw Error();
  clearWorkspace();setNotice(locale==='ar'?'مساحة العمل اتقفلت.':'Local workspace locked.');
 }catch{setNotice('Could not revoke server session. Retry locking the workspace.')}}
 async function readProject(refresh=false){
  if(!authenticated){setNotice(t.signin);return;}const epoch=sessionEpoch.current;setBusy(true);setCore('thinking');
  try{
   const r=await fetch(`/api/github?repo=${encodeURIComponent(repo)}&resource=${resource}${refresh?'&refresh=1':''}`);
   if(epoch!==sessionEpoch.current)return;
   if(r.status===401){clearWorkspace();throw Error('Session expired. Sign in again.');}
   if(!r.ok)throw Error('Source unavailable');const result=await r.json();
   if(epoch!==sessionEpoch.current)return;setGithub(result);await updateSources();
  }catch(e){if(epoch===sessionEpoch.current){setGithub(null);setNotice(e instanceof Error?e.message:'Read failed');}}
  finally{if(epoch===sessionEpoch.current){setBusy(false);setCore('idle');}}
 }
 function localAnswer(text:string){
  let answer=locale==='ar'?'المساعد الذكي لسه غير متصل. أقدر أقولك الوقت أو أوضح حالة الربط؛ مش هنفّذ أي تعديل.':'AI is not connected yet. I can report time or connection availability; no write actions are enabled.';
  if(/time|الوقت|الساعه|الساعة/i.test(text))answer=`${c.greeting} · ${c.time} · ${zone}`;
  else if(/today|النهارده|النهاردة|tasks|مهام/i.test(text))answer=authenticated?(personalMessage||'Personal briefing is loading; no AI model is connected.'):b.message;
  else if(/connect|ربط|متصل/i.test(text))answer=authenticated?sources.map(source=>`${source.name}: ${statusLabel(source.id)}`).join(' · '):(locale==='ar'?'سجّل دخول علشان نفحص حالة المصادر.':'Sign in to check source status.');
  return answer;
 }
 function command(event:React.FormEvent){event.preventDefault();const text=input.trim();if(!text)return;setInput('');setChat(previous=>[...previous,{role:'user' as const,text},{role:'assistant' as const,text:localAnswer(text)}].slice(-20));
 }
 const icon:Record<Tab,string>={overview:'◈',projects:'▦',voice:'◉',settings:'⌘'};
 return <div className={`app motion-${motion}`}>
  <aside><a className="brand" href="#" aria-label="JARVIS home" onClick={e=>{e.preventDefault();setTab('overview')}}><span className="brand-icon">J</span><span>JARVIS<span className="os"> OS</span><small>PERSONAL COMMAND CENTER</small></span></a>
   <div className="workspace"><span className="status-dot"/> PERSONAL SPACE <small>LOCAL FOUNDATION / 001</small></div>
   <nav aria-label="Main navigation">{(['overview','projects','voice','settings'] as Tab[]).map(key=><button key={key} aria-label={t[key]} aria-current={tab===key?'page':undefined} className={tab===key?'active':''} onClick={()=>{stopMic();setTab(key)}}><span>{icon[key]}</span>{t[key]}<span className="nav-arrow">↗</span></button>)}</nav>
   <div className="side-bottom"><div className="shield">◇ <span>{t.privacy}<small>PERSONAL ≠ CORPORATE</small></span></div><p>{t.security}</p><span className="version">M0 → M1 · v0.1.0</span></div>
  </aside>
  <main>
   <header><div className="breadcrumb">WORKSPACE <span>/</span> {t[tab].toUpperCase()}</div><div className="header-tools"><span className="local-time">{c.time}<small>{zone}</small></span><button className="language" onClick={()=>setLocale(locale==='en'?'ar':'en')}>{locale==='en'?'عربي':'English'}</button><span className="avatar" aria-label="Personal workspace">H</span></div></header>
   {notice&&<div className="notice" role="status">{notice}<button aria-label={t.close} onClick={()=>setNotice('')}>×</button></div>}
   {!online&&<div className="offline-banner" role="status">{locale==='ar'?'إنت غير متصل بالإنترنت. وقت الجهاز والإعدادات متاحين؛ البيانات المتصلة ممكن تبقى قديمة.':'You are offline. Device time and preferences remain available; connected data may be stale.'}</div>}
   <section key={tab} className="page">
    {tab==='overview'&&<>
     <div className="eyebrow"><span className="status-dot"/>{t.briefing}<span className="date">{c.date}</span></div>
     {authenticated&&<PersonalHome locale={locale} zone={zone} csrf={()=>csrf.current} onExpired={clearWorkspace} onBriefing={setPersonalMessage} onSourcesChanged={()=>{void updateSources();}}/>}
     {!authenticated&&<div className="hero"><div className="hero-copy"><p className="greeting">{c.greeting}, Hussein.</p><h1>{t.welcome}</h1><p>{t.intro}</p><div className="hero-actions"><button className="primary" onClick={()=>document.getElementById('command')?.focus()}>{t.ask} <span>↗</span></button><button className="secondary" onClick={()=>setTab('voice')}>◉ {t.voice}</button></div><span className="readonly"><span/> {t.mode}</span></div>
      <div className="core-stage"><div className={`core ${core}`} style={{'--level':level} as React.CSSProperties} aria-label={`JARVIS core: ${core}`}><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="core-ring"/><div className="core-inner"><span>J</span><small>J.A.R.V.I.S.</small></div><div className="core-point"/></div><span className="core-label">{core.toUpperCase()}<span>●</span><small>{t.status}</small></span></div>
     </div>}
     {!authenticated&&<><div className="section-heading"><h2>{t.today}</h2><span>{t.sources} / {String(sources.filter(s=>s.status==='ready').length).padStart(2,'0')}</span></div>
     <div className="day-panel"><div className="day-symbol">◎</div><div><h3>{t.noTasks}</h3><p>{t.noTasksText}</p><span className="source-note">SOURCE: NONE · LAST SUCCESSFUL SYNC: —</span></div><button className="text-button" onClick={()=>setTab('projects')}>{t.projects} ↗</button></div></>}
     <div className="section-heading"><h2>{t.projects}</h2><button className="text-button" onClick={()=>setTab('projects')}>{locale==='en'?'View all':'عرض الكل'} ↗</button></div>
     <div className="quick-apps">{manifests.filter(m=>['progressxx','whoop','factory','lexora'].includes(m.id)).map((m,i)=><a className="quick-app" key={m.id} href={m.launchUrl} target="_blank" rel="noopener noreferrer"><span className={`app-icon app-${i}`}>{['P','W','⌁','L'][i]}</span><span><strong>{m.name}</strong><small>{t.launch} · {statusLabel(m.id)}</small></span><span className="launch-arrow">↗</span></a>)}</div>
     {authenticated&&<><ProgressImport locale={locale} zone={zone}/><AIChat locale={locale} zone={zone} csrf={()=>csrf.current} onExpired={clearWorkspace} onState={setCore} localAnswer={localAnswer} draft={voiceDraft} onSpeak={speakText}/></>}
     {!authenticated&&<section className="chat-section" aria-label="Local assistant"><div className="chat-heading"><span className="mini-core">◈</span><strong>JARVIS</strong><small>{t.notAI}</small>{chat.length>0&&<button className="text-button" onClick={()=>setChat([])}>{t.clear}</button>}</div>
      <div className="messages" aria-live="polite">{chat.map((m,i)=><p key={i} className={m.role}><small>{m.role==='user'?'YOU':'JARVIS'}</small>{m.text}</p>)}</div><form className="command" onSubmit={command}><span>✧</span><input id="command" aria-label={t.ask} placeholder={t.placeholder} value={input} maxLength={1000} onChange={e=>setInput(e.target.value)}/><button type="submit" aria-label={t.send}>↑</button></form></section>}
    </>}
    {tab==='projects'&&<><div className="eyebrow">CONNECTED WORKSPACE</div><h1>{t.sources}</h1><p className="lead">{locale==='en'?'Launch your existing apps. Connected summaries appear only after authorized reads.':'افتح برامجك الأصلية. الملخصات هتظهر بعد ربط وقراءة مُصرّح بيهم.'}</p><div className="integration-grid">{manifests.map(m=><article className="integration" key={m.id}><div className="integration-top"><span className="app-icon">{m.name.slice(0,1)}</span><span className="badge">{m.domain}</span></div><h3>{m.name}</h3><span className="connection-state" data-connector={m.id}>{statusLabel(m.id)}</span><p>{m.limitation}</p><small>{locale==='ar'?'آخر قراءة ناجحة':'LAST SUCCESSFUL READ'}: {sourceTime(m.id)}</small>{sources.find(s=>s.id===m.id)?.lastError&&<small className="source-error">{sources.find(s=>s.id===m.id)?.lastError}</small>}{m.launchUrl&&<a href={m.launchUrl} rel="noopener noreferrer" target="_blank">{t.launch} ↗</a>}</article>)}</div>
      <section className="panel github-panel"><h2>GitHub · read-only</h2><p className="source-summary">{statusLabel('github')} · {locale==='ar'?'آخر نجاح':'Last success'}: {sourceTime('github')}</p>{sourceError&&<p role="status">{locale==='ar'?'تعذّر تحديث حالة المصادر.':'Unable to refresh source status.'}</p>}<div className="controls"><label>Repository<select disabled={busy} value={repo} onChange={e=>{setRepo(e.target.value);setGithub(null)}}>{repositories.map(r=><option key={r}>{r}</option>)}</select></label><label>Resource<select disabled={busy} value={resource} onChange={e=>{setResource(e.target.value as Resource);setGithub(null)}}>{(['repository','pulls','issues','actions'] as Resource[]).map(r=><option key={r}>{r}</option>)}</select></label><button className="primary" disabled={busy||!authenticated} onClick={()=>readProject()}>{busy?t.loading:t.refresh}</button><button className="secondary" disabled={busy||!authenticated} onClick={()=>readProject(true)}>{locale==='ar'?'تحقق من المصدر':'Revalidate source'}</button></div>{!authenticated&&<p>{t.signin} → {t.settings}</p>}{github&&<div role="status"><p>{github.status} {github.error||''} · {github.source.observedAt||'No successful read'} · {github.cache||''}{github.retryAt&&` · Retry after ${github.retryAt}`} · {locale==='ar'?'لحد ١٠ نتائج؛ دي مش القائمة الكاملة':'Up to 10 results; not a complete inventory'}</p>{github.data?.items.map((item,i)=><p key={i}><a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}</a> · {item.state}</p>)}</div>}</section>
    </>}
    {tab==='voice'&&<><div className="eyebrow">VOICE / EXPERIMENTAL</div><h1>{t.voiceTitle}</h1><p className="lead">{t.voiceSub}</p><SpeechInput stopToken={voiceStop} locale={locale} onBegin={stopMic} onState={setCore} onUse={text=>{setVoiceDraft(text);setInput(text);setTab('overview');}}/><section className="voice-workbench panel"><div className={`core ${core}`} style={{'--level':level} as React.CSSProperties}><div className="orbit orbit-one"/><div className="core-ring"/><div className="core-inner"><span>J</span><small>{core.toUpperCase()}</small></div></div><meter aria-label="Microphone activity" min="0" max="1" value={level}/><p>{t.mic}</p><div className="controls"><button className={micOn?'danger':'primary'} onClick={microphone}>{micOn?t.stop:t.listen}</button><button className="secondary" onClick={speak}>{t.speak}</button><button className="secondary" onClick={()=>{window.speechSynthesis?.cancel();setCore('idle')}}>{t.cancel}</button></div><label>System voice<select value={voiceName} onChange={e=>setVoiceName(e.target.value)}><option value="">System default (provider may use network)</option>{voices.map((v,i)=><option key={i} value={v.name}>{v.name} · {v.lang} · {v.localService?'device':'network voice'}</option>)}</select></label><small>Waveform: microphone RMS. Speaking state: system speech events, not audio-synchronized lip/waveform output.</small></section></>}
    {tab==='settings'&&<><div className="eyebrow">YOUR SPACE / YOUR RULES</div><h1>{t.settings}</h1><div className="settings-grid"><section className="panel"><h2>{t.auth}</h2><p>API: {health||'checking'} · {authenticated?'Signed in':'Locked'}</p>{authenticated?<button className="secondary" onClick={logout}>{t.logout}</button>:<form onSubmit={login}><label>{t.password}<input type="password" autoComplete="current-password" required maxLength={256} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="primary" disabled={busy}>{t.signin}</button></form>}<p className="muted">Local development only. Multi-user and production identity are pending.</p></section><section className="panel"><h2>Preferences</h2><label>{t.language}<select aria-label={t.language} value={locale} onChange={e=>setLocale(e.target.value as Locale)}><option value="en">English</option><option value="ar">العربية</option></select></label><label>{t.zone}<select aria-label={t.zone} value={zone} onChange={e=>setZone(e.target.value)}>{['Africa/Cairo','Asia/Dubai','Asia/Riyadh','Europe/London','America/New_York','Etc/UTC'].map(z=><option key={z}>{z}</option>)}</select></label><label>{t.motion}<select aria-label={t.motion} value={motion} onChange={e=>setMotion(e.target.value)}><option value="full">Full</option><option value="reduced">Reduced</option><option value="off">Off</option></select></label><label className="checkbox"><input type="checkbox" checked={quiet} onChange={e=>setQuiet(e.target.checked)}/>{t.quiet}</label><p className="muted">{quiet?'Startup is silent.':'Automatic greeting is planned; use the explicit voice test for now.'} {locale==='ar'?'الإعدادات دي محفوظة على الجهاز فقط.':'These preferences are saved on this device only.'}</p><button className="secondary" onClick={()=>{setLocale(defaultPreferences.locale);setZone(defaultPreferences.zone);setMotion(defaultPreferences.motion);setQuiet(defaultPreferences.quiet);}}>{locale==='ar'?'استعادة الإعدادات الافتراضية':'Reset preferences'}</button></section></div></>}
   </section><footer><span>JARVIS OS <span className="footer-dot">/</span> PERSONAL INTELLIGENCE</span><span>{t.mode}</span></footer>
  </main>
 </div>
}
createRoot(document.getElementById('root')!).render(<App/>);
