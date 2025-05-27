const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

// .env dosyasını yükle
dotenv.config();

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';

// Örnek kurslar
const courses = [
  {
    id: 'ai-101',
    title: 'Yapay Zeka Temelleri',
    category: 'ai',
    instructor: 'Dr. Ahmet Yılmaz',
    instructorBio: 'Yapay zeka alanında 15 yıllık deneyime sahip, çeşitli üniversitelerde ders veren akademisyen.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?professor',
    level: 'Başlangıç',
    duration: '8 saat',
    rating: 4.7,
    reviewCount: 342,
    enrolled: 3420,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?ai',
    coverImage: 'https://source.unsplash.com/random/1200x600/?ai',
    description: 'Yapay zeka konseptleri ve uygulamaları hakkında temel bilgiler ve pratik örnekler',
    objectives: [
      'Yapay zeka temel kavramlarını anlamak',
      'Makine öğrenmesi ile yapay zeka arasındaki farkı öğrenmek',
      'Yapay zeka uygulama alanlarını tanımak',
      'Basit yapay zeka algoritmaları geliştirmek'
    ],
    requirements: [
      'Temel bilgisayar bilgisi',
      'Basit seviyede programlama deneyimi',
      'Merak ve öğrenme isteği'
    ],
    modules: [
      {
        id: 'ai-101-mod1',
        title: 'Yapay Zeka\'ya Giriş',
        description: 'Yapay zeka nedir, nerelerde kullanılır ve neden önemlidir sorularının cevapları',
        duration: '1 saat',
        videoUrl: 'https://www.youtube.com/embed/QA0XpGhiz5w',
        resources: [
          {
            title: 'Yapay Zeka Tanıtım Dokümanı',
            url: 'https://example.com/ai-intro.pdf',
            type: 'document'
          },
          {
            title: 'AI Tarihi Makalesi',
            url: 'https://example.com/ai-history',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'ai-101-mod2',
        title: 'Makine Öğrenmesi Temelleri',
        description: 'Makine öğrenmesinin temelleri, yapay zeka ile ilişkisi ve temel algoritmalar',
        duration: '2 saat',
        videoUrl: 'https://www.youtube.com/embed/JMUxmLyrhSk',
        resources: [
          {
            title: 'Makine Öğrenmesi 101',
            url: 'https://example.com/ml-101',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'ai-101-mod3',
        title: 'Derin Öğrenme ve Sinir Ağları',
        description: 'Derin öğrenme konseptleri ve temel sinir ağı yapıları',
        duration: '2.5 saat',
        videoUrl: 'https://www.youtube.com/embed/NWONeJKn6kc',
        resources: [
          {
            title: 'Derin Öğrenme Görselleştirilmiş',
            url: 'https://example.com/deep-learning-viz',
            type: 'article'
          }
        ],
        quizzes: [
          {
            id: 'quiz-ai101-1',
            title: 'Yapay Zeka Temelleri Quiz',
            questions: [
              {
                id: 'q1-ai101',
                text: 'Hangisi bir yapay zeka uygulaması değildir?',
                options: [
                  'Yüz tanıma sistemi',
                  'Hesap makinesi',
                  'Otonom araçlar',
                  'Akıllı asistanlar'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              },
              {
                id: 'q2-ai101',
                text: 'Makine öğrenmesinde "eğitim verisi" ne işe yarar?',
                options: [
                  'Modelin performansını test etmek için kullanılır',
                  'Modeli eğitmek için kullanılır',
                  'Modelin sonuçlarını doğrulamak için kullanılır',
                  'Modelin hızını artırmak için kullanılır'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              }
            ]
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'ai-101-mod4',
        title: 'Yapay Zeka Uygulama Alanları',
        description: 'Gerçek dünya problemlerinde yapay zeka kullanımı ve vaka çalışmaları',
        duration: '2.5 saat',
        videoUrl: 'https://www.youtube.com/embed/QA0XpGhiz5w',
        resources: [
          {
            title: 'Yapay Zeka Uygulama Alanları',
            url: 'https://example.com/ai-applications',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['yapay zeka', 'makine öğrenmesi', 'derin öğrenme', 'veri bilimi'],
    totalModules: 4,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'web-react',
    title: 'Modern React ile Web Geliştirme',
    category: 'web',
    instructor: 'Zeynep Kaya',
    instructorBio: '10+ yıllık frontend geliştirme deneyimi, 5+ yıldır React ile aktif olarak çalışıyor.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?developer',
    level: 'Orta Seviye',
    duration: '15 saat',
    rating: 4.8,
    reviewCount: 512,
    enrolled: 5120,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?webdevelopment',
    coverImage: 'https://source.unsplash.com/random/1200x600/?reactjs',
    description: 'React, Redux ve TypeScript ile modern web uygulamaları geliştirmeyi öğrenin',
    objectives: [
      'React temellerini öğrenmek',
      'Modern JavaScript ve ESNext özelliklerini kullanmak',
      'Redux ile durum yönetimini uygulamak',
      'TypeScript ile tip güvenli uygulamalar geliştirmek',
      'React Hooks ile fonksiyonel komponentler oluşturmak'
    ],
    requirements: [
      'HTML, CSS ve JavaScript bilgisi',
      'Temel web geliştirme deneyimi',
      'Node.js ve npm bilgisi'
    ],
    modules: [
      {
        id: 'react-mod1',
        title: 'React Temelleri',
        description: 'React kütüphanesi, JSX yapısı ve temel komponentler',
        duration: '3 saat',
        videoUrl: 'https://www.youtube.com/embed/w7ejDZ8SWv8',
        resources: [
          {
            title: 'React Resmi Dokümantasyon',
            url: 'https://reactjs.org/docs/getting-started.html',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'react-mod2',
        title: 'React Hooks',
        description: 'Modern React için Hook\'lar ve fonksiyonel komponentler',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/TNhaISOUy6Q',
        resources: [
          {
            title: 'React Hooks Rehberi',
            url: 'https://example.com/react-hooks-guide',
            type: 'article'
          }
        ],
        quizzes: [
          {
            id: 'quiz-react-1',
            title: 'React Hooks Bilgi Testi',
            questions: [
              {
                id: 'q1-react',
                text: 'useState Hook\'u ne için kullanılır?',
                options: [
                  'Komponent yaşam döngüsünü kontrol etmek için',
                  'Komponent stil işlemleri için',
                  'Komponent içinde durum (state) yönetimi için',
                  'Komponentler arası veri akışı için'
                ],
                correctOption: 2,
                type: 'multiple_choice'
              }
            ]
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'react-mod3',
        title: 'Redux ile Durum Yönetimi',
        description: 'Redux temelleri, actions, reducers ve store yapısı',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/0i7iSxbGW_Y',
        resources: [
          {
            title: 'Redux Dokümantasyon',
            url: 'https://redux.js.org/',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'react-mod4',
        title: 'TypeScript ile React',
        description: 'TypeScript temellerini öğrenin ve React ile kullanın',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/0-i5bGbO1Ec',
        resources: [
          {
            title: 'TypeScript ile React',
            url: 'https://example.com/typescript-react',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['react', 'redux', 'typescript', 'frontend', 'javascript'],
    totalModules: 4,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'embedded-arduino',
    title: 'Arduino ile Gömülü Sistemler',
    category: 'embedded',
    instructor: 'Murat Demir',
    instructorBio: 'Elektronik mühendisi, 8 yıllık Arduino ve gömülü sistemler deneyimi',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?engineer',
    level: 'Başlangıç',
    duration: '10 saat',
    rating: 4.5,
    reviewCount: 289,
    enrolled: 2890,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?arduino',
    coverImage: 'https://source.unsplash.com/random/1200x600/?electronics',
    description: 'Arduino platformunu kullanarak gömülü sistem projelerini nasıl geliştirebileceğinizi öğrenin',
    objectives: [
      'Arduino temellerini anlamak',
      'Elektronik devreleri tasarlamak ve kurmak',
      'Arduino IDE kullanarak kod yazmak',
      'Sensörler ve aktüatörlerle çalışmak',
      'IoT (Nesnelerin İnterneti) projeleri geliştirmek'
    ],
    requirements: [
      'Temel elektronik bilgisi',
      'Basit C++ programlama deneyimi',
      'Arduino başlangıç kiti (önerilen)'
    ],
    modules: [
      {
        id: 'arduino-mod1',
        title: 'Arduino\'ya Giriş',
        description: 'Arduino platformu, donanım özellikleri ve geliştirme ortamı',
        duration: '2 saat',
        videoUrl: 'https://www.youtube.com/embed/fJWR7dBuc18',
        resources: [
          {
            title: 'Arduino Resmi Sitesi',
            url: 'https://www.arduino.cc/',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'arduino-mod2',
        title: 'Temel Elektronik ve Devreler',
        description: 'Arduino ile kullanabileceğiniz temel elektronik bileşenler ve devre kurulumu',
        duration: '3 saat',
        videoUrl: 'https://www.youtube.com/embed/d8_xXNcGYyA',
        resources: [
          {
            title: 'Temel Elektronik Rehberi',
            url: 'https://example.com/basic-electronics',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'arduino-mod3',
        title: 'Sensörler ve Veri Okuma',
        description: 'Çeşitli sensörlerden veri okuma ve işleme teknikleri',
        duration: '2.5 saat',
        videoUrl: 'https://www.youtube.com/embed/MA4VoQMRFQU',
        resources: [
          {
            title: 'Sensör Kütüphaneleri',
            url: 'https://example.com/arduino-sensors',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'arduino-mod4',
        title: 'IoT Projeleri',
        description: 'Arduino\'yu internete bağlama ve nesnelerin interneti projeleri geliştirme',
        duration: '2.5 saat',
        videoUrl: 'https://www.youtube.com/embed/HpzwQZhUUMM',
        resources: [
          {
            title: 'Arduino IoT Cloud',
            url: 'https://create.arduino.cc/iot/',
            type: 'link'
          }
        ],
        quizzes: [
          {
            id: 'quiz-arduino-1',
            title: 'Arduino IoT Bilgi Testi',
            questions: [
              {
                id: 'q1-arduino',
                text: 'Arduino\'yu internete bağlamak için hangi shield kullanılabilir?',
                options: [
                  'Motor Shield',
                  'Ethernet Shield',
                  'LCD Shield',
                  'Relay Shield'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              }
            ]
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['arduino', 'gömülü sistemler', 'elektronik', 'iot', 'robotik'],
    totalModules: 4,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Veritabanına bağlan ve kursları ekle
async function seedCourses() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut kursları temizle
    console.log('Mevcut kurslar temizleniyor...');
    await Course.deleteMany({});
    console.log('Mevcut kurslar temizlendi');

    // Yeni kursları ekle
    console.log('Yeni kurslar ekleniyor...');
    const result = await Course.insertMany(courses);
    console.log(`${result.length} kurs başarıyla eklendi`);

    // Bağlantıyı kapat
    await mongoose.connection.close();
    console.log('MongoDB bağlantısı kapatıldı');
    console.log('Seed işlemi tamamlandı!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed işlemi sırasında hata oluştu:', error);
    process.exit(1);
  }
}

// Seed işlemini başlat
seedCourses(); 