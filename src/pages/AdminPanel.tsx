import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';

import { useAuth } from '../context/AuthContext';
import { SiteSettings } from '../components/admin/SiteSettings';
import { EducationManager } from '../components/admin/EducationManager';
import { RoadmapManager } from '../components/admin/RoadmapManager';
import { ProjectManager } from '../components/admin/ProjectManager';
import { CompanyHierarchy } from '../components/admin/CompanyHierarchy';

// Admin panel için özel bileşen
const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  
  // Admin login kontrolü
  useEffect(() => {
    console.log('Admin panel açılıyor...');
    
    // Login sayfasından yönlendirilmiş veya local storage'da admin oturumu kontrolü
    const isAdminFromLogin = sessionStorage.getItem('adminLoginRedirect') === 'true';
    const isAdminFromStorage = localStorage.getItem('adminAuth') === 'true';
    
    console.log('Admin kontrolleri:', { isAdminFromLogin, isAdminFromStorage });
    console.log('SessionStorage:', sessionStorage.getItem('adminLoginRedirect'));
    console.log('LocalStorage:', localStorage.getItem('adminAuth'));
    
    if (isAdminFromLogin || isAdminFromStorage) {
      console.log('Admin doğrulaması başarılı');
      // Login sayfasından geldiyse veya local storage'da kayıtlıysa
      setAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
      
      // Tek kullanımlık yönlendirme bayrağını temizle
      if (isAdminFromLogin) {
        sessionStorage.removeItem('adminLoginRedirect');
      }
      
      // Dialog kutusunu kapat
      setLoginDialogOpen(false);
    } else {
      // Eğer admin değilse login dialogu göster
      console.log('Admin doğrulaması başarısız, login dialog açılıyor');
      setLoginDialogOpen(true);
    }
  }, []);
  
  // Tab değişikliği işleyicisi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Admin girişi
  const handleAdminLogin = () => {
    console.log('Admin login bilgileri:', { username, password });
    
    // Basit admin doğrulama - gerçek uygulamada API çağrısı ile yapılmalı
    if (username === 'a' && password === 'a') {
      console.log('Admin doğrulama başarılı');
      setAuthenticated(true);
      setLoginDialogOpen(false);
      
      // Oturum bilgilerini kaydet
      try {
        localStorage.setItem('adminAuth', 'true');
        console.log('Admin oturumu kaydedildi');
      } catch (err) {
        console.error('Admin oturumu kaydetme hatası:', err);
      }
    } else {
      console.log('Geçersiz admin bilgileri');
      setError('Geçersiz kullanıcı adı veya şifre');
    }
  };
  
  // Admin çıkışı
  const handleAdminLogout = () => {
    setAuthenticated(false);
    localStorage.removeItem('adminAuth');
    navigate('/');
  };
  
  // Admin login dialogu
  const renderLoginDialog = () => (
    <Dialog open={loginDialogOpen} onClose={() => !authenticated && navigate('/')}>
      <DialogTitle>Admin Girişi</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          autoFocus
          margin="dense"
          label="Kullanıcı Adı"
          type="text"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Şifre"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => navigate('/')}>İptal</Button>
        <Button onClick={handleAdminLogin}>Giriş Yap</Button>
      </DialogActions>
    </Dialog>
  );
  
  // Admin paneli içeriği
  const renderAdminPanelContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    switch (activeTab) {
      case 0: // Site ve Proje Ayarları
        return <SiteSettings />;
      case 1: // Eğitim Yönetimi
        return <EducationManager />;
      case 2: // Roadmap Yönetimi
        return <RoadmapManager />;
      case 3: // Proje Yönetimi
        return <ProjectManager />;
      case 4: // Şirket Hiyerarşisi
        return <CompanyHierarchy />;
      default:
        return <SiteSettings />;
    }
  };
  
  return (
    <Container maxWidth="xl">
      {renderLoginDialog()}
      
      {authenticated && (
        <Box sx={{ mt: 4, mb: 10 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                <DashboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Admin Paneli
              </Typography>
              
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleAdminLogout}
                startIcon={<LogoutIcon />}
              >
                Çıkış
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              sx={{ 
                mb: 3,
                '& .MuiTab-root': {
                  fontSize: '0.9rem',
                  minHeight: 48
                }
              }}
            >
              <Tab icon={<SettingsIcon />} label="Site Ayarları" iconPosition="start" />
              <Tab icon={<SchoolIcon />} label="Eğitim Yönetimi" iconPosition="start" />
              <Tab icon={<MapIcon />} label="Roadmap Yönetimi" iconPosition="start" />
              <Tab icon={<WorkIcon />} label="Proje Yönetimi" iconPosition="start" />
              <Tab icon={<BusinessIcon />} label="Şirket Hiyerarşisi" iconPosition="start" />
            </Tabs>
            
            {renderAdminPanelContent()}
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default AdminPanel; 