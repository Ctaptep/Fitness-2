import React, { useState, useEffect } from 'react';
import api, { get, post, put, del } from '../api';
import TelegramMessageForm from './TelegramMessageForm';

interface Client {
  id: number;
  username: string;
  full_name: string;
  email: string;
  is_premium: number;
  is_active: number;
}

const Clients: React.FC = () => {
  // Bulk selection state
  const [selectedBulk, setSelectedBulk] = useState<number[]>([]);

  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState('');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [form, setForm] = useState<Omit<Client, 'id'>>({ username: '', full_name: '', email: '', is_premium: 0, is_active: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const fetchClients = () => {
    console.log('fetchClients called');
    get('/users').then(res => {
      console.log('get(/users) resolved', res.data);
      setClients(res.data);
    }).catch((e) => {
      console.error('get(/users) error', e);
      setError('Ошибка загрузки');
    });
  };

  useEffect(() => {
    console.log('useEffect called');
    fetchClients();
  }, []);

  let filtered = clients.filter(c => (c.full_name || c.username).toLowerCase().includes(filter.toLowerCase()));
  if (premiumFilter === 'free') filtered = filtered.filter(c => c.is_premium === 0);
  if (premiumFilter === 'paid') filtered = filtered.filter(c => c.is_premium === 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.full_name.trim() || !form.email.trim()) {
      setError('Заполните все поля');
      return;
    }
    try {
      if (editingId) {
        await put(`/users/${editingId}`, { ...form });
        setEditingId(null);
      } else {
        await post('/users', { ...form, password: 'changeme' });
      }
      setForm({ username: '', full_name: '', email: '', is_premium: 0, is_active: 1 });
      fetchClients();
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  const handleEdit = (c: Client) => {
    setForm({ username: c.username, full_name: c.full_name, email: c.email, is_premium: c.is_premium, is_active: c.is_active });
    setEditingId(c.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить клиента?')) return;
    try {
      await del(`/users/${id}`);
      fetchClients();
    } catch {
      setError('Ошибка удаления');
    }
  };

  // --- Bulk actions handlers ---
  const handleBulkDelete = async () => {
    if (!window.confirm('Удалить выбранных клиентов?')) return;
    setError('');
    try {
      await Promise.all(selectedBulk.map(id => del(`/users/${id}`)));
      setSelectedBulk([]);
      fetchClients();
    } catch {
      setError('Ошибка массового удаления');
    }
  };

  const handleBulkStatus = async (field: 'is_premium' | 'is_active', value: number) => {
    setError('');
    try {
      await Promise.all(selectedBulk.map(id => put(`/users/${id}`, { [field]: value })));
      setSelectedBulk([]);
      fetchClients();
    } catch {
      setError('Ошибка массового обновления');
    }
  };

  console.log('Clients render', { clients, filter, error });
  return (
    <div>
      <h2>Клиенты</h2>
      <input placeholder="Фильтр по имени или username" value={filter} onChange={e => setFilter(e.target.value)} />
      <select value={premiumFilter} onChange={e => setPremiumFilter(e.target.value as any)} style={{ marginLeft: 8 }}>
        <option value="all">Все</option>
        <option value="free">Бесплатные</option>
        <option value="paid">Платные</option>
      </select>
      {error && <div style={{ color: 'red', margin: '8px 0' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ margin: '16px 0' }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
        />
        <input
          name="full_name"
          placeholder="Имя"
          value={form.full_name}
          onChange={handleChange}
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <select name="is_premium" value={form.is_premium} onChange={handleChange}>
          <option value={0}>Бесплатный</option>
          <option value={1}>Платный</option>
        </select>
        <select name="is_active" value={form.is_active} onChange={handleChange}>
          <option value={1}>Активен</option>
          <option value={0}>Неактивен</option>
        </select>
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={() => { setForm({ username: '', full_name: '', email: '', is_premium: 0, is_active: 1 }); setEditingId(null); }}>Отмена</button>}
      </form>
      <form onSubmit={e => e.preventDefault()}>
        <div style={{ margin: '8px 0' }}>
          <button
            type="button"
            disabled={selectedBulk.length === 0}
            onClick={handleBulkDelete}
            style={{ marginRight: 8 }}
          >
            Удалить выбранных
          </button>
          <button
            type="button"
            disabled={selectedBulk.length === 0}
            onClick={() => handleBulkStatus('is_premium', 1)}
            style={{ marginRight: 8 }}
          >
            Сделать платными
          </button>
          <button
            type="button"
            disabled={selectedBulk.length === 0}
            onClick={() => handleBulkStatus('is_premium', 0)}
            style={{ marginRight: 8 }}
          >
            Сделать бесплатными
          </button>
          <button
            type="button"
            disabled={selectedBulk.length === 0}
            onClick={() => handleBulkStatus('is_active', 1)}
            style={{ marginRight: 8 }}
          >
            Активировать
          </button>
          <button
            type="button"
            disabled={selectedBulk.length === 0}
            onClick={() => handleBulkStatus('is_active', 0)}
          >
            Деактивировать
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selectedBulk.length === filtered.length}
                  onChange={e => {
                    if (e.target.checked) setSelectedBulk(filtered.map(c => c.id));
                    else setSelectedBulk([]);
                  }}
                />
              </th>
              <th>ID</th>
              <th>Username</th>
              <th>Имя</th>
              <th>Email</th>
              <th>Платный</th>
              <th>Активен</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedBulk.includes(c.id)}
                    onChange={e => {
                      if (e.target.checked) setSelectedBulk([...selectedBulk, c.id]);
                      else setSelectedBulk(selectedBulk.filter(id => id !== c.id));
                    }}
                  />
                </td>
                <td>{c.id}</td>
                <td>{c.username}</td>
                <td>{c.full_name}</td>
                <td>{c.email}</td>
                <td>{c.is_premium ? 'Да' : 'Нет'}</td>
                <td>{c.is_active ? 'Да' : 'Нет'}</td>
                <td>
                  <button onClick={() => handleEdit(c)}>Редактировать</button>
                  <button onClick={() => handleDelete(c.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </form>
      <hr style={{ margin: '32px 0' }} />
      <h3>Отправить сообщение клиенту в Telegram</h3>
      <TelegramMessageForm clients={clients} />
    </div>
  );
};

// --- Компонент отправки сообщения в Telegram ---
export default Clients;
