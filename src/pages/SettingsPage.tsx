import React, { useState, ChangeEvent, useEffect } from 'react';
import { 
  Box, Typography, Paper, TextField, Button, Avatar, Tabs, Tab, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  CircularProgress, List, ListItem, ListItemAvatar, ListItemText, 
  ListItemSecondaryAction, IconButton, Chip, Divider, MenuItem,
  Select, FormControl, InputLabel, Card, CardContent, CardActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { Project as ProjectType, Participant as ParticipantType } from '../types';

// Sekmeler için enum
enum TabOption {
  PROFILE = 0,
  EMAIL = 1,
  PASSWORD = 2,
  SESSION_HISTORY = 3,
  TEAM_PERMISSIONS = 4,
  ACCOUNT = 5
}

// Oturum geçmişi tipi
interface SessionHistoryItem {
  id: string;
  date: Date | string;
  ip: string;
  device: string;
  browser: string;
  location?: string;
  isCurrentSession?: boolean;
}

const SettingsPage: React.FC = () => {
  const { 
    user, 
    updateProfile, 
    changePassword, 
    getLoginHistory, 
    terminateSession, 
    deactivateAccount,
    deleteAccount,
    uploadProfileImage
  } = useAuth();
  
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // State for forms
  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState(user?.surname || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [passwords, setPasswords] = useState({ old: '', new1: '', new2: '' });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Hesap işlemleri için dialog
  const [deactivateDialog, setDeactivateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Oturum geçmişi state'i
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  
  // Takım ve projeler için state
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  
  // Yeni üye daveti için dialog
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member');

  // User bilgileri değişince form alanlarını güncelle
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setSurname(user.surname || '');
      setEmail(user.email || '');
    }
  }, [user]);
  
  // Oturum sekmesi seçildiğinde oturum geçmişini yükle
  useEffect(() => {
    if (tab === TabOption.SESSION_HISTORY) {
      loadSessionHistory();
    } else if (tab === TabOption.TEAM_PERMISSIONS) {
      loadProjects();
    }
  }, [tab]);
  
  // Oturum geçmişini yükle
  const loadSessionHistory = async () => {
    setLoadingSessions(true);
    setErrorMsg('');
    
    try {
      const history = await getLoginHistory();
      setSessionHistory(history);
    } catch (err: any) {
      setErrorMsg(err.message || 'Oturum geçmişi yüklenirken bir hata oluştu.');
    } finally {
      setLoadingSessions(false);
    }
  };
  
  // Projeleri yükle
  const loadProjects = async () => {
    setLoadingProjects(true);
    setErrorMsg('');
    
    try {
      const projectList = await projectAPI.getProjects();
      setProjects(projectList);
    } catch (err: any) {
      setErrorMsg(err.message || 'Projeler yüklenirken bir hata oluştu.');
    } finally {
      setLoadingProjects(false);
    }
  };
  
  // Proje detayını görüntüle (proje detay sayfasına yönlendir)
  const handleViewProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  // Kullanıcı rolünü değiştir
  const handleChangeRole = async (projectId: string, userId: string, newRole: 'admin' | 'member') => {
    setIsLoading(true);
    
    try {
      // Önce kullanıcıyı çıkar
      await projectAPI.removeParticipant(projectId, userId);
      
      // Sonra yeni rolle tekrar ekle
      const userToInvite = projects
        .find(p => p.id === projectId)
        ?.participants
        ?.find(p => p.userId === userId);
        
      if (userToInvite) {
        await projectAPI.inviteUserToProject(projectId, userToInvite.email || '', newRole);
        await loadProjects();
        setSuccessMsg('Kullanıcı rolü başarıyla güncellendi.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Rol güncellenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Kullanıcıyı projeden çıkar
  const handleRemoveUser = async (projectId: string, userId: string) => {
    setIsLoading(true);
    
    try {
      await projectAPI.removeParticipant(projectId, userId);
      await loadProjects();
      setSuccessMsg('Kullanıcı başarıyla projeden çıkarıldı.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kullanıcı çıkarılırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Projeye kullanıcı davet et
  const handleInviteUser = async () => {
    if (!selectedProject) return;
    
    setIsLoading(true);
    
    try {
      await projectAPI.inviteUserToProject(selectedProject.id, inviteEmail, inviteRole);
      await loadProjects();
      setSuccessMsg('Kullanıcı başarıyla davet edildi.');
      setInviteDialog(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kullanıcı davet edilirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Davet dialogunu aç
  const handleOpenInviteDialog = (project: ProjectType) => {
    setSelectedProject(project);
    setInviteDialog(true);
  };
  
  // Tarihi biçimlendir
  const formatDate = (date: Date | string) => {
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // Türkçe ay isimleri
      const months = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
      ];
      
      const day = dateObj.getDate();
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      const hours = String(dateObj.getHours()).padStart(2, '0');
      const minutes = String(dateObj.getMinutes()).padStart(2, '0');
      
      return `${day} ${month} ${year}, ${hours}:${minutes}`;
    } catch (err) {
      return String(date);
    }
  };
  
  // Kullanıcının projede yönetici olup olmadığını kontrol et
  const isUserAdminInProject = (project: ProjectType) => {
    return project.owner === user?.id || 
      project.participants?.some(p => p.userId === user?.id && p.role === 'admin');
  };
  
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

  // E-posta güncelleme
  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const success = await updateProfile({ email });
      
      if (success) {
        setSuccessMsg('E-posta adresi güncellendi!');
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        setErrorMsg('E-posta güncellenirken bir hata oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    
    if (passwords.new1 !== passwords.new2) {
      setErrorMsg('Yeni şifreler eşleşmiyor!');
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await changePassword({
        currentPassword: passwords.old,
        newPassword: passwords.new1
      });
      
      if (success) {
        setSuccessMsg('Şifre başarıyla değiştirildi!');
        setPasswords({ old: '', new1: '', new2: '' });
        setTimeout(() => setSuccessMsg(''), 2000);
      } else {
        setErrorMsg('Şifre değiştirilirken bir hata oluştu. Mevcut şifrenizi kontrol edin.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Oturum çıkışı yap
  const handleSessionLogout = async (sessionId: string) => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const success = await terminateSession(sessionId);
      
      if (success) {
        setSuccessMsg('Oturum sonlandırıldı!');
        loadSessionHistory(); // Oturum listesini yenile
      } else {
        setErrorMsg('Oturum sonlandırılırken bir hata oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hesabı dondur
  const handleDeactivateAccount = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const success = await deactivateAccount();
      
      if (success) {
        setSuccessMsg('Hesabınız donduruldu. Tekrar giriş yaparak aktifleştirebilirsiniz.');
        setDeactivateDialog(false);
      } else {
        setErrorMsg('Hesap dondurulurken bir hata oluştu.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hesabı sil
  const handleDeleteAccount = async () => {
    // Güvenlik kontrolü - kullanıcı adını doğrula
    if (confirmText !== user?.username) {
      setErrorMsg('Kullanıcı adınızı doğru girmelisiniz.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const success = await deleteAccount(user?.username || '');
      
      if (success) {
        setSuccessMsg('Hesabınız silindi.');
        setDeleteDialog(false);
      } else {
        setErrorMsg('Hesap silinirken bir hata oluştu.');
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
          Hesap Ayarları
        </Typography>
        <Tabs 
          value={tab} 
          onChange={(_, v) => setTab(v)} 
          sx={{ mb: 3 }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Profil" />
          <Tab label="E-posta" />
          <Tab label="Şifre" />
          <Tab label="Oturumlar" />
          <Tab label="Takım & Yetki" />
          <Tab label="Hesap" />
        </Tabs>
        {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
        {errorMsg && <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>}
        
        {/* Profil Sekmesi */}
        {tab === TabOption.PROFILE && (
          <Box component="form" onSubmit={handleNameUpdate}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar src={profilePic || undefined} sx={{ width: 72, height: 72, mb: 1 }} />
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
              sx={{ mb: 2 }}
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Kaydet'}
            </Button>
          </Box>
        )}
        
        {/* E-posta Sekmesi */}
        {tab === TabOption.EMAIL && (
          <Box component="form" onSubmit={handleEmailUpdate}>
            <TextField
              label="E-posta"
              value={email}
              onChange={e => setEmail(e.target.value)}
              fullWidth
              sx={{ mb: 2 }}
              type="email"
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'E-posta Güncelle'}
            </Button>
          </Box>
        )}
        
        {/* Şifre Sekmesi */}
        {tab === TabOption.PASSWORD && (
          <Box component="form" onSubmit={handlePasswordChange}>
            <TextField
              label="Mevcut Şifre"
              value={passwords.old}
              onChange={e => setPasswords({ ...passwords, old: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              type="password"
            />
            <TextField
              label="Yeni Şifre"
              value={passwords.new1}
              onChange={e => setPasswords({ ...passwords, new1: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              type="password"
            />
            <TextField
              label="Yeni Şifre (Tekrar)"
              value={passwords.new2}
              onChange={e => setPasswords({ ...passwords, new2: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
              type="password"
            />
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Şifreyi Değiştir'}
            </Button>
          </Box>
        )}
        
        {/* Oturum Geçmişi Sekmesi */}
        {tab === TabOption.SESSION_HISTORY && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Aktif Oturumlar
            </Typography>
            
            {loadingSessions ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : sessionHistory.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                Herhangi bir aktif oturum bulunamadı.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ maxHeight: 300, mb: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Cihaz / Tarayıcı</TableCell>
                      <TableCell>IP Adresi</TableCell>
                      <TableCell>İşlem</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionHistory.map((session) => (
                      <TableRow key={session.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell component="th" scope="row">
                          {formatDate(session.date)}
                          {session.isCurrentSession && (
                            <Typography variant="caption" color="primary" display="block">
                              Mevcut oturum
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{session.device}</Typography>
                          <Typography variant="caption" color="text.secondary">{session.browser}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{session.ip}</Typography>
                          <Typography variant="caption" color="text.secondary">{session.location}</Typography>
                        </TableCell>
                        <TableCell>
                          {!session.isCurrentSession && (
                            <Button 
                              variant="outlined" 
                              color="error" 
                              size="small"
                              onClick={() => handleSessionLogout(session.id)}
                              disabled={isLoading}
                            >
                              Sonlandır
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={loadSessionHistory}
              disabled={loadingSessions}
              sx={{ mb: 1 }}
            >
              {loadingSessions ? <CircularProgress size={24} /> : 'Yenile'}
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              * Diğer cihazlardaki oturumlarınızı buradan sonlandırabilirsiniz.
            </Typography>
          </Box>
        )}
        
        {/* Takım ve Yetki Ayarları Sekmesi */}
        {tab === TabOption.TEAM_PERMISSIONS && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Takım ve Yetki Ayarları
            </Typography>
            
            {loadingProjects ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : projects.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
                Herhangi bir proje bulunamadı. Takım ayarları için önce bir projeye katılın.
              </Typography>
            ) : (
              <Box>
                {projects.map((project) => (
                  <Card key={project.id} sx={{ mb: 2, overflow: 'visible' }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">{project.name}</Typography>
                        <Chip 
                          label={project.owner === user?.id ? 'Proje Sahibi' : 'Katılımcı'}
                          color={project.owner === user?.id ? 'primary' : 'default'}
                          size="small"
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Katılımcılar ({project.participants?.length || 0})
                      </Typography>
                      
                      {project.participants && project.participants.length > 0 ? (
                        <List sx={{ bgcolor: 'background.paper', maxHeight: 200, overflow: 'auto' }}>
                          {project.participants.map((participant) => (
                            <ListItem key={participant.userId} dense>
                              <ListItemAvatar>
                                <Avatar>
                                  {participant.userName?.[0] || participant.email?.[0] || '?'}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText 
                                primary={participant.userName || participant.email} 
                                secondary={
                                  <>
                                    {participant.role === 'admin' ? 'Yönetici' : 'Üye'} • {formatDate(participant.joinedAt).split(',')[0]}
                                    {participant.userId === user?.id && ' (Siz)'}
                                  </>
                                }
                              />
                              {isUserAdminInProject(project) && participant.userId !== user?.id && (
                                <ListItemSecondaryAction>
                                  {/* Rol değiştirme */}
                                  {project.owner === user?.id && (
                                    <IconButton 
                                      edge="end" 
                                      onClick={() => handleChangeRole(
                                        project.id, 
                                        participant.userId,
                                        participant.role === 'admin' ? 'member' : 'admin'
                                      )}
                                      disabled={isLoading}
                                      sx={{ mr: 1 }}
                                    >
                                      {participant.role === 'admin' ? <GroupIcon /> : <AdminPanelSettingsIcon />}
                                    </IconButton>
                                  )}
                                  
                                  {/* Kullanıcıyı çıkarma */}
                                  <IconButton 
                                    edge="end" 
                                    onClick={() => handleRemoveUser(project.id, participant.userId)}
                                    disabled={isLoading}
                                    color="error"
                                  >
                                    <PersonRemoveIcon />
                                  </IconButton>
                                </ListItemSecondaryAction>
                              )}
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Bu projede henüz katılımcı bulunmuyor.
                        </Typography>
                      )}
                    </CardContent>
                    
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleViewProject(project.id)}
                      >
                        Projeyi Görüntüle
                      </Button>
                      
                      {isUserAdminInProject(project) && (
                        <Button 
                          variant="contained" 
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={() => handleOpenInviteDialog(project)}
                          disabled={isLoading}
                        >
                          Üye Davet Et
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </Box>
            )}
            
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={loadProjects}
              disabled={loadingProjects}
              sx={{ mb: 1 }}
            >
              {loadingProjects ? <CircularProgress size={24} /> : 'Projeleri Yenile'}
            </Button>
            
            <Typography variant="caption" color="text.secondary">
              * Takım ayarları ve yetkilendirme işlemleri proje bazlı yapılır. Yönetici olduğunuz projelerde üye davet edebilir veya çıkarabilirsiniz.
            </Typography>
          </Box>
        )}
        
        {/* Hesap İşlemleri Sekmesi */}
        {tab === TabOption.ACCOUNT && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Hesap İşlemleri
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" paragraph>
                Hesabınızı geçici olarak dondurmak isterseniz, aşağıdaki butona tıklayabilirsiniz. Hesabınız dondurulduğunda,
                bilgileriniz korunur ancak tekrar giriş yapana kadar hesabınıza erişilemez.
              </Typography>
              <Button 
                variant="outlined" 
                color="warning"
                fullWidth
                onClick={() => setDeactivateDialog(true)}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Hesabımı Dondur'}
              </Button>
            </Box>
            
            <Box>
              <Typography variant="body2" paragraph color="error">
                <strong>Dikkat:</strong> Hesabınızı silmek, tüm verilerinizin tamamen silinmesine neden olur ve bu işlem geri alınamaz.
              </Typography>
              <Button 
                variant="outlined" 
                color="error"
                fullWidth
                onClick={() => setDeleteDialog(true)}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Hesabımı Sil'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Hesap Dondurma Dialog */}
      <Dialog
        open={deactivateDialog}
        onClose={() => !isLoading && setDeactivateDialog(false)}
      >
        <DialogTitle>Hesabı Dondur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hesabınızı dondurmak istediğinizden emin misiniz? Hesabınız dondurulduğunda, tekrar giriş yapana kadar hesabınıza erişilemez.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeactivateDialog(false)} disabled={isLoading}>İptal</Button>
          <Button 
            onClick={handleDeactivateAccount} 
            color="warning"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Hesabı Dondur'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Hesap Silme Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => !isLoading && setDeleteDialog(false)}
      >
        <DialogTitle>Hesabı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Hesabınızı silmek, tüm verilerinizin tamamen silinmesine neden olur ve bu işlem geri alınamaz.
            Bu işlemi onaylamak için kullanıcı adınızı (<strong>{user?.username}</strong>) aşağıya yazın.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Kullanıcı Adınız"
            fullWidth
            variant="outlined"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)} disabled={isLoading}>İptal</Button>
          <Button 
            onClick={handleDeleteAccount} 
            color="error"
            disabled={isLoading || confirmText !== user?.username}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Hesabı Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kullanıcı Davet Dialog */}
      <Dialog
        open={inviteDialog}
        onClose={() => !isLoading && setInviteDialog(false)}
      >
        <DialogTitle>Kullanıcı Davet Et</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Projeye katılacak kullanıcının e-posta adresini ve rolünü belirtin.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="E-posta Adresi"
            type="email"
            fullWidth
            variant="outlined"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={isLoading}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Rol</InputLabel>
            <Select
              labelId="role-select-label"
              value={inviteRole}
              label="Rol"
              onChange={(e) => setInviteRole(e.target.value as 'admin' | 'member')}
              disabled={isLoading}
            >
              <MenuItem value="admin">Yönetici</MenuItem>
              <MenuItem value="member">Üye</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteDialog(false)} disabled={isLoading}>İptal</Button>
          <Button 
            onClick={handleInviteUser} 
            color="primary"
            variant="contained"
            disabled={isLoading || !inviteEmail}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Davet Et'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage; 