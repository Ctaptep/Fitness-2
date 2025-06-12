import React, { useState, useEffect } from 'react';
import api from '../api';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Loader, SnackbarAlert } from '../components/LoaderSnackbar';

interface NutritionPlan {
  id: number;
  name: string;
  description: string;
  user_id: number;
}

const Nutrition: React.FC = () => {
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState<Omit<NutritionPlan, 'id'>>({ name: '', description: '', user_id: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nutrition_plans');
      setPlans(res.data);
    } catch {
      setSnackbar({ open: true, message: 'Ошибка загрузки', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = plans.filter(n => n.name.toLowerCase().includes(filter.toLowerCase()));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim()) {
      setSnackbar({ open: true, message: 'Заполните все поля', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/nutrition_plans/${editingId}`, { ...form });
        setEditingId(null);
        setSnackbar({ open: true, message: 'План обновлён', severity: 'success' });
      } else {
        await api.post('/nutrition_plans', { ...form });
        setSnackbar({ open: true, message: 'План добавлен', severity: 'success' });
      }
      setForm({ name: '', description: '', user_id: 1 });
      fetchPlans();
    } catch {
      setSnackbar({ open: true, message: 'Ошибка сохранения', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (n: NutritionPlan) => {
    setForm({ name: n.name, description: n.description, user_id: n.user_id });
    setEditingId(n.id);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить план питания?')) return;
    setLoading(true);
    try {
      await api.delete(`/nutrition_plans/${id}`);
      setSnackbar({ open: true, message: 'План удалён', severity: 'success' });
      fetchPlans();
    } catch {
      setSnackbar({ open: true, message: 'Ошибка удаления', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid {...({ container: true, spacing: 2, justifyContent: 'center', sx: { mt: 1 } } as any)}>
    <Grid {...({ item: true, xs: 12, md: 10, lg: 8 } as any)}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>Питание</Typography>
          <Grid {...({ container: true, spacing: 2, alignItems: 'center', sx: { mb: 2 } } as any)}>
    <Grid {...({ item: true, xs: 12, sm: 6, md: 4 } as any)}>
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
            <Grid container component="div" spacing={2} alignItems="center">
              <Grid {...({ item: true, xs: 12, sm: 5, md: 4 } as any)}>
                <TextField
                  fullWidth
                  name="name"
                  label="Название плана"
                  value={form.name}
                  onChange={handleChange}
                  size="small"
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 5, md: 4 } as any)}>
                <TextField
                  fullWidth
                  name="description"
                  label="Описание"
                  value={form.description}
                  onChange={handleChange}
                  size="small"
                  multiline
                  minRows={1}
                  maxRows={4}
                />
              </Grid>
              <Grid {...({ item: true, xs: 12, sm: 2, md: 2 } as any)}>
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ minWidth: 120 }}>
                  {editingId ? 'Сохранить' : 'Добавить'}
                </Button>
                {editingId && (
                  <Button variant="text" color="secondary" fullWidth sx={{ mt: 1 }} onClick={() => { setForm({ name: '', description: '', user_id: 1 }); setEditingId(null); }}>
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
                  <TableCell>Описание</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(n => (
                  <TableRow key={n.id}>
                    <TableCell>{n.id}</TableCell>
                    <TableCell>{n.name}</TableCell>
                    <TableCell>{n.description}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(n)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(n.id)} size="small">
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
};

export default Nutrition;
