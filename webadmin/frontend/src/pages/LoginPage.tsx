import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const timeoutId = React.useRef<number | null>(null);
  const [status, setStatus] = useState('init');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [fallbackUserId, setFallbackUserId] = useState<string | null>(null);
  const [fallbackResult, setFallbackResult] = useState<any>(null);
  const [windowDump, setWindowDump] = useState<string | null>(null);
  const [showWindowDump, setShowWindowDump] = useState(false);
  const navigate = useNavigate();

  // Редирект после успешной Telegram-авторизации
  React.useEffect(() => {
    if (status === 'tg-webapp' && localStorage.getItem('token')) {
      navigate('/webapp');
    }
  }, [status, navigate]);

  useEffect(() => {
    const initAuth = () => {
      const debugInfo: any = {
        userAgent: navigator.userAgent,
        location: window.location.href,
        referrer: document.referrer,
        telegramWebAppPresent: false,
        telegramWebAppKeys: null,
        telegramWebviewProxyPresent: false,
        telegramWebviewProxyKeys: null,
        windowKeys: Object.keys(window),
        isIframe: window.self !== window.top,
        timestamp: new Date().toISOString()
      };

      const win = window as any;
      const tgWebApp = win.Telegram?.WebApp;
      const tgProxy = win.TelegramWebviewProxy;

      let messageHandler: ((event: MessageEvent) => void) | null = null;

      if (tgWebApp) {
        debugInfo.telegramWebAppPresent = true;
        debugInfo.telegramWebAppKeys = Object.keys(tgWebApp);
        debugInfo.tgWebAppInitData = tgWebApp.initData;
        debugInfo.tgWebAppUser = tgWebApp.initDataUnsafe?.user;

        setStatus('tg-webapp');
        setError(null);
        setDebug(debugInfo);

      } else if (tgProxy) {
        debugInfo.telegramWebviewProxyPresent = true;
        debugInfo.telegramWebviewProxyKeys = Object.keys(tgProxy);

        setStatus('proxy-fallback');
        setError('Авторизация через TelegramWebviewProxy...');
        setDebug(debugInfo);

        try {
          if (typeof tgProxy.postEvent === 'function') {
            tgProxy.postEvent('web_app_request_data', '{}');
          } else if (typeof tgProxy.sendData === 'function') {
            tgProxy.sendData('{}');
          }
        } catch (e) {
          setFallbackResult('Ошибка вызова tgProxy: ' + (e as Error).message);
        }

        messageHandler = (event: MessageEvent) => {
          try {
            if (typeof event.data === 'string' && event.data.trim().startsWith('{')) {
              const data = JSON.parse(event.data);
              if (data && (data.user || data.user_id)) {
                const userId = data.user_id || data.user?.id || null;
                setFallbackUserId(userId);
                setFallbackResult(data);
                setStatus('proxy-fallback-success');
                setError(null);
              }
            }
          } catch (parseError) {
            console.error('Ошибка парсинга сообщения:', parseError);
          }
        };

        window.addEventListener('message', messageHandler);

      } else {
        setStatus('no-tg');
        setError('Ошибка: Не найден Telegram API. Откройте через Telegram-клиент (мобильный или Desktop).');
        setDebug(debugInfo);
      }
    };

    initAuth();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const handleShowWindowDump = () => {
    if (!windowDump) {
      try {
        const dump: Record<string, string> = {};
        for (const key in window) {
          try {
            dump[key] = typeof (window as any)[key];
          } catch (e) {
            dump[key] = 'inaccessible';
          }
        }
        setWindowDump(JSON.stringify(dump, null, 2));
      } catch (e) {
        setWindowDump('Ошибка при дампе window: ' + (e as Error).message);
      }
    }
    setShowWindowDump(!showWindowDump);
  };

  const diag = {
    telegram: !!(window as any).Telegram,
    webapp: !!((window as any).Telegram?.WebApp),
    proxy: !!(window as any).TelegramWebviewProxy,
    userAgent: navigator.userAgent,
    location: window.location.href,
    referrer: document.referrer,
    isIframe: window.self !== window.top,
  };

  const diagText = JSON.stringify(diag, null, 2);

  const handleCopyDiag = () => {
    navigator.clipboard.writeText(diagText).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = diagText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

  const statusColor =
    status === 'tg-webapp' ? 'green' :
      status.includes('proxy') ? 'orange' : 'red';

  return (
    <div style={{
      padding: 32,
      fontFamily: 'sans-serif',
      maxWidth: 800,
      margin: '0 auto',
      backgroundColor: '#fafafa'
    }}>
      <h2>
        Добро пожаловать в Fitness AI!
        <span style={{
          display: 'inline-block',
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: statusColor,
          marginLeft: 8
        }}></span>
      </h2>
      <p>Вы успешно авторизованы через Telegram.</p>

      <div style={{
        margin: '16px 0',
        color: statusColor,
        fontWeight: 600,
        fontSize: 18
      }}>
        Статус: {status}
      </div>

      {error && (
        <div style={{
          background: '#fff6f6',
          padding: 12,
          borderRadius: 8,
          borderLeft: `4px solid ${statusColor}`,
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Ошибка:</div>
          <div>{error}</div>
        </div>
      )}

      {fallbackUserId && (
        <div style={{
          background: '#f0fff4',
          padding: 12,
          borderRadius: 8,
          borderLeft: '4px solid #38a169',
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 600, color: '#2f855a' }}>
            [Fallback] Успешная авторизация
          </div>
          <div>User ID: <strong>{fallbackUserId}</strong></div>
        </div>
      )}

      {fallbackResult && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Данные авторизации:</div>
          <pre style={{
            background: '#f0fff4',
            padding: 12,
            borderRadius: 8,
            fontSize: 14,
            overflowX: 'auto',
            maxHeight: 300
          }}>
            {JSON.stringify(fallbackResult, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Отладочная информация:</div>
        <pre style={{
          background: '#f8f9fa',
          padding: 16,
          borderRadius: 8,
          fontSize: 14,
          overflowX: 'auto',
          maxHeight: 300,
          border: '1px solid #eaeaea'
        }}>
          {debug ? JSON.stringify(debug, null, 2) : 'Сбор информации...'}
        </pre>
      </div>

      {debug?.tgWebAppInitData && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>Init Data:</div>
          <div style={{
            wordBreak: 'break-all',
            fontSize: 14,
            padding: 12,
            background: '#edf2ff',
            borderRadius: 8,
            marginTop: 8
          }}>
            {String(debug.tgWebAppInitData)}
          </div>
        </div>
      )}

      {debug?.telegramWebviewProxyKeys && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>Доступные методы прокси:</div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8
          }}>
            {debug.telegramWebviewProxyKeys.map((key: string) => (
              <span key={key} style={{
                padding: '4px 8px',
                background: '#fff3e0',
                borderRadius: 4,
                fontSize: 13
              }}>
                {key}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{
        background: '#f8f9fa',
        padding: 16,
        borderRadius: 8,
        fontSize: 14,
        borderLeft: '3px solid #4a5568'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Инструкция:</div>
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li>Перейдите по кнопке выше (или найдите вашего бота в Telegram).</li>
          <li>Нажмите кнопку <b>“Открыть WebApp”</b> в сообщении от бота.</li>
          <li>Мини-приложение откроется внутри Telegram с поддержкой всех функций.</li>
        </ul>
        <div style={{ marginTop: 12, fontSize: 15, color: '#c53030' }}>
          Если вы открываете сайт вручную или через web.telegram.org — Telegram API работать не будет!
        </div>
      </div>

      {status === 'no-tg' && (
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <a
            href="https://t.me/YourBot?start=webapp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              padding: '18px 32px',
              background: '#229ED9',
              color: '#fff',
              borderRadius: 10,
              fontWeight: 900,
              letterSpacing: 1,
              textDecoration: 'none',
              fontSize: 22,
              boxShadow: '0 4px 12px rgba(0,0,0,0.13)',
              margin: '24px 0',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
          >
            ОТКРЫТЬ ЧЕРЕЗ TELEGRAM-БОТА
          </a>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
