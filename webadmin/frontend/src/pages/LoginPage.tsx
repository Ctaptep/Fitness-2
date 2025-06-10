import React, { useEffect, useState } from 'react';

const getType = (obj: any) => Object.prototype.toString.call(obj);

const LoginPage: React.FC = () => {
  const [status, setStatus] = useState('init');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [fallbackUserId, setFallbackUserId] = useState<string | null>(null);
  const [fallbackResult, setFallbackResult] = useState<any>(null);

  useEffect(() => {
    // Поддержка и WebApp API (мобильный Telegram), и TelegramWebviewProxy (старый Desktop API)
    let debugInfo: any = {
      userAgent: navigator.userAgent,
      location: window.location.href,
      referrer: document.referrer,
      telegramWebAppPresent: false,
      telegramWebAppKeys: null,
      telegramWebviewProxyPresent: false,
      telegramWebviewProxyKeys: null,
      windowKeys: Object.keys(window),
      isIframe: window.self !== window.top,
    };
    const win: any = window;
    const tgWebApp = win.Telegram?.WebApp;
    const tgProxy = win.TelegramWebviewProxy;
    if (tgWebApp) {
      debugInfo.telegramWebAppPresent = true;
      debugInfo.telegramWebAppKeys = Object.keys(tgWebApp);
      setStatus('tg-webapp');
      setError(null);
      // Здесь можно добавить авторизацию через WebApp API (initData, user info и т.д.)
      // Например:
      setDebug((prev: any) => ({ ...prev, tgWebAppInitData: tgWebApp.initData, tgWebAppUser: tgWebApp.initDataUnsafe?.user }));
    } else if (tgProxy) {
      debugInfo.telegramWebviewProxyPresent = true;
      debugInfo.telegramWebviewProxyKeys = Object.keys(tgProxy);
      setStatus('proxy-fallback');
      setError('Авторизация через TelegramWebviewProxy...');
      try {
        if (typeof tgProxy.postEvent === 'function') {
          tgProxy.postEvent('web_app_request_data', '{}');
        } else if (typeof tgProxy.sendData === 'function') {
          tgProxy.sendData('{}');
        }
      } catch (e) {
        setFallbackResult('Ошибка вызова tgProxy: ' + (e as any).message);
      }
      // Слушаем ответ от Telegram
      const handler = (event: MessageEvent) => {
        if (typeof event.data === 'string' && event.data.startsWith('{')) {
          try {
            const data = JSON.parse(event.data);
            if (data && (data.user || data.user_id)) {
              setFallbackUserId(data.user_id || data.user?.id || null);
              setFallbackResult(data);
              setStatus('proxy-fallback-success');
              setError(null);
            }
          } catch {}
        }
      };
      window.addEventListener('message', handler);
      return () => window.removeEventListener('message', handler);
    } else {
      setStatus('no-tg');
      setError('Ошибка: Откройте через Telegram-клиент (мобильный или Desktop).');
    }
    setDebug(debugInfo);
  }, []);

  let statusColor = 'red';
  if (status === 'tg-ok') statusColor = 'green';
  if (status === 'proxy-no-webapp') statusColor = 'orange';
  if (status === 'proxy-fallback' || status === 'proxy-fallback-success') statusColor = 'orange';

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1976d2', marginBottom: 8 }}>Telegram WebApp Авторизация</h2>
      <div style={{ margin: '16px 0', color: statusColor, fontWeight: 600 }}>
        Статус: {status}
      </div>
      {error && <div style={{ color: statusColor, marginBottom: 12, fontWeight: 500 }}>Ошибка: {error}</div>}
      {fallbackUserId && (
        <div style={{ color: 'green', marginBottom: 12, fontWeight: 500 }}>
          [Fallback] Получен userId: {fallbackUserId}
        </div>
      )}
      {fallbackResult && (
        <pre style={{ background: '#e0ffe0', padding: 8, borderRadius: 6, fontSize: 13, marginBottom: 14 }}>
          {JSON.stringify(fallbackResult, null, 2)}
        </pre>
      )}
      <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 8, fontSize: 13, overflowX: 'auto', marginBottom: 18 }}>
        {debug ? JSON.stringify(debug, null, 2) : '\u0421\u0431\u043e\u0440 debug-\u0438\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u0438...'}
      </pre>
      <div style={{marginTop: 10, color: '#a67c00', fontSize: 15}}>
        {debug?.tgApiStatus}
      </div>
      {debug?.initData && (
        <div style={{marginTop: 10, color: '#007c3a', fontSize: 13}}>
          <b>initData:</b> {String(debug.initData)}
        </div>
      )}
      {debug?.proxyMethods && debug.proxyMethods.length > 0 && (
        <div style={{marginTop: 10, color: '#a67c00', fontSize: 13}}>
          <b>Proxy methods:</b> {debug.proxyMethods.join(", ")}
        </div>
      )}
      <div style={{marginTop: 24, color: '#888', fontSize: 13}}>
        Запустите через Telegram-бота, чтобы увидеть полноценную авторизацию. <br />
        Если статус orange — TelegramWebviewProxy найден, но WebApp API нет (старый клиент или ограничения Telegram).<br />
        Fallback-режим: если получен userId, авторизация возможна через старый API (но не все функции WebApp будут работать).<br />
      </div>
      {(!debug?.tgApiStatus || debug?.tgApiStatus.includes('не обнаружено')) && (
        <div style={{marginTop: 32}}>
          <a
            href="https://oauth.telegram.org/auth?bot_id=6469783217&origin=https://www.korobanov-roman.ru&embed=0"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#229ED9',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              textDecoration: 'none',
              fontSize: 18
            }}
          >
            Войти через Telegram
          </a>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
// Файл обновлён для устранения проблем с индексом IDE
