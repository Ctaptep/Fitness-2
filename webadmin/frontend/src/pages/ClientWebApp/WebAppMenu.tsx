import React from 'react';
import { Link } from 'react-router-dom';

const WebAppMenu: React.FC = () => (
  <nav style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: 20 }}>
    <Link to="/webapp">Личные данные</Link>
    <Link to="/webapp/avatar">Аватар</Link>
    <Link to="/webapp/plan">План</Link>
    <Link to="/webapp/progress">Прогресс</Link>
    <Link to="/webapp/leaders">Таблица лидеров</Link>
    <Link to="/webapp/shop">Магазин</Link>
    <Link to="/webapp/challenges">Челенджи</Link>
    <Link to="/webapp/ads">Реклама</Link>
  </nav>
);

export default WebAppMenu;
