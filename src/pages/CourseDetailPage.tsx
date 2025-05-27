import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, CircularProgress, Button, 
  Divider, Paper, Alert, Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import CourseVideoPlayer from '../components/learning/CourseVideoPlayer';
import CourseModulesList from '../components/learning/CourseModulesList';
import CourseTranscriptContent from '../components/learning/CourseTranscriptContent';
import CourseQuizAssignment from '../components/learning/CourseQuizAssignment';

// Örnek kurs modülleri ve dersler
const courseModulesData = [
  {
    id: 'module-1',
    title: 'Modül 1: Giriş ve Temel Kavramlar',
    duration: '45 dakika',
    completed: true,
    locked: false,
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'Kursa Genel Bakış',
        duration: '5:20',
        type: 'video',
        completed: true,
        locked: false
      },
      {
        id: 'lesson-1-2',
        title: 'Kavramsal Çerçeve',
        duration: '10:15',
        type: 'video',
        completed: true,
        locked: false
      },
      {
        id: 'lesson-1-3',
        title: 'Hazırlık Dokümanları',
        duration: '8 sayfa',
        type: 'reading',
        completed: false,
        locked: false
      },
      {
        id: 'lesson-1-4',
        title: 'Modül 1 Testi',
        duration: '10 soru',
        type: 'quiz',
        completed: false,
        locked: false
      }
    ]
  },
  {
    id: 'module-2',
    title: 'Modül 2: İleri Seviye Konular',
    duration: '1 saat 15 dakika',
    completed: false,
    locked: false,
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Veri Yapıları ve Algoritma Analizi',
        duration: '15:30',
        type: 'video',
        completed: false,
        locked: false
      },
      {
        id: 'lesson-2-2',
        title: 'Performans Optimizasyonu',
        duration: '12:45',
        type: 'video',
        completed: false,
        locked: false
      },
      {
        id: 'lesson-2-3',
        title: 'Örnek Uygulama Geliştirme',
        duration: '20:10',
        type: 'video',
        completed: false,
        locked: false
      },
      {
        id: 'lesson-2-4',
        title: 'Modül 2 Projesi',
        duration: '1 proje',
        type: 'assignment',
        completed: false,
        locked: false
      }
    ]
  },
  {
    id: 'module-3',
    title: 'Modül 3: Uygulama ve Proje',
    duration: '2 saat',
    completed: false,
    locked: true,
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'Gerçek Dünya Uygulamaları',
        duration: '18:40',
        type: 'video',
        completed: false,
        locked: true
      },
      {
        id: 'lesson-3-2',
        title: 'Vaka Çalışmaları',
        duration: '22:15',
        type: 'video',
        completed: false,
        locked: true
      },
      {
        id: 'lesson-3-3',
        title: 'Final Projesi',
        duration: '1 proje',
        type: 'assignment',
        completed: false,
        locked: true
      }
    ]
  }
];

// Örnek transkript içeriği
const transcriptData = {
  title: "Kursa Genel Bakış",
  description: "Bu videoda kursun genel yapısını ve öğrenilecek konuları inceleyeceğiz.",
  transcript: [
    { time: "00:00", text: "Merhaba ve kursumuza hoş geldiniz!", current: false },
    { time: "00:15", text: "Bu kurs boyunca, web geliştirmenin temel prensiplerini ve modern yaklaşımları öğreneceksiniz.", current: false },
    { time: "00:30", text: "Öncelikle, HTML, CSS ve JavaScript gibi temel teknolojileri inceleyeceğiz.", current: true },
    { time: "00:45", text: "Ardından, React gibi modern JavaScript kütüphaneleri ile uygulama geliştirmeyi öğreneceğiz.", current: false },
    { time: "01:00", text: "Son olarak, gerçek dünya projeleri üzerinde çalışarak öğrendiklerinizi pekiştireceksiniz.", current: false },
    { time: "01:15", text: "Bu kurs sonunda, tam donanımlı bir web geliştirici olacaksınız.", current: false },
  ],
  resources: [
    { title: "Kurs Notları", type: "PDF", url: "#" },
    { title: "Örnek Kodlar", type: "ZIP", url: "#" },
    { title: "Ek Kaynaklar", type: "DOC", url: "#" }
  ],
  notes: ""
};

// Örnek quiz soruları
const quizQuestions = [
  {
    id: 'q1',
    text: 'Web geliştirmenin temel yapı taşı olan işaretleme dili hangisidir?',
    options: [
      { id: 'a', text: 'JavaScript' },
      { id: 'b', text: 'HTML' },
      { id: 'c', text: 'CSS' },
      { id: 'd', text: 'PHP' }
    ],
    correctOptionId: 'b'
  },
  {
    id: 'q2',
    text: 'Aşağıdakilerden hangisi bir JavaScript kütüphanesidir?',
    options: [
      { id: 'a', text: 'Angular' },
      { id: 'b', text: 'React' },
      { id: 'c', text: 'Vue' },
      { id: 'd', text: 'Hepsi' }
    ],
    correctOptionId: 'd'
  },
  {
    id: 'q3',
    text: 'CSS\'de bir elementin dış kenar boşluklarını belirleyen özellik hangisidir?',
    options: [
      { id: 'a', text: 'padding' },
      { id: 'b', text: 'border' },
      { id: 'c', text: 'margin' },
      { id: 'd', text: 'spacing' }
    ],
    correctOptionId: 'c'
  }
];

// Örnek görev (assignment) bilgileri
const assignmentData = {
  id: 'assignment-1',
  title: 'Web Sitesi Tasarımı',
  description: 'Bu görevde, öğrendiğiniz HTML, CSS ve JavaScript bilgilerini kullanarak basit bir kişisel web sitesi oluşturacaksınız.',
  deadline: '15 Haziran 2023',
  requirements: [
    'En az 3 sayfa içermeli (Ana Sayfa, Hakkımda, İletişim)',
    'Responsive tasarım prensiplerine uygun olmalı',
    'En az bir form elemanı içermeli',
    'JavaScript ile etkileşimli bir özellik eklenmeli'
  ]
};

// Ana bileşen
const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  // State değişkenleri
  const [loading, setLoading] = useState<boolean>(true);
  const [currentLessonId, setCurrentLessonId] = useState<string>('lesson-1-1');
  const [currentModuleId, setCurrentModuleId] = useState<string>('module-1');
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [currentContent, setCurrentContent] = useState<any>(transcriptData);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [contentType, setContentType] = useState<'video' | 'reading' | 'quiz' | 'assignment'>('video');
  
  // Kurs verilerini yükle
  useEffect(() => {
    const loadCourseData = async () => {
      // Gerçek uygulamada burada API isteği yapılır
      setTimeout(() => {
        setCourseModules(courseModulesData);
        console.log("CourseDetailPage yüklendi, courseId:", courseId);
        setCourseTitle(courseId ? `Kurs: ${courseId}` : 'Kurs İçeriği');
        setLoading(false);
      }, 1000);
    };
    
    loadCourseData();
  }, [courseId]);
  
  // Dersi değiştirdiğimizde içerik türünü belirle
  useEffect(() => {
    if (courseModules.length === 0) return;
    
    // Mevcut dersi bul
    let currentLesson;
    for (const module of courseModules) {
      const lesson = module.lessons.find((l: any) => l.id === currentLessonId);
      if (lesson) {
        currentLesson = lesson;
        break;
      }
    }
    
    if (currentLesson) {
      setContentType(currentLesson.type as any);
    }
  }, [currentLessonId, courseModules]);
  
  // Ders seçme işleyicisi
  const handleLessonSelect = (moduleId: string, lessonId: string) => {
    setCurrentModuleId(moduleId);
    setCurrentLessonId(lessonId);
    
    // Gerçek uygulamada burada dersin içeriğini API'den çekebilirsiniz
    // Şimdilik transkript verisini kullanıyoruz
  };
  
  // Video tamamlama işleyicisi
  const handleVideoComplete = () => {
    // Gerçek uygulamada burada kullanıcının ilerleme durumunu güncelleyebilirsiniz
    console.log("Video tamamlandı!");
    setShowSuccess(true);
    setSuccessMessage('Video başarıyla tamamlandı!');
    
    // Güncellenmiş modül listesini oluştur
    const updatedModules = courseModules.map(module => {
      if (module.id === currentModuleId) {
        const updatedLessons = module.lessons.map((lesson: any) => {
          if (lesson.id === currentLessonId) {
            return { ...lesson, completed: true };
          }
          return lesson;
        });
        return { ...module, lessons: updatedLessons };
      }
      return module;
    });
    
    setCourseModules(updatedModules);
    
    // 3 saniye sonra mesajı kapat
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    
    // Bir sonraki derse geç (varsa)
    let nextLessonFound = false;
    let shouldMoveToNextModule = false;
    
    for (const module of courseModules) {
      if (shouldMoveToNextModule || module.id === currentModuleId) {
        const lessonIndex = module.lessons.findIndex((l: any) => l.id === currentLessonId);
        
        if (module.id === currentModuleId && lessonIndex < module.lessons.length - 1) {
          // Aynı modül içinde bir sonraki derse geç
          const nextLesson = module.lessons[lessonIndex + 1];
          if (!nextLesson.locked) {
            setCurrentLessonId(nextLesson.id);
            nextLessonFound = true;
            break;
          }
        } else if (module.id === currentModuleId) {
          // Modülün son dersindeysek, bir sonraki modüle geçmeyi işaretle
          shouldMoveToNextModule = true;
        } else if (shouldMoveToNextModule && !module.locked && module.lessons.length > 0) {
          // Bir sonraki modülün ilk dersine geç
          const nextLesson = module.lessons[0];
          if (!nextLesson.locked) {
            setCurrentModuleId(module.id);
            setCurrentLessonId(nextLesson.id);
            nextLessonFound = true;
            break;
          }
        }
      }
    }
  };
  
  // Not kaydetme işleyicisi
  const handleSaveNote = (note: string) => {
    // Gerçek uygulamada burada API'ye not kaydedilir
    setShowSuccess(true);
    setSuccessMessage('Notunuz başarıyla kaydedildi!');
    
    // 3 saniye sonra mesajı kapat
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };
  
  // Quiz veya ödev tamamlama işleyicisi
  const handleQuizComplete = (passed: boolean) => {
    if (passed) {
      setShowSuccess(true);
      setSuccessMessage(contentType === 'quiz' ? 'Tebrikler! Testi başarıyla tamamladınız.' : 'Tebrikler! Göreviniz kabul edildi.');
      
      // Güncellenmiş modül listesini oluştur
      const updatedModules = courseModules.map(module => {
        if (module.id === currentModuleId) {
          const updatedLessons = module.lessons.map((lesson: any) => {
            if (lesson.id === currentLessonId) {
              return { ...lesson, completed: true };
            }
            return lesson;
          });
          return { ...module, lessons: updatedLessons };
        }
        return module;
      });
      
      setCourseModules(updatedModules);
      
      // 3 saniye sonra mesajı kapat
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };
  
  // Yükleniyor durumu
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  // Ders içeriğini belirle
  const renderContent = () => {
    // Mevcut ders için video URL'si belirle
    const getVideoUrl = () => {
      // Farklı dersler için farklı video URL'leri
      const videoUrls: Record<string, string> = {
        'lesson-1-1': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'lesson-1-2': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'lesson-2-1': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'lesson-2-2': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'lesson-2-3': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        // Kurs ID'sine göre varsayılan videolar
        'ai-101': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'web-react': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
        'data-python': 'https://www.youtube.com/watch?v=CxGSnA-RTsA', // Yeni video
      };
      
      // Önce lesson ID'si, yoksa course ID'si ile eşleşen videoyu göster
      return videoUrls[currentLessonId] || videoUrls[courseId || ''] || 'https://www.youtube.com/watch?v=CxGSnA-RTsA';
    };
    
    // Dersin başlığını belirle
    const getVideoTitle = () => {
      // Ders ID'sine göre modül ve ders bilgisini bul
      for (const module of courseModules) {
        const lesson = module.lessons.find((l: any) => l.id === currentLessonId);
        if (lesson) {
          return `${module.title} - ${lesson.title}`;
        }
      }
      return "Video: Kursa Genel Bakış";
    };
    
    switch (contentType) {
      case 'video':
        return (
          <CourseVideoPlayer 
            videoUrl={getVideoUrl()} 
            title={getVideoTitle()}
            onComplete={handleVideoComplete}
          />
        );
      case 'reading':
        return (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>Okuma Materyali</Typography>
            <Typography variant="body1" paragraph>
              Bu bölümde, konuyla ilgili teorik bilgileri ve kavramsal çerçeveyi detaylı olarak inceleyeceğiz.
              Burada öğrendiğiniz bilgiler, uygulamalı derslerde kullanılacaktır.
            </Typography>
            <Typography variant="body1" paragraph>
              Okuma materyalini tamamladığınızda, bilgilerinizi test etmek için bir quiz yapacaksınız.
            </Typography>
            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant="contained" color="primary" onClick={handleVideoComplete}>
                Tamamlandı olarak İşaretle
              </Button>
            </Box>
          </Paper>
        );
      case 'quiz':
        return (
          <CourseQuizAssignment
            type="quiz"
            title="Modül Testi"
            description="Bu test, öğrendiğiniz bilgileri pekiştirmenizi sağlayacak sorular içerir."
            questions={quizQuestions}
            onComplete={handleQuizComplete}
          />
        );
      case 'assignment':
        return (
          <CourseQuizAssignment
            type="assignment"
            title="Proje Ödevi"
            description="Bu ödevi tamamlayarak öğrendiklerinizi uygulamalı olarak pekiştirebilirsiniz."
            assignment={assignmentData}
            onComplete={handleQuizComplete}
          />
        );
      default:
        return (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6">İçerik yüklenemedi</Typography>
          </Paper>
        );
    }
  };
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          onClick={() => navigate('/learning')}
          sx={{ mb: 2 }}
        >
          Kurslara Dön
        </Button>
        
        <Typography variant="h4" fontWeight={600}>
          {courseTitle}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Sol taraf: Video/İçerik ve Transkript/Notlar */}
        <Box sx={{ flex: { md: 2 }, width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            {renderContent()}
          </Box>
          
          <Box sx={{ mt: 3 }}>
            <CourseTranscriptContent
              content={currentContent}
              onSaveNote={handleSaveNote}
            />
          </Box>
        </Box>
        
        {/* Sağ taraf: Modül ve Ders Listesi */}
        <Box sx={{ flex: { md: 1 }, width: '100%' }}>
          <CourseModulesList
            modules={courseModules}
            currentLessonId={currentLessonId}
            onLessonSelect={handleLessonSelect}
          />
        </Box>
      </Box>
      
      {/* Başarı mesajı */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CourseDetailPage; 