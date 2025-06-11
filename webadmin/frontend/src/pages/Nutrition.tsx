import React, { useState, useEffect } from 'react';
import api from '../api';

interface NutritionPlan {
  id: number;
  name: string;
  description: string;
  user_id: number;
}

const Nutrition: React.FC = () => {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<Omit<NutritionPlan, 'id'>>({ name: '', description: '', user_id: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string>('');

  const fetchPlans = () => {
    api.get('/nutrition_plans').then(res => setPlans(res.data)).catch(() => setError('Ошибка загрузки'));
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = plans.filter(n => n.name.toLowerCase().includes(filter.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.description.trim()) {
      setError('Заполните все поля');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/nutrition_plans/${editingId}`, { ...form });
        setEditingId(null);
      } else {
        await api.post('/nutrition_plans', { ...form });
      }
      setForm({ name: '', description: '', user_id: 1 });
      fetchPlans();
    } catch {
      setError('Ошибка сохранения');
    }
  };

  const handleEdit = (n: NutritionPlan) => {
    setForm({ name: n.name, description: n.description, user_id: n.user_id });
    setEditingId(n.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить план питания?')) return;
    try {
      await api.delete(`/nutrition_plans/${id}`);
      fetchPlans();
    } catch {
      setError('Ошибка удаления');
    }
  };

  return (
    <div>
      <h2>Питание</h2>
      <input placeholder="Фильтр по названию" value={filter} onChange={e => setFilter(e.target.value)} />
      {error && <div style={{ color: 'red', margin: '8px 0' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ margin: '16px 0' }}>
        <input
          name="name"
          placeholder="Название плана"
          value={form.name}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Описание"
          value={form.description}
          onChange={handleChange}
        />
        <button type="submit">{editingId ? 'Сохранить' : 'Добавить'}</button>
        {editingId && <button type="button" onClick={() => { setForm({ name: '', description: '', user_id: 1 }); setEditingId(null); }}>Отмена</button>}
      </form>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(n => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.name}</td>
              <td>{n.description}</td>
              <td>
                <button onClick={() => handleEdit(n)}>Редактировать</button>
                <button onClick={() => handleDelete(n.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Nutrition;
