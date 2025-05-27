import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  Chip,
  Paper,
  CircularProgress,
  Rating,
  LinearProgress,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent as MUIStepContent,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  SelectChangeEvent,
  Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import MemoryIcon from '@mui/icons-material/Memory';
import SecurityIcon from '@mui/icons-material/Security';
import WebIcon from '@mui/icons-material/Web';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import DoneIcon from '@mui/icons-material/Done';
import TimelineIcon from '@mui/icons-material/Timeline';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LaunchIcon from '@mui/icons-material/Launch';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import PeopleIcon from '@mui/icons-material/People';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DateRangeIcon from '@mui/icons-material/DateRange';

import { useAuth } from '../context/AuthContext';
import learningService, { LearningPath, LearningStep, StepContent as CourseStepContent } from '../services/learningService';

// Kurs kategorileri
const categories = [
  { id: 'all', name: 'Tümü', icon: <SchoolIcon /> },
  { id: 'ai', name: 'Yapay Zeka', icon: <SmartToyIcon /> },
  { id: 'web', name: 'Web Geliştirme', icon: <WebIcon /> },
  { id: 'mobile', name: 'Mobil Uygulama', icon: <PhoneAndroidIcon /> },
  { id: 'embedded', name: 'Gömülü Sistemler', icon: <MemoryIcon /> },
  { id: 'data-science', name: 'Veri Bilimi', icon: <StorageIcon /> },
  { id: 'cyber-security', name: 'Siber Güvenlik', icon: <SecurityIcon /> },
  { id: 'robotics', name: 'Robotik', icon: <PrecisionManufacturingIcon /> },
  { id: 'programming', name: 'Programlama', icon: <CodeIcon /> },
];

// Örnek kurs verileri
const coursesData = [
  {
    id: 'ai-101',
    title: 'Yapay Zeka Temelleri',
    category: 'ai',
    image: 'https://source.unsplash.com/random/400x300/?ai',
    instructor: 'Dr. Ahmet Yılmaz',
    rating: 4.7,
    enrolled: 3420,
    duration: '8 saat',
    level: 'Başlangıç',
    description: 'Yapay zeka konseptleri ve uygulamaları hakkında temel bilgiler ve pratik örnekler',
    progress: 0,
    totalModules: 12,
    completedModules: 0
  },
  {
    id: 'web-react',
    title: 'Modern React ile Web Geliştirme',
    category: 'web',
    image: 'https://source.unsplash.com/random/400x300/?webdevelopment',
    instructor: 'Zeynep Kaya',
    rating: 4.8,
    enrolled: 5120,
    duration: '15 saat',
    level: 'Orta Seviye',
    description: 'React, Redux ve TypeScript ile modern web uygulamaları geliştirmeyi öğrenin',
    progress: 35,
    totalModules: 18,
    completedModules: 6
  },
  {
    id: 'embedded-arduino',
    title: 'Arduino ile Gömülü Sistemler',
    category: 'embedded',
    image: 'https://source.unsplash.com/random/400x300/?arduino',
    instructor: 'Murat Demir',
    rating: 4.5,
    enrolled: 2890,
    duration: '10 saat',
    level: 'Başlangıç',
    description: 'Arduino platformunu kullanarak gömülü sistem projelerini nasıl geliştirebileceğinizi öğrenin',
    progress: 65,
    totalModules: 15,
    completedModules: 10
  },
  {
    id: 'data-python',
    title: 'Python ile Veri Analizi',
    category: 'data-science',
    image: 'https://source.unsplash.com/random/400x300/?datascience',
    instructor: 'Prof. Ayşe Yıldız',
    rating: 4.9,
    enrolled: 6750,
    duration: '12 saat',
    level: 'Orta Seviye',
    description: 'Pandas, NumPy ve Matplotlib kütüphaneleri ile veri analizi ve görselleştirme',
    progress: 20,
    totalModules: 20,
    completedModules: 4
  },
  {
    id: 'cyber-101',
    title: 'Siber Güvenlik Temelleri',
    category: 'cyber-security',
    image: 'https://source.unsplash.com/random/400x300/?cybersecurity',
    instructor: 'Hakan Kılıç',
    rating: 4.6,
    enrolled: 4120,
    duration: '14 saat',
    level: 'Başlangıç',
    description: 'Ağ güvenliği, kriptografi ve güvenlik açıkları hakkında temel bilgiler',
    progress: 45,
    totalModules: 16,
    completedModules: 7
  },
  {
    id: 'robotics-intro',
    title: 'Robotik Sistemlere Giriş',
    category: 'robotics',
    image: 'https://source.unsplash.com/random/400x300/?robotics',
    instructor: 'Dr. Mehmet Öz',
    rating: 4.4,
    enrolled: 2340,
    duration: '9 saat',
    level: 'Başlangıç',
    description: 'Robotik sistemlerin temelleri, sensörler ve aktüatörler hakkında bilgi edinme',
    progress: 10,
    totalModules: 14,
    completedModules: 1
  },
  {
    id: 'mobile-flutter',
    title: 'Flutter ile Mobil Uygulama Geliştirme',
    category: 'mobile',
    image: 'https://source.unsplash.com/random/400x300/?mobileapp',
    instructor: 'Can Yılmaz',
    rating: 4.7,
    enrolled: 3840,
    duration: '16 saat',
    level: 'Orta Seviye',
    description: 'Dart dili ve Flutter framework kullanarak iOS ve Android için hızlı uygulama geliştirme',
    progress: 0,
    totalModules: 22,
    completedModules: 0
  },
  {
    id: 'prog-algorithms',
    title: 'Algoritma ve Veri Yapıları',
    category: 'programming',
    image: 'https://source.unsplash.com/random/400x300/?algorithm',
    instructor: 'Prof. Ali Durmaz',
    rating: 4.8,
    enrolled: 4920,
    duration: '18 saat',
    level: 'İleri Seviye',
    description: 'Temel algoritmaları ve veri yapılarını öğrenerek daha verimli kod yazmayı öğrenin',
    progress: 75,
    totalModules: 24,
    completedModules: 18
  }
];

// Atanan eğitim görevleri - örnek veri
const assignedCoursesData = [
  {
    id: 'task-ai-101',
    courseId: 'ai-101',
    title: 'Yapay Zeka Temelleri',
    category: 'ai',
    image: 'https://source.unsplash.com/random/400x300/?ai',
    assignedBy: 'Ahmet Yönetici',
    assignedDate: '2023-04-15',
    dueDate: '2023-05-15',
    status: 'in-progress', // 'not-started', 'in-progress', 'completed', 'overdue'
    priority: 'high', // 'low', 'medium', 'high'
    progress: 25,
    totalModules: 12,
    completedModules: 3
  },
  {
    id: 'task-web-react',
    courseId: 'web-react',
    title: 'Modern React ile Web Geliştirme',
    category: 'web',
    image: 'https://source.unsplash.com/random/400x300/?webdevelopment',
    assignedBy: 'Mehmet Yıldız',
    assignedDate: '2023-04-10',
    dueDate: '2023-04-25',
    status: 'overdue',
    priority: 'medium',
    progress: 35,
    totalModules: 18,
    completedModules: 6
  },
  {
    id: 'task-data-python',
    courseId: 'data-python',
    title: 'Python ile Veri Analizi',
    category: 'data-science',
    image: 'https://source.unsplash.com/random/400x300/?datascience',
    assignedBy: 'Ayşe Demir',
    assignedDate: '2023-05-01',
    dueDate: '2023-06-01',
    status: 'not-started',
    priority: 'low',
    progress: 0,
    totalModules: 20,
    completedModules: 0
  }
];

interface LearningPathListProps {
  selectedCategory: string;
}

// Öğrenme yolları için adım içeriği geliştirilmiş versiyonlar
// API Detaylı içerik
const apiDetailedContent: CourseStepContent = {
  title: "API Geliştirme Detaylı Bilgi",
  description: `API (Uygulama Programlama Arayüzü), yazılım bileşenleri arasında tanımlanmış iletişimi sağlayan bir arayüzdür. Modern web uygulamaları ve mikroservis mimarileri oluşturmak için temel yapı taşıdır.

API'ler Neden Önemlidir?
- Farklı sistemlerin birbiriyle iletişim kurmasını sağlar
- Uygulama geliştirmeyi modüler hale getirir
- Kod yeniden kullanımını artırır
- Ölçeklenebilirliği geliştirir

API Türleri:
1. REST API: HTTP protokolünü temel alan, stateless (durumsuz) iletişim sağlayan, JSON/XML formatlarını kullanan web servisleri.
2. GraphQL: İstemcilerin tam olarak istedikleri verileri sorgulayabildiği, tek bir endpoint kullanan modern bir API yapısı.
3. SOAP: XML tabanlı, daha katı kuralları olan, özellikle kurumsal sistemlerde kullanılan bir protokol.
4. gRPC: Google tarafından geliştirilen, yüksek performanslı RPC (Uzak Prosedür Çağrısı) framework'ü.

API Güvenliği:
- Kimlik doğrulama (Authentication): Kullanıcının kimliği doğrulanır (JWT, OAuth, API Keys)
- Yetkilendirme (Authorization): Doğrulanmış kullanıcının erişim izinleri kontrol edilir
- Rate Limiting: Aşırı istekleri sınırlandırarak DDoS saldırılarını önler
- Veri Doğrulama: Gelen verilerin bütünlüğünü kontrol eder

İyi Bir API Tasarımında Dikkat Edilmesi Gerekenler:
- Tutarlı naming conventions (isimlendirme kuralları)
- Uygun HTTP metodlarının kullanımı (GET, POST, PUT, DELETE)
- Kapsamlı hata yönetimi ve anlamlı hata mesajları
- Sürüm kontrolü (versiyonlama)
- Kapsamlı dokümantasyon (Swagger/OpenAPI)`,
  videoUrl: "https://www.youtube.com/embed/CxGSnA-RTsA",
  resources: [
    { title: "RESTful API Tasarım Rehberi", url: "https://restfulapi.net/" },
    { title: "GraphQL Resmi Belgeleri", url: "https://graphql.org/learn/" },
    { title: "Swagger ile API Dokümantasyonu", url: "https://swagger.io/docs/" },
    { title: "JWT Authentication Rehberi", url: "https://jwt.io/introduction/" }
  ],
  quizQuestions: [
    {
      question: "REST API'lerde kullanılan temel HTTP metodları nelerdir?",
      answer: "GET, POST, PUT, DELETE, PATCH"
    },
    {
      question: "API güvenliği için hangi önlemler alınmalıdır?",
      answer: "Authentication, Authorization, Rate Limiting, Data Validation, HTTPS"
    }
  ]
};

// Öğrenme yolları bileşeni
const LearningPathList: React.FC<LearningPathListProps> = ({ selectedCategory }) => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<LearningStep | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [expandedPath, setExpandedPath] = useState<string | false>(false);
  const [apiDetailedContent, setApiDetailedContent] = useState<CourseStepContent | null>(null);
  const { user } = useAuth(); // useAuth hook'unu bileşen seviyesinde kullanıyoruz
  
  // Kategori değiştiğinde yeni öğrenme yollarını getir
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await learningService.getLearningPaths(selectedCategory);
        setLearningPaths(data);
      } catch (err) {
        console.error('Öğrenme yolları yüklenirken hata oluştu:', err);
        setError('Öğrenme yolları yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedCategory]);
  
  const handleStepClick = async (step: LearningStep) => {
    try {
      // Detaylı içeriği getir - apiService yerine learningService kullanıyoruz
      const detailedContent = await learningService.getStepDetails(step.id);
      
      if (detailedContent) {
        setSelectedStep({
          ...step,
          content: detailedContent
        });
      } else {
        setSelectedStep(step);
      }
      
      setDialogOpen(true);
    } catch (err) {
      console.error('Adım detayları yüklenirken hata oluştu:', err);
      // Hata olsa bile mevcut içerikle devam et
      setSelectedStep(step);
      setDialogOpen(true);
    }
  };
  
  // Quiz cevabını gönder
  const handleSubmitQuiz = async (event: React.MouseEvent) => {
    event.preventDefault();
    if (!selectedStep) return;
    
    // Form içinden cevabı al
    const form = event.currentTarget.closest('form');
    if (!form) return;
    
    const answerInput = form.querySelector('textarea') as HTMLTextAreaElement;
    if (!answerInput) return;
    
    const answer = answerInput.value.trim();
    if (!answer) {
      alert('Lütfen bir cevap girin');
      return;
    }
    
    try {
      // useAuth hook'unu doğrudan çağırmak yerine bileşen seviyesinde kullanmalıyız
      if (!user || !user.id) {
        console.error('Kullanıcı kimliği bulunamadı');
        return;
      }
      
      // Normalde her quiz için benzersiz bir ID olur, şimdilik step ID kullanıyoruz
      const result = await learningService.submitQuizAnswer(
        user.id, 
        selectedStep.id, 
        `quiz-${selectedStep.id}`, 
        answer
      );
      
      // Başarılı cevap işleme (mesaj gösterme, vs.)
      console.log('Quiz sonucu:', result);
      
      // İlerlemeyi kaydet (örnek olarak %100 ilerleme)
      await learningService.saveUserProgress(user.id, selectedStep.id, 100);
      
      // Form temizle ve başarı mesajı göster
      answerInput.value = '';
      alert('Cevabınız başarıyla gönderildi');
      
    } catch (err) {
      console.error('Quiz cevabı gönderilirken hata oluştu:', err);
      alert('Cevap gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
  };
  
  const handlePathChange = (pathId: string) => {
    setExpandedPath(expandedPath === pathId ? false : pathId);
  };

  return (
    <Box sx={{ mt: 4 }}>
      {selectedCategory === 'all' ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6">
            Öğrenme yollarını görüntülemek için bir kategori seçin
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Her kategoride uzmanlaşmak için adım adım rehberler bulacaksınız
          </Typography>
        </Paper>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff4f4', color: 'error.main' }}>
          <Typography variant="body1">{error}</Typography>
        </Paper>
      ) : learningPaths && learningPaths.length > 0 ? (
        <>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            Öğrenme Yolları
            <TimelineIcon sx={{ ml: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          </Typography>
          
          {learningPaths.map((path, pathIndex) => (
            <Accordion 
              key={pathIndex} 
              expanded={expandedPath === `path-${pathIndex}`}
              onChange={() => handlePathChange(`path-${pathIndex}`)}
              sx={{ 
                mb: 3, 
                borderLeft: '4px solid #1976d2',
                '&:before': {
                  display: 'none',
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                onClick={(e) => {
                  // Eğer harici URL varsa, kullanıcıyı yönlendir
                  if (path.externalUrl) {
                    e.stopPropagation(); // Accordion'un açılmasını engelle
                    window.open(path.externalUrl, '_blank'); // Yeni sekmede aç
                  }
                }}
                sx={{ 
                  '& .MuiAccordionSummary-content': { 
                    alignItems: 'center'
                  },
                  cursor: path.externalUrl ? 'pointer' : 'default',
                  '&:hover': {
                    bgcolor: path.externalUrl ? 'rgba(25, 118, 210, 0.08)' : 'transparent'
                  }
                }}
              >
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  {path.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                  {path.description}
                </Typography>
                {path.externalUrl && (
                  <IconButton 
                    size="small" 
                    sx={{ ml: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(path.externalUrl, '_blank');
                    }}
                  >
                    <LaunchIcon fontSize="small" />
                  </IconButton>
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Stepper orientation="vertical" sx={{ pl: 2, pb: 2 }}>
                  {path.steps && path.steps.map((step, stepIndex) => (
                    <Step key={stepIndex} active={true} completed={false}>
                      <StepLabel>
                        <Typography variant="subtitle1" fontWeight={500}>{step.name}</Typography>
                      </StepLabel>
                      <MUIStepContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {step.content?.description?.substring(0, 120) || ''}...
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleStepClick(step)}
                          startIcon={<InfoIcon />}
                          sx={{ mb: 2 }}
                        >
                          Detaylı Bilgi
                        </Button>
                      </MUIStepContent>
                    </Step>
                  ))}
                </Stepper>
              </AccordionDetails>
            </Accordion>
          ))}
          
          {/* İçerik detay diyaloğu */}
          <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            maxWidth="md"
            fullWidth
          >
            {selectedStep && (
              <>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  {selectedStep.content.title}
                </DialogTitle>
                <DialogContent dividers>
                  <Typography variant="body1" paragraph>
                    {selectedStep.content.description}
                  </Typography>
                  
                  {selectedStep.content.videoUrl && (
                    <Box sx={{ mt: 3, mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Eğitim Videosu
                      </Typography>
                      <Paper 
                        elevation={3} 
                        sx={{ 
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          overflow: 'hidden',
                          mb: 2
                        }}
                      >
                        <iframe
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0
                          }}
                          src={`${selectedStep.content.videoUrl.replace('watch?v=', 'embed/')}?autoplay=0&controls=1`}
                          title="Eğitim Videosu"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </Paper>
                    </Box>
                  )}
                  
                  {selectedStep.content.resources && selectedStep.content.resources.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Kaynaklar ve Dökümanlar
                      </Typography>
                      <List>
                        {selectedStep.content.resources.map((resource, index) => (
                          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                            <ListItemText
                              primary={
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#1976d2' }}
                                >
                                  <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
                                  {resource.title}
                                </a>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                  
                  {/* Quiz/Ödev bölümü */}
                  <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f9ff', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      Mini Quiz
                    </Typography>
                    
                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                      <form>
                        <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
                          {selectedStep.id === 'web-backend-api' 
                            ? 'RESTful API ve GraphQL arasındaki temel farklar nelerdir?' 
                            : 'Bu konuyla ilgili aşağıdaki soruyu cevaplayın:'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedStep.id === 'web-backend-api'
                            ? 'En az üç temel fark belirterek açıklayınız.'
                            : 'Öğrendiğiniz bilgileri pekiştirmek için soru.'}
                        </Typography>
                        
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Cevabınızı buraya yazın..."
                          variant="outlined"
                          sx={{ mt: 2 }}
                          name="quizAnswer"
                        />
                        
                        <Button 
                          variant="contained" 
                          color="primary" 
                          sx={{ mt: 2 }}
                          onClick={handleSubmitQuiz}
                          type="button"
                        >
                          Cevabı Gönder
                        </Button>
                      </form>
                    </Paper>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleDialogClose}>Kapat</Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    startIcon={<PlayCircleOutlineIcon />}
                  >
                    Kursa Git
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="body1">
            Bu kategori için öğrenme yolu yakında eklenecektir
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

// Atanan Eğitimler bileşeni
interface AssignedCoursesListProps {
  courses: any[];
  onUpdateStatus: (courseId: string, newStatus: string) => void;
}

const AssignedCoursesList: React.FC<AssignedCoursesListProps> = ({ courses, onUpdateStatus }) => {
  const navigate = useNavigate();
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [completedTaskId, setCompletedTaskId] = useState<string | null>(null);
  
  // Görev durum rengini belirle
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'in-progress':
        return 'info.main';
      case 'not-started':
        return 'text.secondary';
      case 'overdue':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };
  
  // Görev durumunu Türkçe metin olarak döndür
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'in-progress':
        return 'Devam Ediyor';
      case 'not-started':
        return 'Başlanmadı';
      case 'overdue':
        return 'Gecikmiş';
      default:
        return 'Bilinmiyor';
    }
  };
  
  // Öncelik seviyesini Türkçe metin olarak döndür
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Bilinmiyor';
    }
  };
  
  // Tarih formatını düzenle (2023-05-15 -> 15 Mayıs 2023)
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
  };
  
  // Görev tamamlama işleyicisi
  const handleCompleteTask = (courseId: string) => {
    onUpdateStatus(courseId, 'completed');
    setCompletedTaskId(courseId);
    setShowSuccessMessage(courses.find(c => c.id === courseId)?.title || 'Kurs');
    
    // 3 saniye sonra başarı mesajını kaldır
    setTimeout(() => {
      setShowSuccessMessage(null);
      setCompletedTaskId(null);
    }, 3000);
  };
  
  // Göreve başlama işleyicisi
  const handleStartTask = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course && course.status === 'not-started') {
      onUpdateStatus(courseId, 'in-progress');
    }
    
    // Hedef kurs ID'si belirleme - debug için console'a yazdıralım
    const targetCourseId = course?.courseId || course?.id;
    console.log('Başlatılacak kurs ID:', targetCourseId);
    console.log('Orijinal kurs:', course);
    
    if (targetCourseId) {
      // Doğrudan kurs detay sayfasına yönlendir
      navigate(`/course/${targetCourseId}`);
    }
  };
  
  // Görev durumuna göre sıralama yapalım (önce gecikmiş, sonra devam eden, sonra başlanmamış, en son tamamlanmış)
  const sortedCourses = [...courses].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'overdue': 0,
      'in-progress': 1,
      'not-started': 2,
      'completed': 3
    };
    
    return statusOrder[a.status] - statusOrder[b.status];
  });
  
  return (
    <Box sx={{ mt: 4, position: 'relative' }}>
      {/* Tamamlama başarı mesajı */}
      <Snackbar
        open={!!showSuccessMessage}
        autoHideDuration={3000}
        onClose={() => setShowSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          <Typography variant="subtitle1">
            Tebrikler! 🎉 "{showSuccessMessage}" görevi tamamlandı
          </Typography>
        </Alert>
      </Snackbar>
      
      {courses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6">
            Atanmış eğitim göreviniz bulunmuyor
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Yöneticinizden size eğitim görevi atamasını isteyebilirsiniz
          </Typography>
        </Paper>
      ) : (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
          {sortedCourses.map((course) => (
            <Paper 
              key={course.id} 
              sx={{ 
                mb: 2, 
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                transform: completedTaskId === course.id ? 'scale(1.02)' : 'scale(1)',
                boxShadow: completedTaskId === course.id ? '0 8px 30px rgba(0,200,83,0.2)' : '',
              }}
            >
              <ListItem 
                alignItems="flex-start"
                sx={{ 
                  borderLeft: 4, 
                  borderLeftColor: getStatusColor(course.status),
                  p: 0,
                  backgroundColor: completedTaskId === course.id ? 'rgba(0, 200, 83, 0.05)' : 'inherit'
                }}
              >
                <ListItemAvatar sx={{ m: 2 }}>
                  <Avatar 
                    variant="rounded" 
                    src={course.image} 
                    sx={{ 
                      width: 80, 
                      height: 80,
                      filter: course.status === 'completed' ? 'grayscale(0.5)' : 'none'
                    }}
                  />
                  {course.status === 'completed' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'inherit',
                      }}
                    >
                      <CheckCircleIcon sx={{ color: 'white', fontSize: 40 }} />
                    </Box>
                  )}
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, flexWrap: 'wrap' }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        fontWeight={600}
                        sx={{ 
                          textDecoration: course.status === 'completed' ? 'line-through' : 'none',
                          color: course.status === 'completed' ? 'text.secondary' : 'text.primary',
                          mr: 1
                        }}
                      >
                        {course.title}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={getStatusText(course.status)} 
                        color={
                          course.status === 'completed' ? 'success' : 
                          course.status === 'overdue' ? 'error' : 
                          course.status === 'in-progress' ? 'info' :
                          'default'
                        } 
                        sx={{ ml: 1 }}
                      />
                      <Chip 
                        size="small" 
                        label={`Öncelik: ${getPriorityText(course.priority)}`} 
                        variant="outlined"
                        color={
                          course.priority === 'high' ? 'error' :
                          course.priority === 'medium' ? 'warning' :
                          'info'
                        }
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Atayan: {course.assignedBy}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <DateRangeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography 
                          variant="body2" 
                          color={course.status === 'overdue' ? 'error.main' : 'text.secondary'}
                          sx={{ fontWeight: course.status === 'overdue' ? 600 : 400 }}
                        >
                          Son Tarih: {formatDate(course.dueDate)}
                        </Typography>
                        
                        {course.status === 'overdue' && (
                          <Chip 
                            size="small" 
                            label="GECİKMİŞ" 
                            color="error" 
                            sx={{ 
                              ml: 1, 
                              height: 20, 
                              fontSize: '0.7rem',
                              animation: 'none',
                              transition: 'transform 0.5s ease',
                              '&:hover': {
                                transform: 'scale(1.1)'
                              }
                            }}
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            İlerleme
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color={course.status === 'completed' ? 'success.main' : 'primary.main'}
                            fontWeight={course.status === 'completed' ? 700 : 400}
                          >
                            {course.status === 'completed' ? '100' : course.progress}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={course.status === 'completed' ? 100 : course.progress} 
                          color={course.status === 'completed' ? 'success' : 'primary'}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              transition: 'transform 1.5s ease'
                            }
                          }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'right' }}>
                          {course.status === 'completed' 
                            ? `${course.totalModules}/${course.totalModules} modül tamamlandı` 
                            : `${course.completedModules}/${course.totalModules} modül tamamlandı`
                          }
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ m: 2, width: '100%' }}
                />
                
                <ListItemSecondaryAction sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: 1, mr: 2 }}>
                  <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    startIcon={<PlayCircleOutlineIcon />}
                    onClick={() => handleStartTask(course.id)}
                    disabled={course.status === 'completed'}
                    sx={{
                      opacity: course.status === 'completed' ? 0.7 : 1
                    }}
                  >
                    {course.status === 'not-started' ? 'Başla' : 'Devam Et'}
                  </Button>
                  
                  {course.status !== 'completed' ? (
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleCompleteTask(course.id)}
                    >
                      Tamamlandı
                    </Button>
                  ) : (
                    <Button 
                      variant="outlined" 
                      color="success"
                      size="small"
                      disabled
                      startIcon={<DoneIcon />}
                    >
                      Tamamlandı
                    </Button>
                  )}
                  
                  <IconButton 
                    size="small" 
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        transform: 'rotate(90deg)',
                        transition: 'transform 0.3s ease'
                      }
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

// Ana sayfa bileşeni
const LearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'courses' | 'paths' | 'assigned'>(
    // URL'de "assigned=true" parametresi varsa atanan eğitimler sekmesini seç
    location.search.includes('assigned=true') ? 'assigned' : 'courses'
  );
  const [assignedCourses, setAssignedCourses] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const [assignmentSuccess, setAssignmentSuccess] = useState<{show: boolean, message: string}>({show: false, message: ''});
  const [assignmentError, setAssignmentError] = useState<{show: boolean, message: string}>({show: false, message: ''});

  // Sayfanın ilk yüklenişinde kursları getir
  useEffect(() => {
    setLoading(true);
    
    const fetchData = async () => {
      try {
        // Kursları API'den getir
        const fetchedCoursesData = await learningService.getAllCourses();
        setCourses(fetchedCoursesData);
        
        // LOCAL STORAGE'dan atanmış kursları yükle
        const savedAssignedCourses = localStorage.getItem('assignedCourses');
        if (savedAssignedCourses) {
          try {
            setAssignedCourses(JSON.parse(savedAssignedCourses));
          } catch (error) {
            console.error('Atanan kurslar yüklenirken hata:', error);
            setAssignedCourses([]);
          }
        } else {
          setAssignedCourses([]);
        }
        
        // Kurs ID belirtilmişse ilgili kategoriye git
        if (courseId) {
          const course = fetchedCoursesData.find(c => c.id === courseId);
          if (course) {
            setSelectedCategory(course.category);
          }
        }
      } catch (error) {
        console.error('Kurs verileri yüklenirken hata oluştu:', error);
        setAssignmentError({
          show: true,
          message: 'Kurs verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'
        });
        setCourses([]);
        setAssignedCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [courseId, user]);

  // Göreve kurs atama
  const handleAssignCourse = async (courseId: string) => {
    if (!user || !user.id) {
      console.error('Kullanıcı kimliği bulunamadı');
      setAssignmentError({show: true, message: 'Lütfen önce giriş yapın'});
      return;
    }
    
    setIsAssigning(true);
    try {
      // Mock veriye kurs ekleyin
      // Course verilerini bul
      const courseToAssign = courses.find(c => c.id === courseId);
      if (!courseToAssign) {
        throw new Error('Kurs bulunamadı');
      }

      // Yeni atanan kurs objesi oluştur
      const assignedCourse = {
        id: `task-${courseId}-${Date.now()}`,
        courseId: courseToAssign.id,
        title: courseToAssign.title,
        category: courseToAssign.category,
        image: courseToAssign.image,
        assignedBy: 'Sistem',
        assignedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        totalModules: courseToAssign.totalModules || 10,
        completedModules: 0
      };

      // Atanan kursları güncelle ve localStorage'a kaydet
      const updatedCourses = [...assignedCourses, assignedCourse];
      setAssignedCourses(updatedCourses);
      localStorage.setItem('assignedCourses', JSON.stringify(updatedCourses));
      
      // Başarı mesajı göster
      setAssignmentSuccess({
        show: true,
        message: 'Kurs başarıyla görevlerinize eklendi!'
      });
      
      // assignedCourses state'i güncellendikten sonra sekmeyi değiştir
      setTimeout(() => {
        setViewMode('assigned');
      }, 100);
      
    } catch (error: any) {
      console.error('Kurs atanırken hata oluştu:', error);
      setAssignmentError({
        show: true,
        message: error.message || 'Kurs atanırken bir hata oluştu.'
      });
      
      // 3 saniye sonra hata mesajını kaldır
      setTimeout(() => {
        setAssignmentError({show: false, message: ''});
      }, 3000);
    } finally {
      setIsAssigning(false);
    }
  };

  // Görev durumunu güncelle
  const handleUpdateTaskStatus = async (courseId: string, newStatus: string) => {
    if (!user || !user.id) {
      console.error('Kullanıcı kimliği bulunamadı');
      setAssignmentError({show: true, message: 'Lütfen önce giriş yapın'});
      return;
    }
    
    try {
      // Önce arayüzde güncelle (hızlı feedback için)
      const updatedCourses = assignedCourses.map(course => 
        course.id === courseId 
          ? { 
              ...course, 
              status: newStatus,
              completedModules: newStatus === 'completed' ? course.totalModules : course.completedModules,
              progress: newStatus === 'completed' ? 100 : course.progress
            } 
          : course
      );
      
      // State'i ve localStorage'ı güncelle
      setAssignedCourses(updatedCourses);
      localStorage.setItem('assignedCourses', JSON.stringify(updatedCourses));
      
      // Başarı mesajı göster
      setAssignmentSuccess({
        show: true,
        message: newStatus === 'completed' 
          ? 'Kurs başarıyla tamamlandı!' 
          : 'Kurs durumu güncellendi!'
      });
      
      // 2 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setAssignmentSuccess({show: false, message: ''});
      }, 2000);
      
    } catch (error) {
      console.error('Görev durumu güncellenirken hata oluştu:', error);
      setAssignmentError({
        show: true,
        message: 'Görev durumu güncellenirken bir hata oluştu.'
      });
      
      // 3 saniye sonra hata mesajını kaldır
      setTimeout(() => {
        setAssignmentError({show: false, message: ''});
      }, 3000);
    }
  };

  // Kategori değiştiğinde filtreleme
  const filteredCourses = courses.filter(course => 
    (selectedCategory === 'all' || course.category === selectedCategory) &&
    (course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
     course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Kategori değişim işleyicisi
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Kurs kartı bileşeni
  const CourseCard = ({ course }: { course: any }) => {
    // Destructure navigate from useNavigate hook inside the component
    const cardNavigate = useNavigate();
    
    return (
      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'all 0.3s',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        '&:hover': { 
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.12)'
        }
      }}>
        <Box sx={{ position: 'relative', height: 160, bgcolor: 'rgba(0,0,0,0.04)' }}>
          {course.image ? (
            <CardMedia
              component="img"
              height="160"
              image={course.image}
              alt={course.title}
              sx={{ 
                objectFit: 'cover',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            />
          ) : (
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                bgcolor: `${course.title.charCodeAt(0) % 5 === 0 ? '#e3f2fd' : 
                          course.title.charCodeAt(0) % 5 === 1 ? '#e8f5e9' : 
                          course.title.charCodeAt(0) % 5 === 2 ? '#fff3e0' : 
                          course.title.charCodeAt(0) % 5 === 3 ? '#f3e5f5' : '#e0f7fa'}`
              }}
            >
              <SchoolIcon sx={{ fontSize: 48, mb: 1, color: 'text.secondary', opacity: 0.7 }} />
              <Typography variant="caption" color="text.secondary">
                Görsel yükleniyor...
              </Typography>
            </Box>
          )}
          <Chip 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {course.category === 'data-science' && <StorageIcon fontSize="inherit" />}
                {course.category === 'ai' && <SmartToyIcon fontSize="inherit" />}
                {course.category === 'web' && <WebIcon fontSize="inherit" />}
                {course.category === 'mobile' && <PhoneAndroidIcon fontSize="inherit" />}
                {course.category === 'embedded' && <MemoryIcon fontSize="inherit" />}
                {course.category === 'cyber-security' && <SecurityIcon fontSize="inherit" />}
                {course.category === 'robotics' && <PrecisionManufacturingIcon fontSize="inherit" />}
                {course.category === 'programming' && <CodeIcon fontSize="inherit" />}
                {course.category === undefined && <CategoryIcon fontSize="inherit" />}
                <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1 }}>
                  {course.category === 'data-science' ? 'Veri Bilimi' : 
                   course.category === 'ai' ? 'Yapay Zeka' :
                   course.category === 'web' ? 'Web' :
                   course.category === 'mobile' ? 'Mobil' :
                   course.category === 'embedded' ? 'Gömülü' :
                   course.category === 'cyber-security' ? 'Güvenlik' :
                   course.category === 'robotics' ? 'Robotik' :
                   course.category === 'programming' ? 'Kodlama' :
                   'Genel'}
                </Typography>
              </Box>
            }
            size="small" 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              height: 22,
              minHeight: 22,
              bgcolor: 
                course.category === 'data-science' ? 'rgba(3, 169, 244, 0.9)' :
                course.category === 'ai' ? 'rgba(156, 39, 176, 0.9)' :
                course.category === 'web' ? 'rgba(76, 175, 80, 0.9)' :
                course.category === 'mobile' ? 'rgba(255, 152, 0, 0.9)' :
                course.category === 'embedded' ? 'rgba(63, 81, 181, 0.9)' :
                course.category === 'cyber-security' ? 'rgba(244, 67, 54, 0.9)' :
                course.category === 'robotics' ? 'rgba(0, 150, 136, 0.9)' :
                course.category === 'programming' ? 'rgba(33, 150, 243, 0.9)' :
                'rgba(158, 158, 158, 0.9)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              fontWeight: 400,
              fontSize: '0.6rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              '& .MuiChip-label': {
                px: 0.75,
                py: 0.25,
                paddingBottom: 0,
                paddingTop: 0
              },
              letterSpacing: '0.02em',
              borderRadius: '4px',
              zIndex: 3
            }} 
          />
        </Box>

        <CardContent sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          p: 2.5,
          pb: 1.5,
        }}>
          <Typography 
            variant="h6" 
            component="div" 
            fontWeight={700}
            sx={{
              mb: 1.5,
              lineHeight: 1.3,
              fontSize: '1.1rem',
              minHeight: 46,
              maxHeight: 46,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {course.title}
          </Typography>
        
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2,
            pb: 1.5,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <Avatar 
              sx={{ 
                width: 24, 
                height: 24, 
                mr: 1, 
                bgcolor: course.instructor.charCodeAt(0) % 5 === 0 ? '#1976d2' : 
                        course.instructor.charCodeAt(0) % 5 === 1 ? '#388e3c' : 
                        course.instructor.charCodeAt(0) % 5 === 2 ? '#f57c00' : 
                        course.instructor.charCodeAt(0) % 5 === 3 ? '#7b1fa2' : '#0097a7',
                fontSize: '0.8rem'
              }}
            >
              {course.instructor.charAt(0)}
            </Avatar>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: 'text.primary',
                fontSize: '0.85rem'
              }}
            >
              {course.instructor}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Rating value={course.rating} precision={0.1} size="small" readOnly />
              <Typography variant="body2" fontWeight={600} sx={{ ml: 0.5 }}>
                {course.rating}
              </Typography>
            </Box>
          </Box>
  
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              minHeight: 60,
              maxHeight: 60,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}
          >
            {course.description}
          </Typography>
  
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 1.5,
            justifyContent: 'flex-start',
            mb: 3,
            mt: 'auto',
            pt: 1.5,
            borderTop: '1px dashed rgba(0,0,0,0.08)'
          }}>
            <Chip 
              size="small" 
              label={`${course.duration}`} 
              icon={<AccessTimeIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ 
                height: 28, 
                '& .MuiChip-label': { 
                  px: 1, 
                  py: 0.5, 
                  fontSize: '0.75rem',
                  fontWeight: 500
                } 
              }}
            />
            <Chip 
              size="small" 
              label={course.level} 
              variant="outlined" 
              icon={<SignalCellularAltIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ 
                height: 28, 
                '& .MuiChip-label': { 
                  px: 1, 
                  py: 0.5, 
                  fontSize: '0.75rem',
                  fontWeight: 500
                } 
              }}
            />
            <Chip 
              size="small" 
              label={`${course.enrolled} öğrenci`} 
              variant="outlined"
              icon={<PeopleIcon sx={{ fontSize: '0.9rem !important' }} />}
              sx={{ 
                height: 28, 
                '& .MuiChip-label': { 
                  px: 1, 
                  py: 0.5, 
                  fontSize: '0.75rem',
                  fontWeight: 500
                } 
              }}
            />
          </Box>
  
          {course.progress > 0 && (
            <Box sx={{ mt: 'auto', mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  İlerleme
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {course.progress}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={course.progress} 
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  bgcolor: 'rgba(0,0,0,0.04)'
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, textAlign: 'right', fontSize: '0.75rem' }}>
                {course.completedModules}/{course.totalModules} modül tamamlandı
              </Typography>
            </Box>
          )}
        </CardContent>
        <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
          <Button 
            variant="contained" 
            sx={{ 
              flexGrow: 1,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
            color="primary"
            onClick={() => cardNavigate(`/course/${course.id}`)}
          >
            {course.progress > 0 ? 'Devam Et' : 'Kursa Başla'}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ 
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600
            }}
            onClick={() => handleAssignCourse(course.id)}
          >
            Görev Ekle
          </Button>
        </Box>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Bildirim mesajları */}
      <Snackbar
        open={assignmentSuccess.show}
        autoHideDuration={3000}
        onClose={() => setAssignmentSuccess({show: false, message: ''})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          {assignmentSuccess.message}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={assignmentError.show}
        autoHideDuration={3000}
        onClose={() => setAssignmentError({show: false, message: ''})}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
          {assignmentError.message}
        </Alert>
      </Snackbar>
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Eğitim Platformu
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button 
            variant={viewMode === 'courses' ? 'contained' : 'outlined'}
            onClick={() => {
              setViewMode('courses');
              navigate('.', { replace: true }); // URL'den parametreleri kaldır
            }}
          >
            Kurslar
          </Button>
          <Button 
            variant={viewMode === 'paths' ? 'contained' : 'outlined'}
            onClick={() => {
              setViewMode('paths');
              navigate('.', { replace: true }); // URL'den parametreleri kaldır
            }}
          >
            Öğrenme Yolları
          </Button>
          <Badge 
            badgeContent={assignedCourses.filter(c => c.status === 'overdue').length} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                transition: 'transform 0.5s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                }
              }
            }}
          >
            <Button 
              variant={viewMode === 'assigned' ? 'contained' : 'outlined'}
              onClick={() => {
                setViewMode('assigned');
                // Atanan eğitimler sekmesine geçildiğini URL'e yansıt
                navigate('?assigned=true', { replace: true });
              }}
              startIcon={<AssignmentIcon />}
            >
              Atanan Eğitimler
            </Button>
          </Badge>
          
          {user && user.role === 'admin' && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/learning/admin')}
              startIcon={<AdminPanelSettingsIcon />}
            >
              Yönetici Paneli
            </Button>
          )}
        </Box>
      </Box>
      
      {viewMode !== 'assigned' && (
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Kurs veya içerik ara..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <FilterListIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>
      )}
      
      {viewMode !== 'assigned' && (
        <Paper sx={{ p: 2, mb: 4, overflowX: 'auto' }}>
          <Tabs 
            value={selectedCategory} 
            onChange={(_, value) => handleCategoryChange(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {categories.map((category) => (
              <Tab 
                key={category.id}
                value={category.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 0.5 }}>
                    {category.icon}
                    <Box sx={{ ml: 1 }}>{category.name}</Box>
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      ) : viewMode === 'courses' ? (
        <>
          <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
            {selectedCategory === 'all' ? 'Önerilen Kurslar' : categories.find(c => c.id === selectedCategory)?.name + ' Kursları'}
          </Typography>
          
          {filteredCourses.length > 0 ? (
            <Box sx={{ width: '100%' }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  {filteredCourses.map((course) => (
                    <Box key={course.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' } }}>
                      <CourseCard course={course} />
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Box>
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
              <Typography variant="h6">
                Gösterilecek kurs bulunamadı
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Farklı bir arama terimi veya kategori deneyin
              </Typography>
            </Paper>
          )}
        </>
      ) : viewMode === 'paths' ? (
        <LearningPathList selectedCategory={selectedCategory} />
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              Atanan Eğitim Görevleri
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                icon={<AccessTimeIcon />} 
                label={`${assignedCourses.filter(c => c.status === 'overdue').length} Gecikmiş`} 
                color="error" 
                variant="outlined" 
                size="small"
                sx={{
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'scale(1.1)'
                  }
                }}
              />
              <Chip 
                icon={<PlayCircleOutlineIcon />} 
                label={`${assignedCourses.filter(c => c.status === 'in-progress').length} Devam Eden`} 
                color="info" 
                variant="outlined" 
                size="small"
              />
              <Chip 
                icon={<CheckCircleIcon />} 
                label={`${assignedCourses.filter(c => c.status === 'completed').length} Tamamlanmış`} 
                color="success" 
                variant="outlined" 
                size="small"
              />
            </Box>
          </Box>
          
          <AssignedCoursesList 
            courses={assignedCourses} 
            onUpdateStatus={handleUpdateTaskStatus}
          />
        </>
      )}
    </Container>
  );
};

export default LearningPage;