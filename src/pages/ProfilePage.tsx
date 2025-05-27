import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Avatar, Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';

// Gerekirse User tipini genişletelim
interface ExtendedUser extends User {
  profileImage?: {
    url: string;
    filename?: string;
    path?: string;
  };
}

const ProfilePage: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    uploadProfileImage
  } = useAuth();
  
  const navigate = useNavigate();

  // State for forms
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // User bilgileri değişince form alanlarını güncelle
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
    }
  }, [user]);
  
  // Profil fotoğrafı seçimi
  const handleProfilePicChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      // Dosyayı görüntülemek için oku
      reader.onload = (ev) => {
        setProfilePic(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Profil fotoğrafını kaydet
      setIsLoading(true);
      setErrorMsg('');
      
      // Use a safer check with TypeScript
      const uploadFunction = uploadProfileImage;
      if (uploadFunction) {
        uploadFunction(file)
          .then(success => {
            if (success) {
              setSuccessMsg('Profil fotoğrafı güncellendi!');
              setTimeout(() => setSuccessMsg(''), 2000);
            } else {
              setErrorMsg('Profil fotoğrafı güncellenirken bir hata oluştu.');
            }
          })
          .catch(err => {
            setErrorMsg(err.message || 'Bir hata oluştu.');
          })
          .finally(() => {
            setIsLoading(false);
          });
      } else {
        setErrorMsg('Profil fotoğrafı yükleme özelliği şu anda kullanılamıyor.');
        setIsLoading(false);
      }
    }
  };

  // İsim/soyisim güncelleme
  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const success = await updateProfile({ name, surname });
      
      if (success) {
        setSuccessMsg('İsim ve soyisim güncellendi!');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        setErrorMsg('Bilgiler güncellenirken bir hata oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '60vh', p: 2 }}>
      <Paper sx={{ p: 4, minWidth: 350, width: { xs: '100%', sm: 500 } }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
          Profil Bilgilerim
        </Typography>
        
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        
        <Box component="form" onSubmit={handleNameUpdate}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={profilePic || ((user as ExtendedUser)?.profileImage?.url) || undefined} 
              sx={{ 
                width: 120, 
                height: 120, 
                mb: 2,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
              }} 
            />
            <Button variant="outlined" component="label" size="small">
              Profil Fotoğrafı Yükle
              <input type="file" accept="image/*" hidden onChange={handleProfilePicChange} />
            </Button>
          </Box>
          
          <TextField
            label="İsim"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Soyisim"
            value={surname}
            onChange={e => setSurname(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/settings')}
              sx={{ flex: 1 }}
            >
              Tüm Ayarlar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isLoading}
              sx={{ flex: 1 }}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage; 