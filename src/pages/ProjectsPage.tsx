import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Dialog as ConfirmDialog,
  DialogContentText,
  Chip,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Tooltip,
  Paper,
  Fade,
  Popper
} from '@mui/material';
import { useProjectContext } from '../context/ProjectContext';
import AddIcon from '@mui/icons-material/Add';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useLoading } from '../context/LoadingContext';
import ShareIcon from '@mui/icons-material/Share';
import { useTaskContext } from '../context/TaskContext';
import { Project, Task } from '../types';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Sıralama seçenekleri için enum
enum SortOption {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'nameAsc',
  NAME_DESC = 'nameDesc'
}

// Filtreleme seçenekleri için enum
enum FilterOption {
  ALL = 'all',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

// Proje durumu için enum
enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FROZEN = 'frozen'
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    projectId: string | null;
  } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    open: boolean;
    projectId: string | null;
    projectName: string;
    isDeleting?: boolean;
  }>({
    open: false,
    projectId: null,
    projectName: ''
  });
  const [editProject, setEditProject] = useState<{
    open: boolean;
    projectId: string | null;
    name: string;
    description: string;
    isSubmitting: boolean;
  }>({
    open: false,
    projectId: null,
    name: '',
    description: '',
    isSubmitting: false
  });
  const [shareCode, setShareCode] = useState('');
  const [joiningProject, setJoiningProject] = useState(false);
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  
  // Filtreleme ve sıralama durumları
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.NEWEST);
  const [filterOption, setFilterOption] = useState<FilterOption>(FilterOption.ALL);
  const [filterTabValue, setFilterTabValue] = useState(0);

  const [hoverInfo, setHoverInfo] = useState<{
    open: boolean;
    anchorEl: null | HTMLElement;
    projectId: string | null;
  }>({
    open: false,
    anchorEl: null,
    projectId: null
  });

  // ProjectContext'ten verileri ve fonksiyonları al
  const { 
    projects, 
    loading, 
    error, 
    loadProjects, 
    createProject,
    deleteProject,
    updateProject,
    joinProject
  } = useProjectContext();
  
  // Global loading state
  const { setLoading } = useLoading();

  // Görev tamamlandığında ilerleme çubuğunun güncellenmesi için
  const { tasks } = useTaskContext();
  
  // Görevler değiştiğinde projeleri güncelle
  useEffect(() => {
    if (tasks.length > 0) {
      console.log('Görevlerde değişiklik algılandı, projeler güncelleniyor');
      
      // Sadece bir kez yenile
      loadProjects();
    }
  }, [tasks, loadProjects]);

  // İlk yükleme ve refreshes
  useEffect(() => {
    loadProjects();
    document.title = 'Tüm Projeler | Görev Yöneticisi';
  }, [loadProjects]);

  // Filtreleme ve sıralama işlevleri
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortOption(event.target.value as SortOption);
  };

  const handleFilterChange = (event: React.SyntheticEvent, newValue: number) => {
    setFilterTabValue(newValue);
    setFilterOption(newValue === 0 ? FilterOption.ALL : 
                    newValue === 1 ? FilterOption.ACTIVE : 
                    FilterOption.COMPLETED);
  };

  // Projeleri filtrele ve sırala
  const filteredAndSortedProjects = [...projects]
    .filter(project => {
      if (filterOption === FilterOption.ALL) return true;
      
      // Tamamlanma durumunu doğrudan hesapla
      let isCompleted = false;
      let completedTasksCount = 0;
      let totalTasksCount = 0;
      
      if (project.tasks && project.tasks.length > 0) {
        totalTasksCount = project.tasks.length;
        completedTasksCount = project.tasks.filter(t => t.status === 'tamamlandi').length;
        isCompleted = completedTasksCount === totalTasksCount;
        
        console.log(`Filtrelemede proje: ${project.name}, Tamamlanan: ${completedTasksCount}/${totalTasksCount}, Durum: ${isCompleted ? 'Tamamlandı' : 'Aktif'}`);
      }
      
      return filterOption === FilterOption.COMPLETED ? isCompleted : !isCompleted;
    })
    .sort((a, b) => {
      switch(sortOption) {
        case SortOption.NEWEST:
          return b.createdAt && a.createdAt 
            ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            : 0;
        case SortOption.OLDEST:
          return b.createdAt && a.createdAt 
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : 0;
        case SortOption.NAME_ASC:
          return a.name.localeCompare(b.name);
        case SortOption.NAME_DESC:
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      const result = await createProject({
        name: newProject.name,
        description: newProject.description,
      });
      
      if (result) {
        console.log('Yeni proje oluşturuldu:', result);
        
        const projectId = result.id;
        console.log('Proje ID:', projectId);
        
        setOpenDialog(false);
        setNewProject({ name: '', description: '' });
        setSnackbar({ 
          open: true, 
          message: 'Proje başarıyla oluşturuldu!', 
          severity: 'success' 
        });
        
        // Proje oluşturulduktan sonra otomatik olarak yeni projeye yönlendir
        if (projectId) {
          setTimeout(() => {
            navigate(`/projects/${projectId}`);
          }, 1000);
        } else {
          console.error('Proje oluşturuldu ancak ID bulunamadı:', result);
        }
      }
    } catch (err) {
      console.error('Proje oluşturulurken hata oluştu:', err);
      setSnackbar({ 
        open: true, 
        message: 'Proje oluşturulurken bir hata oluştu.', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, projectId: string) => {
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      projectId
    });
  };

  const handleCloseMenu = () => {
    setContextMenu(null);
  };

  const handleDeleteProject = async () => {
    if (!confirmDelete.projectId) return;
    
    try {
      setConfirmDelete({...confirmDelete, isDeleting: true });
      setLoading(true);
      
      console.log('Proje silme işlemi başlatılıyor, ID:', confirmDelete.projectId);
      
      try {
        const result = await deleteProject(confirmDelete.projectId);
        console.log('Proje silme sonucu:', result);
        
        if (result) {
          // Projeleri yeniden yükle
          console.log('Projeler yeniden yükleniyor...');
          await loadProjects();
          
          setSnackbar({
            open: true,
            message: `"${confirmDelete.projectName}" projesi başarıyla silindi`,
            severity: 'success'
          });
        } else {
          setSnackbar({
            open: true,
            message: 'Proje silinemedi, lütfen tekrar deneyin',
            severity: 'error'
          });
        }
      } catch (error: any) {
        console.error('Proje silme API hatası:', error);
        
        // Token/yetkilendirme hatası değilse, sadece hata mesajı göster login'e atma
        let errorMessage = 'Proje silinirken bir hata oluştu';
        
        if (error.response?.status === 401) {
          errorMessage = 'Oturum süreniz dolmuş, lütfen tekrar giriş yapın';
          // Oturum hatası durumunda bile kullanıcıyı rahatsız etmemek için 
          // navigate('/login') çağrısını kaldırıyoruz
        }
        
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Proje silme işlemi başarısız oldu:', err);
      setSnackbar({
        open: true,
        message: 'Proje silinirken beklenmeyen bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setConfirmDelete({
        open: false,
        projectId: null,
        projectName: '',
        isDeleting: false
      });
      setLoading(false);
    }
  };

  const openDeleteConfirm = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setConfirmDelete({
        open: true,
        projectId,
        projectName: project.name
      });
    }
    handleCloseMenu();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleEditProject = async () => {
    if (!editProject.projectId || !editProject.name.trim()) {
      return;
    }
    
    try {
      setEditProject({ ...editProject, isSubmitting: true });
      setLoading(true);
      
      const result = await updateProject(editProject.projectId, {
        name: editProject.name,
        description: editProject.description
      });
      
      if (result) {
        setEditProject({
          open: false,
          projectId: null,
          name: '',
          description: '',
          isSubmitting: false
        });
        
        // Projeleri güncelleme sonrası yeniden yükle
        await loadProjects();
        
        setSnackbar({
          open: true,
          message: 'Proje başarıyla güncellendi!',
          severity: 'success'
        });
      }
    } catch (err) {
      console.error('Proje güncellenirken hata oluştu:', err);
      setSnackbar({
        open: true,
        message: 'Proje güncellenirken bir hata oluştu.',
        severity: 'error'
      });
      setEditProject({ ...editProject, isSubmitting: false });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setEditProject({
        open: true,
        projectId: project.id,
        name: project.name,
        description: project.description || '',
        isSubmitting: false
      });
    }
    handleCloseMenu();
  };

  // Projeye katılma
  const handleJoinProject = async () => {
    if (!shareCode.trim()) return;
    
    try {
      setJoiningProject(true);
      
      const joinedProject = await joinProject(shareCode);
      
      if (joinedProject) {
        setSnackbar({
          open: true,
          message: `${joinedProject.name} projesine başarıyla katıldınız`,
          severity: 'success'
        });
        
        setShareCode('');
        navigate(`/projects/${joinedProject.id}`);
      } else {
        setSnackbar({
          open: true,
          message: 'Projeye katılırken bir hata oluştu',
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Projeye katılırken hata oluştu:', error);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Projeye katılırken bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setJoiningProject(false);
    }
  };

  // Hover kartı için fonksiyonlar
  const handleHoverOpen = (event: React.MouseEvent<HTMLElement>, projectId: string) => {
    setHoverInfo({
      open: true,
      anchorEl: event.currentTarget,
      projectId
    });
  };

  const handleHoverClose = () => {
    setHoverInfo({
      open: false,
      anchorEl: null,
      projectId: null
    });
  };

  // Projenin durumunu belirleyen yardımcı fonksiyon
  const getProjectStatus = (project: Project): ProjectStatus => {
    if (!project.tasks || project.tasks.length === 0) {
      return ProjectStatus.ACTIVE;
    }
    
    const completedTasks = project.tasks.filter(t => t.status === 'tamamlandi').length;
    const totalTasks = project.tasks.length;
    
    if (completedTasks === totalTasks) {
      return ProjectStatus.COMPLETED;
    }
    
    return ProjectStatus.ACTIVE;
  };

  // Tarih formatı için yardımcı fonksiyon
  const formatDate = (date?: string | Date) => {
    if (!date) return 'Tarih bilgisi yok';
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <></>;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Box 
        sx={{ 
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          mb: 4,
          py: 5,
          px: { xs: 3, md: 5 },
          backgroundImage: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(187, 134, 252, 0.12) 100%)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          border: '1px solid rgba(156, 39, 176, 0.1)'
        }}
      >
        {/* Decorative Elements */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: '-20px', 
          right: '-20px', 
          width: '160px', 
          height: '160px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(156, 39, 176, 0.05)',
          zIndex: 0
        }} />
        <Box sx={{ 
          position: 'absolute', 
          top: '20px', 
          right: '40%', 
          width: '80px', 
          height: '80px', 
          borderRadius: '50%', 
          backgroundColor: 'rgba(156, 39, 176, 0.03)',
          zIndex: 0
        }} />
        
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700, 
              mb: 2,
              background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            Projelerim
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            sx={{ 
              maxWidth: '700px',
              mb: 3,
              color: 'text.secondary'
            }}
          >
            Tüm projelerinizi görüntüleyin, düzenleyin ve yönetin. Yeni projeler oluşturabilir veya arkadaşlarınızın projelerine katılabilirsiniz.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {/* Proje Oluştur Butonu */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/projects/create')}
              sx={{ 
                borderRadius: '8px',
                padding: '10px 20px',
                background: 'linear-gradient(to right, #9c27b0, #b52cc1)',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.25)',
                fontWeight: 600,
                letterSpacing: '0.3px',
                '& .MuiButton-startIcon': {
                  marginRight: '8px',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
                },
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(to right, #8e24aa, #a020c0)',
                  boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                  transform: 'translateY(-2px)',
                  filter: 'brightness(110%)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)',
                }
              }}
            >
              Yeni Proje Oluştur
            </Button>
            
            {/* Projeye Katıl Butonu */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ShareIcon />}
              onClick={() => setOpenJoinDialog(true)}
              sx={{ 
                borderRadius: '8px',
                padding: '10px 20px',
                borderColor: '#9c27b0',
                borderWidth: '1.5px',
                color: '#9c27b0',
                fontWeight: 600,
                letterSpacing: '0.3px',
                '& .MuiButton-startIcon': {
                  marginRight: '8px',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem',
                },
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.04)',
                  borderColor: '#8e24aa',
                  color: '#8e24aa',
                  boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(1px)',
                  boxShadow: 'none',
                }
              }}
            >
              Projeye Katıl
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filtreleme ve Sıralama Bölümü */}
      {projects.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 auto', maxWidth: '600px' }}>
            <Tabs 
              value={filterTabValue} 
              onChange={handleFilterChange}
              sx={{
                '& .MuiTab-root': {
                  minHeight: '48px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  py: 1,
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: 'primary.main'
                  },
                  '&:hover': {
                    color: 'primary.main',
                    opacity: 0.8,
                    backgroundColor: 'rgba(156, 39, 176, 0.04)'
                  }
                },
                '& .MuiTabs-indicator': {
                  height: 4,
                  borderRadius: '2px',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }
              }}
            >
              <Tab 
                label="Tüm Projeler" 
                icon={<FilterListIcon sx={{ fontSize: '1.2rem', mb: '0 !important', mr: 1 }} />}
                iconPosition="start"
              />
              <Tab 
                label="Aktif Projeler" 
                icon={<div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                  <span style={{ width: 10, height: 10, backgroundColor: '#9c27b0', borderRadius: '50%', marginRight: 6 }}></span>
                </div>}
                iconPosition="start"
              />
              <Tab 
                label="Tamamlanan Projeler" 
                icon={<div style={{ display: 'flex', alignItems: 'center', marginRight: 8 }}>
                  <span style={{ width: 10, height: 10, backgroundColor: '#4caf50', borderRadius: '50%', marginRight: 6 }}></span>
                </div>}
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          {/* Sıralama Dropdown */}
          <FormControl 
            size="medium" 
            sx={{ 
              minWidth: 230, 
              flex: '0 0 auto',
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }
              }
            }}
          >
            <InputLabel id="sort-projects-label" sx={{ display: 'flex', alignItems: 'center' }}>
              <SortIcon sx={{ mr: 1, fontSize: '1.2rem' }} /> Sıralama
            </InputLabel>
            <Select
              labelId="sort-projects-label"
              value={sortOption}
              label="Sıralama"
              onChange={handleSortChange}
              sx={{
                '& .MuiSelect-select': {
                  display: 'flex',
                  alignItems: 'center',
                  py: 1.5,
                  pl: 2
                },
                '& .MuiMenuItem-root': {
                  py: 1.5
                }
              }}
            >
              <MenuItem value={SortOption.NEWEST}>En Yeni</MenuItem>
              <MenuItem value={SortOption.OLDEST}>En Eski</MenuItem>
              <MenuItem value={SortOption.NAME_ASC}>İsim (A-Z)</MenuItem>
              <MenuItem value={SortOption.NAME_DESC}>İsim (Z-A)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {projects.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8
          }}
        >
          <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Henüz projeniz bulunmamaktadır
          </Typography>
          <Typography color="text.secondary" align="center" sx={{ maxWidth: 500, mb: 3 }}>
            Yeni bir proje oluşturarak görevlerinizi düzenlemeye başlayabilirsiniz.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/projects/create')}
            sx={{ 
              borderRadius: '8px',
              padding: '10px 20px',
              background: 'linear-gradient(to right, #9c27b0, #b52cc1)',
              boxShadow: '0 2px 6px rgba(156, 39, 176, 0.25)',
              fontWeight: 600,
              letterSpacing: '0.3px',
              '& .MuiButton-startIcon': {
                marginRight: '8px',
              },
              '& .MuiSvgIcon-root': {
                fontSize: '1.2rem',
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'linear-gradient(to right, #8e24aa, #a020c0)',
                boxShadow: '0 4px 12px rgba(156, 39, 176, 0.4)',
                transform: 'translateY(-2px)',
                filter: 'brightness(110%)'
              },
              '&:active': {
                transform: 'translateY(1px)',
                boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)',
              }
            }}
          >
            İlk Projeni Oluştur
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: { xs: 2, sm: 3, md: 4 } }}>
          {filteredAndSortedProjects.map((project) => (
            <Box 
              key={project.id}
              sx={{ width: '100%' }}
              onMouseEnter={(e) => handleHoverOpen(e, project.id)}
              onMouseLeave={handleHoverClose}
            >
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid rgba(0,0,0,0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  backgroundColor: 'background.paper',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.03)',
                    boxShadow: '0 12px 24px rgba(156, 39, 176, 0.25)',
                    borderColor: 'primary.main',
                    '& .card-highlight': {
                      height: '6px',
                      opacity: 1
                    }
                  }
                }}
              >
                {/* Header background decoration */}
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '80px',
                    background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(187, 134, 252, 0.05) 100%)',
                    zIndex: 0
                  }}
                />
                
                {/* Project icon */}
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: 18,
                    left: 20,
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #9c27b0 0%, #bb86fc 100%)',
                    color: 'white',
                    boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)',
                    zIndex: 1
                  }}
                >
                  <FolderIcon />
                </Box>
                
                {/* Border highlight overlay */}
                <Box 
                  className="card-highlight"
                  sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #9c27b0, #bb86fc)',
                    opacity: 0,
                    transition: 'all 0.3s ease'
                  }}
                />
                <IconButton
                  sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)'
                    }
                  }}
                  onClick={(e) => handleOpenMenu(e, project.id)}
                >
                  <MoreVertIcon fontSize="small" sx={{ color: '#9c27b0' }} />
                </IconButton>
                <CardContent 
                  onClick={(e) => {
                    // Menü düğmesine tıklandıysa yönlendirmeyi engelle
                    if ((e.target as Element).closest('button')) {
                      return;
                    }
                    navigate(`/projects/${project.id}`)
                  }}
                  sx={{ 
                    pt: 3, pb: 2, px: 3,
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    zIndex: 1,
                    mt: '40px'
                  }}
                >
                  {/* Proje Durumu / Etiketi */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    {(() => {
                      // Bu kısımda tamamlanma durumunu doğrudan hesaplayalım
                      let isCompleted = false;
                      let activeTasksCount = 0;
                      let completedTasksCount = 0;
                      let totalTasksCount = 0;
                      
                      if (project.tasks && project.tasks.length > 0) {
                        totalTasksCount = project.tasks.length;
                        completedTasksCount = project.tasks.filter(t => t.status === 'tamamlandi').length;
                        activeTasksCount = totalTasksCount - completedTasksCount;
                        isCompleted = activeTasksCount === 0;
                        
                        console.log(`Proje kartı: ${project.name}, Tamamlanan: ${completedTasksCount}, Toplam: ${totalTasksCount}, Aktif: ${activeTasksCount}, Tamamlandı mı: ${isCompleted}`);
                      }
                      
                      return (
                        <Chip 
                          label={isCompleted ? "Tamamlandı" : "Aktif"} 
                          size="small"
                          color={isCompleted ? "success" : "primary"}
                          sx={{ 
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: '22px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                      );
                    })()}
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    noWrap
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      position: 'relative',
                      mb: 1
                    }}
                  >
                    {project.name}
                  </Typography>
                  
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      mb: 3, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      fontSize: '0.875rem'
                    }}
                  >
                    {project.description}
                  </Typography>
                  
                  {/* Durum Göstergeleri */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mb: 2, 
                    flexWrap: 'wrap',
                    justifyContent: 'space-between'
                  }}>
                    {/* Görev durumları */}
                    {project.tasks && project.tasks.length > 0 && (
                      <>
                        <Tooltip title="Bekleyen Görevler" arrow>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${project.tasks.filter(t => t.status === 'beklemede').length} beklemede`}
                            sx={{ 
                              borderColor: 'warning.light', 
                              color: 'warning.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Yapılmakta Olan Görevler" arrow>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${project.tasks.filter(t => t.status === 'yapiliyor').length} yapılıyor`}
                            sx={{ 
                              borderColor: 'info.light', 
                              color: 'info.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Tooltip>
                        <Tooltip title="Tamamlanmış Görevler" arrow>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={`${project.tasks.filter(t => t.status === 'tamamlandi').length} tamamlandı`}
                            sx={{ 
                              borderColor: 'success.light', 
                              color: 'success.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Tooltip>
                      </>
                    )}
                  </Box>
                  
                  {/* Görev Tamamlanma Durumu */}
                  {project.tasks && project.tasks.length > 0 && (
                    <Box sx={{ mt: 'auto', mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          Görev İlerlemesi
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                          px: 1.5, 
                          py: 0.5, 
                          borderRadius: 2,
                          border: '1px solid rgba(76, 175, 80, 0.2)'
                        }}>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {project.tasks.filter(t => t.status === 'tamamlandi').length}/{project.tasks.length}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ 
                        width: '100%', 
                        height: '10px', 
                        bgcolor: 'rgba(0,0,0,0.06)', 
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <Box sx={{ 
                          width: `${project.tasks && project.tasks.length > 0 ? (project.tasks.filter(t => t.status === 'tamamlandi').length / project.tasks.length) * 100 : 0}%`, 
                          height: '100%',
                          borderRadius: '10px',
                          background: 'linear-gradient(90deg, #4caf50, #8bc34a)',
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                          minWidth: '0%',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(rgba(255,255,255,0.2), rgba(255,255,255,0.4))',
                          }
                        }} />
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                    mt: 'auto',
                    pt: 1,
                    borderTop: '1px solid rgba(0,0,0,0.06)'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <span role="img" aria-label="tasks" style={{ marginRight: '4px' }}>📌</span>
                        {project.tasks?.length || 0} görev
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <span role="img" aria-label="participants" style={{ marginRight: '4px' }}>👥</span>
                        {(project.participants?.length || 0) + 1} kişi
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Tooltip title={project.updatedAt || project.createdAt 
                        ? `Son güncelleme: ${new Date(project.updatedAt || project.createdAt || new Date()).toLocaleString('tr-TR')}`
                        : `Tarih bilgisi yok`} arrow>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                          <AccessTimeIcon sx={{ fontSize: '0.875rem', mr: 0.5 }} />
                          {project.updatedAt || project.createdAt 
                            ? new Date(project.updatedAt || project.createdAt || new Date()).toLocaleDateString('tr-TR')
                            : 'Tarih bilgisi yok'}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
              
              {/* Proje Bilgisi Hover Kartı */}
              <Popper
                open={hoverInfo.open && hoverInfo.projectId === project.id}
                anchorEl={hoverInfo.anchorEl}
                placement="right-start"
                transition
                disablePortal
                style={{ zIndex: 1300 }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={350}>
                    <Paper 
                      elevation={8}
                      sx={{
                        p: 2,
                        width: 320,
                        borderRadius: 2,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(156, 39, 176, 0.2)',
                        overflow: 'hidden',
                        mt: 1,
                        ml: 2
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mb: 1.5, 
                          color: '#000000',
                          fontWeight: 800,
                          borderBottom: '2px solid rgba(156, 39, 176, 0.2)',
                          pb: 1
                        }}
                      >
                        Proje Detayları
                      </Typography>
                      
                      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#000000" fontWeight={700}>
                          Durum:
                        </Typography>
                        <Chip 
                          label={getProjectStatus(project) === ProjectStatus.COMPLETED ? "Tamamlandı" : "Devam Ediyor"} 
                          size="small"
                          sx={{
                            fontWeight: 800,
                            bgcolor: getProjectStatus(project) === ProjectStatus.COMPLETED ? '#e8f5e9' : '#fff8e1',
                            color: getProjectStatus(project) === ProjectStatus.COMPLETED ? '#1b5e20' : '#e65100',
                            border: `1px solid ${getProjectStatus(project) === ProjectStatus.COMPLETED ? '#81c784' : '#ffb74d'}`
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#000000" fontWeight={700}>
                          Oluşturulma:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#000000">
                          {formatDate(project.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#000000" fontWeight={700}>
                          Son Güncelleme:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#000000">
                          {formatDate(project.updatedAt || project.createdAt)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#000000" fontWeight={700}>
                          Görevler:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} color="#000000">
                          {project.tasks?.filter(t => t.status === 'tamamlandi').length || 0} / {project.tasks?.length || 0} tamamlandı
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}`);
                          }}
                          sx={{ 
                            textTransform: 'none', 
                            fontWeight: 700,
                            backgroundColor: '#9c27b0',
                            '&:hover': {
                              backgroundColor: '#7b1fa2'
                            }
                          }}
                        >
                          Detaylar için projeye tıklayın
                        </Button>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          ))}
        </Box>
      )}

      {/* Context Menü */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem
          dense
          onClick={() => {
            if (contextMenu?.projectId) {
              openEditDialog(contextMenu.projectId);
            }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Düzenle
        </MenuItem>
        <Divider />
        <MenuItem 
          dense
          onClick={() => contextMenu?.projectId && openDeleteConfirm(contextMenu.projectId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>

      {/* Yeni Proje Dialogu */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Yeni Proje Oluştur</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Proje Adı"
            fullWidth
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={4}
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!newProject.name.trim()}
            sx={{ 
              background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
              boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #8e24aa 30%, #a66eed 90%)',
                boxShadow: '0 4px 8px 2px rgba(156, 39, 176, .4)'
              },
              '&.Mui-disabled': {
                background: 'rgba(156, 39, 176, 0.3)',
              }
            }}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>

      {/* Proje Düzenleme Dialogu */}
      <Dialog
        open={editProject.open} 
        onClose={() => !editProject.isSubmitting && setEditProject({...editProject, open: false})}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Projeyi Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Proje Adı"
            fullWidth
            value={editProject.name}
            onChange={(e) =>
              setEditProject({ ...editProject, name: e.target.value })
            }
            disabled={editProject.isSubmitting}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={4}
            value={editProject.description}
            onChange={(e) =>
              setEditProject({ ...editProject, description: e.target.value })
            }
            disabled={editProject.isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setEditProject({...editProject, open: false})}
            disabled={editProject.isSubmitting}
          >
            İptal
          </Button>
          <Button 
            onClick={handleEditProject} 
            variant="contained"
            disabled={!editProject.name.trim() || editProject.isSubmitting}
            startIcon={editProject.isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {editProject.isSubmitting ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialogu */}
      <ConfirmDialog
        open={confirmDelete.open}
        onClose={() => !confirmDelete.isDeleting && setConfirmDelete({...confirmDelete, open: false})}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Projeyi silmek istediğinizden emin misiniz?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <strong>"{confirmDelete.projectName}"</strong> projesini silmek üzeresiniz. 
            Bu işlem geri alınamaz ve projeye ait tüm görevler de silinecektir.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDelete({...confirmDelete, open: false})} 
            color="primary"
            disabled={confirmDelete.isDeleting}
          >
            İptal
          </Button>
          <Button 
            onClick={handleDeleteProject} 
            color="error" 
            variant="contained" 
            autoFocus
            disabled={confirmDelete.isDeleting}
            startIcon={confirmDelete.isDeleting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {confirmDelete.isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </ConfirmDialog>

      {/* Projeye Katılma Dialogu */}
      <Dialog 
        open={openJoinDialog} 
        onClose={() => setOpenJoinDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Projeye Katıl</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Katılmak istediğiniz projenin paylaşım kodunu girin.
          </Typography>
          <TextField
            fullWidth
            label="Paylaşım Kodu"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={handleJoinProject} 
            disabled={!shareCode.trim() || joiningProject}
          >
            {joiningProject ? 'Katılınıyor...' : 'Katıl'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProjectsPage; 