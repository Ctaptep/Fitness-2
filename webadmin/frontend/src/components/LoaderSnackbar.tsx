import React from 'react';
import { Snackbar, Alert, CircularProgress, Box } from '@mui/material';

export function Loader({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
      <CircularProgress />
    </Box>
  );
}

export function SnackbarAlert({ open, message, severity = 'success', onClose }: {
  open: boolean;
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
