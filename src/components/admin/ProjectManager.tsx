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
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

// Tip tanımlamaları
interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  surname?: string;
  role: string;
  projectId?: string;
  position?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  managerId?: string;
  status: 'active' | 'completed' | 'pending';
  members: string[]; // Kullanıcı ID'leri listesi
  createdAt: string;
  deadline?: string;
}

// Mock API servis fonksiyonları
const mockProjectService = {
  getProjects: async (): Promise<Project[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Web Uygulaması Geliştirme',
            description: 'Şirket için yeni web uygulaması geliştirme projesi',
            managerId: 'u1',
            status: 'active',
            members: ['u1', 'u2', 'u3'],
            createdAt: '2025-01-15',
            deadline: '2025-06-30'
          },
          {
            id: '2',
            name: 'API Geliştirme',
            description: 'Mobil uygulamalar için REST API tasarımı ve geliştirme',
            managerId: 'u4',
            status: 'pending',
            members: ['u4', 'u5'],
            createdAt: '2025-02-10',
            deadline: '2025-05-15'
          }
        ]);
      }, 800);
    });
  },
  
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'u1', username: 'ahmetyilmaz', email: 'ahmet@example.com', name: 'Ahmet', surname: 'Yılmaz', role: 'manager', projectId: '1', position: 'Proje Yöneticisi' },
          { id: 'u2', username: 'aysedemir', email: 'ayse@example.com', name: 'Ayşe', surname: 'Demir', role: 'developer', projectId: '1', position: 'Frontend Geliştirici' },
          { id: 'u3', username: 'mehmetcan', email: 'mehmet@example.com', name: 'Mehmet', surname: 'Can', role: 'designer', projectId: '1', position: 'UI/UX Tasarımcı' },
          { id: 'u4', username: 'aliyildirim', email: 'ali@example.com', name: 'Ali', surname: 'Yıldırım', role: 'manager', projectId: '2', position: 'Backend Takım Lideri' },
          { id: 'u5', username: 'zeynepsahin', email: 'zeynep@example.com', name: 'Zeynep', surname: 'Şahin', role: 'developer', projectId: '2', position: 'Backend Geliştirici' },
          { id: 'u6', username: 'canozturk', email: 'can@example.com', name: 'Can', surname: 'Öztürk', role: 'qa', projectId: undefined, position: undefined }
        ]);
      }, 600);
    });
  },
  
  createProject: async (projectData: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...projectData,
          createdAt: new Date().toISOString().split('T')[0]
        });
      }, 1000);
    });
  },
  
  updateProject: async (id: string, projectData: Partial<Project>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Proje güncellendi:', id, projectData);
        resolve(true);
      }, 1000);
    });
  },
  
  deleteProject: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Proje silindi:', id);
        resolve(true);
      }, 800);
    });
  },
  
  addUserToProject: async (projectId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Kullanıcı (${userId}) projeye (${projectId}) eklendi`);
        resolve(true);
      }, 800);
    });
  },
  
  removeUserFromProject: async (projectId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Kullanıcı (${userId}) projeden (${projectId}) çıkarıldı`);
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
  
  setProjectManager: async (projectId: string, userId: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Proje (${projectId}) yöneticisi olarak kullanıcı (${userId}) atandı`);
        resolve(true);
      }, 800);
    });
  }
};

// Proje yönetimi bileşeni
export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Dialog durumları
  const [projectDialogOpen, setProjectDialogOpen] = useState<boolean>(false);
  const [userDialogOpen, setUserDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState<boolean>(false);
  
  // Form verileri
  const [formProjectData, setFormProjectData] = useState<{
    name: string;
    description: string;
    managerId?: string;
    status: string;
  }>({
    name: '',
    description: '',
    managerId: undefined,
    status: 'pending'
  });
  
  const [formUserData, setFormUserData] = useState<{
    role: string;
    position?: string;
  }>({
    role: 'member',
    position: ''
  });
  
  // İlk yüklemede verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [projectsData, usersData] = await Promise.all([
          mockProjectService.getProjects(),
          mockProjectService.getUsers()
        ]);
        
        setProjects(projectsData);
        setUsers(usersData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Tab değişimini işle
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Proje form değişikliklerini işle
  const handleProjectFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormProjectData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name === 'role' || name === 'position') {
      setFormUserData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'managerId' || name === 'status') {
      setFormProjectData(prev => ({
        ...prev,
        [name]: value || undefined
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
  
  // Yeni proje oluştur dialog
  const handleCreateProject = () => {
    setSelectedProject(null);
    setFormProjectData({
      name: '',
      description: '',
      managerId: undefined,
      status: 'pending'
    });
    setProjectDialogOpen(true);
  };
  
  // Proje düzenleme dialog
  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setFormProjectData({
      name: project.name,
      description: project.description,
      managerId: project.managerId,
      status: project.status
    });
    setProjectDialogOpen(true);
  };
  
  // Proje silme dialog
  const handleDeleteProject = (project: Project) => {
    setSelectedProject(project);
    setDeleteDialogOpen(true);
  };
  
  // Kullanıcı düzenleme dialog
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormUserData({
      role: user.role,
      position: user.position
    });
    setUserDialogOpen(true);
  };
  
  // Projeye üye ekleme dialog
  const handleAddMemberDialog = (project: Project) => {
    setSelectedProject(project);
    setAddMemberDialogOpen(true);
  };
  
  // Proje kaydetme işlemi
  const handleSaveProject = async () => {
    try {
      setSaving(true);
      
      const projectData = {
        name: formProjectData.name,
        description: formProjectData.description,
        managerId: formProjectData.managerId,
        status: formProjectData.status as 'active' | 'completed' | 'pending',
        members: selectedProject?.members || []
      };
      
      if (selectedProject) {
        // Mevcut projeyi güncelle
        const isSuccess = await mockProjectService.updateProject(selectedProject.id, projectData);
        
        if (isSuccess) {
          setProjects(prev => 
            prev.map(p => 
              p.id === selectedProject.id ? { ...p, ...projectData } : p
            )
          );
          setSuccess('Proje başarıyla güncellendi');
        }
      } else {
        // Yeni proje oluştur
        const newProject = await mockProjectService.createProject({
          ...projectData,
          members: [],
          deadline: undefined
        });
        
        setProjects(prev => [...prev, newProject]);
        setSuccess('Proje başarıyla oluşturuldu');
      }
      
      setProjectDialogOpen(false);
    } catch (err) {
      setError('Proje kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Proje silme işlemi
  const handleConfirmDelete = async () => {
    if (!selectedProject) return;
    
    try {
      setSaving(true);
      
      const isSuccess = await mockProjectService.deleteProject(selectedProject.id);
      
      if (isSuccess) {
        // Proje üyelerinin projectId değerini temizle
        const updatedUsers = users.map(user => 
          user.projectId === selectedProject.id 
            ? { ...user, projectId: undefined } 
            : user
        );
        
        setUsers(updatedUsers);
        setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
        setSuccess('Proje başarıyla silindi');
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Proje silinirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Kullanıcı kaydetme işlemi
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      setSaving(true);
      
      const isSuccess = await mockProjectService.updateUserRole(selectedUser.id, formUserData.role);
      
      if (isSuccess) {
        setUsers(prev => 
          prev.map(u => 
            u.id === selectedUser.id 
              ? { 
                  ...u, 
                  role: formUserData.role,
                  position: formUserData.position
                } 
              : u
          )
        );
        setSuccess('Kullanıcı bilgileri güncellendi');
      }
      
      setUserDialogOpen(false);
    } catch (err) {
      setError('Kullanıcı güncellenirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Projeye üye ekleme işlemi
  const handleAddMember = async (userId: string) => {
    if (!selectedProject) return;
    
    try {
      setSaving(true);
      
      const isSuccess = await mockProjectService.addUserToProject(selectedProject.id, userId);
      
      if (isSuccess) {
        // Projeye kullanıcıyı ekle
        setProjects(prev => 
          prev.map(p => 
            p.id === selectedProject.id 
              ? { ...p, members: [...p.members, userId] } 
              : p
          )
        );
        
        // Kullanıcının projectId'sini güncelle
        setUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, projectId: selectedProject.id } 
              : u
          )
        );
        
        setSuccess('Kullanıcı projeye eklendi');
      }
    } catch (err) {
      setError('Kullanıcı eklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Projeden üye çıkarma işlemi
  const handleRemoveMember = async (projectId: string, userId: string) => {
    try {
      setSaving(true);
      
      const isSuccess = await mockProjectService.removeUserFromProject(projectId, userId);
      
      if (isSuccess) {
        // Projeden kullanıcıyı çıkar
        setProjects(prev => 
          prev.map(p => 
            p.id === projectId 
              ? { ...p, members: p.members.filter(id => id !== userId) } 
              : p
          )
        );
        
        // Kullanıcının projectId'sini temizle
        setUsers(prev => 
          prev.map(u => 
            u.id === userId 
              ? { ...u, projectId: undefined } 
              : u
          )
        );
        
        // Eğer kullanıcı proje yöneticisiyse, yönetici bilgisini de kaldır
        const project = projects.find(p => p.id === projectId);
        if (project && project.managerId === userId) {
          setProjects(prev => 
            prev.map(p => 
              p.id === projectId 
                ? { ...p, managerId: undefined } 
                : p
            )
          );
        }
        
        setSuccess('Kullanıcı projeden çıkarıldı');
      }
    } catch (err) {
      setError('Kullanıcı çıkarılırken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Proje yöneticisi atama
  const handleSetProjectManager = async (projectId: string, userId: string) => {
    try {
      setSaving(true);
      
      const isSuccess = await mockProjectService.setProjectManager(projectId, userId);
      
      if (isSuccess) {
        setProjects(prev => 
          prev.map(p => 
            p.id === projectId 
              ? { ...p, managerId: userId } 
              : p
          )
        );
        
        setSuccess('Proje yöneticisi atandı');
      }
    } catch (err) {
      setError('Proje yöneticisi atanırken bir hata oluştu');
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
  
  // Yardımcı fonksiyonlar
  const getProjectMembers = (projectId: string): User[] => {
    return users.filter(user => projects.find(p => p.id === projectId)?.members.includes(user.id));
  };
  
  const getProjectManager = (managerId?: string): User | undefined => {
    return users.find(user => user.id === managerId);
  };
  
  const getUnassignedUsers = (): User[] => {
    return users.filter(user => !user.projectId);
  };
  
  const getUserFullName = (user?: User): string => {
    if (!user) return '';
    return `${user.name || ''} ${user.surname || ''}`.trim() || user.username;
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
          Proje Yönetimi
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleCreateProject}
        >
          Yeni Proje
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable" 
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<WorkIcon />} 
            label="Projeler" 
            iconPosition="start" 
          />
          <Tab 
            icon={<GroupsIcon />} 
            label="Ekip Üyeleri" 
            iconPosition="start" 
          />
        </Tabs>
        
        {/* Projeler Sekmesi */}
        {tabValue === 0 && (
          <Box sx={{ p: 2 }}>
            {projects.length > 0 ? (
              <Grid container spacing={3}>
                {projects.map(project => {
                  const manager = getProjectManager(project.managerId);
                  
                  return (
                    <Grid item xs={12} md={6} key={project.id}>
                      <Card variant="outlined">
                        <CardHeader
                          title={project.name}
                          action={
                            <Box>
                              <IconButton onClick={() => handleEditProject(project)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="error" onClick={() => handleDeleteProject(project)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          }
                        />
                        <Divider />
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {project.description}
                          </Typography>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Proje Durumu
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                            {project.status === 'active' && (
                              <Chip color="success" label="Aktif" size="small" />
                            )}
                            {project.status === 'pending' && (
                              <Chip color="warning" label="Beklemede" size="small" />
                            )}
                            {project.status === 'completed' && (
                              <Chip color="info" label="Tamamlandı" size="small" />
                            )}
                          </Box>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Proje Lideri
                          </Typography>
                          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            {manager ? (
                              <>
                                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                                  {manager.name?.charAt(0) || manager.username.charAt(0)}
                                </Avatar>
                                <Typography variant="body2">
                                  {getUserFullName(manager)}
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Atanmamış
                              </Typography>
                            )}
                          </Box>
                          
                          <Typography variant="subtitle2" gutterBottom>
                            Ekip Üyeleri ({getProjectMembers(project.id).length})
                          </Typography>
                          <Box>
                            <List dense>
                              {getProjectMembers(project.id).map(member => (
                                <ListItem key={member.id}>
                                  <ListItemAvatar>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {member.name?.charAt(0) || member.username.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={getUserFullName(member)}
                                    secondary={member.position || member.role}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                    secondaryTypographyProps={{ variant: 'caption' }}
                                  />
                                  <ListItemSecondaryAction>
                                    {!project.managerId || project.managerId !== member.id ? (
                                      <Tooltip title="Proje Lideri Yap">
                                        <IconButton 
                                          edge="end" 
                                          size="small"
                                          onClick={() => handleSetProjectManager(project.id, member.id)}
                                        >
                                          <SupervisorAccountIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    ) : null}
                                    <Tooltip title="Projeden Çıkar">
                                      <IconButton 
                                        edge="end" 
                                        size="small" 
                                        color="error"
                                        onClick={() => handleRemoveMember(project.id, member.id)}
                                        sx={{ ml: 1 }}
                                      >
                                        <PersonRemoveIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              ))}
                              <ListItem>
                                <Button
                                  startIcon={<PersonAddIcon />}
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleAddMemberDialog(project)}
                                  fullWidth
                                >
                                  Üye Ekle
                                </Button>
                              </ListItem>
                            </List>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Typography align="center" sx={{ py: 4 }}>
                Henüz bir proje oluşturulmamış.
              </Typography>
            )}
          </Box>
        )}
        
        {/* Ekip Üyeleri Sekmesi */}
        {tabValue === 1 && (
          <Box sx={{ p: 2 }}>
            <List>
              {users.map(user => {
                const userProject = projects.find(p => p.id === user.projectId);
                const isProjectManager = userProject?.managerId === user.id;
                
                return (
                  <ListItem key={user.id}>
                    <ListItemAvatar>
                      <Avatar>
                        {user.name?.charAt(0) || user.username.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getUserFullName(user)}
                          {isProjectManager && (
                            <Tooltip title="Proje Lideri">
                              <SupervisorAccountIcon 
                                color="primary" 
                                fontSize="small" 
                                sx={{ ml: 1 }} 
                              />
                            </Tooltip>
                          )}
                          {user.role === 'admin' && (
                            <Tooltip title="Admin">
                              <SecurityIcon 
                                color="error" 
                                fontSize="small" 
                                sx={{ ml: 1 }} 
                              />
                            </Tooltip>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {user.email}
                          </Typography>
                          <Box sx={{ display: 'flex', mt: 0.5 }}>
                            {user.position && (
                              <Chip 
                                size="small" 
                                label={user.position} 
                                sx={{ mr: 1 }} 
                                variant="outlined"
                              />
                            )}
                            {userProject && (
                              <Chip 
                                size="small" 
                                icon={<WorkIcon />} 
                                label={userProject.name} 
                                color="primary" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEditUser(user)}
                    >
                      Düzenle
                    </Button>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        )}
      </Paper>
      
      {/* Proje Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={projectDialogOpen} 
        onClose={() => setProjectDialogOpen(false)}
      >
        <DialogTitle>{selectedProject ? `${selectedProject.name} Projesinin Düzenle` : 'Yeni Proje Oluştur'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Proje Adı"
            fullWidth
            value={formProjectData.name}
            onChange={handleProjectFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            fullWidth
            multiline
            rows={2}
            value={formProjectData.description}
            onChange={handleProjectFormChange}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth>
            <InputLabel id="project-manager-label">Proje Lideri</InputLabel>
            <Select
              labelId="project-manager-label"
              id="project-manager-select"
              name="managerId"
              value={formProjectData.managerId || ''}
              label="Proje Lideri"
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
          <Button onClick={() => setProjectDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveProject} 
            variant="contained" 
            disabled={saving || !formProjectData.name || !formProjectData.description}
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
      
      {/* Projeye Üye Ekleme Dialog */}
      <Dialog 
        open={addMemberDialogOpen} 
        onClose={() => setAddMemberDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Projeye Üye Ekle: {selectedProject?.name}</DialogTitle>
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
      
      {/* Proje Silme Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Proje Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedProject?.name}</strong> projesinin silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz ve proje üyelerinin proje bağlantısı kaldırılacaktır.
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