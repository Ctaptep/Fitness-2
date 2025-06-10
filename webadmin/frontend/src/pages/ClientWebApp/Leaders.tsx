import React from 'react';

const leaders = [
  { name: 'Иван', score: 120 },
  { name: 'Ольга', score: 110 },
  { name: 'Петр', score: 100 }
];

const Leaders: React.FC = () => (
  <div>
    <h2>Таблица лидеров</h2>
    <table>
      <thead>
        <tr>
          <th>Имя</th>
          <th>Баллы</th>
        </tr>
      </thead>
      <tbody>
        {leaders.map((l, idx) => (
          <tr key={idx}>
            <td>{l.name}</td>
            <td>{l.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default Leaders;
