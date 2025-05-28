import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  SelectChangeEvent,
  Card,
  CardContent,
  CardHeader,
  Tab,
  Tabs,
  FormControlLabel,
  Switch,
  Tooltip,
  ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Tip tanımlamaları
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  role: string;
  teamId?: string;
  position?: string;
}

interface Team {
  id: string;
  name: string;
  description: string;
  leaderId?: string;
  members: string[]; // Kullanıcı ID'leri listesi
  createdAt: string;
}

// Mock API servis fonksiyonları
const mockTeamService = {
  getTeams: async (): Promise<Team[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Frontend Takımı',
            description: 'Web arayüzü geliştirme ekibi',
            leaderId: 'u1',
            members: ['u1', 'u2', 'u3'],
            createdAt: '2025-01-15'
          },
          {
            id: '2',
            name: 'Backend Takımı',
            description: 'API ve veritabanı ekibi',
            leaderId: 'u4',
            members: ['u4', 'u5'],
            createdAt: '2025-02-10'
          }
        ]);
      }, 800);
    });
  },
  
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'u1', username: 'ahmetyilmaz', email: 'ahmet@example.com', name: 'Ahmet', surname: 'Yılmaz', role: 'member', teamId: '1', position: 'Takım Lideri' },
          { id: 'u2', username: 'aysedemir', email: 'ayse@example.com', name: 'Ayşe', surname: 'Demir', role: 'member', teamId: '1', position: 'Frontend Geliştirici' },
          { id: 'u3', username: 'mehmetcan', email: 'mehmet@example.com', name: 'Mehmet', surname: 'Can', role: 'member', teamId: '1', position: 'UI/UX Tasarımcı' },
          { id: 'u4', username: 'aliyildirim', email: 'ali@example.com', name: 'Ali', surname: 'Yıldırım', role: 'admin', teamId: '2', position: 'Backend Takım Lideri' },
          { id: 'u5', username: 'zeynepsahin', email: 'zeynep@example.com', name: 'Zeynep', surname: 'Şahin', role: 'member', teamId: '2', position: 'Backend Geliştirici' },
          { id: 'u6', username: 'canozturk', email: 'can@example.com', name: 'Can', surname: 'Öztürk', role: 'member', teamId: undefined, position: undefined }
        ]);
      }, 600);
    });
  },
  
  createTeam: async (teamData: Omit<Team, 'id' | 'createdAt'>): Promise<Team> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...teamData,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }, 1000);
    });
  },
  
  updateTeam: async (id: string, teamData: Partial<Team>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Takım güncellendi:', id, teamData);
        resolve(true);
      }, 1000);
    });
  },
  
  deleteTeam: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Takım silindi:', id);
        resolve(true);
      }, 800);
    });
  },
  
  addUserToTeam: async (teamId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Kullanıcı (${userId}) takıma (${teamId}) eklendi`);
        resolve(true);
      }, 800);
    });
  },
  
  removeUserFromTeam: async (teamId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Kullanıcı (${userId}) takımdan (${teamId}) çıkarıldı`);
        resolve(true);
      }, 800);
    });
  },
  
  updateUserRole: async (userId: string, role: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Kullanıcı (${userId}) rolü güncellendi: ${role}`);
        resolve(true);
      }, 800);
    });
  },
  
  setTeamLeader: async (teamId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Takım (${teamId}) lideri olarak kullanıcı (${userId}) atandı`);
        resolve(true);
      }, 800);
    });
  }
};

// Takım yönetimi bileşeni
export const TeamManager: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Dialog durumları
  const [teamDialogOpen, setTeamDialogOpen] = useState<boolean>(false);
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState<boolean>(false);
  
  // Form verileri
  const [formTeamData, setFormTeamData] = useState<{
    name: string;
    description: string;
    leaderId?: string;
  }>({
    name: '',
    description: '',
    leaderId: undefined
  });
  
  const [formUserData, setFormUserData] = useState<{
    id: string;
    role: string;
    position?: string;
  }>({
    id: '',
    role: 'member',
    position: ''
  });
  
  // İlk yüklemede verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Takım ve kullanıcı verilerini eş zamanlı yükle
        const [teamData, userData] = await Promise.all([
          mockTeamService.getTeams(),
          mockTeamService.getUsers()
        ]);
        
        setTeams(teamData);
        setUsers(userData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Tab değişikliği işleyicisi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Form değişikliklerini işle
  const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name === 'leaderId') {
      setFormTeamData(prev => ({
        ...prev,
        leaderId: value || undefined
      }));
    } else if (name === 'role') {
      setFormUserData(prev => ({
        ...prev,
        role: value
      }));
    }
  };
  
  // Kullanıcı form değişikliklerini işle
  const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Yeni takım oluştur
  const handleCreateTeam = () => {
    setSelectedTeam(null);
    setFormTeamData({
      name: '',
      description: '',
      leaderId: undefined
    });
    setTeamDialogOpen(true);
  };
  
  // Takım düzenle
  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setFormTeamData({
      name: team.name,
      description: team.description,
      leaderId: team.leaderId
    });
    setTeamDialogOpen(true);
  };
  
  // Takım sil
  const handleDeleteTeam = (team: Team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };
  
  // Kullanıcı düzenleme dialogu aç
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormUserData({
      id: user.id,
      role: user.role,
      position: user.position || ''
    });
    setUserDialogOpen(true);
  };
  
  // Takıma üye ekle dialogu aç
  const handleAddMemberDialog = (team: Team) => {
    setSelectedTeam(team);
    setAddMemberDialogOpen(true);
  };
  
  // Takım kaydet
  const handleSaveTeam = async () => {
    try {
      setSaving(true);
      
      if (selectedTeam) {
        // Var olan takımı güncelle
        const isSuccess = await mockTeamService.updateTeam(selectedTeam.id, formTeamData);
        
        if (isSuccess) {
          setTeams(prev => 
            prev.map(team => 
              team.id === selectedTeam.id
                ? { 
                    ...team, 
                    name: formTeamData.name, 
                    description: formTeamData.description,
                    leaderId: formTeamData.leaderId
                  }
                : team
            )
          );
          
          setSuccess('Takım başarıyla güncellendi');
        }
      } else {
        // Yeni takım oluştur
        const newTeam = await mockTeamService.createTeam({
          name: formTeamData.name,
          description: formTeamData.description,
          leaderId: formTeamData.leaderId,
          members: formTeamData.leaderId ? [formTeamData.leaderId] : []
        });
        
        setTeams(prev => [...prev, newTeam]);
        setSuccess('Yeni takım başarıyla oluşturuldu');
      }
      
      setTeamDialogOpen(false);
    } catch (err) {
      setError('Takım kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Takım silme işlemini onayla
  const handleConfirmDelete = async () => {
    if (!selectedTeam) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockTeamService.deleteTeam(selectedTeam.id);
      
      if (isSuccess) {
        setTeams(prev => prev.filter(t => t.id !== selectedTeam.id));
        
        // Takım silindiğinde ilgili kullanıcıların takım ID'lerini temizle
        setUsers(prev => 
          prev.map(user => 
            user.teamId === selectedTeam.id
              ? { ...user, teamId: undefined, position: undefined }
              : user
          )
        );
        
        setSuccess('Takım başarıyla silindi');
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Takım silinirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Kullanıcı bilgilerini güncelle
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSaving(true);
      
      // Rol değişikliği
      if (selectedUser.role !== formUserData.role) {
        await mockTeamService.updateUserRole(selectedUser.id, formUserData.role);
      }
      
      // Kullanıcıyı güncelle
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id
            ? { ...user, role: formUserData.role, position: formUserData.position }
            : user
        )
      );
      
      setSuccess('Kullanıcı bilgileri başarıyla güncellendi');
      setUserDialogOpen(false);
    } catch (err) {
      setError('Kullanıcı bilgileri güncellenirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Takıma üye ekle
  const handleAddMember = async (userId: string) => {
    if (!selectedTeam) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockTeamService.addUserToTeam(selectedTeam.id, userId);
      
      if (isSuccess) {
        // Takım üyelerini güncelle
        setTeams(prev => 
          prev.map(team => 
            team.id === selectedTeam.id
              ? { ...team, members: [...team.members, userId] }
              : team
          )
        );
        
        // Kullanıcı takım bilgisini güncelle
        setUsers(prev => 
          prev.map(user => 
            user.id === userId
              ? { ...user, teamId: selectedTeam.id }
              : user
          )
        );
        
        setSuccess('Kullanıcı takıma başarıyla eklendi');
      }
    } catch (err) {
      setError('Kullanıcı takıma eklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Üyeyi takımdan çıkar
  const handleRemoveMember = async (teamId: string, userId: string) => {
    try {
      setSaving(true);
      const isSuccess = await mockTeamService.removeUserFromTeam(teamId, userId);
      
      if (isSuccess) {
        // Takımdan üyeyi kaldır
        setTeams(prev => 
          prev.map(team => 
            team.id === teamId
              ? { 
                  ...team, 
                  members: team.members.filter(id => id !== userId),
                  // Eğer lider çıkarılıyorsa lider ID'sini temizle
                  leaderId: team.leaderId === userId ? undefined : team.leaderId
                }
              : team
          )
        );
        
        // Kullanıcı takım bilgisini temizle
        setUsers(prev => 
          prev.map(user => 
            user.id === userId
              ? { ...user, teamId: undefined, position: undefined }
              : user
          )
        );
        
        setSuccess('Kullanıcı takımdan başarıyla çıkarıldı');
      }
    } catch (err) {
      setError('Kullanıcı takımdan çıkarılırken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Takım lideri ata
  const handleSetTeamLeader = async (teamId: string, userId: string) => {
    try {
      setSaving(true);
      const isSuccess = await mockTeamService.setTeamLeader(teamId, userId);
      
      if (isSuccess) {
        // Takım liderini güncelle
        setTeams(prev => 
          prev.map(team => 
            team.id === teamId
              ? { ...team, leaderId: userId }
              : team
          )
        );
        
        setSuccess('Takım lideri başarıyla atandı');
      }
    } catch (err) {
      setError('Takım lideri atanırken bir hata oluştu');
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
  
  // Helper fonksiyonlar
  const getTeamMembers = (teamId: string): User[] => {
    return users.filter(user => user.teamId === teamId);
  };
  
  const getTeamLeader = (leaderId?: string): User | undefined => {
    return leaderId ? users.find(user => user.id === leaderId) : undefined;
  };
  
  const getUnassignedUsers = (): User[] => {
    return users.filter(user => !user.teamId);
  };
  
  const getUserFullName = (user?: User): string => {
    if (!user) return '';
    if (user.name && user.surname) return `${user.name} ${user.surname}`;
    return user.username;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Takım Yönetimi
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleCreateTeam}
        >
          Yeni Takım Oluştur
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Takımlar" icon={<GroupsIcon />} iconPosition="start" />
        <Tab label="Kullanıcılar" icon={<AccountCircleIcon />} iconPosition="start" />
      </Tabs>
      
      {/* Takımlar Sekmesi */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {teams.map(team => {
            const members = getTeamMembers(team.id);
            const leader = getTeamLeader(team.leaderId);
            
            return (
              <Grid item xs={12} md={6} key={team.id}>
                <Card>
                  <CardHeader 
                    title={team.name}
                    subheader={`Oluşturulma: ${team.createdAt}`}
                    action={
                      <Box>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditTeam(team)}
                          title="Takımı Düzenle"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDeleteTeam(team)}
                          title="Takımı Sil"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {team.description}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Takım Lideri:
                      </Typography>
                      {leader ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {leader.name?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">
                            {getUserFullName(leader)}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Henüz bir lider atanmamış
                        </Typography>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Takım Üyeleri ({members.length}):</span>
                      <Button 
                        size="small" 
                        startIcon={<PersonAddIcon />}
                        onClick={() => handleAddMemberDialog(team)}
                      >
                        Üye Ekle
                      </Button>
                    </Typography>
                    
                    <List sx={{ maxHeight: 240, overflow: 'auto' }}>
                      {members.length > 0 ? (
                        members.map(member => (
                          <ListItem key={member.id} sx={{ py: 0.5 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {member.name?.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={getUserFullName(member)}
                              secondary={member.position || 'Pozisyon belirtilmemiş'}
                            />
                            <ListItemSecondaryAction>
                              {member.id !== team.leaderId && (
                                <Tooltip title="Lider Olarak Ata">
                                  <IconButton 
                                    edge="end" 
                                    size="small"
                                    onClick={() => handleSetTeamLeader(team.id, member.id)}
                                  >
                                    <SecurityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Takımdan Çıkar">
                                <IconButton 
                                  edge="end" 
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveMember(team.id, member.id)}
                                >
                                  <PersonRemoveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>
                          <ListItemText 
                            primary="Bu takımda henüz üye bulunmuyor" 
                            secondary="Yukarıdaki 'Üye Ekle' butonunu kullanarak takıma üye ekleyebilirsiniz" 
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
          
          {teams.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Henüz bir takım oluşturulmamış.</Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />} 
                  onClick={handleCreateTeam}
                >
                  İlk Takımı Oluştur
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Kullanıcılar Sekmesi */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Kullanıcılar ve Roller
              </Typography>
              <List>
                {users.map(user => {
                  const userTeam = teams.find(team => team.id === user.teamId);
                  const isTeamLeader = userTeam?.leaderId === user.id;
                  
                  return (
                    <ListItem key={user.id} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemAvatar>
                        <Avatar>
                          {user.name?.charAt(0) || user.username.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="span" variant="body1">
                              {getUserFullName(user)}
                            </Typography>
                            {user.role === 'admin' && (
                              <Chip 
                                size="small" 
                                label="Admin" 
                                color="error" 
                                sx={{ ml: 1 }} 
                              />
                            )}
                            {isTeamLeader && (
                              <Chip 
                                size="small" 
                                icon={<SecurityIcon />} 
                                label="Takım Lideri" 
                                color="primary" 
                                variant="outlined"
                                sx={{ ml: 1 }} 
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" component="span">
                              {user.email}
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {userTeam ? (
                                <Chip 
                                  size="small" 
                                  label={`${userTeam.name} ${user.position ? `- ${user.position}` : ''}`}
                                  variant="outlined"
                                />
                              ) : (
                                <Chip 
                                  size="small" 
                                  label="Takım Atanmamış" 
                                  color="default" 
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button 
                          size="small" 
                          startIcon={<EditIcon />}
                          onClick={() => handleEditUser(user)}
                        >
                          Düzenle
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Takım Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={teamDialogOpen} 
        onClose={() => setTeamDialogOpen(false)}
      >
        <DialogTitle>{selectedTeam ? `${selectedTeam.name} Takımını Düzenle` : 'Yeni Takım Oluştur'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Takım Adı"
            fullWidth
            value={formTeamData.name}
            onChange={handleTeamFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            fullWidth
            multiline
            rows={2}
            value={formTeamData.description}
            onChange={handleTeamFormChange}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel id="team-leader-label">Takım Lideri</InputLabel>
            <Select
              labelId="team-leader-label"
              id="team-leader-select"
              name="leaderId"
              value={formTeamData.leaderId || ''}
              label="Takım Lideri"
              onChange={handleSelectChange}
            >
              <MenuItem value="">
                <em>Lider Seçilmedi</em>
              </MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {getUserFullName(user)} ({user.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveTeam} 
            variant="contained" 
            disabled={saving || !formTeamData.name || !formTeamData.description}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kullanıcı Düzenleme Dialog */}
      <Dialog 
        open={userDialogOpen} 
        onClose={() => setUserDialogOpen(false)}
      >
        <DialogTitle>Kullanıcı Düzenle: {selectedUser ? getUserFullName(selectedUser) : ''}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="user-role-label">Kullanıcı Rolü</InputLabel>
            <Select
              labelId="user-role-label"
              id="user-role-select"
              name="role"
              value={formUserData.role}
              label="Kullanıcı Rolü"
              onChange={handleSelectChange}
            >
              <MenuItem value="member">Üye</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            name="position"
            label="Pozisyon"
            fullWidth
            value={formUserData.position || ''}
            onChange={handleUserFormChange}
            placeholder="Örn: Frontend Geliştirici"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Takıma Üye Ekleme Dialog */}
      <Dialog 
        open={addMemberDialogOpen} 
        onClose={() => setAddMemberDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Takıma Üye Ekle: {selectedTeam?.name}</DialogTitle>
        <DialogContent>
          <List sx={{ minHeight: 200 }}>
            {getUnassignedUsers().length > 0 ? (
              getUnassignedUsers().map(user => (
                <ListItem key={user.id}>
                  <ListItemAvatar>
                    <Avatar>{user.name?.charAt(0) || user.username.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={getUserFullName(user)}
                    secondary={user.email}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => {
                      handleAddMember(user.id);
                      setAddMemberDialogOpen(false);
                    }}
                  >
                    Ekle
                  </Button>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="Eklenebilecek kullanıcı bulunamadı" />
              </ListItem>
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddMemberDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>
      
      {/* Takım Silme Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Takımı Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedTeam?.name}</strong> takımını silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz ve takım üyelerinin takım bağlantısı kaldırılacaktır.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={saving}
          >
            {saving ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirimler */}
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