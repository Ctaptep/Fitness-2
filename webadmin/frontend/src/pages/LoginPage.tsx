import React, { useEffect, useState } from 'react';

const LoginPage: React.FC = () => {
  // Состояния компонента
  const [status, setStatus] = useState('init');
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);
  const [fallbackUserId, setFallbackUserId] = useState<string | null>(null);
  const [fallbackResult, setFallbackResult] = useState<any>(null);
  const [windowDump, setWindowDump] = useState<string | null>(null);
  const [showWindowDump, setShowWindowDump] = useState(false);

  useEffect(() => {
    // Диагностический таймер
    const timeoutId = setTimeout(() => {
      console.log('[Диагностика] window.Telegram:', window.Telegram);
      console.log('[Диагностика] window.Telegram.WebApp:', window.Telegram?.WebApp);
      console.log('[Диагностика] window.TelegramWebviewProxy:', window.TelegramWebviewProxy);
      
      alert(
        'Диагностика Telegram API:\n\n' +
        'window.Telegram: ' + (window.Telegram ? 'есть' : 'нет') + '\n' +
        'window.Telegram.WebApp: ' + (window.Telegram?.WebApp ? 'есть' : 'нет') + '\n' +
        'window.TelegramWebviewProxy: ' + (window.TelegramWebviewProxy ? 'есть' : 'нет')
      );
    }, 1500);

    // Основная логика инициализации
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
        // Режим Telegram WebApp (современные клиенты)
        debugInfo.telegramWebAppPresent = true;
        debugInfo.telegramWebAppKeys = Object.keys(tgWebApp);
        debugInfo.tgWebAppInitData = tgWebApp.initData;
        debugInfo.tgWebAppUser = tgWebApp.initDataUnsafe?.user;
        
        setStatus('tg-webapp');
        setError(null);
        setDebug(debugInfo);
        
      } else if (tgProxy) {
        // Fallback-режим для старых клиентов
        debugInfo.telegramWebviewProxyPresent = true;
        debugInfo.telegramWebviewProxyKeys = Object.keys(tgProxy);
        
        setStatus('proxy-fallback');
        setError('Авторизация через TelegramWebviewProxy...');
        setDebug(debugInfo);
        
        try {
          // Попытка запроса данных через разные методы прокси
          if (typeof tgProxy.postEvent === 'function') {
            tgProxy.postEvent('web_app_request_data', '{}');
          } else if (typeof tgProxy.sendData === 'function') {
            tgProxy.sendData('{}');
          }
        } catch (e) {
          setFallbackResult('Ошибка вызова tgProxy: ' + (e as Error).message);
        }

        // Обработчик ответа от Telegram
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
        // Telegram API не обнаружен
        setStatus('no-tg');
        setError('Ошибка: Не найден Telegram API. Откройте через Telegram-клиент (мобильный или Desktop).');
        setDebug(debugInfo);
      }
    };

    initAuth();

    // Очистка эффекта
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Обработчик показа дампа window
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

  // Диагностические данные для отображения
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

  // Копирование диагностической информации
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

  // Определение цвета статуса
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
      {/* Диагностический блок */}
      <div style={{
        background: '#f0f5ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        border: '1px solid #d0d7de',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginTop: 0, color: '#1f3a8a' }}>Диагностика Telegram API</h3>
        <div style={{ lineHeight: 1.6, fontSize: 15 }}>
          <div>
            <b>window.Telegram:</b> 
            <span style={{ color: diag.telegram ? 'green' : 'red', fontWeight: 600, marginLeft: 8 }}>
              {diag.telegram ? 'Обнаружен' : 'Отсутствует'}
            </span>
          </div>
          <div>
            <b>window.Telegram.WebApp:</b> 
            <span style={{ color: diag.webapp ? 'green' : diag.telegram ? 'orange' : 'red', fontWeight: 600, marginLeft: 8 }}>
              {diag.webapp ? 'Доступен' : diag.telegram ? 'Частично доступен' : 'Недоступен'}
            </span>
          </div>
          <div>
            <b>window.TelegramWebviewProxy:</b> 
            <span style={{ color: diag.proxy ? 'orange' : 'red', fontWeight: 600, marginLeft: 8 }}>
              {diag.proxy ? 'Доступен (legacy)' : 'Отсутствует'}
            </span>
          </div>
          <div><b>User Agent:</b> <span style={{ fontSize: 14 }}>{diag.userAgent}</span></div>
          <div><b>URL:</b> <span style={{ fontSize: 14 }}>{diag.location}</span></div>
          <div><b>Referrer:</b> <span style={{ fontSize: 14 }}>{diag.referrer || 'не установлен'}</span></div>
          <div><b>Iframe:</b> <span style={{ fontWeight: 600 }}>{diag.isIframe ? 'Да' : 'Нет'}</span></div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button 
            onClick={handleCopyDiag}
            style={{
              padding: '8px 16px',
              background: '#e9ecef',
              border: '1px solid #ced4da',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Скопировать диагностику
          </button>
          <button 
            onClick={handleShowWindowDump}
            style={{
              padding: '8px 16px',
              background: '#e9ecef',
              border: '1px solid #ced4da',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            {showWindowDump ? 'Скрыть window' : 'Показать window'}
          </button>
        </div>
      </div>

      {showWindowDump && windowDump && (
        <pre style={{
          background: '#2d2d2d',
          color: '#f8f8f2',
          padding: 16,
          borderRadius: 8,
          fontSize: 13,
          overflowX: 'auto',
          maxHeight: 300,
          marginBottom: 24
        }}>
          {windowDump}
        </pre>
      )}

      {/* Блок статуса авторизации */}
      <div style={{ 
        background: '#fff',
        padding: 24,
        borderRadius: 12,
        border: `2px solid ${statusColor}`,
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <h2 style={{ 
          color: '#1976d2', 
          marginTop: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span>Telegram WebApp Авторизация</span>
          <span style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            borderRadius: '50%',
            backgroundColor: statusColor
          }}></span>
        </h2>
        
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
            <li>Откройте страницу через Telegram-бота для полноценной авторизации</li>
            <li>Статус <span style={{ color: 'orange' }}>оранжевый</span> - используется legacy-режим (старые клиенты)</li>
            <li>Статус <span style={{ color: 'green' }}>зеленый</span> - используется современный WebApp API</li>
            <li>В fallback-режиме некоторые функции могут быть ограничены</li>
          </ul>
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
          <div style={{
            margin: '24px auto',
            maxWidth: 450,
            background: '#fffbe6',
            border: '2px solid #ffd700',
            borderRadius: 12,
            padding: 18,
            color: '#b7791f',
            fontSize: 18,
            fontWeight: 600,
            lineHeight: 1.5
          }}>
            <b>Внимание!</b><br/>
            Для работы мини-приложения откройте его <u>только через кнопку</u> в Telegram-боте.<br/>
            <br/>
            <ol style={{textAlign:'left', margin:'12px auto 0', paddingLeft: 24}}>
              <li>Перейдите по кнопке выше (или найдите вашего бота в Telegram).</li>
              <li>Нажмите кнопку <b>“Открыть WebApp”</b> в сообщении от бота.</li>
              <li>Мини-приложение откроется внутри Telegram с поддержкой всех функций.</li>
            </ol>
            <div style={{marginTop:12, fontSize:15, color:'#c53030'}}>
              Если вы открываете сайт вручную или через web.telegram.org — Telegram API работать не будет!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;