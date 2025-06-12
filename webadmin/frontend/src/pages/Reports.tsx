import React, { useState, useEffect } from 'react';
import api from '../api';
import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { SnackbarAlert } from '../components/LoaderSnackbar';

interface Report {
  id: number;
  report_text: string;
  user_id: number;
  created_at: string;
}

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<Omit<Report, 'id' | 'created_at'>>({ report_text: '', user_id: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [error, setError] = useState<string>('');

  const fetchReports = () => {
    api.get('/reports').then(res => setReports(res.data)).catch(() => setError('Ошибка загрузки'));
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filtered = reports.filter(r => r.report_text.toLowerCase().includes(filter.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setForm({ ...form, report_text: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.report_text.trim()) {
      setSnackbar({ open: true, message: 'Заполните текст отчета', severity: 'error' });
      return;
    }
    try {
      if (editingId) {
        await api.put(`/reports/${editingId}`, { ...form });
        setEditingId(null);
        setSnackbar({ open: true, message: 'Отчет обновлен', severity: 'success' });
      } else {
        await api.post('/reports', { ...form });
        setSnackbar({ open: true, message: 'Отчет добавлен', severity: 'success' });
      }
      setForm({ report_text: '', user_id: 1 });
      fetchReports();
    } catch {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    }
  };

  const handleEdit = (r: Report) => {
    setForm({ report_text: r.report_text, user_id: r.user_id });
    setEditingId(r.id);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить отчет?')) return;
    try {
      await api.delete(`/reports/${id}`);
      fetchReports();
      setSnackbar({ open: true, message: 'Отчет удален', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Ошибка удаления', severity: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <h2>Отчеты</h2>
      <TextField
        label="Фильтр по тексту"
        value={filter}
        onChange={e => setFilter(e.target.value)}
        size="small"
        sx={{ mb: 2 }}
      />
      <form onSubmit={handleSubmit} style={{ margin: '16px 0', display: 'flex', gap: 16, alignItems: 'center' }}>
        <TextField
          name="report_text"
          label="Текст отчета"
          value={form.report_text}
          onChange={e => setForm({ ...form, report_text: e.target.value })}
          size="small"
          multiline
          minRows={2}
          sx={{ flex: 1 }}
        />
        <Button type="submit" variant="contained" color="primary">
          {editingId ? 'Сохранить' : 'Добавить'}
        </Button>
        {editingId && (
          <Button type="button" variant="outlined" color="secondary" onClick={() => { setForm({ report_text: '', user_id: 1 }); setEditingId(null); }}>
            Отмена
          </Button>
        )}
      </form>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Текст отчета</TableCell>
              <TableCell>Пользователь</TableCell>
              <TableCell>Создан</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.report_text}</TableCell>
                <TableCell>{r.user_id}</TableCell>
                <TableCell>{r.created_at}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined" onClick={() => handleEdit(r)} sx={{ mr: 1 }}>Редактировать</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => handleDelete(r.id)}>Удалить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      />
    </Paper>
  );
};

export default Reports;
