import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Workout {
  id: number;
  name: string;
  date: string;
}

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/workouts`).then(res => setWorkouts(res.data));
  }, []);

  const filtered = workouts.filter(w => w.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h2>Тренировки</h2>
      <input placeholder="Фильтр по названию" value={filter} onChange={e => setFilter(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(w => (
            <tr key={w.id}>
              <td>{w.id}</td>
              <td>{w.name}</td>
              <td>{w.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Добавить формы добавления/удаления по аналогии */}
    </div>
  );
};

export default Workouts;
