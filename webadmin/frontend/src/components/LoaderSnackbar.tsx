import React from 'react';
import { Backdrop, CircularProgress, Snackbar, Alert } from '@mui/material';

export const Loader: React.FC<{ open: boolean }> = ({ open }) => (
  <Backdrop sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }} open={open}>
    <CircularProgress color="inherit" />
  </Backdrop>
);

interface SnackbarAlertProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

export const SnackbarAlert: React.FC<SnackbarAlertProps> = ({ open, message, severity, onClose }) => (
  <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
    <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
      {message}
    </Alert>
  </Snackbar>
);
