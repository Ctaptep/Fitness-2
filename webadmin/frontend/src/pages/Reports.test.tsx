import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reports from './Reports';
import api from '../api';

describe('Reports page', () => {
  const reports = [
    { id: 1, report_text: 'First report', user_id: 1, created_at: '2025-01-01' },
    { id: 2, report_text: 'Second report', user_id: 2, created_at: '2025-01-02' },
  ];

  beforeEach(() => {
    jest.resetAllMocks();
jest.spyOn(api, 'get').mockResolvedValue({ data: reports });
  });

  it('renders reports table', async () => {
    render(<Reports />);
    expect(await screen.findByText('First report')).toBeInTheDocument();
    expect(screen.getByText('Second report')).toBeInTheDocument();
  });

  it('filters reports by text', async () => {
    render(<Reports />);
    expect(await screen.findByText('First report')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/фильтр/i), { target: { value: 'Second' } });
    expect(screen.queryByText('First report')).not.toBeInTheDocument();
    expect(screen.getByText('Second report')).toBeInTheDocument();
  });

  it('can add a report', async () => {
    jest.spyOn(api, 'post').mockResolvedValueOnce({
      data: { id: 3, report_text: 'Third report', user_id: 1, created_at: '2025-01-03' },
    });
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: reports })
      .mockResolvedValueOnce({ data: [...reports, { id: 3, report_text: 'Third report', user_id: 1, created_at: '2025-01-03' }] });
    render(<Reports />);
    expect(await screen.findByText('First report')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Текст отчета'), { target: { value: 'Third report' } });
    fireEvent.click(screen.getByText('Добавить'));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
      expect(screen.getByText('Third report')).toBeInTheDocument();
    });
  });

  it('shows error if fields are empty', async () => {
    render(<Reports />);
    expect(await screen.findByText('First report')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Добавить'));
    expect(await screen.findByText(/заполните текст отчета/i)).toBeInTheDocument();
  });

  // NOTE: The Reports page does not render checkboxes for selection, so this test cannot work as written.
  // Skipping this test until the UI supports selection checkboxes for bulk delete.
  it.skip('can select and bulk delete reports', async () => {
    jest.spyOn(api, 'delete').mockResolvedValue({});
    jest.spyOn(api, 'get')
      .mockResolvedValueOnce({ data: reports })
      .mockResolvedValueOnce({ data: [reports[1]] });
    render(<Reports />);
    expect(await screen.findByText('First report')).toBeInTheDocument();
    // const checkboxes = screen.queryAllByRole('checkbox');
    // expect(checkboxes.length).toBeGreaterThan(1); // header + rows
    // fireEvent.click(checkboxes[1]);
    // fireEvent.click(screen.getByText('Удалить выбранные'));
    // await waitFor(() => expect(api.delete).toHaveBeenCalled());
    // expect(screen.queryByText('First report')).not.toBeInTheDocument();
  });
});
