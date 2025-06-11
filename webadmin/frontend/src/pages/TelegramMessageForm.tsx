import React, { useState } from 'react';
import api from '../api';

interface Client {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_premium: number;
  is_active: number;
}

interface TelegramMessageFormProps {
  clients: Client[];
}

const TelegramMessageForm: React.FC<TelegramMessageFormProps> = ({ clients }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('');
    if (!selected || !message.trim()) {
      setStatus('Выберите клиента и введите сообщение');
      return;
    }
    setLoading(true);
    try {
      await api.post('/send_telegram_message', { user_id: selected, message });
      setStatus('Сообщение отправлено!');
      setMessage('');
    } catch (e: any) {
      setStatus(e?.response?.data?.detail || 'Ошибка отправки');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSend} style={{ margin: '16px 0' }}>
      <select value={selected ?? ''} onChange={e => setSelected(Number(e.target.value))}>
        <option value="">Выберите клиента</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>{c.full_name || c.username}</option>
        ))}
      </select>
      <textarea
        placeholder="Сообщение"
        value={message}
        onChange={e => setMessage(e.target.value)}
        style={{ marginLeft: 8, minWidth: 300 }}
      />
      <button type="submit" disabled={loading} style={{ marginLeft: 8 }}>
        {loading ? 'Отправка...' : 'Отправить'}
      </button>
      {status && <div style={{ color: status.includes('Ошибка') ? 'red' : 'green', marginTop: 8 }}>{status}</div>}
    </form>
  );
};

export default TelegramMessageForm;
