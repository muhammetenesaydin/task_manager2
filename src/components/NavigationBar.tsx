import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import MailIcon from '@mui/icons-material/Mail';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

// AuthContext'teki User tipini genişleterek name ve surname ekleyeceğiz
interface ExtendedUser {
  id: string;
  username: string;
  email: string;
  role: string;
  name?: string;
  surname?: string;
  profileImage?: {
    url: string;
    filename?: string;
    path?: string;
  };
}

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  
  // User nesnesini ExtendedUser olarak ele alacağız
  const extendedUser = user as ExtendedUser;
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };
  
  const handleEditProfile = () => {
    handleClose();
    navigate('/profile');
  };
  
  return (
    <AppBar position="static" sx={{
      backgroundColor: isLightMode ? 'primary.main' : 'primary.dark',
      boxShadow: isLightMode 
        ? '0 2px 10px rgba(0, 0, 0, 0.1)' 
        : '0 2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      <Toolbar sx={{ py: { xs: 0.5, sm: 1 }, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center' }}>
          <img 
            src="/images/task-logo.png" 
            alt="Task Manager Logo" 
            style={{ 
              height: '32px', 
              marginRight: '16px',
              filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.2))'
            }} 
          />
          Görev Yöneticisi
        </Typography>
        
        <ThemeToggle />
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/projects"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              Projelerim
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/team"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupsIcon />
                <span>Takım</span>
              </Box>
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/learning"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon />
                <span>Eğitim</span>
              </Box>
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/calendar"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 500,
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthIcon />
                <span>Takvim</span>
              </Box>
            </Button>
            <Box sx={{ ml: { xs: 1, sm: 2 } }}>
              <IconButton
                size="large"
                aria-label="kullanıcı hesabı"
                aria-controls="profile-menu"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
                sx={{ 
                  p: { xs: 0.5, sm: 1 },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                <Avatar sx={{ 
                  width: { xs: 32, sm: 40 }, 
                  height: { xs: 32, sm: 40 }, 
                  bgcolor: 'secondary.main',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                }}
                src={extendedUser.profileImage?.url}
                >
                  {extendedUser.name ? extendedUser.name.charAt(0).toUpperCase() : (extendedUser.username ? extendedUser.username.charAt(0).toUpperCase() : 'K')}
                </Avatar>
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    width: 200,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {extendedUser.name ? `${extendedUser.name} ${extendedUser.surname || ''}` : extendedUser.username}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    {extendedUser.email || 'E-posta yok'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={handleEditProfile} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Profilim" />
                </MenuItem>
                <MenuItem sx={{ py: 1.5 }} onClick={() => { handleClose(); navigate('/settings') }}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Ayarlar" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Çıkış Yap" />
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 } }}>
            <Button 
              variant="contained"
              component={RouterLink} 
              to="/login"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 600,
                padding: '8px 16px',
                background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #8e24aa 30%, #a66eed 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(156, 39, 176, .5)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 2px 4px rgba(156, 39, 176, .4)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LoginIcon />
                <span>Giriş Yap</span>
              </Box>
            </Button>
            <Button 
              variant="outlined"
              component={RouterLink} 
              to="/register"
              sx={{
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                fontWeight: 600,
                padding: '8px 16px',
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: '#bb86fc',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon />
                <span>Kayıt Ol</span>
              </Box>
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar; 