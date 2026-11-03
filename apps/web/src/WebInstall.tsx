import React, {useEffect, useState} from 'react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
}

export function WebInstall({visible, ar}: {visible: boolean; ar: boolean}) {
  const [offer, setOffer] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!import.meta.env.PROD) return;
    const standalone = window.matchMedia('(display-mode: standalone)');
    const sync = () => setInstalled(standalone.matches);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setOffer(event as InstallPrompt);
    };
    const onInstalled = () => {
      setOffer(null);
      setInstalled(true);
    };
    sync();
    standalone.addEventListener('change', sync);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      standalone.removeEventListener('change', sync);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible || !import.meta.env.PROD) return null;
  const title = ar ? 'تثبيت جارفس من المتصفح' : 'Install JARVIS from your browser';

  async function install() {
    if (!offer) return;
    setOffer(null);
    try {
      await offer.prompt();
    } catch {
      // The browser can revoke its install offer. Menu instructions remain visible.
    }
  }

  return <section className="panel" aria-label={title}>
    <h2>{title}</h2>
    <p>{ar ? 'جارفس بيحتاج الخدمة المحلية وهي شغّالة علشان يفتح مساحة العمل.' : 'The workspace needs the local JARVIS service running.'}</p>
    {installed ? <p role="status">{ar ? 'جارفس متثبّت في المتصفح ده.' : 'JARVIS is installed in this browser.'}</p> :
      <>
        {offer && <button type="button" className="primary" onClick={() => void install()}>
          {ar ? 'ثبّت جارفس' : 'Install JARVIS'}
        </button>}
        <p>{ar ? 'لو زر التثبيت مش ظاهر، افتح قائمة المتصفح ودور على تثبيت التطبيق أو إضافة للشاشة الرئيسية.' : 'If the button is unavailable, check the browser menu for Install app or Add to Home Screen.'}</p>
      </>}
  </section>;
}
