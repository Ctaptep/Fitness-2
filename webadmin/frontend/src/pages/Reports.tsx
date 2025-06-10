import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Report {
  id: number;
  title: string;
  created_at: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/reports`).then(res => setReports(res.data));
  }, []);

  const filtered = reports.filter(r => r.title.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h2>Отчеты</h2>
      <input placeholder="Фильтр по названию" value={filter} onChange={e => setFilter(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Создан</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.title}</td>
              <td>{r.created_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Добавить формы добавления/удаления по аналогии */}
    </div>
  );
};

export default Reports;
