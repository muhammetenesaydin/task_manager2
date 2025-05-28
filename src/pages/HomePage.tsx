import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Card, 
  CardContent,
  useTheme as useMuiTheme
} from '@mui/material';
import { 
  AssignmentTurnedIn as TaskIcon, 
  Group as TeamIcon, 
  School as LearningIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { useTheme } from '../context/ThemeContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  const theme = useMuiTheme();

  const features = [
    {
      title: 'Görev Yönetimi',
      description: 'Görevlerinizi oluşturun, önceliklendirin ve takip edin',
      icon: <TaskIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      path: '/projects'
    },
    {
      title: 'Ekip İşbirliği',
      description: 'Ekip üyeleriyle projeler üzerinde işbirliği yapın',
      icon: <TeamIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      path: '/team'
    },
    {
      title: 'Takvim Görünümü',
      description: 'Görevlerinizi takvim üzerinde planlayın',
      icon: <CalendarIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      path: '/calendar'
    },
    {
      title: 'Öğrenme Platformu',
      description: 'Öğrenme materyallerine erişin ve becerilerinizi geliştirin',
      icon: <LearningIcon fontSize="large" sx={{ color: theme.palette.primary.main }} />,
      path: '/learning'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      py: { xs: 4, md: 10 }
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          {/* Hero Section */}
          <Grid item xs={12} md={6} sx={{ mb: { xs: 4, md: 0 } }}>
            <Box sx={{ 
              textAlign: { xs: 'center', md: 'left' },
              animation: 'fadeIn 1s ease-out'
            }}>
              <Typography 
                component="h1" 
                variant="h2" 
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2,
                  textShadow: isLightMode 
                    ? '0 2px 5px rgba(0,0,0,0.1)' 
                    : '0 2px 5px rgba(0,0,0,0.2)',
                  fontFamily: "'Poppins', sans-serif",
                  letterSpacing: '-0.5px',
                  lineHeight: 1.2
                }}
              >
                Görev Yöneticisi
              </Typography>

              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'text.secondary',
                  mb: 4,
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 500,
                  maxWidth: { md: '90%' }
                }}
              >
                Projelerinizi, görevlerinizi ve ekip işbirliğinizi tek bir platformda yönetin.
              </Typography>

              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: { xs: 'center', md: 'flex-start' },
                mb: 4
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/projects')}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    boxShadow: `0 3px 15px ${isLightMode ? 'rgba(126, 87, 194, 0.4)' : 'rgba(149, 117, 205, 0.4)'}`,
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: `0 6px 20px ${isLightMode ? 'rgba(126, 87, 194, 0.6)' : 'rgba(149, 117, 205, 0.6)'}`,
                    }
                  }}
                >
                  Projeleri Görüntüle
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/projects/create')}
                  sx={{ 
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                    fontSize: '1rem',
                    borderWidth: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }
                  }}
                >
                  Yeni Proje Oluştur
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Hero Image */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                height: '100%',
                width: '100%',
                backgroundColor: isLightMode 
                  ? 'rgba(255, 255, 255, 0.7)' 
                  : 'rgba(30, 30, 30, 0.7)', 
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                border: `1px solid ${isLightMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: isLightMode 
                  ? '0 10px 30px rgba(0, 0, 0, 0.1), 0 0 10px rgba(0, 0, 0, 0.05)' 
                  : '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 10px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                animation: 'fadeInUp 1s ease-out'
              }}
            >
              <Box 
                component="img"
                src="/images/task-management-illustration.svg" 
                alt="Görev Yönetimi İllüstrasyonu"
                sx={{ 
                  width: '100%',
                  maxWidth: 400,
                  height: 'auto',
                  objectFit: 'contain',
                  filter: isLightMode ? 'none' : 'brightness(0.9)'
                }}
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Features Section */}
        <Box sx={{ mt: 8, mb: 4 }}>
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              mb: 6, 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Öne Çıkan Özellikler
          </Typography>

          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid key={index} item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    backgroundColor: isLightMode 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : 'rgba(30, 30, 30, 0.8)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: isLightMode 
                        ? '0 12px 30px rgba(0, 0, 0, 0.12), 0 0 10px rgba(0, 0, 0, 0.08)' 
                        : '0 12px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(0, 0, 0, 0.3)',
                    },
                    cursor: 'pointer',
                    animation: `fadeInUp ${0.3 + index * 0.1}s ease-out`
                  }}
                  onClick={() => navigate(feature.path)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      sx={{ 
                        mb: 1.5,
                        fontWeight: 600
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Box>
  );
};

export default HomePage;
