import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Client {
  id: number;
  name: string;
  email: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/clients`).then(res => setClients(res.data));
  }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <h2>Клиенты</h2>
      <input placeholder="Фильтр по имени" value={filter} onChange={e => setFilter(e.target.value)} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Добавить формы добавления/удаления по аналогии */}
    </div>
  );
};

export default Clients;
