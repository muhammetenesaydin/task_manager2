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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { useTheme } from '../context/ThemeContext';

// Uzmanlık alanları
const EXPERTISE_AREAS = [
  'Yapay Zeka',
  'Veri Bilimi',
  'Web Geliştirme',
  'Mobil Uygulama',
  'Gömülü Sistemler',
  'UI/UX Tasarım',
  'DevOps',
  'Ağ Güvenliği',
  'Sistem Yönetimi',
  'Veritabanı',
  'IoT',
  'Oyun Geliştirme',
  'Blockchain',
  'Bulut Bilişim',
  'Test Mühendisliği'
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, error, loading, clearError, user } = useAuth();
  const { setLoading } = useLoading();
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    expertise: [] as string[],
    title: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Kullanıcı oturum açtığında yönlendirme yapma
  useEffect(() => {
    if (user) {
      navigate('/projects');
    }
  }, [user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validasyon hatasını temizle
    setValidationError(null);
  };

  // Uzmanlık alanı değişikliklerini işle
  const handleExpertiseChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      expertise: typeof value === 'string' ? value.split(',') : value,
    }));
  };
  
  const validateForm = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Şifreler eşleşmiyor');
      return false;
    }
    
    if (formData.password.length < 6) {
      setValidationError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    
    if (!formData.email.endsWith('@gmail.com')) {
      setValidationError('Sadece Gmail hesapları kabul edilmektedir');
      return false;
    }

    if (formData.expertise.length === 0) {
      setValidationError('En az bir uzmanlık alanı seçmelisiniz');
      return false;
    }
    
    if (!formData.title.trim()) {
      setValidationError('Ünvan/Pozisyon alanı zorunludur');
      return false;
    }
    
    return true;
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);
    
    // Form doğrulama
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      await register(formData);
    } catch (err) {
      console.error('Kayıt sırasında hata oluştu:', err);
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  // Local loading durumu ve genel loading durumunu birleştir
  const isLoading = loading || isSubmitting;
  // Görüntülenecek hata (validasyon hatası veya API hatası)
  const displayError = validationError || error;
  
  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ 
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
            Hesap Oluştur
          </Typography>
          
          {displayError && (
            <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
              {displayError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 3, width: '100%' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 45%' }}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Adınız"
                  name="name"
                  autoComplete="given-name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%' }}>
                <TextField
                  required
                  fullWidth
                  id="surname"
                  label="Soyadınız"
                  name="surname"
                  autoComplete="family-name"
                  value={formData.surname}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ width: '100%', mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Kullanıcı Adı"
                  name="username"
                  autoComplete="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ width: '100%', mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="E-posta Adresi"
                  name="email"
                  autoComplete="email"
                  helperText="Sadece Gmail hesapları kabul edilmektedir"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  error={Boolean(validationError && validationError.includes('Gmail'))}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  FormHelperTextProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ width: '100%', mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  id="title"
                  label="Ünvan / Pozisyon"
                  name="title"
                  placeholder="Örn: Yazılım Geliştirici, Veri Bilimci, Tasarımcı"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isLoading}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ width: '100%', mt: 2 }}>
                <FormControl fullWidth required error={Boolean(validationError && validationError.includes('uzmanlık'))}>
                  <InputLabel id="expertise-label" sx={{ color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }}>Uzmanlık Alanları</InputLabel>
                  <Select
                    labelId="expertise-label"
                    id="expertise"
                    multiple
                    value={formData.expertise}
                    onChange={handleExpertiseChange}
                    input={<OutlinedInput id="select-multiple-chip" label="Uzmanlık Alanları" sx={{ color: isLightMode ? 'text.primary' : 'white' }} />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} sx={{ color: isLightMode ? 'text.primary' : 'white', backgroundColor: 'primary.dark' }} />
                        ))}
                      </Box>
                    )}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 48 * 4.5 + 8,
                          width: 250,
                        },
                      },
                    }}
                    disabled={isLoading}
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                      '& .MuiSelect-icon': {
                        color: isLightMode ? 'text.primary' : 'white',
                      }
                    }}
                  >
                    {EXPERTISE_AREAS.map((area) => (
                      <MenuItem
                        key={area}
                        value={area}
                        sx={{ color: isLightMode ? 'text.primary' : 'text.secondary' }}
                      >
                        {area}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 45%', mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Şifre"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  error={Boolean(validationError && validationError.includes('karakter'))}
                  helperText="En az 6 karakter"
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  FormHelperTextProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
              <Box sx={{ flex: '1 1 45%', mt: 2 }}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Şifre Tekrar"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  error={Boolean(validationError && validationError.includes('eşleşmiyor'))}
                  InputLabelProps={{
                    style: { color: isLightMode ? undefined : 'rgba(255, 255, 255, 0.7)' }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: isLightMode 
                          ? 'rgba(0, 0, 0, 0.23)' 
                          : 'rgba(255, 255, 255, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: isLightMode ? 'text.primary' : 'white',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: isLightMode ? 'primary.main' : 'white',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: isLightMode ? 'text.primary' : 'white',
                    },
                  }}
                />
              </Box>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3, 
                mb: 2, 
                height: 54,
                background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                borderRadius: '0.75rem',
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
                fontSize: '1.05rem',
                letterSpacing: '0.2px',
                textTransform: 'none'
              }}
              disabled={isLoading || 
                !formData.name.trim() || 
                !formData.surname.trim() || 
                !formData.username.trim() || 
                !formData.email.trim() || 
                !formData.password.trim() || 
                !formData.confirmPassword.trim() ||
                !formData.title.trim() ||
                formData.expertise.length === 0
              }
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Kayıt Ol'
              )}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2" sx={{ color: isLightMode ? 'text.primary' : 'white', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Zaten bir hesabınız var mı? Giriş yapın
              </Link>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterPage; 