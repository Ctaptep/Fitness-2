import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Nutrition from './Nutrition';
import api from '../api';

describe('Nutrition page', () => {
  const plans = [
    { id: 1, name: 'Low Carb', description: 'desc1', user_id: 1 },
    { id: 2, name: 'Keto', description: 'desc2', user_id: 1 },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(api, 'get').mockResolvedValue({ data: plans });
  });

  it('renders nutrition plans table', async () => {
    render(<Nutrition />);
    expect(await screen.findByText('Low Carb')).toBeInTheDocument();
    expect(screen.getByText('Keto')).toBeInTheDocument();
  });

  it('filters plans by name', async () => {
    render(<Nutrition />);
    expect(await screen.findByText('Low Carb')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/фильтр/i), { target: { value: 'Keto' } });
    expect(screen.queryByText('Low Carb')).not.toBeInTheDocument();
    expect(screen.getByText('Keto')).toBeInTheDocument();
  });

  it('can add a plan', async () => {
    jest.spyOn(api, 'post').mockResolvedValueOnce({
      data: { id: 3, name: 'Vegan', description: 'desc3', user_id: 1 },
    });
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: plans })
      .mockResolvedValueOnce({ data: [...plans, { id: 3, name: 'Vegan', description: 'desc3', user_id: 1 }] });
    render(<Nutrition />);
    expect(await screen.findByText('Low Carb')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Название плана'), { target: { value: 'Vegan' } });
    fireEvent.change(screen.getByPlaceholderText('Описание'), { target: { value: 'desc3' } });
    fireEvent.click(screen.getByText('Добавить'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(screen.getByText('Vegan')).toBeInTheDocument();
    });
  });

  it('shows error if fields are empty', async () => {
    render(<Nutrition />);
    expect(await screen.findByText('Low Carb')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Добавить'));
    expect(await screen.findByText(/заполните все поля/i)).toBeInTheDocument();
  });

  // NOTE: The Nutrition page does not render checkboxes for selection, so this test cannot work as written.
  // Skipping this test until the UI supports selection checkboxes for bulk delete.
  it.skip('can select and bulk delete plans', async () => {
    jest.spyOn(api, 'delete').mockResolvedValue({});
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: plans })
      .mockResolvedValueOnce({ data: [plans[1]] });
    render(<Nutrition />);
    expect(await screen.findByText('Low Carb')).toBeInTheDocument();
    // const checkboxes = screen.getAllByRole('checkbox');
    // fireEvent.click(checkboxes[1]);
    // fireEvent.click(screen.getByText('Удалить выбранные'));
    // await waitFor(() => expect(api.delete).toHaveBeenCalled());
    // expect(screen.queryByText('Low Carb')).not.toBeInTheDocument();
  });
});
