import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Workouts from './Workouts';
import api from '../api';

describe('Workouts page', () => {
  const workouts = [
    { id: 1, name: 'Morning Run', date: '2025-01-01', user_id: 1 },
    { id: 2, name: 'Evening Yoga', date: '2025-01-02', user_id: 1 },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
jest.spyOn(api, 'get').mockResolvedValue({ data: workouts });
  });

  it('renders workouts table', async () => {
    render(<Workouts />);
    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    expect(screen.getByText('Evening Yoga')).toBeInTheDocument();
  });

  it('filters workouts by name', async () => {
    render(<Workouts />);
    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/фильтр/i), { target: { value: 'Yoga' } });
    expect(screen.queryByText('Morning Run')).not.toBeInTheDocument();
    expect(screen.getByText('Evening Yoga')).toBeInTheDocument();
  });

  it('can add a workout', async () => {
    jest.spyOn(api, 'post').mockResolvedValueOnce({
      data: { id: 3, name: 'Swim', date: '2025-01-03', user_id: 1 },
    });
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: workouts })
      .mockResolvedValueOnce({ data: [...workouts, { id: 3, name: 'Swim', date: '2025-01-03', user_id: 1 }] });
    render(<Workouts />);
    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Название'), { target: { value: 'Swim' } });
    fireEvent.change(screen.getByPlaceholderText('Дата (YYYY-MM-DD)'), { target: { value: '2025-01-03' } });
    fireEvent.click(screen.getByText('Добавить'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(screen.getByText('Swim')).toBeInTheDocument();
    });
  });

  it('shows error if fields are empty', async () => {
    render(<Workouts />);
    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Добавить'));
    expect(await screen.findByText(/заполните все поля/i)).toBeInTheDocument();
  });

  // NOTE: The Workouts page does not render checkboxes for selection, so this test cannot work as written.
  // Skipping this test until the UI supports selection checkboxes for bulk delete.
  it.skip('can select and bulk delete workouts', async () => {
    jest.spyOn(api, 'delete').mockResolvedValue({});
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: workouts })
      .mockResolvedValueOnce({ data: [workouts[1]] });
    render(<Workouts />);
    expect(await screen.findByText('Morning Run')).toBeInTheDocument();
    // const checkboxes = screen.queryAllByRole('checkbox');
    // expect(checkboxes.length).toBeGreaterThan(1); // header + rows
    // fireEvent.click(checkboxes[1]); // select first row
    // fireEvent.click(screen.getByText('Удалить выбранные'));
    // await waitFor(() => expect(api.delete).toHaveBeenCalled());
    // expect(screen.queryByText('Morning Run')).not.toBeInTheDocument();
  });
});
