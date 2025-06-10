import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Nutrition {
  id: number;
  meal: string;
  calories: number;
  date: string;
}

const Nutrition: React.FC = () => {
  const [data, setData] = useState<Nutrition[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/nutrition`).then(res => setData(res.data));
  }, []);

  const filtered = data.filter(n => n.meal.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h2>Питание</h2>
      <input placeholder="Фильтр по блюду" value={filter} onChange={e => setFilter(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Блюдо</th>
            <th>Калории</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(n => (
            <tr key={n.id}>
              <td>{n.id}</td>
              <td>{n.meal}</td>
              <td>{n.calories}</td>
              <td>{n.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Добавить формы добавления/удаления по аналогии */}
    </div>
  );
};

export default Nutrition;
