import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [form, setForm] = useState({
    height: '',
    weight: '',
    age: '',
    chest: '',
    waist: '',
    hips: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2>Личные данные</h2>
      <input name="height" placeholder="Рост (см)" value={form.height} onChange={handleChange} />
      <input name="weight" placeholder="Вес (кг)" value={form.weight} onChange={handleChange} />
      <input name="age" placeholder="Возраст" value={form.age} onChange={handleChange} />
      <input name="chest" placeholder="Грудь (см)" value={form.chest} onChange={handleChange} />
      <input name="waist" placeholder="Талия (см)" value={form.waist} onChange={handleChange} />
      <input name="hips" placeholder="Бёдра (см)" value={form.hips} onChange={handleChange} />
      <button>Сохранить</button>
    </div>
  );
};

export default Profile;
