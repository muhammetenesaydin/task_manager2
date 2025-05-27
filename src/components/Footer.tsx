import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import { useTheme } from '../context/ThemeContext';

const Footer: React.FC = () => {
  const { mode } = useTheme();
  const isLightMode = mode === 'light';

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        mt: 'auto',
        backgroundColor: isLightMode 
          ? 'rgba(240, 240, 240, 0.8)' 
          : 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        borderTop: isLightMode 
          ? '1px solid rgba(0, 0, 0, 0.1)' 
          : '1px solid rgba(255, 255, 255, 0.12)',
      }}
    >
      <Container maxWidth="lg">
        <Typography 
          variant="body2" 
          color={isLightMode ? 'text.primary' : 'white'}
          align="center"
          sx={{ 
            fontFamily: "'Raleway', sans-serif",
            letterSpacing: '0.5px',
            '& a': {
              color: isLightMode ? 'primary.main' : 'white',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
                color: isLightMode ? 'primary.dark' : '#bb86fc'
              }
            }
          }}
        >
          © {new Date().getFullYear()} Görev Yöneticisi | Geliştirici:{' '}
          <Link href="https://github.com/" target="_blank" rel="noopener noreferrer">
            [Adınız]
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 