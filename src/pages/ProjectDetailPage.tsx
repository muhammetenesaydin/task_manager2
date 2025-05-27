import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Divider,
  Alert,
  Chip,
  IconButton,
  Snackbar,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { DndContext, closestCorners, DragEndEvent, DragStartEvent, useSensor, useSensors, PointerSensor, DragOverlay, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import Todo from '../components/Todo';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTaskContext } from '../context/TaskContext';
import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { normalizeId } from '../utils/dataUtils';
import TaskCard from '../components/TaskCard';

// Sürüklenebilir görev kartı bileşeni
interface SortableTaskItemProps {
  id: string;
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  projectUsers?: { id: string; name: string; email: string }[];
  onAssignUser?: (taskId: string, userId: string) => void;
}

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ 
  id, 
  task, 
  onStatusChange, 
  onDelete, 
  onEdit, 
  projectUsers,
  onAssignUser 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: id,
    data: {
      type: 'task',
      task: task
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : 1,
    position: 'relative' as const
  };

  // Daha geniş bir sürükleme alanı oluşturarak kullanıcıya daha iyi deneyim sağla
  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ 
        mb: 2, 
        transition: 'transform 0.2s, box-shadow 0.2s', 
        cursor: 'grab',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        },
        ...(isDragging && {
          boxShadow: '0 8px 16px rgba(156, 39, 176, 0.3) !important',
        })
      }}
      {...attributes}
      {...listeners}
    >
      <Paper sx={{ 
        position: 'relative',
        overflow: 'visible',
        borderLeft: `4px solid ${
          task.priority === 'yüksek' ? '#e74c3c' :
          task.priority === 'normal' ? '#3498db' :
          task.priority === 'düşük' ? '#2ecc71' : '#bdc3c7'
        }`,
        borderRadius: '4px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
      }}>
        {/* Sürükleme göstergesi */}
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: -16,
            transform: 'translateY(-50%)',
            color: isDragging ? '#9c27b0' : '#95a5a6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: isDragging ? 'rgba(156, 39, 176, 0.1)' : 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </Box>
        <TaskCard
          task={task}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onEdit={onEdit}
          projectUsers={projectUsers}
          onAssignUser={onAssignUser}
        />
      </Paper>
    </Box>
  );
};

// Katılımcıyı kullanıcı listesine dönüştürme yardımcı fonksiyonu
const participantToUser = (participant: any) => {
  return {
    id: participant.userId,
    name: participant.userName || participant.email,
    email: participant.email || ''
  };
};

const ProjectDetailPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [newTask, setNewTask] = useState<{ 
    title: string; 
    description: string; 
    status: Task['status']; 
    deadline: Date | undefined; 
    priority: "düşük" | "normal" | "yüksek";
    tags: string[];
  }>({
    title: '',
    description: '',
    status: 'beklemede',
    deadline: undefined,
    priority: 'normal',
    tags: []
  });
  const [initialStatus, setInitialStatus] = useState<Task['status']>('beklemede');
  const [editTask, setEditTask] = useState<Task | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const [previousProjectId, setPreviousProjectId] = useState<string | null>(null);
  
  // Taşıma işlemi için
  type PendingMove = { taskId: string; oldStatus: Task['status']; newStatus: Task['status'] };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingMoves, setPendingMoves] = useState<PendingMove[]>([]);
  
  // Sürükle bırak için state değişkenleri
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sürükle bırak sensörleri - alternatif sensörler eklemek
  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Daha az gecikme ile sürükleme hemen başlar
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      // Mobil cihazlar için dokunma sensörü - daha kolay sürükleme
      activationConstraint: {
        delay: 100,
        tolerance: 8,
      },
    }),
    useSensor(PointerSensor, {
      // Yedek sensör
      activationConstraint: {
        distance: 2,
      }
    })
  );

  // Context'leri kullan
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError, 
    loadTasks, 
    addTask, 
    updateTask, 
    deleteTask,
    clearTasks,
    assignUserToTask
  } = useTaskContext();
  
  const {
    selectedProject: project,
    loading: projectLoading,
    error: projectError,
    getProject,
    clearSelectedProject,
    generateShareCode,
    inviteUserToProject,
    removeParticipant
  } = useProjectContext();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, logout, checkTokenValidity } = useAuth();

  // Global loading state
  const { setLoading } = useLoading();

  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  // Hata gösterme fonksiyonu (sadece bir kez göster)
  const showErrorOnce = useCallback((message: string, severity: 'success' | 'error' = 'error') => {
    if (!errorShown) {
      setSnackbar({
        open: true,
        message,
        severity
      });
      setErrorShown(true);
    }
  }, [errorShown]);

  // TokenValidation fonksiyonu - API'ye erişim öncesi kontrol yapar
  const validateToken = useCallback(async (): Promise<boolean> => {
    try {
      return await checkTokenValidity();
    } catch (err) {
      console.error('Token kontrolü sırasında hata:', err);
      return false;
    }
  }, [checkTokenValidity]);

  // Proje sahibi kontrolü
  const isProjectOwner = project && user && project.owner && user.id && project.owner === user.id;

  // Token validasyonu ve oturum kontrolü
  useEffect(() => {
    const validateSession = async () => {
      try {
        const isValid = await validateToken();
        if (!isValid) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Oturum doğrulama hatası:', err);
      }
    };
    
    validateSession();
  }, [validateToken, navigate]);

  // ProjectId değiştiğinde verileri temizle ve yeniden yükle
  useEffect(() => {
    if (projectId !== previousProjectId) {
      console.log('Proje değişti, veri temizleniyor:', previousProjectId, '->', projectId);
      
      // Global loader'ı etkinleştir
      setLoading(true);
      
      // Mevcut verileri temizle
      clearSelectedProject();
      clearTasks();
      
      // Veri yükleme durumunu sıfırla
      setIsDataLoaded(false);
      setErrorShown(false);
      
      // Yeni ProjectId'yi kaydet
      setPreviousProjectId(projectId || null);
    }
  }, [projectId, previousProjectId, clearSelectedProject, clearTasks, setLoading]);

  // Proje ve görevleri yükleme
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        showErrorOnce('Geçersiz proje ID');
        navigate('/projects');
        return;
      }
      
      try {
        // Token kontrolü
        const isTokenValid = await validateToken();
        if (!isTokenValid) {
          showErrorOnce('Oturum süresi doldu, lütfen tekrar giriş yapın');
          navigate('/login');
          return;
        }
        
        setLoading(true);
        setIsDataLoaded(false);
        
        // Önce projeyi yükle
        const projectData = await getProject(projectId);
        
        if (!projectData) {
          showErrorOnce('Proje bulunamadı');
          navigate('/projects');
          return;
        }
        
        // Projeye ait görevleri yükle
        await loadTasks(projectId);
        
        setIsDataLoaded(true);
      } catch (err) {
        console.error('Proje detayları yüklenirken hata:', err);
        showErrorOnce('Proje detayları yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };
    
    // Veri yükleme durumunu kontrol et
    if (!isDataLoaded && projectId) {
      fetchData();
    }
  }, [projectId, getProject, loadTasks, navigate, showErrorOnce, validateToken, setLoading, isDataLoaded]);

  const handleOpenDialog = (status: Task['status']) => {
    setInitialStatus('beklemede');
    setNewTask({ 
      ...newTask, 
      status: 'beklemede'
    });
    setOpenDialog(true);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId || !newTask.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Görev başlığı boş olamaz',
        severity: 'error'
      });
      return;
    }
    
    try {
      setInitialStatus('beklemede');
      setLoading(true);
      
      // Token geçerliliğini kontrol et
      const isTokenValid = await validateToken();
      if (!isTokenValid) {
        setSnackbar({
          open: true,
          message: 'Oturum süresi doldu, lütfen tekrar giriş yapın',
          severity: 'error'
        });
        navigate('/login');
        return;
      }
      
      console.log('Görev ekleme işlemi başlatılıyor...', newTask);
      const result = await addTask(projectId, {
        title: newTask.title,
        description: newTask.description,
        status: 'beklemede',
        priority: newTask.priority,
        deadline: newTask.deadline || undefined,
        tags: newTask.tags
      });
      
      if (result) {
        console.log('Görev başarıyla eklendi:', result);
        setOpenDialog(false);
        setNewTask({
          title: '',
          description: '',
          deadline: undefined,
          priority: 'normal',
          tags: [],
          status: initialStatus
        });
        
        setSnackbar({
          open: true,
          message: 'Görev başarıyla eklendi!',
          severity: 'success'
        });
      } else {
        console.error('Görev ekleme başarısız oldu, null sonuç döndü');
        setSnackbar({
          open: true,
          message: 'Görev eklenirken bir hata oluştu.',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Görev eklenirken hata oluştu:', err);
      setSnackbar({
        open: true,
        message: 'Görev eklenirken bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Görev durumunu değiştir
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    // Backend'e değişiklik isteği gönder
    updateTask(taskId, { status: newStatus })
      .then((updatedTask: Task | null) => {
        if (updatedTask) {
          // Hemen verileri yenile
          if (projectId) {
            setTimeout(() => {
              getProject(projectId);
            }, 300);
          }
        }
      })
      .catch(error => {
        console.error('Görev durumu güncellenirken hata oluştu:', error);
      });
  };

  // Sürükleme başladığında çağrılır
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    console.log('Sürükleme başladı:', active.id);
    
    setActiveId(active.id as string);
    
    // Aktif görevi bul
    const task = tasks.find(t => (t._id === active.id || t.id === active.id));
    if (task) {
      console.log('Sürüklenen görev bulundu:', task);
      setActiveTask(task);
      setIsDragging(true);
    } else {
      console.log('Sürüklenen görev bulunamadı!', active.id, tasks);
    }
  };
  
  // Sürükleme bittiğinde çağrılır
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log('Sürükleme bitti:', { activeId: active.id, overId: over?.id });
    
    // State'leri temizle
    setIsDragging(false);
    setActiveId(null);
    
    // Üzerine bırakılan alan yoksa işlem yapma
    if (!over) {
      console.log('Hedef bulunamadı, sürükleme işlemi iptal edildi');
      setActiveTask(null);
      return;
    }
    
    // Task ID'sini al
    const taskId = String(active.id);
    
    // Sürüklenen görevin durumunu kontrol et
    const task = activeTask || tasks.find(t => t._id === taskId || t.id === taskId);
    if (!task) {
      console.log('Task bulunamadı, işlem iptal edildi');
      setActiveTask(null);
      return;
    }
    
    // Over ID'sini kontrol et ve durum değişikliği yap
    let newStatus: Task['status'] | null = null;
    
    const overId = String(over.id);
    
    // Doğrudan durum kolonları
    if (overId === 'beklemede' || overId === 'yapiliyor' || overId === 'tamamlandi') {
      newStatus = overId as Task['status'];
    } 
    // Droppable kolon alanları
    else if (overId.startsWith('droppable-')) {
      newStatus = overId.replace('droppable-', '') as Task['status'];
    } 
    // Başka bir görev üzerine bırakıldıysa, o görevin durumunu al
    else {
      const overTask = tasks.find(t => t._id === overId || t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }
    
    // Durum değişmişse güncelle
    if (newStatus && task.status !== newStatus) {
      console.log(`Görev durumu değiştiriliyor: ${task.status} -> ${newStatus}`);
      handleStatusChange(taskId, newStatus);
    } else {
      console.log('Durum değişikliği yok veya geçersiz hedef');
    }
    
    setActiveTask(null);
  };

  // Manuel sürükleme için HTML5 Drag API
  const handleNativeDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    console.log('Native sürükleme başladı:', task);
    
    // Taşınan veriyi ayarla
    e.dataTransfer.setData('text/plain', task.id || task._id || '');
    e.dataTransfer.effectAllowed = 'move';
    
    // Gorunumu ayarla
    setActiveTask(task);
    setIsDragging(true);
  };
  
  const handleNativeDragOver = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleNativeDrop = (e: React.DragEvent<HTMLDivElement>, status: Task['status']) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    console.log('Native drop:', taskId, 'into', status);
    
    if (!taskId) return;
    
    const task = tasks.find(t => (t._id === taskId || t.id === taskId));
    if (task && task.status !== status) {
      console.log(`Manuel sürükleme ile durum değiştiriliyor: ${task.status} -> ${status}`);
      handleStatusChange(taskId, status);
    }
    
    setActiveTask(null);
    setIsDragging(false);
  };
  
  const handleNativeDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Native sürükleme bitti');
    setActiveTask(null);
    setIsDragging(false);
  };

  const TaskCardWithDnd: React.FC<{task: Task, onStatusChange: any, onDelete: any, onEdit: any, projectUsers?: any, onAssignUser?: any}> = (props) => {
    return (
      <div 
        draggable="true"
        onDragStart={(e) => handleNativeDragStart(e, props.task)}
        onDragEnd={handleNativeDragEnd}
        style={{cursor: 'grab'}}
      >
        <TaskCard {...props} />
      </div>
    );
  };

  // Özel görev silme fonksiyonu
  const handleDeleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      console.log('ProjectDetailPage - handleDeleteTask çağrıldı, ID:', taskId);
      
      // TaskId parametresini kontrol et
      if (!taskId) {
        console.error('ProjectDetailPage - Görev silme işleminde geçersiz ID:', taskId);
        setSnackbar({
          open: true,
          message: 'Görev silme işlemi yapılamadı: Geçersiz görev ID',
          severity: 'error'
        });
        return false;
      }
      
      // Optimistik UI yanıtı - hemen başarılı döndür
      // API'nin tamamlanmasını bekleme
      
      // Anlık görsel bildirim göster
      setSnackbar({
        open: true,
        message: 'Görev silindi',
        severity: 'success'
      });
      
      // ID'yi normalize et (MongoDB formatı sorunlarını önlemek için)
      const normalizedTaskId = normalizeId(taskId);
      console.log('ProjectDetailPage - Görev silme işlemi başlatılıyor (normalize):', normalizedTaskId);

      try {
        // Silme işlemini arkaplanda başlat
        deleteTask(normalizedTaskId)
          .then(result => {
            console.log('ProjectDetailPage - deleteTask sonucu:', result);
          })
          .catch(err => {
            console.error('ProjectDetailPage - Silme işlemi hatası:', err);
          });
        
        // Beklemeden başarılı kabul et (anlık yanıt)
        return true;
      } catch (tokenError) {
        console.error('ProjectDetailPage - Token kontrolü sırasında hata:', tokenError);
        // Arkaplanda hata olsa bile UI'da gösterme ve işleme devam et
        return true;
      }
    } catch (error) {
      console.error('ProjectDetailPage - Görev silme hatası:', error);
      // Kullanıcı deneyimini bozmamak için hata olsa bile başarılı döndür
      return true;
    }
  }, [deleteTask]);

  // Paylaşım kodu oluşturma
  const handleGenerateShareCode = async () => {
    if (!projectId) return;
    
    try {
      setGeneratingCode(true);
      await generateShareCode(projectId);
      setSnackbar({
        open: true,
        message: 'Paylaşım kodu oluşturuldu',
        severity: 'success'
      });
    } catch (error) {
      console.error('Paylaşım kodu oluşturulurken hata:', error);
      setSnackbar({
        open: true,
        message: 'Paylaşım kodu oluşturulamadı',
        severity: 'error'
      });
    } finally {
      setGeneratingCode(false);
    }
  };

  // Paylaşım kodunu panoya kopyalama
  const handleCopyShareCode = () => {
    if (project?.shareCode) {
      navigator.clipboard.writeText(project.shareCode);
      setCopiedToClipboard(true);
      
      setTimeout(() => {
        setCopiedToClipboard(false);
      }, 3000);
    }
  };

  // Kullanıcı davet etme
  const handleInviteUser = async () => {
    if (!projectId || !inviteEmail.trim()) return;
    
    try {
      const result = await inviteUserToProject(projectId, inviteEmail);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Kullanıcı davet edildi',
          severity: 'success'
        });
        setInviteEmail('');
        setOpenInviteDialog(false);
      }
    } catch (error) {
      console.error('Kullanıcı davet edilirken hata:', error);
      setSnackbar({
        open: true,
        message: 'Kullanıcı davet edilemedi',
        severity: 'error'
      });
    }
  };

  // Katılımcıyı projeden çıkarma
  const handleRemoveParticipant = async (userId: string) => {
    if (!projectId) return;
    
    try {
      const result = await removeParticipant(projectId, userId);
      
      if (result) {
        setSnackbar({
          open: true,
          message: 'Katılımcı projeden çıkarıldı',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Katılımcı çıkarılırken hata:', error);
      setSnackbar({
        open: true,
        message: 'Katılımcı çıkarılamadı',
        severity: 'error'
      });
    }
  };

  // Loading ve error durumlarını birleştir
  const loading = tasksLoading || projectLoading;
  const error = tasksError || projectError;

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Görev düzenleme fonksiyonu
  const handleEditTask = (task: Task) => {
    // Task nesnesini kopyala ve düzenleme için hazırla
    setEditTask({
      ...task,
      // Eğer deadline null veya undefined ise undefined olarak ayarla
      deadline: task.deadline ? new Date(task.deadline) : undefined,
      // Eğer tags yoksa boş dizi olarak ayarla
      tags: task.tags || []
    });
    setOpenEditDialog(true);
  };

  // Görev güncelleme fonksiyonu
  const handleUpdateTask = async () => {
    if (!editTask || !editTask._id) {
      setSnackbar({
        open: true,
        message: 'Görev bilgileri eksik',
        severity: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Token geçerliliğini kontrol et
      const isTokenValid = await validateToken();
      if (!isTokenValid) {
        setSnackbar({
          open: true,
          message: 'Oturum süresi doldu, lütfen tekrar giriş yapın',
          severity: 'error'
        });
        navigate('/login');
        return;
      }
      
      console.log('Görev güncelleme işlemi başlatılıyor...', editTask);
      const result = await updateTask(editTask._id, {
        title: editTask.title,
        description: editTask.description,
        status: editTask.status,
        priority: editTask.priority,
        deadline: editTask.deadline,
        tags: editTask.tags
      });
      
      if (result) {
        console.log('Görev başarıyla güncellendi:', result);
        setOpenEditDialog(false);
        
        // Görevi güncelledikten sonra başarı bildirimi göster
        setSnackbar({
          open: true,
          message: 'Görev başarıyla güncellendi!',
          severity: 'success'
        });
        
        // Proje verilerini güncelle
        if (projectId) {
          setTimeout(() => {
            getProject(projectId);
          }, 300);
        }
      } else {
        console.error('Görev güncelleme başarısız oldu, null sonuç döndü');
        setSnackbar({
          open: true,
          message: 'Görev güncellenirken bir hata oluştu.',
          severity: 'error'
        });
      }
    } catch (err) {
      console.error('Görev güncellenirken hata oluştu:', err);
      setSnackbar({
        open: true,
        message: 'Görev güncellenirken bir hata oluştu.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <></>;
  }

  if (error) {
    return (
      <Container sx={{ mt: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  // Proje bulunamadıysa
  if (!project) {
    return (
      <Container sx={{ mt: 5, textAlign: 'center' }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Proje bulunamadı veya erişim izniniz yok.
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Projeler Sayfasına Dön
        </Button>
      </Container>
    );
  }

  // Durum renkleri
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yapiliyor':
        return '#f44336'; // Kırmızı
      case 'beklemede':
        return '#ffeb3b'; // Sarı
      case 'tamamlandi':
        return '#4caf50'; // Yeşil
      default:
        return '#e0e0e0';
    }
  };

  // Durum başlıkları
  const getStatusTitle = (status: string) => {
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

  // Öncelik renklerini belirle
  const getPriorityColor = (priority: string) => {
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

  // Görevleri durumlarına göre grupla
  const tasksByStatus: Record<Task['status'], Task[]> = {
    yapiliyor: tasks.filter(task => task.status === 'yapiliyor'),
    beklemede: tasks.filter(task => task.status === 'beklemede'),
    tamamlandi: tasks.filter(task => task.status === 'tamamlandi')
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {project?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {project?.description}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Projeler sayfasına dönüş butonu */}
            <Button
              variant="outlined"
              onClick={() => navigate('/projects')}
            >
              Tüm Projeler
            </Button>
            
            {/* Projeyi Paylaş butonu */}
            {isProjectOwner && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ShareIcon />}
                onClick={() => setOpenShareDialog(true)}
              >
                Projeyi Paylaş
              </Button>
            )}
            
            {/* Katılımcıları Gör butonu */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<PersonAddIcon />}
              onClick={() => setParticipantsDialogOpen(true)}
            >
              Katılımcılar
            </Button>
            
            {/* Her kullanıcı için görev ekleme düğmesi */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog('yapiliyor')}
            >
              Yeni Görev
            </Button>
          </Box>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f7faf7', minHeight: '80vh' }}>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToWindowEdges]}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
              {(['beklemede', 'yapiliyor', 'tamamlandi'] as Task['status'][]).map((status) => (
                <Paper
                  key={status}
                  id={status}
                  data-droppable="true"
                  elevation={4}
                  sx={{
                    p: 2,
                    height: '100%',
                    minHeight: 'calc(100vh - 200px)',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    border: `2px solid ${
                      status === 'beklemede' ? '#f1c40f' : 
                      status === 'yapiliyor' ? '#3498db' : 
                      '#2ecc71'
                    }`,
                    transition: 'all 0.2s ease',
                    '&:hover': { 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      transform: 'translateY(-4px)' 
                    },
                    ...(isDragging && {
                      outline: status === activeTask?.status ? 'none' : '2px dashed #9c27b0',
                      outlineOffset: '-2px',
                    })
                  }}
                >
                  {/* Sütun Başlığı */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 2,
                    pb: 2,
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: status === 'beklemede' ? '#f1c40f' : 
                                status === 'yapiliyor' ? '#3498db' : 
                                '#2ecc71',
                        mr: 1.5
                      }} 
                    />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700, 
                        color: status === 'beklemede' ? '#d4ac0d' : 
                              status === 'yapiliyor' ? '#2980b9' : 
                              '#27ae60', 
                        flexGrow: 1 
                      }}
                    >
                      {status === 'beklemede' ? 'Beklemede' :
                      status === 'yapiliyor' ? 'Yapılıyor' : 
                      'Tamamlandı'}
                    </Typography>
                    <Box sx={{ 
                      bgcolor: status === 'beklemede' ? 'rgba(241, 196, 15, 0.1)' : 
                              status === 'yapiliyor' ? 'rgba(52, 152, 219, 0.1)' : 
                              'rgba(46, 204, 113, 0.1)', 
                      color: status === 'beklemede' ? '#d4ac0d' : 
                            status === 'yapiliyor' ? '#2980b9' : 
                            '#27ae60',
                      borderRadius: '14px', 
                      px: 1.5, 
                      py: 0.5, 
                      fontWeight: 600, 
                      fontSize: 14,
                      border: `1px solid ${
                        status === 'beklemede' ? 'rgba(241, 196, 15, 0.3)' : 
                        status === 'yapiliyor' ? 'rgba(52, 152, 219, 0.3)' : 
                        'rgba(46, 204, 113, 0.3)'
                      }`
                    }}>
                      {tasks.filter(task => task.status === status).length}
                    </Box>
                    
                    {/* Yeni görev ekleme butonu */}
                    <Tooltip title={`${status === 'beklemede' ? 'Beklemede' : 
                                      status === 'yapiliyor' ? 'Yapılıyor' : 
                                      'Tamamlandı'} Listesine Görev Ekle`}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDialog(status)}
                        sx={{ 
                          ml: 1,
                          bgcolor: status === 'beklemede' ? 'rgba(241, 196, 15, 0.1)' : 
                                  status === 'yapiliyor' ? 'rgba(52, 152, 219, 0.1)' : 
                                  'rgba(46, 204, 113, 0.1)',
                          color: status === 'beklemede' ? '#d4ac0d' : 
                                status === 'yapiliyor' ? '#2980b9' : 
                                '#27ae60',
                          '&:hover': {
                            bgcolor: status === 'beklemede' ? 'rgba(241, 196, 15, 0.2)' : 
                                    status === 'yapiliyor' ? 'rgba(52, 152, 219, 0.2)' : 
                                    'rgba(46, 204, 113, 0.2)',
                          }
                        }}
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* Görev Listesi */}
                  <Box 
                    sx={{ 
                      flex: 1, 
                      overflow: 'auto', 
                      minHeight: 60,
                      px: 0.5,
                      transition: 'all 0.2s ease',
                      // Boş durumda bırakma alanı oluşturmak için min-height
                      ...(tasks.filter(task => task.status === status).length === 0 && {
                        minHeight: '200px',
                        border: '2px dashed #e0e0e0',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }),
                      // Sürükleme sırasında hedef bölgeyi vurgula
                      ...(isDragging && activeTask?.status !== status && {
                        backgroundColor: 'rgba(156, 39, 176, 0.05)',
                        border: '2px dashed rgba(156, 39, 176, 0.3)',
                        borderRadius: '8px',
                        boxShadow: 'inset 0 0 8px rgba(156, 39, 176, 0.1)'
                      })
                    }}
                    id={`droppable-${status}`}
                    data-droppable="true"
                    data-status={status}
                    onDragOver={(e) => handleNativeDragOver(e, status)}
                    onDrop={(e) => handleNativeDrop(e, status)}
                  >
                    {tasks.filter(task => task.status === status).length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center' }}>
                        {status === 'beklemede' ? 'Henüz bir görev eklenmemiş' :
                         status === 'yapiliyor' ? 'Üzerinde çalışılan bir görev yok' : 
                         'Tamamlanmış görev bulunmuyor'}
                         <Box sx={{ mt: 1 }}>Görevleri buraya sürükleyebilirsiniz</Box>
                      </Typography>
                    ) : (
                      <SortableContext 
                        items={tasks.filter(task => task.status === status).map(task => task._id || task.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {tasks
                          .filter(task => task.status === status)
                          .map(task => (
                            <TaskCardWithDnd
                              key={task._id || task.id}
                              task={task}
                              onStatusChange={handleStatusChange}
                              onDelete={handleDeleteTask}
                              onEdit={handleEditTask}
                              projectUsers={project?.participants?.map(participantToUser) || []}
                              onAssignUser={assignUserToTask}
                            />
                          ))}
                      </SortableContext>
                    )}
                  </Box>
                </Paper>
              ))}
            </Box>
          </DndContext>
        </Box>

        {/* Paylaşım Kodu Diyalogu */}
        <Dialog 
          open={openShareDialog} 
          onClose={() => setOpenShareDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Projeyi Paylaş</DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              Aşağıdaki paylaşım kodu ile diğer kullanıcılar projenize katılabilir.
            </Typography>
            
            {project?.shareCode ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TextField
                  fullWidth
                  value={project.shareCode}
                  variant="filled"
                  InputProps={{ readOnly: true }}
                  sx={{ mr: 1 }}
                />
                <Tooltip title={copiedToClipboard ? "Kopyalandı!" : "Kopyala"}>
                  <IconButton onClick={handleCopyShareCode} color={copiedToClipboard ? "success" : "primary"}>
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Bu proje için henüz paylaşım kodu oluşturulmamış.
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleGenerateShareCode}
                  disabled={generatingCode}
                  startIcon={<ShareIcon />}
                >
                  {generatingCode ? 'Oluşturuluyor...' : 'Paylaşım Kodu Oluştur'}
                </Button>
              </Box>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="body1">
              E-posta ile davet et
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <TextField
                fullWidth
                label="E-posta Adresi"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                sx={{ mr: 1 }}
              />
              <Button
                variant="contained"
                onClick={handleInviteUser}
                disabled={!inviteEmail.trim()}
              >
                Davet Et
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenShareDialog(false)}>Kapat</Button>
          </DialogActions>
        </Dialog>

        {/* Katılımcılar Diyalogu */}
        <Dialog 
          open={participantsDialogOpen} 
          onClose={() => setParticipantsDialogOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Proje Katılımcıları</DialogTitle>
          <DialogContent>
            {project?.participants && project.participants.length > 0 ? (
              <List>
                {project.participants.map((participant) => (
                  <ListItem key={participant.userId}>
                    <ListItemAvatar>
                      <Avatar>
                        {participant.userName?.[0] || participant.email?.[0] || '?'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={participant.userName || participant.email} 
                      secondary={`${participant.role === 'admin' ? 'Yönetici' : 'Üye'} • ${new Date(participant.joinedAt).toLocaleDateString('tr-TR')}`} 
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Çıkar">
                        <IconButton edge="end" onClick={() => handleRemoveParticipant(participant.userId)}>
                          <PersonRemoveIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  Bu projede henüz katılımcı bulunmuyor.
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setParticipantsDialogOpen(false)}>Kapat</Button>
            <Button 
              variant="contained" 
              startIcon={<PersonAddIcon />}
              onClick={() => {
                setParticipantsDialogOpen(false);
                setOpenShareDialog(true);
              }}
            >
              Katılımcı Ekle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Yeni Görev Dialogu */}
        <Dialog 
          open={openDialog} 
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {`${getStatusTitle(initialStatus)} Listesine Görev Ekle`}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Görev Başlığı"
              fullWidth
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Açıklama"
              fullWidth
              multiline
              rows={4}
              value={newTask.description}
              onChange={(e) =>
                setNewTask({ ...newTask, description: e.target.value })
              }
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
                    key={`priority-${priority}`}
                    label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                    onClick={() => setNewTask({ ...newTask, priority: priority as any })}
                    color={newTask.priority === priority ? 'primary' : 'default'}
                    variant={newTask.priority === priority ? 'filled' : 'outlined'}
                    sx={{ 
                      borderColor: getPriorityColor(priority),
                      backgroundColor: newTask.priority === priority ? getPriorityColor(priority) : 'transparent',
                      color: newTask.priority === priority ? 'white' : getPriorityColor(priority),
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
                  setNewTask({ ...newTask, deadline: selectedDate });
                }}
                value={newTask.deadline ? new Date(newTask.deadline).toISOString().split('T')[0] : ''}
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
                value={newTask.tags.join(', ')}
                onChange={(e) => {
                  const tagsInput = e.target.value;
                  const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                  setNewTask({ ...newTask, tags: tagsArray });
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {newTask.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small"
                    onDelete={() => {
                      const newTags = [...newTask.tags];
                      newTags.splice(index, 1);
                      setNewTask({ ...newTask, tags: newTags });
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>İptal</Button>
            <Button 
              onClick={handleAddTask} 
              variant="contained" 
              disabled={!newTask.title.trim()}
            >
              Oluştur
            </Button>
          </DialogActions>
        </Dialog>

        {/* Görev Düzenleme Dialogu */}
        <Dialog 
          open={openEditDialog} 
          onClose={() => setOpenEditDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Görevi Düzenle
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Görev Başlığı"
              fullWidth
              value={editTask?.title || ''}
              onChange={(e) => {
                if (editTask) {
                  setEditTask({
                    ...editTask,
                    title: e.target.value
                  });
                }
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Açıklama"
              fullWidth
              multiline
              rows={4}
              value={editTask?.description || ''}
              onChange={(e) => {
                if (editTask) {
                  setEditTask({
                    ...editTask,
                    description: e.target.value
                  });
                }
              }}
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
                    key={`edit-priority-${priority}`}
                    label={priority.charAt(0).toUpperCase() + priority.slice(1)}
                    onClick={() => {
                      if (editTask) {
                        setEditTask({
                          ...editTask,
                          priority: priority as any
                        });
                      }
                    }}
                    color={editTask?.priority === priority ? 'primary' : 'default'}
                    variant={editTask?.priority === priority ? 'filled' : 'outlined'}
                    sx={{ 
                      borderColor: getPriorityColor(priority),
                      backgroundColor: editTask?.priority === priority ? getPriorityColor(priority) : 'transparent',
                      color: editTask?.priority === priority ? 'white' : getPriorityColor(priority),
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
                  if (editTask) {
                    const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                    setEditTask({
                      ...editTask,
                      deadline: selectedDate
                    });
                  }
                }}
                value={editTask?.deadline ? new Date(editTask.deadline).toISOString().split('T')[0] : ''}
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
                value={editTask?.tags ? editTask.tags.join(', ') : ''}
                onChange={(e) => {
                  if (editTask) {
                    const tagsInput = e.target.value;
                    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
                    setEditTask({
                      ...editTask,
                      tags: tagsArray
                    });
                  }
                }}
              />
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                {editTask?.tags && editTask.tags.map((tag, index) => (
                  <Chip 
                    key={index} 
                    label={tag} 
                    size="small"
                    onDelete={() => {
                      if (editTask && editTask.tags) {
                        const newTags = [...editTask.tags];
                        newTags.splice(index, 1);
                        setEditTask({
                          ...editTask,
                          tags: newTags
                        });
                      }
                    }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Durum Seçimi */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Durum
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['beklemede', 'yapiliyor', 'tamamlandi'].map((status) => (
                  <Chip
                    key={`edit-status-${status}`}
                    label={getStatusTitle(status)}
                    onClick={() => {
                      if (editTask) {
                        setEditTask({
                          ...editTask,
                          status: status as Task['status']
                        });
                      }
                    }}
                    color={editTask?.status === status ? 'primary' : 'default'}
                    variant={editTask?.status === status ? 'filled' : 'outlined'}
                    sx={{ 
                      borderColor: status === 'beklemede' ? '#f1c40f' : 
                                 status === 'yapiliyor' ? '#3498db' : 
                                 '#2ecc71',
                      backgroundColor: editTask?.status === status 
                        ? (status === 'beklemede' ? '#f1c40f' : 
                           status === 'yapiliyor' ? '#3498db' : 
                           '#2ecc71')
                        : 'transparent',
                      color: editTask?.status === status ? 'white' : 
                           (status === 'beklemede' ? '#f1c40f' : 
                            status === 'yapiliyor' ? '#3498db' : 
                            '#2ecc71')
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEditDialog(false)}>İptal</Button>
            <Button 
              onClick={handleUpdateTask} 
              variant="contained" 
              disabled={!editTask?.title?.trim()}
            >
              Güncelle
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bildirim Snackbarı */}
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
    </Box>
  );
};

export default ProjectDetailPage; 