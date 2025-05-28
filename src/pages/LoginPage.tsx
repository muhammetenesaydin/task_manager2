import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Paper,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, error, loading, clearError, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setLoading } = useLoading();
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  
  // Kullanıcı oturum açtığında yönlendirme yapma
  useEffect(() => {
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      await login(username, password, isAdminLogin, rememberMe);
    } catch (err) {
      console.error('Giriş sırasında hata oluştu:', err);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  // Local loading durumu ve genel loading durumunu birleştir
  const isLoading = loading || isSubmitting;
  
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={1} sx={{ 
        p: 4, 
        backgroundColor: isLightMode
          ? 'rgba(255, 255, 255, 0.6)'
          : 'rgba(255, 255, 255, 0.15)', 
        backdropFilter: 'blur(10px)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 0 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset',
        borderRadius: '1.5rem',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2), 0 0 25px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.25) inset',
          transform: 'translateY(-5px)'
        }
      }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: isLightMode ? 'text.primary' : 'white',
              mb: 2,
              textShadow: isLightMode ? 'none' : '0 2px 5px rgba(0,0,0,0.2)'
            }}
          >
            {isAdminLogin ? 'Yönetici Girişi' : 'Giriş Yap'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Kullanıcı Adı"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.75rem',
                  '& fieldset': {
                    borderColor: isLightMode 
                      ? 'rgba(0, 0, 0, 0.23)' 
                      : 'rgba(255, 255, 255, 0.3)',
                    borderWidth: '1px',
                    transition: 'border-color 0.3s ease-in-out'
                  },
                  '&:hover fieldset': {
                    borderColor: isLightMode ? 'text.primary' : 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isLightMode ? 'primary.main' : 'white',
                    borderWidth: '2px'
                  },
                  '& input': {
                    color: isLightMode ? 'text.primary' : 'white'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isLightMode ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: isLightMode ? 'primary.main' : 'white'
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '14px 16px'
                }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.75rem',
                  '& fieldset': {
                    borderColor: isLightMode 
                      ? 'rgba(0, 0, 0, 0.23)' 
                      : 'rgba(255, 255, 255, 0.3)',
                    borderWidth: '1px',
                    transition: 'border-color 0.3s ease-in-out'
                  },
                  '&:hover fieldset': {
                    borderColor: isLightMode ? 'text.primary' : 'white',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: isLightMode ? 'primary.main' : 'white',
                    borderWidth: '2px'
                  },
                  '& input': {
                    color: isLightMode ? 'text.primary' : 'white'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: isLightMode ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: isLightMode ? 'primary.main' : 'white'
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '14px 16px'
                }
              }}
            />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    color="primary"
                    sx={{
                      color: isLightMode ? 'rgba(0, 0, 0, 0.54)' : 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-checked': {
                        color: isLightMode ? 'primary.main' : 'primary.light',
                      }
                    }}
                  />
                }
                label="Beni hatırla"
                sx={{ 
                  color: isLightMode ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={isAdminLogin}
                    onChange={(e) => setIsAdminLogin(e.target.checked)}
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: isLightMode ? 'primary.main' : 'primary.light',
                        '& + .MuiSwitch-track': {
                          backgroundColor: isLightMode ? 'primary.main' : 'primary.light',
                        },
                      },
                    }}
                  />
                }
                label="Yönetici Girişi"
                sx={{ 
                  color: isLightMode ? 'text.secondary' : 'rgba(255, 255, 255, 0.7)',
                }}
              />
            </Box>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                height: 54,
                background: isAdminLogin 
                  ? 'linear-gradient(45deg, #d32f2f 30%, #ff5252 90%)'
                  : 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                boxShadow: isAdminLogin
                  ? '0 3px 5px 2px rgba(211, 47, 47, .3)'
                  : '0 3px 5px 2px rgba(156, 39, 176, .3)',
                borderRadius: '0.75rem',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  background: isAdminLogin
                    ? 'linear-gradient(45deg, #b71c1c 30%, #ff1744 90%)'
                    : 'linear-gradient(45deg, #8e24aa 30%, #a66eed 90%)',
                  boxShadow: isAdminLogin
                    ? '0 5px 12px rgba(211, 47, 47, .5)'
                    : '0 5px 12px rgba(156, 39, 176, .5)',
                  transform: 'translateY(-3px) scale(1.02)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: isAdminLogin
                    ? '0 2px 4px rgba(211, 47, 47, .4)'
                    : '0 2px 4px rgba(156, 39, 176, .4)'
                },
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: '1.05rem',
                letterSpacing: '0.2px',
                textTransform: 'none'
              }}
              disabled={isLoading || !username.trim() || !password.trim()}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isAdminLogin ? 'Yönetici Olarak Giriş Yap' : 'Giriş Yap'
              )}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link 
                component={RouterLink} 
                to="/register" 
                variant="body2"
                sx={{ 
                  color: isLightMode ? 'primary.main' : 'white',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Hesabınız yok mu? Kayıt olun
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage; 