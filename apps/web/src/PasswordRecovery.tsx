import {useEffect, useRef, useState} from 'react';

export function PasswordRecovery({ar}: {ar:boolean}) {
  const pick = (en:string, arabic:string) => ar ? arabic : en;
  const [ready,setReady] = useState<boolean|null>(null);
  const [challenge,setChallenge] = useState('');
  const [code,setCode] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [message,setMessage] = useState('');
  const [busy,setBusy] = useState(false);
  const [success,setSuccess] = useState(false);
  const [retryAt,setRetryAt] = useState(0);
  const [now,setNow] = useState(Date.now());
  const alive = useRef(true), controller = useRef<AbortController|null>(null);
  useEffect(() => {
    alive.current=true;
    const status=new AbortController();
    void fetch('/api/recovery', {signal:status.signal, cache:'no-store'})
      .then(async response => {if (!response.ok) throw Error(); return response.json();})
      .then(data => {if(alive.current)setReady(data.available===true);})
      .catch(() => {if(alive.current)setReady(false);});
    return () => {alive.current=false;status.abort();controller.current?.abort();};
  },[]);
  useEffect(() => {
    if (!retryAt) return;
    const timer=setInterval(() => setNow(Date.now()),1000);
    return () => clearInterval(timer);
  },[retryAt]);
  const seconds=Math.max(0,Math.ceil((retryAt-now)/1000));
  function errorText(error:unknown) {
    const key=error instanceof Error ? error.message : '';
    const messages:Record<string,[string,string]>={
      recovery_not_configured:['Email recovery needs a one-time setup by the project owner. No email was sent.','استرجاع الإيميل محتاج تفعيل مرة واحدة من صاحب المشروع. مفيش إيميل اتبعت.'],
      recovery_send_failed:['The email service could not accept the request. Wait a minute and retry.','خدمة الإيميل ما قبلتش الطلب. استنى دقيقة وجرب تاني.'],
      recovery_rate_limited:['Too many attempts. Wait before retrying; sending is limited to three requests per hour.','محاولات كتير. استنى قبل ما تجرب تاني؛ الإرسال محدود بثلاث طلبات في الساعة.'],
      invalid_or_expired_code:['The code is incorrect, expired or already used. Request another code if needed.','الكود غلط أو انتهت صلاحيته أو اتستخدم. اطلب كود جديد لو محتاج.'],
      invalid_recovery_input:['Enter the 8-digit code and a password of 12–256 characters.','اكتب الكود المكوّن من ٨ أرقام وباسورد من ١٢ لـ٢٥٦ حرف.'],
    };
    return messages[key]?.[ar?1:0] ?? pick('Could not complete recovery. Check your connection and retry.','ما قدرناش نكمل الاسترجاع. راجع الاتصال وجرب تاني.');
  }
  async function post(path:string, body:unknown) {
    controller.current?.abort();
    controller.current=new AbortController();
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body),signal:controller.current.signal,cache:'no-store'});
    const data=await response.json();
    if (!response.ok) throw Error(data.error);
    return data;
  }
  async function send() {
    setBusy(true);setMessage('');setSuccess(false);
    const deadline=Date.now()+60000;setRetryAt(deadline);setNow(Date.now());
    try {
      const result=await post('/api/recovery/request',{});
      if (alive.current) {setChallenge(result.challenge);setCode('');setPassword('');setConfirm('');}
    } catch(error) {if(alive.current)setMessage(errorText(error));}
    finally {if(alive.current)setBusy(false);}
  }
  async function reset(event:React.FormEvent) {
    event.preventDefault();
    if (password!==confirm) {setMessage(pick('The passwords do not match.','الباسوردين مش زي بعض.'));return;}
    setBusy(true);setMessage('');
    try {
      await post('/api/recovery/complete',{challenge,code,password});
      if(alive.current){setChallenge('');setCode('');setSuccess(true);}
    } catch(error) {if(alive.current)setMessage(errorText(error));}
    finally {if(alive.current){setPassword('');setConfirm('');setBusy(false);}}
  }
  return <details className="cloud-password-help">
    <summary>{pick('Forgot your online password?','نسيت باسورد الأونلاين؟')}</summary>
    <p>{pick('Reset your password here with a code sent to the owner’s configured recovery email. Your saved data stays encrypted with the same key.','غيّر الباسورد من هنا بكود يوصلك على إيميل الاسترجاع المسجّل. بياناتك المحفوظة بتفضل بنفس مفتاح التشفير.')}</p>
    {ready===null ? <p role="status">{pick('Checking email recovery…','جاري فحص استرجاع الإيميل…')}</p> : !ready ?
      <p role="status">{pick('Email recovery is not enabled yet. The project owner needs to connect an email service and recovery address once. No code has been sent.','استرجاع الإيميل لسه مش متفعّل. صاحب المشروع محتاج يربط خدمة إرسال وإيميل استرجاع مرة واحدة. مفيش كود اتبعت.')}</p> : <>
      {!success&&<button type="button" className="secondary" disabled={busy||seconds>0} onClick={()=>void send()}>{seconds>0?pick(`Retry in ${seconds}s`,`جرّب بعد ${seconds} ثانية`):challenge?pick('Send a new code','ابعت كود جديد'):pick('Email me a reset code','ابعتلي كود على الإيميل')}</button>}
      {challenge&&<form onSubmit={reset}>
        <p>{pick('The email service accepted the request. Check your inbox and spam folder. The code expires in 10 minutes; up to five incorrect attempts are allowed.','خدمة الإيميل قبلت الطلب. راجع الوارد والـSpam. الكود صالح ١٠ دقائق، وبحد أقصى ٥ محاولات غلط.')}</p>
        <label>{pick('Reset code','كود الاسترجاع')}<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" minLength={8} maxLength={8} required value={code} onChange={e=>setCode(e.target.value)}/></label>
        <label>{pick('New online password','باسورد الأونلاين الجديد')}<input type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
        <label>{pick('Confirm new password','أكد الباسورد الجديد')}<input type="password" autoComplete="new-password" minLength={12} maxLength={256} required value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
        <button className="primary" disabled={busy}>{pick('Save new password','احفظ الباسورد الجديد')}</button>
      </form>}
    </>}
    {message&&<p role="alert">{message}</p>}
    {success&&<p role="status">{pick('Password changed. Sign in above with your new password. Earlier sessions on this deployment are no longer valid.','الباسورد اتغيّر. افتح المساحة من فوق بالباسورد الجديد. جلسات الدخول السابقة على النسخة دي مبقتش صالحة.')}</p>}
  </details>;
}
