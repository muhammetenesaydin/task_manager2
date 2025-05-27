import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  ListItemAvatar,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useDraggable } from '@dnd-kit/core';
import { normalizeId } from '../utils/dataUtils';
import { Task } from '../types';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LinkIcon from '@mui/icons-material/Link';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useTaskContext } from '../context/TaskContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import { useAuth } from '../context/AuthContext';

interface TodoProps {
  task: Task;
  onEdit: (updatedTask: Task) => void;
  onDelete: (taskId: string) => Promise<boolean>;
  isOwner?: boolean;
  isAdmin?: boolean;
  projectUsers?: Array<{id: string, name: string, email: string}>;
}

// Öncelik renkleri
const getPriorityColor = (priority: string | undefined) => {
  switch (priority) {
    case 'yüksek':
      return '#d32f2f'; // Koyu kırmızı
    case 'normal':
      return '#1976d2'; // Mavi
    case 'düşük':
      return '#388e3c'; // Yeşil
    default:
      return '#757575'; // Gri
  }
};

// Öncelik adı
const getPriorityLabel = (priority: string | undefined) => {
  if (!priority) return null;
  return priority.charAt(0).toUpperCase() + priority.slice(1);
};

// Kullanıcı adını güvenli şekilde al ve formatlı halde döndür
const getUserName = (user: any) => {
  if (!user) return 'Kullanıcı';
  
  // Eğer kullanıcı bir string ise (ID ise), kısa bir tanımlayıcı kullan
  if (typeof user === 'string') {
    return `Kullanıcı ${user.substr(0, 4)}`;
  }
  
  // Kullanıcı bir obje ise ve hash'li parolası varsa düzelt
  if (typeof user === 'object') {
    if (user.name && typeof user.name === 'string') {
      // Hash'li ad içeriyorsa temizle
      if (user.name.includes('$2a$')) {
        return `Kullanıcı ${(user.id || user._id || '').substr(0, 4)}`;
      }
      return user.name; // Normal adı döndür
    }
    return `Kullanıcı ${(user.id || user._id || '').substr(0, 4)}`;
  }
  
  return 'Kullanıcı';
};

// Kullanıcı profil fotoğrafı URL'sini al
const getUserProfileImage = (user: any) => {
  if (!user) return null;
  
  // Kullanıcı bir obje ise ve profilePhoto alanı varsa onu döndür
  if (typeof user === 'object') {
    return user.profilePhoto || user.avatar || user.image || null;
  }
  
  return null;
};

// Kullanıcı için rastgele renk oluştur (id veya name'e göre)
const getUserColor = (user: any) => {
  const colors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#0288d1', '#689f38'];
  
  if (!user) return colors[0];
  
  let id: string;
  
  if (typeof user === 'string') {
    id = user;
  } else if (typeof user === 'object') {
    id = user.id || user._id || user.name || '';
  } else {
    id = '';
  }
  
  // Hash kodu oluştur
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % colors.length;
  }
  
  return colors[hash];
};

const Todo: React.FC<TodoProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  isOwner = false, 
  isAdmin = false,
  projectUsers = []
}) => {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });
  
  // İşlem durumunu izleyen state'ler
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  
  // ÜÇ NOKTA MENÜSÜ İÇİN STATE VE REFERANS
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);
  
  // MongoDB'den gelen görevlerden ID alanını normalleştir
  const taskId = normalizeId(task);
  
  // Sürükleme için kullanılacak task verisini hazırla ve kullanıcı adlarını düzelt
  const draggableTask = React.useMemo(() => {
    if (!task) return task;
    
    // Derin kopya oluştur
    const modifiedTask = JSON.parse(JSON.stringify(task));
    
    // Kullanıcı adlarını düzelt
    if (modifiedTask.assignedTo && Array.isArray(modifiedTask.assignedTo)) {
      modifiedTask.assignedTo = modifiedTask.assignedTo.map((assignee: any) => {
        if (!assignee || !assignee.user) return assignee;
        
        const sanitizedAssignee = {...assignee};
        
        // Kullanıcı nesnesini düzelt
        if (typeof assignee.user === 'object') {
          if (assignee.user.name && assignee.user.name.includes('$2a$')) {
            sanitizedAssignee.user = {
              ...assignee.user,
              name: 'Kullanıcı' + (assignee.user.id ? ` ${assignee.user.id.substr(0, 4)}` : '')
            };
          }
        }
        
        return sanitizedAssignee;
      });
    }
    
    return modifiedTask;
  }, [task]);
  
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: taskId,
    data: { task: draggableTask }
  });

  const { user } = useAuth();
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [assignLoading, setAssignLoading] = useState(false);

  // Menü açma ve kapama işleyicileri
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    // Gereksiz logları kaldıralım
    
    // Olay yayılmasını engelle
    event.preventDefault();
    event.stopPropagation(); 
    
    // Menü açmak için anchor element'i ayarla
    setMenuAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Düzenleme ve silme fonksiyonlarını basitleştirelim
  const handleEditClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation(); // Tıklama olayının yayılmasını engelle
    }
    
    handleMenuClose(); // Menüyü kapat
    
    // Eğer zaten yükleme devam ediyorsa, çık
    if (isEditLoading) return;
    
    // Görsel geribildirim için yüklenme durumunu aç
    setIsEditLoading(true);
    
    // Düzenleme için task verilerini hazırla
    setEditedTask({ ...task });
    
    // Dialog'u aç (kısa bir gecikmeyle işlem başladığı belli olsun)
    setTimeout(() => {
      setOpenEditDialog(true);
      setIsEditLoading(false);
    }, 100);
  };

  const handleDeleteClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation(); // Tıklama olayının yayılmasını engelle
    }
    
    handleMenuClose(); // Menüyü kapat
    
    // Eğer zaten yükleme devam ediyorsa, çık
    if (isDeleteLoading) return;
    
    // Görsel geribildirim için yüklenme durumunu aç
    setIsDeleteLoading(true);
    
    // Dialog'u aç (kısa bir gecikmeyle işlem başladığı belli olsun)
    setTimeout(() => {
      setOpenDeleteDialog(true);
      setIsDeleteLoading(false);
    }, 100);
  };

  const handleSaveEdit = () => {
    // Anında görsel geri bildirim için snackbarı göster
    setSnackbar({
      open: true,
      message: 'Değişiklikler kaydediliyor...',
      severity: 'info'
    });
    
    // UI'ı kilitleme
    setIsEditLoading(true);
    
    // Dialog'u kapat
    setOpenEditDialog(false);
    
    // Kısa bir bekleme ile görevi güncelle
    setTimeout(() => {
      // Görevi güncelle
      onEdit(editedTask);
      
      // İşlemi tamamla
      setIsEditLoading(false);
    }, 100);
  };

  const handleConfirmDelete = async () => {
    // Dialogu kapat
    setOpenDeleteDialog(false);
    
    // Görev ID kontrolü
    if (!taskId) {
      console.error('Görev ID bulunamadı');
      setSnackbar({
        open: true,
        message: 'Görev ID bulunamadı!',
        severity: 'error'
      });
      return;
    }
    
    // UI geribildirim için durumu güncelle
    setIsDeleteLoading(true);
    setIsDeleting(true);
    
    // Görsel geribildirim için snackbarı göster
    setSnackbar({
      open: true,
      message: 'Görev siliniyor...',
      severity: 'info'
    });
    
    console.log('Todo - Silme işlemi başlatılıyor, ID:', taskId);
    
    try {
      console.log('Todo - onDelete fonksiyonu çağrılıyor...');
      const result = await onDelete(taskId);
      console.log('Todo - Silme işlemi sonucu:', result);
      
      if (result) {
        // Başarılı silme
        console.log('Todo - Görev başarıyla silindi');
        setSnackbar({
          open: true,
          message: 'Görev başarıyla silindi!',
          severity: 'success'
        });
      } else {
        // Başarısız silme
        console.error('Todo - Görev silinemedi');
        setIsDeleting(false);
        setSnackbar({
          open: true,
          message: 'Görev silinirken bir hata oluştu!',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Todo - Silme işlemi sırasında hata:', error);
      setIsDeleting(false);
      setSnackbar({
        open: true,
        message: `Silme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        severity: 'error'
      });
    } finally {
      // İşlem tamamlandığında loading durumunu kapat
      setIsDeleteLoading(false);
      console.log('Todo - Silme işlemi tamamlandı (başarılı veya başarısız)');
    }
  };

  // Snackbar kapatma fonksiyonu
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999
  } : undefined;

  // Görevin durumuna göre renk belirleme
  const getStatusColor = () => {
    switch (task.status) {
      case 'yapiliyor':
        return '#f44336';
      case 'beklemede':
        return '#ffeb3b';
      case 'tamamlandi':
        return '#4caf50';
      default:
        return '#e0e0e0';
    }
  };

  const [openResourceDialog, setOpenResourceDialog] = useState(false);
  const [resourceData, setResourceData] = useState({
    type: 'link' as 'link' | 'file',
    url: '',
    description: ''
  });

  // Context'ten kaynak ekleme/silme fonksiyonlarını al
  const { addTaskResource, removeTaskResource } = useTaskContext();
  
  // Kaynak ekleme iletişim kutusunu açma
  const handleAddResourceClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation(); // Tıklama olayının yayılmasını engelle
    }
    
    handleMenuClose(); // Menüyü kapat
    setOpenResourceDialog(true);
  };

  // Kaynak ekleme
  const handleAddResource = async () => {
    // URL kontrolü
    if (!resourceData.url.trim()) {
      setSnackbar({
        open: true,
        message: 'URL alanı boş olamaz',
        severity: 'error'
      });
      return;
    }
    
    try {
      const taskId = normalizeId(task);
      if (!taskId) throw new Error('Görev ID bulunamadı');
      
      const result = await addTaskResource(taskId, resourceData);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Kaynak başarıyla eklendi',
          severity: 'success'
        });
        
        // Formu sıfırla ve dialogu kapat
        setResourceData({
          type: 'link',
          url: '',
          description: ''
        });
        setOpenResourceDialog(false);
      }
    } catch (error) {
      console.error('Kaynak eklenirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kaynak eklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Kaynak silme
  const handleRemoveResource = async (resourceId: string) => {
    try {
      const taskId = normalizeId(task);
      if (!taskId) throw new Error('Görev ID bulunamadı');
      
      const result = await removeTaskResource(taskId, resourceId);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Kaynak başarıyla silindi',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Kaynak silinirken hata oluştu:', error);
      setSnackbar({
        open: true,
        message: 'Kaynak silinirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  // Kullanıcı atama menü öğesi için işleyici
  const handleAssignClick = (event?: React.MouseEvent<HTMLElement>) => {
    if (event) {
      event.stopPropagation();
    }
    
    handleMenuClose();
    setOpenAssignDialog(true);
  };
  
  // Kullanıcı atama işlemini gerçekleştir
  const handleAssignTask = () => {
    if (!selectedUserId) {
      setSnackbar({
        open: true,
        message: 'Lütfen bir kullanıcı seçin',
        severity: 'warning'
      });
      return;
    }
    
    setAssignLoading(true);
    
    // Seçilen kullanıcıyı bul
    const selectedUser = projectUsers.find(u => u.id === selectedUserId);
    
    if (!selectedUser) {
      setSnackbar({
        open: true,
        message: 'Seçilen kullanıcı bulunamadı',
        severity: 'error'
      });
      setAssignLoading(false);
      return;
    }
    
    // Eğer kullanıcı zaten atanmışsa ekleme
    const isAlreadyAssigned = task.assignedTo?.some(
      assignee => assignee.user.id === selectedUserId
    );
    
    if (isAlreadyAssigned) {
      setSnackbar({
        open: true,
        message: 'Bu kullanıcı zaten göreve atanmış',
        severity: 'warning'
      });
      setAssignLoading(false);
      return;
    }
    
    // Task'ı güncelle
    const updatedAssignments = [...(task.assignedTo || []), {
      user: {
        id: selectedUser.id,
        name: selectedUser.name || selectedUser.email // Email'i de alternatif olarak kullan
      },
      assignedAt: new Date(),
      completed: false
    }];
    
    const updatedTask = {
      ...task,
      assignedTo: updatedAssignments
    };
    
    // Dialog'u kapat
    setOpenAssignDialog(false);
    
    // Task'ı güncelle
    onEdit(updatedTask);
    
    // Bildirim göster
    setSnackbar({
      open: true,
      message: `Görev ${selectedUser.name || selectedUser.email} kullanıcısına atandı`,
      severity: 'success'
    });
    
    // Yükleme durumunu kapat
    setAssignLoading(false);
    
    // Seçilen kullanıcıyı sıfırla
    setSelectedUserId('');
  };
  
  // Atamayı kaldır
  const handleRemoveAssignment = (assigneeId: string) => {
    // Atanan kullanıcıları filtrele
    const updatedAssignments = task.assignedTo?.filter(
      assignee => assignee.user.id !== assigneeId
    ) || [];
    
    // Task'ı güncelle
    const updatedTask = {
      ...task,
      assignedTo: updatedAssignments
    };
    
    // Task'ı güncelle
    onEdit(updatedTask);
    
    // Bildirim göster
    setSnackbar({
      open: true,
      message: 'Kullanıcı görevden çıkarıldı',
      severity: 'success'
    });
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        position: 'relative',
        zIndex: 0
      }} 
      {...listeners} 
      {...attributes}
    >
      <Card 
        variant="outlined" 
        sx={{ 
          mb: 2, 
          position: 'relative',
          borderLeft: '4px solid',
          borderLeftColor: getStatusColor(),
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        {/* Menü butonu için ayrı bir container */}
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 9999,
            pointerEvents: 'auto', // Tıklamaları her zaman yakala
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMenuClick(e);
          }}
        >
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: '#f0f0f0',
                transform: 'scale(1.05)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.25)'
              },
              '&:active': {
                backgroundColor: '#e0e0e0',
                transform: 'scale(0.95)'
              }
            }}
          >
            <MoreVertIcon fontSize="small" sx={{ color: '#555' }} />
          </IconButton>
        </Box>

        <CardContent sx={{ pt: 1, pr: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="h6" component="h3" gutterBottom>
              {task.title}
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description}
          </Typography>
          
          {/* Öncelik varsa göster */}
          {task.priority && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <Chip 
                label={getPriorityLabel(task.priority)} 
                size="small"
                sx={{ 
                  bgcolor: getPriorityColor(task.priority),
                  color: 'white',
                }}
              />
            </Box>
          )}
          
          {/* Etiketler varsa göster */}
          {task.tags && task.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 1, gap: 0.5 }}>
              {task.tags.map((tag, index) => (
                <Chip 
                  key={`tag-${taskId}-${index}`} 
                  label={tag} 
                  size="small" 
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          
          {task.deadline && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {new Date(task.deadline).toLocaleDateString('tr-TR')}
              </Typography>
            </Box>
          )}
          
          {/* Eğer atanmış kullanıcılar varsa göster */}
          {task.assignedTo && task.assignedTo.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
              {task.assignedTo.map((assignee, index) => (
                <Chip 
                  key={`assignee-${taskId}-${index}`}
                  avatar={
                    <Avatar 
                      src={getUserProfileImage(assignee.user)}
                      sx={{ 
                        bgcolor: getUserColor(assignee.user),
                        color: 'white',
                      }}
                    >
                      {getUserName(assignee.user)[0] || 'U'}
                    </Avatar>
                  }
                  label={getUserName(assignee.user)}
                  size="small"
                  variant="outlined"
                  onDelete={
                    (user?.id === task.owner || isOwner || isAdmin) ?
                    () => handleRemoveAssignment(assignee.user.id) : 
                    undefined
                  }
                />
              ))}
            </Box>
          )}

          {/* Kaynaklar varsa göster */}
          {task.resources && task.resources.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Kaynaklar
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {task.resources.map((resource) => (
                  <Box 
                    key={resource.url}
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1
                    }}
                  >
                    {resource.type === 'link' ? (
                      <LinkIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    ) : (
                      <AttachFileIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="body2" 
                        component="a" 
                        href={resource.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ 
                          color: 'primary.main',
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        {resource.description || resource.url}
                      </Typography>
                      {resource.description && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {resource.url}
                        </Typography>
                      )}
                    </Box>
                    {isOwner && (
                      <IconButton 
                        size="small" 
                        onClick={() => handleRemoveResource(resource._id || '')}
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </CardContent>
        
        <CardActions>
          <Typography variant="caption" color="text.secondary">
            {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('tr-TR') : ''}
          </Typography>
        </CardActions>
      </Card>

      {/* Menü bileşeni */}
      <Menu
        id={`task-menu-${taskId}`}
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              zIndex: 99999,
              minWidth: 180,
            }
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        disablePortal={false}
        // Menüyü daha güvenilir hale getirmek için ek özellikler
        keepMounted
        disableAutoFocusItem
        MenuListProps={{
          'aria-labelledby': `task-menu-${taskId}`,
          onMouseLeave: handleMenuClose
        }}
      >
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick();
          }} 
          disabled={isEditLoading}
          sx={{ 
            py: 1.5, 
            '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
          }}
        >
          <EditIcon fontSize="small" sx={{ mr: 1, color: '#2196f3' }} />
          {isEditLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2">Düzenleniyor...</Typography>
            </Box>
          ) : (
            <Typography variant="body2">Düzenle</Typography>
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleAddResourceClick();
          }}
          sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.04)' } }}
        >
          <AttachFileIcon fontSize="small" sx={{ mr: 1, color: '#4caf50' }} />
          <Typography variant="body2">Kaynak Ekle</Typography>
        </MenuItem>
        
        {/* Kullanıcı atama menü öğesi - Admin veya owner ise göster */}
        {(isAdmin || isOwner) && (
          <MenuItem 
            onClick={(e) => {
              e.stopPropagation();
              handleAssignClick();
            }}
            sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(156, 39, 176, 0.04)' } }}
          >
            <PersonAddIcon fontSize="small" sx={{ mr: 1, color: '#9c27b0' }} />
            <Typography variant="body2">Kullanıcı Ata</Typography>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick();
          }} 
          disabled={isDeleteLoading}
          sx={{ py: 1.5, '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.04)' } }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: '#f44336' }} />
          {isDeleteLoading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={16} sx={{ mr: 1 }} />
              <Typography variant="body2">Siliniyor...</Typography>
            </Box>
          ) : (
            <Typography variant="body2">Sil</Typography>
          )}
        </MenuItem>
      </Menu>

      {/* Düzenleme Dialogu */}
      <Dialog 
        open={openEditDialog} 
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            setOpenEditDialog(false);
          }
        }}
      >
        <DialogTitle>Görevi Düzenle</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Görev Başlığı"
            fullWidth
            value={editedTask.title}
            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Açıklama"
            fullWidth
            multiline
            rows={4}
            value={editedTask.description}
            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          {/* Öncelik Seçimi */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Öncelik
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {['düşük', 'normal', 'yüksek'].map((priority) => (
                <Chip
                  key={priority}
                  label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                  onClick={() => setEditedTask({ ...editedTask, priority: priority as any })}
                  color={editedTask.priority === priority ? 'primary' : 'default'}
                  variant={editedTask.priority === priority ? 'filled' : 'outlined'}
                  sx={{ 
                    borderColor: getPriorityColor(priority),
                    backgroundColor: editedTask.priority === priority ? getPriorityColor(priority) : 'transparent',
                    color: editedTask.priority === priority ? 'white' : getPriorityColor(priority),
                  }}
                />
              ))}
            </Box>
          </Box>
          
          {/* Son Tarih Seçimi */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Son Tarih (Opsiyonel)
            </Typography>
            <TextField
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              onChange={(e) => {
                const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                setEditedTask({ ...editedTask, deadline: selectedDate });
              }}
              value={editedTask.deadline ? new Date(editedTask.deadline).toISOString().split('T')[0] : ''}
            />
          </Box>
          
          {/* Etiket Ekleme */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Etiketler (Virgülle ayırın)
            </Typography>
            <TextField
              fullWidth
              placeholder="örn: acil, toplantı, rapor"
              value={editedTask.tags ? editedTask.tags.join(', ') : ''}
              onChange={(e) => {
                const tagsInput = e.target.value;
                const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                setEditedTask({ ...editedTask, tags: tagsArray });
              }}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
              {editedTask.tags && editedTask.tags.map((tag, index) => (
                <Chip 
                  key={`edit-tag-${taskId}-${index}`} 
                  label={tag} 
                  size="small"
                  onDelete={() => {
                    if (!editedTask.tags) return;
                    const newTags = [...editedTask.tags];
                    newTags.splice(index, 1);
                    setEditedTask({ ...editedTask, tags: newTags });
                  }}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
          <Button onClick={handleSaveEdit} variant="contained">Kaydet</Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onay Dialogu */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            setOpenDeleteDialog(false);
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '8px',
            minWidth: {
              xs: '90%',
              sm: '400px'
            }
          }
        }}
        // Arka planı karartarak daha belirgin hale getir ve tıklamaları engelle
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }
        }}
        // Kapanmayı öncelikli hale getir - doğrudan ESC veya dışarı tıklama ile kapatılabilir
        disableEscapeKeyDown={false}
        keepMounted
      >
        <DialogTitle sx={{ 
          bgcolor: '#ffebee', 
          color: '#d32f2f',
          pb: 1,
          display: 'flex',
          alignItems: 'center'
        }}>
          <DeleteIcon sx={{ mr: 1 }} /> Görevi Sil
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body1">
            <Box component="span" sx={{ fontWeight: 'bold' }}>"{task.title}"</Box> görevini silmek istediğinizden emin misiniz?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            variant="outlined"
            size="large"
            sx={{
              py: 1,
              minWidth: '100px',
              fontSize: '1rem'
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
            size="large"
            sx={{ 
              ml: 1,
              py: 1,
              minWidth: '100px',
              fontSize: '1rem'
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kaynak Ekleme Dialogu */}
      <Dialog 
        open={openResourceDialog} 
        onClose={() => setOpenResourceDialog(false)}
      >
        <DialogTitle>Kaynak Ekle</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Kaynak Türü
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<LinkIcon />}
                label="Link"
                onClick={() => setResourceData(prev => ({ ...prev, type: 'link' }))}
                color={resourceData.type === 'link' ? 'primary' : 'default'}
                variant={resourceData.type === 'link' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<AttachFileIcon />}
                label="Dosya Linki"
                onClick={() => setResourceData(prev => ({ ...prev, type: 'file' }))}
                color={resourceData.type === 'file' ? 'primary' : 'default'}
                variant={resourceData.type === 'file' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>
          
          <TextField
            margin="dense"
            label="URL"
            fullWidth
            value={resourceData.url}
            onChange={(e) => setResourceData(prev => ({ ...prev, url: e.target.value }))}
            sx={{ mb: 2, mt: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Açıklama (İsteğe Bağlı)"
            fullWidth
            value={resourceData.description}
            onChange={(e) => setResourceData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResourceDialog(false)}>İptal</Button>
          <Button 
            onClick={handleAddResource} 
            variant="contained"
            disabled={!resourceData.url.trim()}
          >
            Ekle
          </Button>
        </DialogActions>
      </Dialog>

      {/* Kullanıcı Atama Dialog */}
      <Dialog 
        open={openAssignDialog} 
        onClose={() => setOpenAssignDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Kullanıcı Ata</DialogTitle>
        <DialogContent>
          {projectUsers.length > 0 ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Bu göreve atamak istediğiniz kullanıcıyı seçin:
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="assign-user-label">Kullanıcı</InputLabel>
                <Select
                  labelId="assign-user-label"
                  value={selectedUserId}
                  label="Kullanıcı"
                  onChange={(e) => setSelectedUserId(e.target.value as string)}
                >
                  {projectUsers.map(user => (
                    <MenuItem key={user.id} value={user.id}>
                      <ListItemAvatar>
                        <Avatar>{user.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={user.name} 
                        secondary={user.email} 
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {task.assignedTo && task.assignedTo.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                    Şu anda atanmış kullanıcılar:
                  </Typography>
                  <List dense>
                    {task.assignedTo.map((assignee, index) => (
                      <ListItem 
                        key={`${assignee.user.id}-${index}`}
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" size="small"
                            onClick={() => handleRemoveAssignment(assignee.user.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar 
                            src={getUserProfileImage(assignee.user)}
                            sx={{ 
                              bgcolor: getUserColor(assignee.user),
                              color: 'white',
                            }}
                          >
                            {getUserName(assignee.user).charAt(0) || 'K'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={getUserName(assignee.user)}
                          secondary={assignee.completed ? "Tamamlandı" : "Devam Ediyor"}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Bu projede atanabilecek kullanıcı bulunamadı.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>İptal</Button>
          <Button 
            onClick={handleAssignTask} 
            variant="contained" 
            disabled={!selectedUserId || assignLoading}
            startIcon={assignLoading ? <CircularProgress size={20} /> : null}
          >
            Ata
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Todo; 