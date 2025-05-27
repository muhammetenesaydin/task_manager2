import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import { useProjectContext } from '../context/ProjectContext';
import { useLoading } from '../context/LoadingContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DescriptionIcon from '@mui/icons-material/Description';

const CreateProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { createProject } = useProjectContext();
  const { setLoading } = useLoading();
  
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = { 
      name: '',
      description: ''
    };

    if (!projectData.name.trim()) {
      newErrors.name = 'Proje adı gereklidir';
      isValid = false;
    } else if (projectData.name.length < 3) {
      newErrors.name = 'Proje adı en az 3 karakter olmalıdır';
      isValid = false;
    }

    if (projectData.description.length > 500) {
      newErrors.description = 'Açıklama en fazla 500 karakter olmalıdır';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData({
      ...projectData,
      [name]: value
    });
    
    // Clear error when user types
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setLoading(true);
      
      const result = await createProject({
        name: projectData.name,
        description: projectData.description,
      });
      
      if (result) {
        setSnackbar({ 
          open: true, 
          message: 'Proje başarıyla oluşturuldu!', 
          severity: 'success' 
        });
        
        // Redirect to the new project page
        setTimeout(() => {
          navigate(`/projects/${result.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Proje oluşturulurken hata oluştu:', err);
      setSnackbar({ 
        open: true, 
        message: 'Proje oluşturulurken bir hata oluştu.', 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, md: 5 }, 
          borderRadius: 3,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0.98))',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(156, 39, 176, 0.2)'
        }}
      >
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              onClick={() => navigate('/projects')}
              startIcon={<ArrowBackIcon />}
              sx={{ 
                mr: 2, 
                fontWeight: 700, 
                color: '#000000',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.08)'
                }
              }}
            >
              Geri
            </Button>
            <Typography 
              variant="h4" 
              component="h1" 
              fontWeight={800} 
              color="#000000"
              sx={{ 
                borderBottom: '3px solid rgba(156, 39, 176, 0.5)',
                paddingBottom: 1,
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <CreateNewFolderIcon sx={{ mr: 1.5, color: '#9c27b0', fontSize: 36 }} />
              Yeni Proje Oluştur
            </Typography>
          </Box>
        </Box>
        
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={700} 
            sx={{ mb: 0.5, color: '#000000', display: 'flex', alignItems: 'center' }}
          >
            <DescriptionIcon sx={{ mr: 1, color: '#9c27b0' }} />
            Proje Bilgileri
          </Typography>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              mb: 4, 
              borderRadius: 2, 
              border: '1px solid rgba(156, 39, 176, 0.3)',
              backgroundColor: 'rgba(156, 39, 176, 0.02)'
            }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label={
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  Proje Adı
                  <Box 
                    component="span" 
                    sx={{ 
                      color: '#e91e63', 
                      ml: 0.5, 
                      mt: -0.5, 
                      fontSize: '1.2rem',
                      fontWeight: 'bold' 
                    }}
                  >
                    *
                  </Box>
                </Box>
              }
              name="name"
              autoFocus
              value={projectData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name}
              sx={{ mb: 4 }}
              InputLabelProps={{
                sx: { fontWeight: 700, color: '#000000' }
              }}
              InputProps={{
                sx: { 
                  borderRadius: 2, 
                  fontWeight: 500, 
                  color: '#000000',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(156, 39, 176, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9c27b0'
                  },
                }
              }}
              FormHelperTextProps={{
                sx: { 
                  fontWeight: 600, 
                  color: errors.name ? 'error.main' : '#000000',
                  marginTop: 1
                }
              }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              id="description"
              label="Proje Açıklaması"
              name="description"
              multiline
              rows={6}
              value={projectData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description || 'Projenizin amacını ve hedeflerini açıklayın'}
              sx={{ mb: 2 }}
              InputLabelProps={{
                sx: { fontWeight: 700, color: '#000000' }
              }}
              InputProps={{
                sx: { 
                  borderRadius: 2, 
                  fontWeight: 500, 
                  color: '#000000',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05) inset',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: '2px'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(156, 39, 176, 0.5)'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#9c27b0'
                  }
                }
              }}
              FormHelperTextProps={{
                sx: { 
                  fontWeight: 600, 
                  color: errors.description ? 'error.main' : '#000000',
                  marginTop: 1
                }
              }}
            />
          </Paper>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 5 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
              startIcon={<CancelIcon />}
              sx={{ 
                px: 5, 
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
                color: '#000000',
                borderColor: '#9c27b0',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#7b1fa2',
                  borderWidth: '2px',
                  backgroundColor: 'rgba(156, 39, 176, 0.08)'
                }
              }}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ 
                px: 5, 
                py: 1.7,
                borderRadius: 2,
                background: 'linear-gradient(to right, #9c27b0, #b52cc1)',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.25)',
                fontWeight: 700,
                textTransform: 'none', 
                fontSize: '1rem',
                '&:hover': {
                  background: 'linear-gradient(to right, #8e24aa, #a020c0)',
                  boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 2px 8px rgba(156, 39, 176, 0.3)'
                }
              }}
            >
              {isSubmitting ? 'Oluşturuluyor...' : 'Projeyi Oluştur'}
            </Button>
          </Box>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ 
            width: '100%',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: '0.95rem',
            borderRadius: 2,
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateProjectPage; 