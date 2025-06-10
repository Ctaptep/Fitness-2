import React, { useState } from 'react';

const plans = [
  { id: 1, name: 'Базовый' },
  { id: 2, name: 'Продвинутый' },
  { id: 3, name: 'Премиум' }
];

const Plan: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div>
      <h2>Выбор плана</h2>
      {plans.map(plan => (
        <div key={plan.id}>
          <input type="radio" id={plan.name} name="plan" checked={selected === plan.id} onChange={() => setSelected(plan.id)} />
          <label htmlFor={plan.name}>{plan.name}</label>
        </div>
      ))}
      <button disabled={selected === null}>Выбрать</button>
    </div>
  );
};

export default Plan;
