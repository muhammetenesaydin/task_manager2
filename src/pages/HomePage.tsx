import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box, Paper } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isLightMode = mode === 'light';

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            padding: { xs: 3, sm: 5 },
            width: '100%',
            backgroundColor: isLightMode 
              ? 'rgba(255, 255, 255, 0.75)' 
              : 'rgba(255, 255, 255, 0.15)', 
            backdropFilter: 'blur(10px)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.25) inset',
              transform: 'translateY(-5px)'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <Typography 
              component="h1" 
              variant="h2" 
              sx={{
                fontWeight: 700,
                textShadow: isLightMode 
                  ? '0 2px 5px rgba(0,0,0,0.1)' 
                  : '0 2px 5px rgba(0,0,0,0.2)',
                color: 'text.primary',
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: '-0.5px'
              }}
            >
              Görev Yöneticisi
            </Typography>
          </Box>
          
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              color: 'text.secondary',
              mb: 6,
              maxWidth: '800px',
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 400,
              letterSpacing: '-0.2px',
              fontStyle: 'italic'
            }} 
            paragraph
          >
            Projelerinizi ve görevlerinizi kolayca yönetin
          </Typography>
          
          <Box sx={{ 
            mt: 2, 
            display: 'flex', 
            gap: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/projects')}
              sx={{ 
                background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                borderRadius: '28px',
                padding: '10px 24px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: 'linear-gradient(45deg, #8e24aa 30%, #a66eed 90%)',
                  boxShadow: '0 5px 12px rgba(156, 39, 176, .5)',
                  transform: 'translateY(-3px) scale(1.02)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 2px 4px rgba(156, 39, 176, .4)'
                },
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.2px',
                textTransform: 'none',
                minWidth: '200px'
              }}
            >
              Projeleri Görüntüle
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/projects/create')}
              sx={{ 
                background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                borderRadius: '28px',
                padding: '10px 24px',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: 'linear-gradient(45deg, #8e24aa 30%, #a66eed 90%)',
                  boxShadow: '0 5px 12px rgba(156, 39, 176, .5)',
                  transform: 'translateY(-3px) scale(1.02)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 2px 4px rgba(156, 39, 176, .4)'
                },
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '1rem',
                letterSpacing: '0.2px',
                textTransform: 'none',
                minWidth: '200px'
              }}
            >
              Yeni Proje Oluştur
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default HomePage;
