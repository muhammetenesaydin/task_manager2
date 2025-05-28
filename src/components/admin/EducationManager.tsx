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
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CommentIcon from '@mui/icons-material/Comment';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AttachFileIcon from '@mui/icons-material/AttachFile';

// Kurs tipi tanımı
interface Lesson {
  id: string;
  title: string;
  videoUrl: string;
  order: number;
  description?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  lessons?: Lesson[];
  resources?: {
    id: string;
    title: string;
    fileUrl: string;
  }[];
  comments?: {
    id: string;
    user: string;
    text: string;
    date: string;
    adminResponse?: string;
  }[];
}

// Mock API servis fonksiyonları
const mockEducationService = {
  getCourses: async () => {
    // API'den kursları alma işlemi simülasyonu
    return new Promise<Course[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            title: 'React Temelleri',
            description: 'React kütüphanesinin temel kavramları ve bileşen yapısı',
            thumbnail: 'https://example.com/thumbnails/react.jpg',
            lessons: [
              { 
                id: '1001', 
                title: 'React Nedir?', 
                videoUrl: 'https://www.youtube.com/embed/dGcsHMXbSOA',
                order: 0,
                description: 'React kütüphanesine giriş' 
              },
              { 
                id: '1002', 
                title: 'JSX Kullanımı', 
                videoUrl: 'https://www.youtube.com/embed/uQJC5XRzXNs',
                order: 1,
                description: 'JSX sözdizimi ve kullanımı' 
              },
              { 
                id: '1003', 
                title: 'Component Yapısı', 
                videoUrl: 'https://www.youtube.com/embed/dQVCxODfueg',
                order: 2,
                description: 'React bileşenlerinin yapısı ve kullanımı' 
              }
            ],
            resources: [
              { id: '101', title: 'React Cheat Sheet', fileUrl: '/files/react-cheatsheet.pdf' },
              { id: '102', title: 'JSX Örnekleri', fileUrl: '/files/jsx-examples.pdf' }
            ],
            comments: [
              { id: '201', user: 'Ahmet Yılmaz', text: 'Harika bir eğitim olmuş, teşekkürler!', date: '2025-05-10' },
              { id: '202', user: 'Ayşe Demir', text: 'Bileşenler konusu biraz daha detaylı anlatılabilir mi?', date: '2025-05-12', adminResponse: 'Teşekkürler geri bildirim için, bir sonraki güncellememizde daha detaylı ele alacağız.' }
            ]
          },
          {
            id: '2',
            title: 'TypeScript ile Geliştirme',
            description: 'TypeScript dilinin temelleri ve React ile kullanımı',
            thumbnail: 'https://example.com/thumbnails/typescript.jpg',
            lessons: [
              { 
                id: '2001', 
                title: 'TypeScript Temelleri', 
                videoUrl: 'https://www.youtube.com/embed/BCg4U1FzODs',
                order: 0,
                description: 'TypeScript diline giriş' 
              },
              { 
                id: '2002', 
                title: 'Tip Tanımlamaları', 
                videoUrl: 'https://www.youtube.com/embed/ahCwqrYpIuM',
                order: 1,
                description: 'TypeScript tip sisteminin kullanımı' 
              }
            ],
            resources: [
              { id: '103', title: 'TypeScript Handbook', fileUrl: '/files/ts-handbook.pdf' }
            ],
            comments: [
              { id: '203', user: 'Mehmet Şahin', text: 'Interface ve Type arasındaki farkı daha iyi anladım', date: '2025-05-15' }
            ]
          }
        ]);
      }, 800);
    });
  },
  
  createCourse: async (course: Omit<Course, 'id'>) => {
    // API'ye yeni kurs gönderme işlemi simülasyonu
    return new Promise<Course>((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...course,
          lessons: course.lessons || [],
          resources: course.resources || [],
          comments: []
        });
      }, 1000);
    });
  },
  
  updateCourse: async (id: string, course: Partial<Course>) => {
    // API'ye kurs güncelleme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Kurs güncellendi:', id, course);
        resolve(true);
      }, 1000);
    });
  },
  
  deleteCourse: async (id: string) => {
    // API'den kurs silme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Kurs silindi:', id);
        resolve(true);
      }, 800);
    });
  },
  
  addLesson: async (courseId: string, lesson: Omit<Lesson, 'id'>) => {
    // API'ye ders ekleme işlemi simülasyonu
    return new Promise<Lesson>((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...lesson
        });
      }, 800);
    });
  },
  
  updateLesson: async (courseId: string, lessonId: string, lessonData: Partial<Lesson>) => {
    // API'ye ders güncelleme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Ders güncellendi:', courseId, lessonId, lessonData);
        resolve(true);
      }, 800);
    });
  },
  
  deleteLesson: async (courseId: string, lessonId: string) => {
    // API'den ders silme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Ders silindi:', courseId, lessonId);
        resolve(true);
      }, 800);
    });
  },
  
  addResource: async (courseId: string, resource: { title: string, fileUrl: string }) => {
    // API'ye kaynak ekleme işlemi simülasyonu
    return new Promise<{id: string, title: string, fileUrl: string}>((resolve) => {
      setTimeout(() => {
        const newId = Math.random().toString(36).substring(2, 9);
        resolve({
          id: newId,
          ...resource
        });
      }, 800);
    });
  },
  
  addCommentResponse: async (courseId: string, commentId: string, response: string) => {
    // API'ye yorum yanıtı ekleme işlemi simülasyonu
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('Yorum yanıtı eklendi:', courseId, commentId, response);
        resolve(true);
      }, 800);
    });
  }
};

// Eğitim yönetimi bileşeni
export const EducationManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState<number>(0);
  
  // Dialog durumları
  const [courseDialogOpen, setCourseDialogOpen] = useState<boolean>(false);
  const [lessonDialogOpen, setLessonDialogOpen] = useState<boolean>(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState<boolean>(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState<boolean>(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [deleteLessonDialogOpen, setDeleteLessonDialogOpen] = useState<boolean>(false);
  
  // Form verileri
  const [formCourseData, setFormCourseData] = useState<{
    title: string;
    description: string;
    thumbnail: string;
  }>({
    title: '',
    description: '',
    thumbnail: ''
  });
  
  const [formLessonData, setFormLessonData] = useState<{
    title: string;
    description: string;
    videoUrl: string;
    order: number;
  }>({
    title: '',
    description: '',
    videoUrl: '',
    order: 0
  });
  
  const [formResourceData, setFormResourceData] = useState<{
    title: string;
    fileUrl: string;
  }>({
    title: '',
    fileUrl: ''
  });
  
  const [formCommentResponse, setFormCommentResponse] = useState<{
    commentId: string;
    response: string;
  }>({
    commentId: '',
    response: ''
  });
  
  // Kursları yükle
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await mockEducationService.getCourses();
        setCourses(data);
      } catch (err) {
        setError('Kurslar yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  // Tab değişikliği işleyicisi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Form değişiklikleri işleyicisi
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Hangi formun güncelleneceğini belirle
    if (name === 'title' || name === 'description' || name === 'thumbnail') {
      setFormCourseData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (name === 'lessonTitle' || name === 'lessonDescription' || name === 'videoUrl' || name === 'order') {
      setFormLessonData(prev => ({
        ...prev,
        [name === 'lessonTitle' ? 'title' : (name === 'lessonDescription' ? 'description' : name)]: 
          name === 'order' ? parseInt(value) || 0 : value
      }));
    } else if (name === 'resourceTitle' || name === 'fileUrl') {
      setFormResourceData(prev => ({
        ...prev,
        [name === 'resourceTitle' ? 'title' : name]: value
      }));
    } else if (name === 'response') {
      setFormCommentResponse(prev => ({
        ...prev,
        response: value
      }));
    }
  };
  
  // Yeni kurs oluştur
  const handleAddCourse = () => {
    setSelectedCourse(null);
    setFormCourseData({
      title: '',
      description: '',
      thumbnail: ''
    });
    setCourseDialogOpen(true);
  };
  
  // Kurs düzenle
  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setFormCourseData({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || ''
    });
    setCourseDialogOpen(true);
  };
  
  // Kurs sil
  const handleDeleteCourse = (course: Course) => {
    setSelectedCourse(course);
    setDeleteDialogOpen(true);
  };
  
  // Ders ekle
  const handleAddLesson = (course: Course) => {
    setSelectedCourse(course);
    setSelectedLesson(null);
    
    // Derslerin sıra numarası için en son dersin sırasını al ve bir arttır
    const lastOrder = course.lessons && course.lessons.length > 0
      ? Math.max(...course.lessons.map(l => l.order)) + 1
      : 0;
    
    setFormLessonData({
      title: '',
      description: '',
      videoUrl: '',
      order: lastOrder
    });
    setLessonDialogOpen(true);
  };
  
  // Ders düzenle
  const handleEditLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setFormLessonData({
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl,
      order: lesson.order
    });
    setLessonDialogOpen(true);
  };
  
  // Ders sil
  const handleDeleteLesson = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course);
    setSelectedLesson(lesson);
    setDeleteLessonDialogOpen(true);
  };
  
  // Kaynak ekle
  const handleAddResource = (course: Course) => {
    setSelectedCourse(course);
    setFormResourceData({
      title: '',
      fileUrl: ''
    });
    setResourceDialogOpen(true);
  };
  
  // Yorum yanıtla
  const handleRespondComment = (course: Course, commentId: string) => {
    setSelectedCourse(course);
    // Var olan yanıtı al (eğer varsa)
    const comment = course.comments?.find(c => c.id === commentId);
    setFormCommentResponse({
      commentId,
      response: comment?.adminResponse || ''
    });
    setCommentDialogOpen(true);
  };
  
  // Kurs kaydet
  const handleSaveCourse = async () => {
    try {
      setSaving(true);
      
      if (selectedCourse) {
        // Mevcut kursu güncelle
        const isSuccess = await mockEducationService.updateCourse(selectedCourse.id, formCourseData);
        
        if (isSuccess) {
          // Kurslar listesini güncelle
          setCourses(prev => prev.map(course => 
            course.id === selectedCourse.id 
              ? { ...course, ...formCourseData }
              : course
          ));
          setSuccess('Kurs başarıyla güncellendi');
        }
      } else {
        // Yeni kurs oluştur
        const newCourse = await mockEducationService.createCourse(formCourseData);
        setCourses(prev => [...prev, newCourse]);
        setSuccess('Yeni kurs başarıyla oluşturuldu');
      }
      
      setCourseDialogOpen(false);
    } catch (err) {
      setError('Kurs kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Ders kaydet
  const handleSaveLesson = async () => {
    if (!selectedCourse) return;
    
    try {
      setSaving(true);
      
      if (selectedLesson) {
        // Mevcut dersi güncelle
        const isSuccess = await mockEducationService.updateLesson(
          selectedCourse.id,
          selectedLesson.id,
          formLessonData
        );
        
        if (isSuccess) {
          // Kurslar listesini güncelle
          setCourses(prev => prev.map(course => 
            course.id === selectedCourse.id 
              ? { 
                  ...course, 
                  lessons: course.lessons?.map(lesson =>
                    lesson.id === selectedLesson.id
                      ? { ...lesson, ...formLessonData }
                      : lesson
                  )
                }
              : course
          ));
          setSuccess('Ders başarıyla güncellendi');
        }
      } else {
        // Yeni ders ekle
        const newLesson = await mockEducationService.addLesson(
          selectedCourse.id,
          formLessonData
        );
        
        // Kurslar listesini güncelle
        setCourses(prev => prev.map(course => 
          course.id === selectedCourse.id 
            ? { 
                ...course, 
                lessons: [...(course.lessons || []), newLesson]
              }
            : course
        ));
        
        setSuccess('Ders başarıyla eklendi');
      }
      
      setLessonDialogOpen(false);
    } catch (err) {
      setError('Ders kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Ders silme işlemi
  const handleConfirmDeleteLesson = async () => {
    if (!selectedCourse || !selectedLesson) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockEducationService.deleteLesson(selectedCourse.id, selectedLesson.id);
      
      if (isSuccess) {
        // Kurslar listesini güncelle
        setCourses(prev => prev.map(course => 
          course.id === selectedCourse.id 
            ? { 
                ...course, 
                lessons: course.lessons?.filter(lesson => lesson.id !== selectedLesson.id)
              }
            : course
        ));
        setSuccess('Ders başarıyla silindi');
      }
      
      setDeleteLessonDialogOpen(false);
    } catch (err) {
      setError('Ders silinirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Kurs silme işlemi
  const handleConfirmDelete = async () => {
    if (!selectedCourse) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockEducationService.deleteCourse(selectedCourse.id);
      
      if (isSuccess) {
        setCourses(prev => prev.filter(course => course.id !== selectedCourse.id));
        setSuccess('Kurs başarıyla silindi');
      }
      
      setDeleteDialogOpen(false);
    } catch (err) {
      setError('Kurs silinirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Kaynak ekle
  const handleSaveResource = async () => {
    if (!selectedCourse) return;
    
    try {
      setSaving(true);
      const newResource = await mockEducationService.addResource(
        selectedCourse.id, 
        formResourceData
      );
      
      // Kurslar listesini güncelle
      setCourses(prev => prev.map(course => 
        course.id === selectedCourse.id 
          ? { 
              ...course, 
              resources: [...(course.resources || []), newResource]
            }
          : course
      ));
      
      setSuccess('Kaynak başarıyla eklendi');
      setResourceDialogOpen(false);
    } catch (err) {
      setError('Kaynak eklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Yorum yanıtı kaydet
  const handleSaveCommentResponse = async () => {
    if (!selectedCourse) return;
    
    try {
      setSaving(true);
      const isSuccess = await mockEducationService.addCommentResponse(
        selectedCourse.id,
        formCommentResponse.commentId,
        formCommentResponse.response
      );
      
      if (isSuccess) {
        // Kurslar listesini güncelle
        setCourses(prev => prev.map(course => 
          course.id === selectedCourse.id 
            ? { 
                ...course, 
                comments: course.comments?.map(comment =>
                  comment.id === formCommentResponse.commentId
                    ? { ...comment, adminResponse: formCommentResponse.response }
                    : comment
                )
              }
            : course
        ));
        
        setSuccess('Yanıt başarıyla kaydedildi');
      }
      
      setCommentDialogOpen(false);
    } catch (err) {
      setError('Yanıt kaydedilirken bir hata oluştu');
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
          Eğitim Yönetimi
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleAddCourse}
        >
          Yeni Kurs Ekle
        </Button>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {/* Kurs Listesi */}
      <Grid container spacing={3}>
        {courses.map(course => (
          <Grid item xs={12} key={course.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{course.title}</Typography>
                <Typography variant="body2" color="text.secondary">{course.description}</Typography>
                
                <Accordion sx={{ mt: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Detaylar &amp; Yönetim</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                      <Tab label="Dersler" icon={<VideoLibraryIcon />} iconPosition="start" />
                      <Tab 
                        label={`Kaynaklar (${course.resources?.length || 0})`} 
                        icon={<AttachFileIcon />} 
                        iconPosition="start" 
                      />
                      <Tab 
                        label={`Yorumlar (${course.comments?.length || 0})`} 
                        icon={<CommentIcon />} 
                        iconPosition="start" 
                      />
                    </Tabs>
                    
                    {/* Dersler Sekmesi */}
                    {tabValue === 0 && (
                      <Box>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />} 
                          sx={{ mb: 2 }}
                          onClick={() => handleAddLesson(course)}
                        >
                          Yeni Ders Ekle
                        </Button>
                        
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {course.lessons && course.lessons.length > 0 ? (
                            [...course.lessons]
                              .sort((a, b) => a.order - b.order)
                              .map(lesson => (
                                <ListItem 
                                  key={lesson.id}
                                  secondaryAction={
                                    <Box>
                                      <IconButton 
                                        edge="end" 
                                        aria-label="düzenle"
                                        onClick={() => handleEditLesson(course, lesson)}
                                        sx={{ mr: 1 }}
                                      >
                                        <EditIcon />
                                      </IconButton>
                                      <IconButton 
                                        edge="end" 
                                        aria-label="sil"
                                        onClick={() => handleDeleteLesson(course, lesson)}
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                  }
                                >
                                  <ListItemText 
                                    primary={`${lesson.order + 1}. ${lesson.title}`}
                                    secondary={lesson.description || 'Açıklama yok'} 
                                  />
                                </ListItem>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText primary="Henüz bir ders eklenmemiş." />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                    
                    {/* Kaynaklar Sekmesi */}
                    {tabValue === 1 && (
                      <Box>
                        <Button 
                          variant="outlined" 
                          startIcon={<AddIcon />} 
                          sx={{ mb: 2 }}
                          onClick={() => handleAddResource(course)}
                        >
                          Yeni Kaynak Ekle
                        </Button>
                        
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {course.resources && course.resources.length > 0 ? (
                            course.resources.map(resource => (
                              <ListItem key={resource.id}>
                                <ListItemText 
                                  primary={resource.title}
                                  secondary={resource.fileUrl} 
                                />
                              </ListItem>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText primary="Henüz bir kaynak eklenmemiş." />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                    
                    {/* Yorumlar Sekmesi */}
                    {tabValue === 2 && (
                      <Box>
                        <List sx={{ bgcolor: 'background.paper' }}>
                          {course.comments && course.comments.length > 0 ? (
                            course.comments.map(comment => (
                              <ListItem key={comment.id} alignItems="flex-start" sx={{ flexDirection: 'column' }}>
                                <ListItemText 
                                  primary={
                                    <Typography>
                                      <strong>{comment.user}</strong> · {comment.date}
                                    </Typography>
                                  }
                                  secondary={comment.text}
                                />
                                
                                {comment.adminResponse && (
                                  <Box sx={{ ml: 4, mt: 1, p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                                    <Typography variant="body2" color="white">
                                      Admin yanıtı: {comment.adminResponse}
                                    </Typography>
                                  </Box>
                                )}
                                
                                <Button 
                                  size="small"
                                  sx={{ mt: 1 }} 
                                  onClick={() => handleRespondComment(course, comment.id)}
                                >
                                  {comment.adminResponse ? 'Yanıtı Düzenle' : 'Yanıtla'}
                                </Button>
                                <Divider sx={{ width: '100%', mt: 1 }} />
                              </ListItem>
                            ))
                          ) : (
                            <ListItem>
                              <ListItemText primary="Henüz bir yorum yapılmamış." />
                            </ListItem>
                          )}
                        </List>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<EditIcon />} 
                  onClick={() => handleEditCourse(course)}
                >
                  Düzenle
                </Button>
                <Button 
                  size="small" 
                  color="error" 
                  startIcon={<DeleteIcon />} 
                  onClick={() => handleDeleteCourse(course)}
                >
                  Sil
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
        
        {courses.length === 0 && (
          <Grid item xs={12}>
            <Typography align="center">Henüz bir kurs eklenmemiş.</Typography>
          </Grid>
        )}
      </Grid>
      
      {/* Kurs Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={courseDialogOpen} 
        onClose={() => setCourseDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedCourse ? 'Kursu Düzenle' : 'Yeni Kurs Oluştur'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="title"
            label="Kurs Başlığı"
            fullWidth
            value={formCourseData.title}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Kurs Açıklaması"
            fullWidth
            multiline
            rows={4}
            value={formCourseData.description}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="thumbnail"
            label="Kurs Resmi"
            placeholder="https://example.com/image.jpg"
            fullWidth
            value={formCourseData.thumbnail}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveCourse} 
            variant="contained" 
            disabled={saving || !formCourseData.title || !formCourseData.description}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ders Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={lessonDialogOpen} 
        onClose={() => setLessonDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{selectedLesson ? 'Dersi Düzenle' : 'Yeni Ders Ekle'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="lessonTitle"
            label="Ders Başlığı"
            fullWidth
            value={formLessonData.title}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="lessonDescription"
            label="Ders Açıklaması"
            fullWidth
            multiline
            rows={3}
            value={formLessonData.description}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="videoUrl"
            label="Video URL (YouTube embed URL)"
            placeholder="https://www.youtube.com/embed/video_id"
            fullWidth
            value={formLessonData.videoUrl}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="order"
            label="Sıra Numarası"
            type="number"
            fullWidth
            value={formLessonData.order}
            onChange={handleFormChange}
            helperText="Dersin sıralama numarası (0'dan başlar)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLessonDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveLesson} 
            variant="contained" 
            disabled={saving || !formLessonData.title || !formLessonData.videoUrl}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Ders Silme Dialog */}
      <Dialog
        open={deleteLessonDialogOpen}
        onClose={() => setDeleteLessonDialogOpen(false)}
      >
        <DialogTitle>Dersi Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedLesson?.title}</strong> dersini silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteLessonDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleConfirmDeleteLesson} 
            variant="contained" 
            color="error"
            disabled={saving}
          >
            {saving ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kaynak Ekleme Dialog */}
      <Dialog 
        open={resourceDialogOpen} 
        onClose={() => setResourceDialogOpen(false)}
      >
        <DialogTitle>Yeni Kaynak Ekle</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="resourceTitle"
            label="Kaynak Başlığı"
            fullWidth
            value={formResourceData.title}
            onChange={handleFormChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="fileUrl"
            label="Dosya URL"
            placeholder="https://example.com/files/document.pdf"
            fullWidth
            value={formResourceData.fileUrl}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResourceDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveResource} 
            variant="contained" 
            disabled={saving || !formResourceData.title || !formResourceData.fileUrl}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Yorum Yanıtlama Dialog */}
      <Dialog 
        open={commentDialogOpen} 
        onClose={() => setCommentDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>Yorumu Yanıtla</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="response"
            label="Yanıtınız"
            fullWidth
            multiline
            rows={3}
            value={formCommentResponse.response}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveCommentResponse} 
            variant="contained" 
            disabled={saving || !formCommentResponse.response}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Kurs Silme Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Kursu Sil</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{selectedCourse?.title}</strong> kursunu silmek istediğinize emin misiniz?
            Bu işlem geri alınamaz.
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