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
  SelectChangeEvent,
  Switch,
  FormControlLabel
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';

// Mock API servis fonksiyonları - Gerçek projede API entegrasyonu yapılmalıdır
const mockSiteService = {
  getSiteSettings: async () => {
    // API'den site ayarlarını alma işlemi simülasyonu
    return new Promise<{
      siteName: string;
      companyName: string;
      allowOpenRegistration: boolean;
      defaultUserRole: string;
      autoAssignProject: boolean;
      maintenanceMode: boolean;
    }>((resolve) => {
      setTimeout(() => {
        resolve({
          siteName: 'Task Manager App',
          companyName: 'Örnek Şirket A.Ş.',
          allowOpenRegistration: true,
          defaultUserRole: 'user',
          autoAssignProject: true,
          maintenanceMode: false
        });
      }, 800);
    });
  },
  
  updateSiteSettings: async (settings: {
    siteName: string;
    companyName: string;
    allowOpenRegistration: boolean;
    defaultUserRole: string;
    autoAssignProject: boolean;
    maintenanceMode: boolean;
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
    companyName: string;
    allowOpenRegistration: boolean;
    defaultUserRole: string;
    autoAssignProject: boolean;
    maintenanceMode: boolean;
  }>({
    siteName: '',
    companyName: '',
    allowOpenRegistration: true,
    defaultUserRole: 'user',
    autoAssignProject: true,
    maintenanceMode: false
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
  
  // Switch değişikliklerini işle
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
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
        Site ve Sistem Ayarları
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        {/* Genel Site Ayarları */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Genel Site Ayarları
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="siteName"
                    label="Site İsmi"
                    value={settings.siteName}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    helperText="Bu isim, kullanıcıların göreceği ana sayfa başlığı olacaktır"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    name="companyName"
                    label="Şirket İsmi"
                    value={settings.companyName}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                    helperText="Raporlarda ve faturalarda görünecek şirket ismi"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.maintenanceMode}
                        onChange={handleSwitchChange}
                        name="maintenanceMode"
                        color="warning"
                      />
                    }
                    label="Bakım Modu (Aktif olduğunda sadece adminler giriş yapabilir)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Kullanıcı Kayıt Ayarları */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kullanıcı Kayıt Ayarları
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Sistemde nasıl kullanıcı kaydı yapılabileceğini ayarlayın
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.allowOpenRegistration}
                    onChange={handleSwitchChange}
                    name="allowOpenRegistration"
                    color="primary"
                  />
                }
                label="Açık Kayıt (Kapalıysa sadece admin kullanıcı ekleyebilir)"
                sx={{ mb: 2, display: 'block' }}
              />
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="default-role-label">Varsayılan Kullanıcı Rolü</InputLabel>
                <Select
                  labelId="default-role-label"
                  id="default-role-select"
                  name="defaultUserRole"
                  value={settings.defaultUserRole}
                  label="Varsayılan Kullanıcı Rolü"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="user">Standart Kullanıcı</MenuItem>
                  <MenuItem value="editor">Editör</MenuItem>
                  <MenuItem value="manager">Takım Lideri</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Otomatik Proje Atama Ayarları */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Otomatik Proje Atama
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <InfoIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Yeni kullanıcıların otomatik olarak projelere atanması
              </Typography>
              
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoAssignProject}
                    onChange={handleSwitchChange}
                    name="autoAssignProject"
                    color="primary"
                  />
                }
                label="Yeni kullanıcıları otomatik olarak varsayılan projeye ata"
                sx={{ mb: 2, display: 'block' }}
              />
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
          size="large"
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