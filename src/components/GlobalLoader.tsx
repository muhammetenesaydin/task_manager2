import React from 'react';
import { Backdrop, CircularProgress, Box } from '@mui/material';
import { useLoading } from '../context/LoadingContext';

const GlobalLoader: React.FC = () => {
  const { isLoading } = useLoading();

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: 'column',
        backdropFilter: 'blur(3px)',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
      }}
      open={isLoading}
    >
      <CircularProgress color="primary" size={60} thickness={4} />
      <Box sx={{ mt: 3, color: 'white', fontWeight: 'medium', fontSize: '1.1rem' }}>
        Yükleniyor...
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader; 