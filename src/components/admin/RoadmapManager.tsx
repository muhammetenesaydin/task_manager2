import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  Autocomplete,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import MapIcon from '@mui/icons-material/Map';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import FlagIcon from '@mui/icons-material/Flag';
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from 'react-beautiful-dnd';

// Tip tanımlamaları
interface LearningStep {
  id: string;
  name: string;
  order: number;
  courses: string[]; // Kurs ID listesi
}

interface Roadmap {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
  enrolledUsers?: number;
}

interface Course {
  id: string;
  title: string;
}

interface UserProgress {
  userId: string;
  username: string;
  roadmapId: string;
  currentStep: string; // Adım ID
  completedSteps: string[]; // Tamamlanan adım ID'leri listesi
  progress: number; // Yüzde olarak ilerleme
}

// Mock API servis fonksiyonları
const mockRoadmapService = {
  getRoadmaps: async (): Promise<Roadmap[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'Frontend Geliştirici Yolu',
            description: 'Modern web geliştirme ile frontend teknolojilerini öğrenin',
            enrolledUsers: 12,
            steps: [
              {
                id: 's1',
                name: 'HTML ve CSS Temelleri',
                order: 0,
                courses: ['c1', 'c2']
              },
              {
                id: 's2',
                name: 'JavaScript',
                order: 1,
                courses: ['c3']
              },
              {
                id: 's3',
                name: 'React.js',
                order: 2,
                courses: ['c4', 'c5']
              }
            ]
          },
          {
            id: '2',
            title: 'Backend Geliştirici Yolu',
            description: 'API tasarımı ve arka uç geliştirme becerilerini edinme',
            enrolledUsers: 8,
            steps: [
              {
                id: 's4',
                name: 'Node.js Temelleri',
                order: 0,
                courses: ['c6']
              },
              {
                id: 's5',
                name: 'Express ve REST API',
                order: 1,
                courses: ['c7', 'c8']
              }
            ]
          }
        ]);
      }, 800);
    });
  },
  
  getCourses: async (): Promise<Course[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'c1', title: 'HTML5 Giriş' },
          { id: 'c2', title: 'CSS3 ve Responsive Tasarım' },
          { id: 'c3', title: 'JavaScript ES6+' },
          { id: 'c4', title: 'React Temelleri' },
          { id: 'c5', title: 'React Hooks ve Context API' },
          { id: 'c6', title: 'Node.js Giriş' },
          { id: 'c7', title: 'Express.js ile API Geliştirme' },
          { id: 'c8', title: 'MongoDB ve Mongoose' }
        ]);
      }, 600);
    });
  },
  
  createRoadmap: async (roadmapData: Omit<Roadmap, 'id'>): Promise<Roadmap> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...roadmapData,
          enrolledUsers: 0
        });
      }, 1000);
    });
  },
  
  updateRoadmap: async (id: string, roadmapData: Partial<Roadmap>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Roadmap güncellendi:', id, roadmapData);
        resolve(true);
      }, 1000);
    });
  },
  
  deleteRoadmap: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Roadmap silindi:', id);
        resolve(true);
      }, 800);
    });
  },
  
  getUserProgress: async (roadmapId: string): Promise<UserProgress[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            userId: 'u1',
            username: 'ahmetyilmaz',
            roadmapId,
            currentStep: roadmapId === '1' ? 's2' : 's4',
            completedSteps: roadmapId === '1' ? ['s1'] : [],
            progress: roadmapId === '1' ? 33 : 0
          },
          {
            userId: 'u2',
            username: 'aysedemir',
            roadmapId,
            currentStep: roadmapId === '1' ? 's3' : 's5',
            completedSteps: roadmapId === '1' ? ['s1', 's2'] : ['s4'],
            progress: roadmapId === '1' ? 66 : 50
          }
        ]);
      }, 1000);
    });
  }
};

// Yardımcı fonksiyonlar
const reorder = (list: LearningStep[], startIndex: number, endIndex: number): LearningStep[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  // Sıralama numaralarını güncelle
  return result.map((item, index) => ({
    ...item,
    order: index
  }));
};

// Roadmap Manager Bileşeni
export const RoadmapManager: React.FC = () => {
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog durumları
  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState<boolean>(false);
  const [stepDialogOpen, setStepDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [progressDialogOpen, setProgressDialogOpen] = useState<boolean>(false);
  
  // Form verileri
  const [formRoadmapData, setFormRoadmapData] = useState<{
    title: string;
    description: string;
    steps: LearningStep[];
  }>({
    title: '',
    description: '',
    steps: []
  });
  
  const [formStepData, setFormStepData] = useState<{
    id: string;
    name: string;
    courses: string[];
  }>({
    id: '',
    name: '',
    courses: []
  });
  
  // İlk yüklemede verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Roadmap ve kurs verilerini eş zamanlı yükle
        const [roadmapData, courseData] = await Promise.all([
          mockRoadmapService.getRoadmaps(),
          mockRoadmapService.getCourses()
        ]);
        
        setRoadmaps(roadmapData);
        setCourses(courseData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Kullanıcı ilerlemelerini getir
  const loadUserProgress = async (roadmapId: string) => {
    try {
      const progress = await mockRoadmapService.getUserProgress(roadmapId);
      setUserProgress(progress);
    } catch (err) {
      setError('Kullanıcı ilerlemeleri yüklenirken bir hata oluştu');
      console.error(err);
    }
  };
  
  // Form değişikliklerini işle
  const handleRoadmapFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormRoadmapData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Adım form değişikliklerini işle
  const handleStepFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormStepData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Adım kurslarını değiştir
  const handleCourseSelect = (_event: React.SyntheticEvent, values: Course[]) => {
    setFormStepData(prev => ({
      ...prev,
      courses: values.map(course => course.id)
    }));
  };
  
  // Yeni roadmap oluştur
  const handleCreateRoadmap = () => {
    setSelectedRoadmap(null);
    setFormRoadmapData({
      title: '',
      description: '',
      steps: []
    });
    setRoadmapDialogOpen(true);
  };
  
  // Roadmap düzenle
  const handleEditRoadmap = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setFormRoadmapData({
      title: roadmap.title,
      description: roadmap.description,
      steps: [...roadmap.steps]
    });
    setRoadmapDialogOpen(true);
  };
  
  // Roadmap sil
  const handleDeleteRoadmap = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setDeleteDialogOpen(true);
  };
  
  // Kullanıcı ilerlemesini görüntüle
  const handleViewProgress = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    loadUserProgress(roadmap.id);
    setProgressDialogOpen(true);
  };
  
  // Yeni adım ekle
  const handleAddStep = () => {
    const newStepId = `s_${Math.random().toString(36).substring(2, 9)}`;
    const order = formRoadmapData.steps.length;
    
    setFormStepData({
      id: newStepId,
      name: '',
      courses: []
    });
    
    setStepDialogOpen(true);
  };
  
  // Adım düzenle
  const handleEditStep = (step: LearningStep) => {
    setFormStepData({
      id: step.id,
      name: step.name,
      courses: [...step.courses]
    });
    
    setStepDialogOpen(true);
  };
  
  // Adım sil
  const handleRemoveStep = (stepId: string) => {
    setFormRoadmapData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId).map((step, index) => ({
        ...step,
        order: index
      }))
    }));
    
    setSuccess('Adım başarıyla kaldırıldı');
  };
  
  // Adım yukarı taşı
  const handleMoveStepUp = (index: number) => {
    if (index === 0) return;
    
    const newSteps = [...formRoadmapData.steps];
    [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
    
    setFormRoadmapData(prev => ({
      ...prev,
      steps: newSteps.map((step, i) => ({
        ...step,
        order: i
      }))
    }));
  };
  
  // Adım aşağı taşı
  const handleMoveStepDown = (index: number) => {
    if (index === formRoadmapData.steps.length - 1) return;
    
    const newSteps = [...formRoadmapData.steps];
    [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
    
    setFormRoadmapData(prev => ({
      ...prev,
      steps: newSteps.map((step, i) => ({
        ...step,
        order: i
      }))
    }));
  };
  
  // Sürükle bırak işlemi
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
    
    if (result.destination.index === result.source.index) {
      return;
    }
    
    const newSteps = reorder(
      formRoadmapData.steps,
      result.source.index,
      result.destination.index
    );
    
    setFormRoadmapData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };
  
  // Adım kaydet
  const handleSaveStep = () => {
    // Yeni adım ekleme veya var olan adımı güncelleme
    const stepExists = formRoadmapData.steps.some(step => step.id === formStepData.id);
    
    if (stepExists) {
      // Var olan adımı güncelle
      setFormRoadmapData(prev => ({
        ...prev,
        steps: prev.steps.map(step => 
          step.id === formStepData.id 
            ? { ...step, name: formStepData.name, courses: formStepData.courses }
            : step
        )
      }));
    } else {
      // Yeni adım ekle
      const newStep: LearningStep = {
        id: formStepData.id,
        name: formStepData.name,
        order: formRoadmapData.steps.length,
        courses: formStepData.courses
      };
      
      setFormRoadmapData(prev => ({
        ...prev,
        steps: [...prev.steps, newStep]
      }));
    }
    
    setStepDialogOpen(false);
    setSuccess(stepExists ? 'Adım başarıyla güncellendi' : 'Adım başarıyla eklendi');
  };
  
  // Roadmap kaydet
  const handleSaveRoadmap = async () => {
    try {
      setSaving(true);
      
      if (selectedRoadmap) {
        // Var olan roadmapi güncelle
        const isSuccess = await mockRoadmapService.updateRoadmap(selectedRoadmap.id, formRoadmapData);
        
        if (isSuccess) {
          setRoadmaps(prev => 
            prev.map(roadmap => 
              roadmap.id === selectedRoadmap.id
                ? { ...roadmap, ...formRoadmapData }
                : roadmap
            )
          );
          
          setSuccess('Öğrenme yolu başarıyla güncellendi');
        }
      } else {
        // Yeni roadmap oluştur
        const newRoadmap = await mockRoadmapService.createRoadmap(formRoadmapData);
        setRoadmaps(prev => [...prev, newRoadmap]);
        setSuccess('Yeni öğrenme yolu başarıyla oluşturuldu');
      }
      
      setRoadmapDialogOpen(false);
    } catch (err) {
      setError('Öğrenme yolu kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Roadmap silme işlemini onayla
  const handleConfirmDelete = async () => {
    if (!selectedRoadmap) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockRoadmapService.deleteRoadmap(selectedRoadmap.id);
      
      if (isSuccess) {
        setRoadmaps(prev => prev.filter(r => r.id !== selectedRoadmap.id));
        setSuccess('Öğrenme yolu başarıyla silindi');
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Öğrenme yolu silinirken bir hata oluştu');
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
  
  // Seçilen adımın kurslarını getir
  const getStepCourses = (courseIds: string[]): Course[] => {
    return courses.filter(course => courseIds.includes(course.id));
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
          Öğrenme Yolları Yönetimi
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleCreateRoadmap}
        >
          Yeni Öğrenme Yolu Ekle
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {/* Roadmap Listesi */}
      <Grid container spacing={3}>
        {roadmaps.map(roadmap => (
          <Grid item xs={12} md={6} key={roadmap.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <MapIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  {roadmap.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {roadmap.description}
                </Typography>
                
                <Chip 
                  icon={<PeopleIcon />} 
                  label={`${roadmap.enrolledUsers} Kayıtlı Kullanıcı`} 
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 1 }}
                />
                
                <Chip 
                  icon={<FlagIcon />} 
                  label={`${roadmap.steps.length} Adım`} 
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
                
                <Box sx={{ mt: 2 }}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Öğrenme Adımları:
                    </Typography>
                    
                    <Stepper orientation="vertical" sx={{ mt: 1 }}>
                      {roadmap.steps.map((step, index) => (
                        <Step key={step.id} active={true}>
                          <StepLabel>{step.name}</StepLabel>
                          <StepContent>
                            {step.courses.length > 0 ? (
                              <Box>
                                <Typography variant="caption">
                                  Bağlı Kurslar: {step.courses.length}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                  {step.courses.map(courseId => {
                                    const course = courses.find(c => c.id === courseId);
                                    return course ? (
                                      <Chip
                                        key={courseId}
                                        label={course.title}
                                        size="small"
                                        variant="outlined"
                                      />
                                    ) : null;
                                  })}
                                </Box>
                              </Box>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Henüz kurs bağlanmamış
                              </Typography>
                            )}
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>
                  </Paper>
                </Box>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />} 
                  onClick={() => handleEditRoadmap(roadmap)}
                >
                  Düzenle
                </Button>
                <Button 
                  size="small" 
                  startIcon={<PeopleIcon />}
                  onClick={() => handleViewProgress(roadmap)}
                >
                  İlerlemeyi Görüntüle
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => handleDeleteRoadmap(roadmap)}
                >
                  Sil
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {roadmaps.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center">Henüz bir öğrenme yolu eklenmemiş.</Typography>
          </Grid>
        )}
      </Grid>
      
      {/* Roadmap Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={roadmapDialogOpen} 
        onClose={() => setRoadmapDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedRoadmap ? 'Öğrenme Yolunu Düzenle' : 'Yeni Öğrenme Yolu Oluştur'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Başlık"
            fullWidth
            value={formRoadmapData.title}
            onChange={handleRoadmapFormChange}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Açıklama"
            fullWidth
            multiline
            rows={2}
            value={formRoadmapData.description}
            onChange={handleRoadmapFormChange}
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1">
              Öğrenme Adımları
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddStep}
            >
              Adım Ekle
            </Button>
          </Box>
          
          <Paper variant="outlined" sx={{ p: 2 }}>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="steps">
                {(provided: DroppableProvided) => (
                  <List
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {formRoadmapData.steps.length === 0 ? (
                      <ListItem>
                        <ListItemText primary="Henüz bir adım eklenmemiş" />
                      </ListItem>
                    ) : (
                      formRoadmapData.steps.map((step, index) => (
                        <Draggable key={step.id} draggableId={step.id} index={index}>
                          {(provided: DraggableProvided) => (
                            <ListItem
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              sx={{ 
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                mb: 1,
                                bgcolor: 'background.paper'
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: '30px' }}>
                                {index + 1}
                              </ListItemIcon>
                              
                              <ListItemText
                                primary={step.name}
                                secondary={
                                  <Box>
                                    {step.courses.length > 0 ? (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                        {getStepCourses(step.courses).map(course => (
                                          <Chip
                                            key={course.id}
                                            label={course.title}
                                            size="small"
                                            variant="outlined"
                                          />
                                        ))}
                                      </Box>
                                    ) : (
                                      "Kurs bağlanmamış"
                                    )}
                                  </Box>
                                }
                              />
                              
                              <Box>
                                <Tooltip title="Düzenle">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEditStep(step)}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Yukarı Taşı">
                                  <span>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleMoveStepUp(index)}
                                      disabled={index === 0}
                                    >
                                      <ArrowDropUpIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Aşağı Taşı">
                                  <span>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleMoveStepDown(index)}
                                      disabled={index === formRoadmapData.steps.length - 1}
                                    >
                                      <ArrowDropDownIcon fontSize="small" />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Kaldır">
                                  <IconButton 
                                    size="small" 
                                    color="error"
                                    onClick={() => handleRemoveStep(step.id)}
                                  >
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </ListItem>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoadmapDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveRoadmap} 
            variant="contained" 
            disabled={saving || !formRoadmapData.title || !formRoadmapData.description}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Adım Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={stepDialogOpen} 
        onClose={() => setStepDialogOpen(false)}
      >
        <DialogTitle>
          {formRoadmapData.steps.some(s => s.id === formStepData.id) 
            ? 'Adımı Düzenle' 
            : 'Yeni Adım Ekle'
          }
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="name"
            label="Adım Adı"
            fullWidth
            value={formStepData.name}
            onChange={handleStepFormChange}
            sx={{ mb: 2 }}
          />
          
          <Autocomplete
            multiple
            options={courses}
            getOptionLabel={(option) => option.title}
            value={getStepCourses(formStepData.courses)}
            onChange={handleCourseSelect}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Kurslar"
                placeholder="Kurs seçin"
                helperText="Bu adıma bağlamak istediğiniz kursları seçin"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.title}
                  {...getTagProps({ index })}
                  key={option.id}
                  size="small"
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveStep} 
            variant="contained" 
            disabled={!formStepData.name}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Öğrenme Yolunu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedRoadmap?.title}</strong> öğrenme yolunu silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz ve kayıtlı kullanıcılar etkilenecektir.
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
      
      {/* Kullanıcı İlerleme Dialog */}
      <Dialog
        open={progressDialogOpen}
        onClose={() => setProgressDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Kullanıcı İlerlemeleri: {selectedRoadmap?.title}</DialogTitle>
        <DialogContent>
          {userProgress.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ mb: 2 }} />
              <Typography>İlerlemeler yükleniyor...</Typography>
            </Box>
          ) : (
            <List>
              {userProgress.map((progress) => (
                <ListItem 
                  key={progress.userId} 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 2,
                    p: 2
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {progress.username}
                    </Typography>
                    <Chip 
                      label={`${progress.progress}% Tamamlandı`} 
                      color={progress.progress > 50 ? "success" : "primary"}
                      variant="outlined"
                    />
                  </Box>
                  
                  <Box sx={{ width: '100%' }}>
                    <Stepper orientation="vertical">
                      {selectedRoadmap?.steps.map(step => {
                        const isCompleted = progress.completedSteps.includes(step.id);
                        const isCurrent = progress.currentStep === step.id;
                        
                        return (
                          <Step key={step.id} active={isCurrent} completed={isCompleted}>
                            <StepLabel>
                              {step.name}
                              {isCurrent && (
                                <Typography variant="caption" component="span" sx={{ ml: 1, color: 'primary.main' }}>
                                  (Şu anki adım)
                                </Typography>
                              )}
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressDialogOpen(false)}>Kapat</Button>
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