import React, { useState } from 'react';
import api from '../api';
import { SnackbarAlert } from '../components/LoaderSnackbar';

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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !message.trim()) {
      setSnackbar({ open: true, message: 'Выберите клиента и введите сообщение', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/send_telegram_message', { user_id: selected, message });
      setSnackbar({ open: true, message: 'Сообщение отправлено!', severity: 'success' });
      setMessage('');
    } catch (e: any) {
      setSnackbar({ open: true, message: e?.response?.data?.detail || 'Ошибка отправки', severity: 'error' });
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
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
    </form>
  );
};

export default TelegramMessageForm;
