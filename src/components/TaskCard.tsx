import React, { useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar as MuiAvatar,
  LinearProgress,
  Tooltip
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FlagIcon from '@mui/icons-material/Flag';
import { Task } from '../types';
import { useTaskContext } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  projectUsers?: { id: string; name: string; email: string }[];
  onAssignUser?: (taskId: string, userId: string) => void;
  onAddFile?: (taskId: string, file: File) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onStatusChange,
  onDelete,
  onEdit,
  projectUsers = [],
  onAssignUser,
  onAddFile
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState('');
  const [fileDialogOpen, setFileDialogOpen] = React.useState(false);
  const [fileAdded, setFileAdded] = React.useState(false);
  const [viewDetailsDialogOpen, setViewDetailsDialogOpen] = React.useState(false);
  const [confirmRemoveUserId, setConfirmRemoveUserId] = React.useState<string | null>(null);
  const taskContext = useTaskContext();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus: Task['status']) => {
    if (task._id) {
      onStatusChange(task._id, newStatus);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (task._id) {
      onDelete(task._id);
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    onEdit(task);
    handleMenuClose();
  };

  // Görevi tamamla
  const handleCompleteTask = () => {
    if (task._id) {
      // İlk önce görevi tamamlandı durumuna getir
      onStatusChange(task._id, 'tamamlandi');
      
      // Eğer görevde atanmış kullanıcılar varsa, onları da tamamlandı olarak işaretle
      if (task.assignedTo && task.assignedTo.length > 0 && taskContext) {
        // Bütün kullanıcıları tamamlandı olarak işaretle
        const assignedUserPromises = task.assignedTo.map(assignee => {
          const userId = getUserId(assignee.user);
          if (userId && taskContext.assignUserToTask) {
            // Her bir atanmış kullanıcıyı tamamlandı olarak işaretle
            return taskContext.assignUserToTask(task._id as string, userId, true);
          }
          return Promise.resolve(false);
        });
        
        // Tüm kullanıcılar işaretlendikten sonra görev durumunu güncelle
        Promise.all(assignedUserPromises).then(() => {
          console.log('Tüm atanmış kullanıcılar tamamlandı olarak işaretlendi');
          
          // Görevin durumunu güncelle
          if (task.project && taskContext.updateTask) {
            taskContext.updateTask(task._id as string, { status: 'tamamlandi' })
              .then(updatedTask => {
                console.log('Görev durumu tamamlandı olarak güncellendi:', updatedTask);
                
                // Projenin güncel durumunu API'den sorgula
                try {
                  const projectContext = (window as any).projectContextRef?.current;
                  if (projectContext && typeof projectContext.getProjectStatus === 'function' && task.project) {
                    console.log(`Proje durumunu kontrol ediyorum: ${task.project}`);
                    projectContext.getProjectStatus(task.project)
                      .then((result: any) => {
                        console.log(`Proje durum kontrolü sonucu:`, result);
                      })
                      .catch((err: any) => {
                        console.error('Proje durumu kontrol edilirken hata:', err);
                      });
                  }
                } catch (err) {
                  console.error('ProjectContext erişim hatası:', err);
                }
              });
          }
        });
      } else {
        // Atanmış kullanıcı yoksa, proje durumunu kontrol et
        try {
          const projectContext = (window as any).projectContextRef?.current;
          if (projectContext && typeof projectContext.getProjectStatus === 'function' && task.project) {
            console.log(`Proje durumunu kontrol ediyorum: ${task.project}`);
            projectContext.getProjectStatus(task.project)
              .then((result: any) => {
                console.log(`Proje durum kontrolü sonucu:`, result);
              })
              .catch((err: any) => {
                console.error('Proje durumu kontrol edilirken hata:', err);
              });
          }
        } catch (err) {
          console.error('ProjectContext erişim hatası:', err);
        }
      }
    }
    handleMenuClose();
  };

  // Kullanıcı ata
  const handleAssignUser = () => {
    if (task._id && selectedUserId && onAssignUser) {
      onAssignUser(task._id as string, selectedUserId);
      setAssignDialogOpen(false);
      setSelectedUserId('');
    }
  };

  // Dosya ekle
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (task._id && e.target.files && e.target.files[0] && onAddFile) {
      onAddFile(task._id as string, e.target.files[0]);
      setFileAdded(true);
      setFileDialogOpen(false);
    }
  };

  // Kullanıcı ID'sini güvenli şekilde al
  const getUserId = (user: any) => {
    if (!user) return undefined;
    if (typeof user === 'string') return user;
    return user.id || user._id || undefined;
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

  // Atanan kullanıcıyı sil (artık backend ile)
  const handleRemoveAssignee = (userId: string) => {
    if (!userId || typeof userId !== 'string' || userId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      alert('Geçersiz kullanıcı ID');
      return;
    }
    setConfirmRemoveUserId(userId); // Sadece dialogu aç
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'yapiliyor':
        return 'info';
      case 'beklemede':
        return 'warning';
      case 'tamamlandi':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'yapiliyor':
        return 'Yapılıyor';
      case 'beklemede':
        return 'Beklemede';
      case 'tamamlandi':
        return 'Tamamlandı';
      default:
        return status;
    }
  };

  // Öncelik rengini belirle
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'yüksek':
        return '#f44336'; // kırmızı
      case 'normal':
        return '#fb8c00'; // turuncu
      case 'düşük':
        return '#4caf50'; // yeşil
      default:
        return '#9e9e9e'; // gri
    }
  };

  // Öncelik etiketini belirle
  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'yüksek':
        return 'Acil';
      case 'normal':
        return 'Normal';
      case 'düşük':
        return 'Düşük';
      default:
        return 'Belirsiz';
    }
  };

  // Kalan süreyi hesapla
  const getRemainingTime = (deadline?: string | Date) => {
    if (!deadline) return null;
    
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { text: `${Math.abs(daysDiff)} gün gecikti`, color: '#f44336' };
    } else if (daysDiff === 0) {
      return { text: 'Bugün son gün', color: '#fb8c00' };
    } else if (daysDiff === 1) {
      return { text: 'Yarın son gün', color: '#fb8c00' };
    } else {
      return { text: `${daysDiff} gün kaldı`, color: '#4caf50' };
    }
  };

  // Görevin tamamlanma yüzdesini hesapla (eğer assignedTo dizisinde completed alanı varsa)
  const getCompletionPercentage = () => {
    if (!task.assignedTo || task.assignedTo.length === 0) return 0;
    
    const totalUsers = task.assignedTo.length;
    const completedUsers = task.assignedTo.filter(user => user.completed).length;
    
    return Math.round((completedUsers / totalUsers) * 100);
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h6" component="div" gutterBottom>
            {task.title}
            {fileAdded && <CheckCircleIcon color="success" sx={{ ml: 1, verticalAlign: 'middle' }} />}
          </Typography>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {task.description}
        </Typography>
        
        {/* Öncelik bilgisi */}
        {task.priority && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
            <FlagIcon fontSize="small" sx={{ color: getPriorityColor(task.priority) }} />
            <Chip
              label={getPriorityLabel(task.priority)}
              size="small"
              sx={{
                bgcolor: `${getPriorityColor(task.priority)}20`,
                color: getPriorityColor(task.priority),
                fontWeight: 'bold',
                border: `1px solid ${getPriorityColor(task.priority)}`
              }}
            />
          </Box>
        )}

        {/* Kalan süre bilgisi */}
        {task.deadline && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5 }}>
            <AccessTimeIcon fontSize="small" sx={{ color: getRemainingTime(task.deadline)?.color }} />
            <Tooltip title={`Son Tarih: ${new Date(task.deadline).toLocaleDateString('tr-TR')}`}>
              <Chip
                label={getRemainingTime(task.deadline)?.text}
                size="small"
                sx={{
                  bgcolor: `${getRemainingTime(task.deadline)?.color}20`,
                  color: getRemainingTime(task.deadline)?.color,
                  fontWeight: 'bold',
                  border: `1px solid ${getRemainingTime(task.deadline)?.color}`
                }}
              />
            </Tooltip>
          </Box>
        )}

        {/* Tamamlanma yüzdesi */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Tamamlanma Durumu
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                %{getCompletionPercentage()}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getCompletionPercentage()} 
              sx={{ 
                height: 6, 
                borderRadius: 3,
                bgcolor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getCompletionPercentage() === 100 ? '#4caf50' : '#2196f3'
                }
              }}
            />
          </Box>
        )}

        {/* Atanan kullanıcılar */}
        {task.assignedTo && task.assignedTo.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {task.assignedTo.map((a, i) => {
              const userObj = typeof a.user === 'object' ? a.user : { name: a.user, id: a.user };
              // Renk seçimi için basit bir hash fonksiyonu
              const colors = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1'];
              const color = colors[userObj.id ? userObj.id.charCodeAt(0) % colors.length : i % colors.length];
              const displayName = getUserName(userObj);
              return (
                <Tooltip 
                  key={userObj.id}
                  title={a.completed ? 'Tamamladı' : 'Devam ediyor'}
                >
                  <Chip
                    label={
                      <span style={{ fontWeight: 600, fontSize: 15 }}>
                        {displayName}
                      </span>
                    }
                    avatar={
                      <MuiAvatar 
                        src={getUserProfileImage(userObj)}
                        sx={{ 
                          bgcolor: color, 
                          color: '#fff', 
                          width: 32, 
                          height: 32, 
                          fontWeight: 700,
                          border: a.completed ? '2px solid #4caf50' : 'none'
                        }}
                      >
                        {displayName[0].toUpperCase()}
                      </MuiAvatar>
                    }
                    sx={{
                      bgcolor: `${color}22`,
                      color: color,
                      borderRadius: '16px',
                      fontWeight: 500,
                      fontSize: 15,
                      px: 1.5,
                      py: 0.5,
                      boxShadow: 1,
                      border: a.completed ? `1.5px solid #4caf50` : `1.5px solid ${color}`,
                      '.MuiAvatar-root': { mr: 1 }
                    }}
                    size="medium"
                  />
                </Tooltip>
              );
            })}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Chip
            label={getStatusLabel(task.status)}
            color={getStatusColor(task.status)}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            {task.createdAt ? new Date(task.createdAt).toLocaleDateString('tr-TR') : ''}
          </Typography>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => setViewDetailsDialogOpen(true)}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          İncele
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          Düzenle
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          Sil
        </MenuItem>
        <MenuItem onClick={handleCompleteTask}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" color="success" />
          </ListItemIcon>
          Görevi Tamamla
        </MenuItem>
        <MenuItem onClick={() => setAssignDialogOpen(true)}>
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          Kullanıcı Ata
        </MenuItem>
        <MenuItem onClick={() => setFileDialogOpen(true)}>
          <ListItemIcon>
            <AttachFileIcon fontSize="small" />
          </ListItemIcon>
          Dosya Ekle
        </MenuItem>
        {task.status !== 'yapiliyor' && (
          <MenuItem onClick={() => handleStatusChange('yapiliyor')}>
            Yapılıyor'a Taşı
          </MenuItem>
        )}
        {task.status !== 'beklemede' && (
          <MenuItem onClick={() => handleStatusChange('beklemede')}>
            Beklemede'ye Taşı
          </MenuItem>
        )}
        {task.status !== 'tamamlandi' && (
          <MenuItem onClick={() => handleStatusChange('tamamlandi')}>
            Tamamlandı'ya Taşı
          </MenuItem>
        )}
      </Menu>
      {/* Kullanıcı Ata Dialogu */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)}>
        <DialogTitle>Kullanıcı Ata</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 300 }}>
            <select
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              style={{ width: '100%', padding: 8, fontSize: 16 }}
            >
              <option value="">Kullanıcı seçin</option>
              {projectUsers.map(user => (
                <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
              ))}
            </select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>İptal</Button>
          <Button onClick={handleAssignUser} disabled={!selectedUserId} variant="contained">Ata</Button>
        </DialogActions>
      </Dialog>
      {/* Dosya Ekle Dialogu */}
      <Dialog open={fileDialogOpen} onClose={() => setFileDialogOpen(false)}>
        <DialogTitle>Dosya Ekle</DialogTitle>
        <DialogContent>
          <input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFileDialogOpen(false)}>İptal</Button>
        </DialogActions>
      </Dialog>
      {/* Atanan Kişiler Detay Dialogu */}
      <Dialog 
        open={viewDetailsDialogOpen} 
        onClose={() => setViewDetailsDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 2 }}>
          Atanan Kişiler
          <IconButton onClick={() => setViewDetailsDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {task.assignedTo && task.assignedTo.length > 0 ? (
            <List>
              {task.assignedTo.map((assignee, index) => {
                const userObj = typeof assignee.user === 'object' ? assignee.user : { name: assignee.user, id: assignee.user };
                const displayName = getUserName(userObj);
                return (
                  <ListItem
                    key={index}
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      boxShadow: 1,
                      bgcolor: '#f9f9f9',
                      px: 2,
                      py: 1.5,
                      alignItems: 'center',
                      display: 'flex'
                    }}
                    secondaryAction={
                      <Tooltip title="Görevden çıkar">
                        <IconButton 
                          color="error" 
                          size="large" 
                          sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#ffeaea' } }}
                          onClick={() => handleRemoveAssignee(getUserId(assignee.user))}
                        >
                          <DeleteOutlineIcon fontSize="medium" />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemAvatar>
                      <MuiAvatar 
                        src={getUserProfileImage(userObj)}
                        sx={{ width: 56, height: 56, fontSize: 28, bgcolor: '#1976d2', color: '#fff' }}
                      >
                        {displayName[0].toUpperCase()}
                      </MuiAvatar>
                    </ListItemAvatar>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 20 }}>{displayName}</div>
                      <div style={{ fontSize: 15, color: '#888' }}>
                        Atanma Tarihi: {new Date(assignee.assignedAt || Date.now()).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MuiAvatar sx={{ width: 64, height: 64, bgcolor: '#eee', color: '#888', mx: 'auto', mb: 2 }}>
                <PersonAddIcon fontSize="large" />
              </MuiAvatar>
              <Typography variant="body1" color="text.secondary">
                Bu göreve henüz kimse atanmamış.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsDialogOpen(false)} color="primary">
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
      {/* Kullanıcıyı görevden çıkarma onay dialogu */}
      <Dialog open={!!confirmRemoveUserId} onClose={() => setConfirmRemoveUserId(null)}>
        <DialogTitle>Kullanıcıyı görevden çıkar</DialogTitle>
        <DialogContent>
          Bu kullanıcıyı bu görevden çıkarmak istediğinizden emin misiniz?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveUserId(null)}>Vazgeç</Button>
          <Button color="error" variant="contained" onClick={() => {
            if (confirmRemoveUserId && typeof confirmRemoveUserId === 'string' && confirmRemoveUserId.length === 24 && /^[0-9a-fA-F]{24}$/.test(confirmRemoveUserId)) {
              if (task._id && taskContext?.unassignUserFromTask) {
                taskContext.unassignUserFromTask(task._id as string, confirmRemoveUserId);
              }
            }
            setConfirmRemoveUserId(null);
          }}>Evet, Çıkar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default TaskCard; 