import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';

// Mock API servis fonksiyonları - Gerçek projede API entegrasyonu yapılmalıdır
const mockSiteService = {
  getSiteSettings: async () => {
    // API'den site ayarlarını alma işlemi simülasyonu
    return new Promise<{
      siteName: string;
      emailDomain: string;
      autoAssignProject: boolean;
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          siteName: 'Task Manager App',
          emailDomain: '@orneksite.com',
          autoAssignProject: true
        });
      }, 800);
    });
  },
  
  updateSiteSettings: async (settings: {
    siteName: string;
    emailDomain: string;
    autoAssignProject: boolean;
  }) => {
    // API'ye site ayarlarını gönderme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Kaydedilen ayarlar:', settings);
        resolve(true);
      }, 1000);
    });
  }
};

// Site ayarları bileşeni
export const SiteSettings: React.FC = () => {
  const [settings, setSettings] = useState<{
    siteName: string;
    emailDomain: string;
    autoAssignProject: boolean;
  }>({
    siteName: '',
    emailDomain: '',
    autoAssignProject: true
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Ayarları yükle
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await mockSiteService.getSiteSettings();
        setSettings(data);
      } catch (err) {
        setError('Site ayarları yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);
  
  // Form değişikliklerini işle
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: SelectChangeEvent) => {
    setSettings(prev => ({
      ...prev,
      autoAssignProject: e.target.value === 'true'
    }));
  };
  
  // Kaydetme işlemi
  const handleSave = async () => {
    try {
      setSaving(true);
      const isSuccess = await mockSiteService.updateSiteSettings(settings);
      
      if (isSuccess) {
        setSuccess('Site ayarları başarıyla kaydedildi');
      } else {
        setError('Ayarlar kaydedilirken bir hata oluştu');
      }
    } catch (err) {
      setError('Ayarlar kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Site ve Proje Ayarları
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Site İsmi Ayarları */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Site İsmi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Bu isim kullanıcıların göreceği ana sayfa başlığında görünecektir
              </Typography>
              <TextField
                fullWidth
                name="siteName"
                label="Site İsmi"
                value={settings.siteName}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* E-posta Uzantısı Ayarları */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kayıt Mail Uzantısı
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Otomatik proje ataması için e-posta uzantısını belirleyin
              </Typography>
              <TextField
                fullWidth
                name="emailDomain"
                label="E-posta Uzantısı"
                value={settings.emailDomain}
                onChange={handleChange}
                placeholder="@firma.com"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {/* Otomatik Proje Atama Ayarları */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Otomatik Proje Atama
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Belirtilen e-posta uzantısı ile kayıt olan kullanıcıları otomatik olarak projeye atayabilirsiniz
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="auto-assign-label">Otomatik Atama</InputLabel>
                <Select
                  labelId="auto-assign-label"
                  id="auto-assign-select"
                  value={settings.autoAssignProject ? 'true' : 'false'}
                  label="Otomatik Atama"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="true">Aktif</MenuItem>
                  <MenuItem value="false">Pasif</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </Button>
      </Box>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 