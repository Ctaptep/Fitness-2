import React, { useState, useEffect } from 'react';
import api from '../api';
import { Grid, Paper, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Loader, SnackbarAlert } from '../components/LoaderSnackbar';

interface Workout {
  id: number;
  name: string;
  date: string;
}

const Workouts: React.FC = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<Omit<Workout, 'id'>>({ name: '', date: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchWorkouts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workouts');
      setWorkouts(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Ошибка загрузки', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const filtered = workouts.filter(w => w.name.toLowerCase().includes(filter.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date.trim()) {
      setSnackbar({ open: true, message: 'Заполните все поля', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/workouts/${editingId}`, { ...form, user_id: 1 });
        setEditingId(null);
        setSnackbar({ open: true, message: 'Тренировка обновлена', severity: 'success' });
      } else {
        await api.post('/workouts', { ...form, user_id: 1 });
        setSnackbar({ open: true, message: 'Тренировка добавлена', severity: 'success' });
      }
      setForm({ name: '', date: '' });
      fetchWorkouts();
    } catch {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (w: Workout) => {
    setForm({ name: w.name, date: w.date });
    setEditingId(w.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить тренировку?')) return;
    setLoading(true);
    try {
      await api.delete(`/workouts/${id}`);
      setSnackbar({ open: true, message: 'Тренировка удалена', severity: 'success' });
      fetchWorkouts();
    } catch {
      setSnackbar({ open: true, message: 'Ошибка удаления', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
      <Grid item xs={12} md={10} lg={8}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>Тренировки</Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Фильтр по названию"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                size="small"
              />
            </Grid>
          </Grid>
          <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  fullWidth
                  name="name"
                  label="Название"
                  value={form.name}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={5} md={4}>
                <TextField
                  fullWidth
                  name="date"
                  label="Дата (YYYY-MM-DD)"
                  value={form.date}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={2} md={2}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ minWidth: 120 }}>
                  {editingId ? 'Сохранить' : 'Добавить'}
                </Button>
                {editingId && (
                  <Button variant="text" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => { setForm({ name: '', date: '' }); setEditingId(null); }}>
                    Отмена
                  </Button>
                )}
              </Grid>
            </Grid>
          </form>
          <Loader open={loading} />
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Название</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(w => (
                  <TableRow key={w.id}>
                    <TableCell>{w.id}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.date}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(w)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(w.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
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
      </Grid>
    </Grid>
  );
}

export default Workouts;
