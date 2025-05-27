import axios from 'axios';

// Interface tanımlamaları
export interface StepContent {
  title: string;
  description: string;
  resources?: {
    title: string;
    url: string;
  }[];
  videoUrl?: string;
  quizQuestions?: {
    question: string;
    answer: string;
  }[];
}

export interface LearningStep {
  id: string;
  name: string;
  content: StepContent;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  steps: LearningStep[];
  externalUrl?: string;
}

// Kurs detayları için yeni interface tanımı
export interface CourseDetailModule {
  id: string;
  title: string;
  description: string; 
  duration: string;
  videoUrl?: string;
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'video' | 'document' | 'link';
  }[];
  quizzes?: {
    id: string;
    title: string;
    questions: {
      id: string;
      text: string;
      options?: string[];
      correctOption?: number;
      type: 'multiple_choice' | 'text' | 'code';
    }[];
  }[];
  completionStatus?: 'not_started' | 'in_progress' | 'completed';
}

export interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorBio?: string;
  instructorAvatar?: string;
  level: string;
  duration: string;
  rating: number;
  reviewCount: number;
  enrolled: number;
  thumbnailUrl: string;
  coverImage?: string;
  objectives: string[];
  requirements?: string[];
  modules: CourseDetailModule[];
  completionPercentage?: number;
  lastAccessedModuleId?: string;
  tags?: string[];
  price?: number;
  discountPrice?: number;
  certificate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  image: string;
  instructor: string;
  rating: number;
  enrolled: number;
  duration: string;
  level: string;
  description: string;
  totalModules: number;
  completedModules: number;
  progress?: number;
}

export interface LearningServiceInterface {
  getLearningPaths(category?: string): Promise<LearningPath[]>;
  getStepDetails(stepId: string): Promise<StepContent>;
  saveUserProgress(userId: string, stepId: string, progress: number): Promise<void>;
  submitQuizAnswer(userId: string, stepId: string, quizId: string, answer: string): Promise<{correct: boolean, feedback?: string}>;
  createLearningPath(category: string, pathData: Omit<LearningPath, 'id'>): Promise<LearningPath>;
  updateLearningPath(pathId: string, pathData: Partial<LearningPath>): Promise<LearningPath>;
  deleteLearningPath(pathId: string): Promise<void>;
  createLearningStep(pathId: string, stepData: Omit<LearningStep, 'id'>): Promise<LearningStep>;
  updateLearningStep(stepId: string, stepData: Partial<LearningStep>): Promise<LearningStep>;
  updateStepContent(stepId: string, contentData: Partial<StepContent>): Promise<StepContent>;
  deleteStep(stepId: string): Promise<void>;
  getCategories(): Promise<{id: string, name: string, icon: string}[]>;
  assignCourseToUser(userId: string, courseId: string): Promise<AssignedCourse>;
  getAssignedCourses(userId: string): Promise<AssignedCourse[]>;
  updateAssignedCourseStatus(userId: string, assignedCourseId: string, newStatus: string, progress?: number): Promise<AssignedCourse>;
  // Kurs detayları için yeni fonksiyonlar
  getCourseDetails(courseId: string): Promise<CourseDetail>;
  getCourseModuleContent(courseId: string, moduleId: string): Promise<CourseDetailModule>;
  saveModuleProgress(userId: string, courseId: string, moduleId: string, status: string): Promise<void>;
  submitModuleQuiz(userId: string, courseId: string, moduleId: string, quizId: string, answers: any[]): Promise<{score: number, passed: boolean, feedback?: string}>;
  getAllCourses(): Promise<Course[]>;
}

// API çağrıları için temel URL - .env dosyasından alınabilir
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Atanan kurslar için veri yapısı
export interface AssignedCourse {
  id: string;
  courseId: string;
  title: string;
  category: string;
  image: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  totalModules: number;
  completedModules: number;
}

// Mock veriler - gerçek uygulamada sileceksiniz
// Sahte öğrenme yolları
const mockPathsData: LearningPath[] = [
  {
    id: 'path-web-1',
    title: 'Web Geliştirme Yolu',
    description: 'Modern web teknolojileri ile uygulama geliştirmeyi öğrenin',
    steps: [
      {
        id: 'web-frontend-basics',
        name: 'Frontend Temelleri',
        content: {
          title: 'HTML, CSS ve JavaScript Temelleri',
          description: 'Web sayfalarının temelini oluşturan HTML, CSS ve JavaScript teknolojilerini öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/QA0XpGhiz5w',
          resources: [
            { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/tr/' },
            { title: 'W3Schools', url: 'https://www.w3schools.com/' }
          ]
        }
      },
      {
        id: 'web-frontend-frameworks',
        name: 'Frontend Frameworks',
        content: {
          title: 'React, Vue ve Angular',
          description: 'Modern frontend frameworkleri ile interaktif web uygulamaları geliştirmeyi öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
          resources: [
            { title: 'React Resmi Dokümantasyon', url: 'https://tr.reactjs.org/' },
            { title: 'Vue.js Resmi Sitesi', url: 'https://vuejs.org/' }
          ]
        }
      },
      {
        id: 'web-backend-api',
        name: 'Backend ve API Geliştirme',
        content: {
          title: 'Node.js ile Backend Geliştirme',
          description: 'Node.js kullanarak RESTful API ve backend servisleri geliştirmeyi öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/fBNz5xF-Kx4',
          resources: [
            { title: 'Node.js Resmi Dokümantasyon', url: 'https://nodejs.org/' },
            { title: 'Express.js Rehberi', url: 'https://expressjs.com/' }
          ]
        }
      }
    ]
  },
  {
    id: 'path-ai-1',
    title: 'Yapay Zeka Yolu',
    description: 'Temel yapay zeka ve makine öğrenmesi tekniklerini öğrenin',
    steps: [
      {
        id: 'ai-basics',
        name: 'Yapay Zeka Temelleri',
        content: {
          title: 'Yapay Zeka Giriş',
          description: 'Yapay zeka alanının temel kavramlarını ve uygulama alanlarını öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/JMUxmLyrhSk',
          resources: [
            { title: 'AI Crash Course', url: 'https://www.kaggle.com/learn/intro-to-ai-ethics' },
            { title: 'AI Basics', url: 'https://www.tensorflow.org/resources/learn-ml' }
          ]
        }
      },
      {
        id: 'machine-learning',
        name: 'Makine Öğrenmesi',
        content: {
          title: 'Makine Öğrenmesi Algoritmaları',
          description: 'Temel makine öğrenmesi algoritmalarını ve uygulamalarını öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/NWONeJKn6kc',
          resources: [
            { title: 'Scikit-Learn Dokümantasyon', url: 'https://scikit-learn.org/' },
            { title: 'ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' }
          ]
        }
      }
    ]
  },
  {
    id: 'path-mobile-1',
    title: 'Mobil Uygulama Geliştirme Yolu',
    description: 'iOS ve Android için modern uygulamalar geliştirmeyi öğrenin',
    steps: [
      {
        id: 'mobile-react-native',
        name: 'React Native',
        content: {
          title: 'React Native ile Çoklu Platform',
          description: 'React Native kullanarak iOS ve Android için tek kod tabanı ile uygulama geliştirmeyi öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/0-S5a0eXPoc',
          resources: [
            { title: 'React Native Dokümantasyon', url: 'https://reactnative.dev/' },
            { title: 'Expo', url: 'https://expo.io/' }
          ]
        }
      },
      {
        id: 'mobile-flutter',
        name: 'Flutter',
        content: {
          title: 'Flutter ile Mobil Geliştirme',
          description: 'Google\'ın Flutter framework\'ü ile iOS ve Android için yüksek performanslı uygulamalar geliştirmeyi öğrenin.',
          videoUrl: 'https://www.youtube.com/embed/1ukSR1GRtMU',
          resources: [
            { title: 'Flutter Dokümantasyon', url: 'https://flutter.dev/' },
            { title: 'Dart Dili', url: 'https://dart.dev/' }
          ]
        }
      }
    ]
  }
];

// Örnek kurslar - servisimiz bunun bir alt kümesini döndürecek
const mockCoursesData = [
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
    totalModules: 18,
    completedModules: 0
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
    totalModules: 15,
    completedModules: 0
  }
];

// Atanan kurslar için mock veri
const mockAssignedCoursesData: {[userId: string]: AssignedCourse[]} = {
  // Kullanıcı ID'ye göre atanan kurslar
  'user1': [
    {
      id: 'task-ai-101',
      courseId: 'ai-101',
      title: 'Yapay Zeka Temelleri',
      category: 'ai',
      image: 'https://source.unsplash.com/random/400x300/?ai',
      assignedBy: 'Ahmet Yönetici',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün sonra
      status: 'not-started',
      priority: 'high',
      progress: 0,
      totalModules: 12,
      completedModules: 0
    }
  ]
};

// Kategoriler
const mockCategoriesData = [
  { id: 'all', name: 'Tümü', icon: 'school' },
  { id: 'ai', name: 'Yapay Zeka', icon: 'smart_toy' },
  { id: 'web', name: 'Web Geliştirme', icon: 'web' },
  { id: 'mobile', name: 'Mobil Uygulama', icon: 'phone_android' },
  { id: 'embedded', name: 'Gömülü Sistemler', icon: 'memory' },
  { id: 'data-science', name: 'Veri Bilimi', icon: 'storage' },
  { id: 'cyber-security', name: 'Siber Güvenlik', icon: 'security' },
  { id: 'robotics', name: 'Robotik', icon: 'precision_manufacturing' },
  { id: 'programming', name: 'Programlama', icon: 'code' }
];

// Backend simulasyonu - gerçek uygulamada sileceksiniz
// Sadece geliştirme sırasında mock veri kullanmak için
export const mockLearningService: LearningServiceInterface = {
  // Mock veri üzerinden öğrenme yollarını getir
  async getLearningPaths(category?: string): Promise<LearningPath[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...mockPathsData];
        
        // Kategori filtrelemesi
        if (category && category !== 'all') {
          if (category === 'web') {
            result = result.filter(path => path.id.includes('web'));
          } else if (category === 'ai') {
            result = result.filter(path => path.id.includes('ai'));
          } else if (category === 'mobile') {
            result = result.filter(path => path.id.includes('mobile'));
          } else {
            // Diğer kategoriler için şu an veri yok, boş array dön
            result = [];
          }
        }
        
        resolve(result);
      }, 500); // 500ms gecikme ile API simülasyonu
    });
  },
  
  // Adım detaylarını getir
  async getStepDetails(stepId: string): Promise<StepContent> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Tüm adımların içeriklerini çıkaralım
        const allSteps = mockPathsData.flatMap(path => path.steps);
        const foundStep = allSteps.find(step => step.id === stepId);
        
        if (foundStep) {
          resolve(foundStep.content);
        } else {
          reject(new Error('Adım bulunamadı'));
        }
      }, 300);
    });
  },
  
  // Quiz cevabını gönder - simülasyon
  async submitQuizAnswer(userId: string, stepId: string, quizId: string, answer: string): Promise<{correct: boolean, feedback?: string}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Burada gerçek bir değerlendirme yok, sadece simülasyon
        console.log(`Quiz yanıtı: ${userId}, ${stepId}, ${quizId}, "${answer}"`);
        resolve({
          correct: true,
          feedback: 'Tebrikler! Doğru cevap verdiniz.'
        });
      }, 800);
    });
  },
  
  // İlerleme kaydetme simülasyonu
  async saveUserProgress(userId: string, stepId: string, progress: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`İlerleme kaydedildi: ${userId}, ${stepId}, ${progress}%`);
        resolve();
      }, 300);
    });
  },
  
  // Kategori listesini getir
  async getCategories(): Promise<{id: string, name: string, icon: string}[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCategoriesData);
      }, 300);
    });
  },
  
  // Diğer mock fonksiyonlar (oluşturma, güncelleme, silme)
  async createLearningPath(category: string, pathData: Omit<LearningPath, 'id'>): Promise<LearningPath> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPath: LearningPath = {
          ...pathData,
          id: `path-${category}-${Date.now()}`
        };
        mockPathsData.push(newPath);
        resolve(newPath);
      }, 500);
    });
  },
  
  async updateLearningPath(pathId: string, pathData: Partial<LearningPath>): Promise<LearningPath> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pathIndex = mockPathsData.findIndex(p => p.id === pathId);
        if (pathIndex !== -1) {
          mockPathsData[pathIndex] = {
            ...mockPathsData[pathIndex],
            ...pathData
          } as LearningPath;
          resolve(mockPathsData[pathIndex]);
        } else {
          reject(new Error('Öğrenme yolu bulunamadı'));
        }
      }, 500);
    });
  },
  
  async deleteLearningPath(pathId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPathsData.findIndex(p => p.id === pathId);
        if (index !== -1) {
          mockPathsData.splice(index, 1);
        }
        resolve();
      }, 500);
    });
  },
  
  async createLearningStep(pathId: string, stepData: Omit<LearningStep, 'id'>): Promise<LearningStep> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const pathIndex = mockPathsData.findIndex(p => p.id === pathId);
        if (pathIndex !== -1) {
          const newStep: LearningStep = {
            ...stepData,
            id: `step-${pathId}-${Date.now()}`
          };
          mockPathsData[pathIndex].steps.push(newStep);
          resolve(newStep);
        } else {
          reject(new Error('Öğrenme yolu bulunamadı'));
        }
      }, 500);
    });
  },
  
  async updateLearningStep(stepId: string, stepData: Partial<LearningStep>): Promise<LearningStep> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const path of mockPathsData) {
          const stepIndex = path.steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            path.steps[stepIndex] = {
              ...path.steps[stepIndex],
              ...stepData
            } as LearningStep;
            resolve(path.steps[stepIndex]);
            return;
          }
        }
        reject(new Error('Adım bulunamadı'));
      }, 500);
    });
  },
  
  async updateStepContent(stepId: string, contentData: Partial<StepContent>): Promise<StepContent> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        for (const path of mockPathsData) {
          const step = path.steps.find(s => s.id === stepId);
          if (step) {
            step.content = {
              ...step.content,
              ...contentData
            };
            resolve(step.content);
            return;
          }
        }
        reject(new Error('Adım bulunamadı'));
      }, 500);
    });
  },
  
  async deleteStep(stepId: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        for (const path of mockPathsData) {
          const stepIndex = path.steps.findIndex(s => s.id === stepId);
          if (stepIndex !== -1) {
            path.steps.splice(stepIndex, 1);
            break;
          }
        }
        resolve();
      }, 500);
    });
  },
  
  async assignCourseToUser(userId: string, courseId: string): Promise<AssignedCourse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Kursu mock veriden bul
        const course = mockCoursesData.find(c => c.id === courseId);
        
        if (!course) {
          reject(new Error('Kurs bulunamadı'));
          return;
        }
        
        // Kullanıcının zaten atanmış kursları var mı kontrol et
        if (!mockAssignedCoursesData[userId]) {
          mockAssignedCoursesData[userId] = [];
        }
        
        // Kurs zaten atanmış mı kontrol et
        const isAlreadyAssigned = mockAssignedCoursesData[userId].some(c => c.courseId === courseId);
        if (isAlreadyAssigned) {
          reject(new Error('Bu kurs zaten atanmış'));
          return;
        }
        
        // Yeni atanacak kurs
        const newAssignedCourse: AssignedCourse = {
          id: `task-${courseId}-${Date.now()}`,
          courseId: course.id,
          title: course.title,
          category: course.category,
          image: course.image,
          assignedBy: 'Sistem', // Gerçek uygulamada atayan kişinin bilgisi gelmeli
          assignedDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün sonra
          status: 'not-started',
          priority: 'medium',
          progress: 0,
          totalModules: course.totalModules || 10,
          completedModules: 0
        };
        
        // Kullanıcının atanmış kurslarına ekle
        mockAssignedCoursesData[userId].push(newAssignedCourse);
        
        resolve(newAssignedCourse);
      }, 500);
    });
  },
  
  async getAssignedCourses(userId: string): Promise<AssignedCourse[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Kullanıcı için atanmış kursları getir
        const assignedCourses = mockAssignedCoursesData[userId] || [];
        
        // Tarihe göre kontrol et ve gecikmiş olanları işaretle
        const today = new Date().toISOString().split('T')[0];
        
        const updatedCourses = assignedCourses.map(course => {
          // Sadece başlanmamış veya devam eden kurslarda son tarih kontrolü yap
          if (course.status !== 'completed' && course.dueDate < today) {
            return { ...course, status: 'overdue' as const };
          }
          return course;
        });
        
        resolve(updatedCourses);
      }, 500);
    });
  },
  
  async updateAssignedCourseStatus(userId: string, assignedCourseId: string, newStatus: string, progress?: number): Promise<AssignedCourse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Kullanıcının atanmış kurslarını kontrol et
        if (!mockAssignedCoursesData[userId]) {
          reject(new Error('Kullanıcı için atanmış kurs bulunamadı'));
          return;
        }
        
        // Atanmış kursu bul
        const courseIndex = mockAssignedCoursesData[userId].findIndex(course => course.id === assignedCourseId);
        if (courseIndex === -1) {
          reject(new Error('Atanmış kurs bulunamadı'));
          return;
        }
        
        // Kurs durumunu güncelle
        mockAssignedCoursesData[userId][courseIndex] = {
          ...mockAssignedCoursesData[userId][courseIndex],
          status: newStatus as 'not-started' | 'in-progress' | 'completed' | 'overdue',
          progress: progress !== undefined ? progress : mockAssignedCoursesData[userId][courseIndex].progress,
          completedModules: newStatus === 'completed' 
            ? mockAssignedCoursesData[userId][courseIndex].totalModules 
            : mockAssignedCoursesData[userId][courseIndex].completedModules
        };
        
        resolve(mockAssignedCoursesData[userId][courseIndex]);
      }, 500);
    });
  },
  
  // Kurs detayları için yeni fonksiyonlar
  async getCourseDetails(courseId: string): Promise<CourseDetail> {
    // Bu fonksiyonun gerçek uygulaması için backend iletişimi henüz uygulanmamış
    throw new Error('Kurs detayları için backend iletişimi henüz uygulanmamış');
  },
  
  async getCourseModuleContent(courseId: string, moduleId: string): Promise<CourseDetailModule> {
    // Bu fonksiyonun gerçek uygulaması için backend iletişimi henüz uygulanmamış
    throw new Error('Kurs modül içeriği için backend iletişimi henüz uygulanmamış');
  },
  
  async saveModuleProgress(userId: string, courseId: string, moduleId: string, status: string): Promise<void> {
    // Bu fonksiyonun gerçek uygulaması için backend iletişimi henüz uygulanmamış
    throw new Error('Kurs modül ilerlemesi için backend iletişimi henüz uygulanmamış');
  },
  
  async submitModuleQuiz(userId: string, courseId: string, moduleId: string, quizId: string, answers: any[]): Promise<{score: number, passed: boolean, feedback?: string}> {
    // Bu fonksiyonun gerçek uygulaması için backend iletişimi henüz uygulanmamış
    throw new Error('Kurs modül quiz için backend iletişimi henüz uygulanmamış');
  },

  // Tüm kursları getir
  async getAllCourses(): Promise<Course[]> {
    try {
      console.log('API isteği yapılıyor:', `${API_BASE_URL}/courses`);
      const response = await axios.get(`${API_BASE_URL}/courses`);
      console.log('API yanıtı alındı, kurs sayısı:', response.data.length);
      
      // API'den gelen veriyi Course formatına dönüştür
      const courses: Course[] = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        image: item.thumbnailUrl,
        instructor: item.instructor,
        rating: item.rating,
        enrolled: item.enrolled,
        duration: item.duration,
        level: item.level,
        description: item.description,
        totalModules: item.totalModules || item.modules.length,
        completedModules: item.completedModules || 0,
        progress: item.completionPercentage || 0
      }));
      
      return courses;
    } catch (error) {
      console.error('Kurslar getirilirken hata oluştu:', error);
      // Hatayı göster, ancak uygulama çalışmaya devam etsin diye mock veri dön
      console.log('!! Hata nedeniyle mock veri kullanılıyor !!')
      return mockCoursesData;
    }
  }
};

// API servisi
export const learningService: LearningServiceInterface = {  
  // Tüm öğrenme yollarını getir
  async getLearningPaths(category?: string): Promise<LearningPath[]> {
    try {
      const url = category && category !== 'all' 
        ? `${API_BASE_URL}/learning-paths?category=${category}`
        : `${API_BASE_URL}/learning-paths`;
        
      console.log('Öğrenme yolları API isteği yapılıyor:', url);
      const response = await axios.get(url);
      console.log('Öğrenme yolları alındı, yol sayısı:', response.data.length);
      
      return response.data;
    } catch (error) {
      console.error('Öğrenme yolları getirilirken hata oluştu:', error);
      
      // Öğrenme yolları endpointi olmadığında alternatif olarak kursları kullan
      try {
        console.log('Kurslardan öğrenme yolları oluşturuluyor...');
        const coursesUrl = category && category !== 'all'
          ? `${API_BASE_URL}/courses?category=${category}`
          : `${API_BASE_URL}/courses`;
          
        const coursesResponse = await axios.get(coursesUrl);
        const courses = coursesResponse.data;
        
        // Roadmapların harici bağlantıları
        const roadmapUrls: Record<string, string> = {
          'ai': 'https://roadmap.sh/ai-data-scientist',
          'data-science': 'https://roadmap.sh/ai-data-scientist',
          'embedded': 'https://www.embeddedrelated.com/showarticle/1589.php',
          'cyber-security': 'https://roadmap.sh/cyber-security',
          'blockchain': 'https://roadmap.sh/blockchain',
          'mobile': 'https://roadmap.sh/android',
          'programming': 'https://roadmap.sh/game-developer',
          'robotics': 'https://www.kevsrobots.com/blog/roadmap.html',
          'web': 'https://roadmap.sh/full-stack'
        };
        
        // Kurslardan öğrenme yolları oluştur
        const learningPaths: LearningPath[] = [];
        
        if (courses && courses.length > 0) {
          // Kategori bazlı grupla
          const categoryCourses: Record<string, any[]> = {};
          
          courses.forEach((course: any) => {
            if (!categoryCourses[course.category]) {
              categoryCourses[course.category] = [];
            }
            categoryCourses[course.category].push(course);
          });
          
          // Her kategori için bir öğrenme yolu oluştur
          Object.entries(categoryCourses).forEach(([categoryName, categoryCourseList]) => {
            if (category && category !== 'all' && categoryName !== category) {
              return; // Sadece seçilen kategoriyi dahil et
            }
            
            const categoryTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
            
            // Harici bağlantıyı kontrol et
            const externalUrl = roadmapUrls[categoryName];
            
            const learningPath: LearningPath = {
              id: `path-${categoryName}`,
              title: `${categoryTitle} Öğrenme Yolu`,
              description: `${categoryTitle} alanında uzmanlaşmanız için önerilen adımlar`,
              externalUrl: externalUrl, // Harici bağlantı eklendi
              steps: categoryCourseList.map((course: any) => {
                // Kurs modüllerinden adımlar oluştur
                return {
                  id: course.id,
                  name: course.title,
                  content: {
                    title: course.title,
                    description: course.description,
                    videoUrl: course.modules && course.modules.length > 0 ? 
                      course.modules[0].videoUrl : undefined,
                    resources: course.modules && course.modules.length > 0 && course.modules[0].resources ? 
                      course.modules[0].resources.map((r: any) => ({title: r.title, url: r.url})) : []
                  }
                };
              })
            };
            
            learningPaths.push(learningPath);
          });
        }
        
        console.log('Kurslardan öğrenme yolları oluşturuldu, yol sayısı:', learningPaths.length);
        return learningPaths;
      } catch (error) {
        console.error('Kurslardan öğrenme yolları oluşturulurken hata:', error);
        // Son çare olarak mock veriyi dön, uygulama çalışmaya devam etsin
        console.log('!! Hatalar nedeniyle mock veri kullanılıyor !!');
        return mockPathsData;
      }
    }
  },
  
  // Belirli bir adımın detaylı içeriğini getir
  async getStepDetails(stepId: string): Promise<StepContent> {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/steps/${stepId}`);
      return response.data;
    } catch (error) {
      console.error('Adım detayları getirilirken hata oluştu:', error);
      // Hata durumunda mock veriyi kullan (geliştirme aşamasında)
      return mockLearningService.getStepDetails(stepId);
    }
  },
  
  // Kullanıcının ilerlemesini kaydet
  async saveUserProgress(userId: string, stepId: string, progress: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/courses/steps/${stepId}/progress/${userId}`, {
        progress,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('İlerleme kaydedilirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.saveUserProgress(userId, stepId, progress);
    }
  },
  
  // Quiz cevabını gönder
  async submitQuizAnswer(userId: string, stepId: string, quizId: string, answer: string): Promise<{correct: boolean, feedback?: string}> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/steps/${stepId}/quizzes/${quizId}/submit`, {
        userId,
        answer,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Quiz cevabı gönderilirken hata oluştu:', error);
      // Hata durumunda mock cevap dön (geliştirme aşamasında)
      return mockLearningService.submitQuizAnswer(userId, stepId, quizId, answer);
    }
  },
  
  // Yeni bir öğrenme yolu oluştur
  async createLearningPath(category: string, pathData: Omit<LearningPath, 'id'>): Promise<LearningPath> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses`, {
        category,
        ...pathData
      });
      return response.data;
    } catch (error) {
      console.error('Öğrenme yolu oluşturulurken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.createLearningPath(category, pathData);
    }
  },
  
  // Mevcut bir öğrenme yolunu güncelle
  async updateLearningPath(pathId: string, pathData: Partial<LearningPath>): Promise<LearningPath> {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/${pathId}`, pathData);
      return response.data;
    } catch (error) {
      console.error('Öğrenme yolu güncellenirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.updateLearningPath(pathId, pathData);
    }
  },
  
  // Bir öğrenme yolunu sil
  async deleteLearningPath(pathId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/courses/${pathId}`);
    } catch (error) {
      console.error('Öğrenme yolu silinirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.deleteLearningPath(pathId);
    }
  },
  
  // Öğrenme adımı oluştur
  async createLearningStep(pathId: string, stepData: Omit<LearningStep, 'id'>): Promise<LearningStep> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${pathId}/steps`, stepData);
      return response.data;
    } catch (error) {
      console.error('Öğrenme adımı oluşturulurken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.createLearningStep(pathId, stepData);
    }
  },
  
  // Öğrenme adımını güncelle
  async updateLearningStep(stepId: string, stepData: Partial<LearningStep>): Promise<LearningStep> {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/steps/${stepId}`, stepData);
      return response.data;
    } catch (error) {
      console.error('Öğrenme adımı güncellenirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.updateLearningStep(stepId, stepData);
    }
  },
  
  // Adım içeriğini güncelle
  async updateStepContent(stepId: string, contentData: Partial<StepContent>): Promise<StepContent> {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/steps/${stepId}/content`, contentData);
      return response.data;
    } catch (error) {
      console.error('Adım içeriği güncellenirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.updateStepContent(stepId, contentData);
    }
  },
  
  // Adım sil
  async deleteStep(stepId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/courses/steps/${stepId}`);
    } catch (error) {
      console.error('Öğrenme adımı silinirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.deleteStep(stepId);
    }
  },
  
  // Tüm kategorileri getir
  async getCategories(): Promise<{id: string, name: string, icon: string}[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/categories`);
      return response.data;
    } catch (error) {
      console.error('Kategoriler getirilirken hata oluştu:', error);
      // Hata durumunda mock veri dön (geliştirme aşamasında)
      return mockLearningService.getCategories();
    }
  },
  
  async assignCourseToUser(userId: string, courseId: string): Promise<AssignedCourse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/assign`, {
        userId,
        courseId,
        assignedDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Kurs atanırken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.assignCourseToUser(userId, courseId);
    }
  },
  
  async getAssignedCourses(userId: string): Promise<AssignedCourse[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/assigned/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Atanan kurslar getirilirken hata oluştu:', error);
      // Hata durumunda mock veri dön (geliştirme aşamasında)
      return mockLearningService.getAssignedCourses(userId);
    }
  },
  
  async updateAssignedCourseStatus(userId: string, assignedCourseId: string, newStatus: string, progress?: number): Promise<AssignedCourse> {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/assigned/${userId}/${assignedCourseId}/status`, {
        newStatus,
        progress
      });
      return response.data;
    } catch (error) {
      console.error('Kurs durumu güncellenirken hata oluştu:', error);
      // Hata durumunda mock işlemi yap (geliştirme aşamasında)
      return mockLearningService.updateAssignedCourseStatus(userId, assignedCourseId, newStatus, progress);
    }
  },
  
  // Kurs detayları için yeni fonksiyonlar
  async getCourseDetails(courseId: string): Promise<CourseDetail> {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Kurs detayları getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  async getCourseModuleContent(courseId: string, moduleId: string): Promise<CourseDetailModule> {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}`);
      return response.data;
    } catch (error) {
      console.error('Modül içeriği getirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  async saveModuleProgress(userId: string, courseId: string, moduleId: string, status: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}/progress/${userId}`, {
        status,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Modül ilerlemesi kaydedilirken hata oluştu:', error);
      throw error;
    }
  },
  
  async submitModuleQuiz(userId: string, courseId: string, moduleId: string, quizId: string, answers: any[]): Promise<{score: number, passed: boolean, feedback?: string}> {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/${courseId}/modules/${moduleId}/quizzes/${quizId}/submit`, {
        userId,
        answers,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Quiz cevapları gönderilirken hata oluştu:', error);
      throw error;
    }
  },

  // Tüm kursları getir
  async getAllCourses(): Promise<Course[]> {
    try {
      console.log('API isteği yapılıyor:', `${API_BASE_URL}/courses`);
      const response = await axios.get(`${API_BASE_URL}/courses`);
      console.log('API yanıtı alındı, kurs sayısı:', response.data.length);
      
      // API'den gelen veriyi Course formatına dönüştür
      const courses: Course[] = response.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        image: item.thumbnailUrl,
        instructor: item.instructor,
        rating: item.rating,
        enrolled: item.enrolled,
        duration: item.duration,
        level: item.level,
        description: item.description,
        totalModules: item.totalModules || item.modules.length,
        completedModules: item.completedModules || 0,
        progress: item.completionPercentage || 0
      }));
      
      return courses;
    } catch (error) {
      console.error('Kurslar getirilirken hata oluştu:', error);
      // Hatayı göster, ancak uygulama çalışmaya devam etsin diye mock veri dön
      console.log('!! Hata nedeniyle mock veri kullanılıyor !!')
      return mockCoursesData;
    }
  }
};

export default learningService; 