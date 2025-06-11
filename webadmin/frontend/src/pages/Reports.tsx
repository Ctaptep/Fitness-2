import React, { useState, useEffect } from 'react';
import api from '../api';

interface Report {
  id: number;
  report_text: string;
  user_id: number;
  created_at: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<Omit<Report, 'id' | 'created_at'>>({ report_text: '', user_id: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const fetchReports = () => {
    api.get('/reports').then(res => setReports(res.data)).catch(() => setError('Ошибка загрузки'));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter(r => r.report_text.toLowerCase().includes(filter.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, report_text: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.report_text.trim()) {
      setError('Заполните текст отчета');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/reports/${editingId}`, { ...form });
        setEditingId(null);
      } else {
        await api.post('/reports', { ...form });
      }
      setForm({ report_text: '', user_id: 1 });
      fetchReports();
    } catch {
      setError('Ошибка сохранения');
    }
  };

  const handleEdit = (r: Report) => {
    setForm({ report_text: r.report_text, user_id: r.user_id });
    setEditingId(r.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить отчет?')) return;
    try {
      await api.delete(`/reports/${id}`);
      fetchReports();
    } catch {
      setError('Ошибка удаления');
    }
  };

  return (
    <div>
      <h2>Отчеты</h2>
      <input placeholder="Фильтр по тексту" value={filter} onChange={e => setFilter(e.target.value)} />
      {error && <div style={{ color: 'red', margin: '8px 0' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ margin: '16px 0' }}>
        <textarea
          name="report_text"
          placeholder="Текст отчета"
          value={form.report_text}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={() => { setForm({ report_text: '', user_id: 1 }); setEditingId(null); }}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Текст отчета</th>
            <th>Пользователь</th>
            <th>Создан</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.report_text}</td>
              <td>{r.user_id}</td>
              <td>{r.created_at}</td>
              <td>
                <button onClick={() => handleEdit(r)}>Редактировать</button>
                <button onClick={() => handleDelete(r.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
