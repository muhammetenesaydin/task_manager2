const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

// .env dosyasını yükle
dotenv.config();

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';

// Yeni kurslar
const newCourses = [
  // JavaScript ile Mobil Uygulama Geliştirme
  {
    id: 'mobile-js-101',
    title: 'JavaScript ile Mobil Uygulama Geliştirme',
    category: 'mobile',
    instructor: 'Dr. Emre Kılıç',
    instructorBio: 'React Native ve Mobil geliştirme uzmanı, 10+ yıllık deneyim, 30+ mobil uygulama geliştirdi.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?developer',
    level: 'Orta Seviye',
    duration: '25 saat',
    rating: 4.8,
    reviewCount: 376,
    enrolled: 3240,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?mobile',
    coverImage: 'https://source.unsplash.com/random/1200x600/?javascript',
    description: 'React Native kullanarak iOS ve Android platformları için çapraz platform mobil uygulamalar geliştirmeyi öğrenin',
    objectives: [
      'JavaScript ile mobil uygulama geliştirmenin temelleri',
      'React Native framework\'ünün detaylı kullanımı',
      'Redux ile mobil uygulamalarda durum yönetimi',
      'Native modüller ile etkileşim kurma',
      'Mobil uygulama performans optimizasyonu',
      'Firebase entegrasyonu ile gerçek zamanlı uygulamalar geliştirme'
    ],
    requirements: [
      'JavaScript ve React temel bilgisi',
      'Web geliştirme deneyimi',
      'Temel mobil uygulama konseptlerini anlama'
    ],
    modules: [
      {
        id: 'mobile-js-mod1',
        title: 'Mobil Geliştirme Temelleri',
        description: 'Mobil geliştirme ortamı kurulumu, geliştirme araçları ve React Native mimarisi',
        duration: '5 saat',
        videoUrl: 'https://www.youtube.com/embed/0-S5a0eXPoc',
        resources: [
          {
            title: 'React Native Dokümantasyonu',
            url: 'https://reactnative.dev/docs/getting-started',
            type: 'link'
          },
          {
            title: 'Mobil Geliştirme Best Practices',
            url: 'https://example.com/mobile-best-practices.pdf',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'mobile-js-mod2',
        title: 'UI Komponentleri ve Stillemeler',
        description: 'React Native\'in temel UI komponentleri, stil yönetimi ve responsive tasarım',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/ur6I5m2nTvk',
        resources: [
          {
            title: 'React Native UI Kütüphaneleri',
            url: 'https://example.com/react-native-ui-libraries',
            type: 'article'
          }
        ],
        quizzes: [
          {
            id: 'quiz-mobile-1',
            title: 'React Native UI Komponentleri Quiz',
            questions: [
              {
                id: 'q1-mobile',
                text: 'React Native\'de hangisi web\'deki div\'in karşılığıdır?',
                options: [
                  'Div',
                  'View',
                  'Container',
                  'Section'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              },
              {
                id: 'q2-mobile',
                text: 'StyleSheet.create() kullanmanın avantajı nedir?',
                options: [
                  'Daha hızlı stil uygulaması',
                  'ID referansları ile stil objelerini önbelleğe alır',
                  'CSS dosyaları oluşturur',
                  'DOM manipülasyonunu hızlandırır'
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
        id: 'mobile-js-mod3',
        title: 'Navigasyon ve Routing',
        description: 'React Navigation kütüphanesi, ekranlar arası geçiş ve kompleks navigasyon yapıları',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/nQVCkqvU1uE',
        resources: [
          {
            title: 'React Navigation Dokümantasyon',
            url: 'https://reactnavigation.org/docs/getting-started',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'mobile-js-mod4',
        title: 'Durum Yönetimi ve API Entegrasyonu',
        description: 'Redux ile durum yönetimi, REST API entegrasyonu ve veri yönetimi',
        duration: '5 saat',
        videoUrl: 'https://www.youtube.com/embed/9boMnm5X9ak',
        resources: [
          {
            title: 'Redux Toolkit ile Durum Yönetimi',
            url: 'https://example.com/redux-toolkit',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'mobile-js-mod5',
        title: 'Native Modüller ve Cihaz Özellikleri',
        description: 'Kamera, GPS, bildirimler gibi native cihaz özelliklerine erişim',
        duration: '3 saat',
        videoUrl: 'https://www.youtube.com/embed/JMo0WRKh3UE',
        resources: [
          {
            title: 'React Native Device API\'leri',
            url: 'https://example.com/device-apis',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['react native', 'javascript', 'mobil', 'cross-platform', 'ios', 'android'],
    totalModules: 5,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // 3D Modelleme ve Oyun Tasarımı
  {
    id: 'game-design-3d',
    title: '3D Modelleme ve Oyun Tasarımı',
    category: 'programming',
    instructor: 'Samet Yıldırım',
    instructorBio: '10+ yıllık oyun geliştirme ve 3D modelleme deneyimi, birçok indie oyun ve AAA projelerinde görev almış.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?designer',
    level: 'Orta Seviye',
    duration: '28 saat',
    rating: 4.8,
    reviewCount: 354,
    enrolled: 2960,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?gamedesign',
    coverImage: 'https://source.unsplash.com/random/1200x600/?3dmodeling',
    description: 'Blender ve Unity kullanarak 3D modelleme ve oyun tasarımının temellerini öğrenin',
    objectives: [
      'Blender ile 3D modelleme, rigging ve animasyon',
      'Unity oyun motoru temellerini öğrenmek',
      'C# ile oyun programlama',
      'Oyun mekaniği tasarımı ve implementasyonu',
      'Karakter ve çevre tasarımı',
      'Gerçek zamanlı render teknikleri'
    ],
    requirements: [
      'Temel bilgisayar bilgisi',
      'Temel düzeyde programlama anlayışı',
      'Yaratıcı düşünme ve tasarım yeteneği',
      'Orta düzey bir bilgisayar (grafik kartı olan tercih edilir)'
    ],
    modules: [
      {
        id: 'game-3d-mod1',
        title: 'Blender\'a Giriş ve 3D Modelleme Temelleri',
        description: 'Blender arayüzü, temel 3D modelleme teknikleri ve nesne manipülasyonu',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/MF1qEhBSfq4',
        resources: [
          {
            title: 'Blender Resmi Dokümantasyonu',
            url: 'https://docs.blender.org/',
            type: 'link'
          },
          {
            title: '3D Modelleme Terminolojisi',
            url: 'https://example.com/3d-modeling-terms.pdf',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'game-3d-mod2',
        title: 'Materyal, Doku ve Aydınlatma',
        description: 'PBR materyaller, UV haritalama, dokulandırma ve ışıklandırma temelleri',
        duration: '5 saat',
        videoUrl: 'https://www.youtube.com/embed/eX7OVWh9pA4',
        resources: [
          {
            title: 'PBR Materyaller Rehberi',
            url: 'https://example.com/pbr-materials',
            type: 'article'
          }
        ],
        quizzes: [
          {
            id: 'quiz-3d-1',
            title: '3D Modelleme Quiz',
            questions: [
              {
                id: 'q1-3d',
                text: 'UV haritalama ne işe yarar?',
                options: [
                  'Modeli optimize etmek',
                  '2D dokuyu 3D modele yerleştirmek',
                  'Animasyon oluşturmak',
                  'Fizik hesaplamaları yapmak'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              },
              {
                id: 'q2-3d',
                text: 'Normal map ne için kullanılır?',
                options: [
                  'Renk bilgisi için',
                  'Işık yansıması için',
                  'Yüzey detaylarını simüle etmek için',
                  'Saydamlık için'
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
        id: 'game-3d-mod3',
        title: 'Rigging ve Animasyon',
        description: 'Karakter rigging, weight painting ve keyframe animasyon teknikleri',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/f2pTkW-1JkE',
        resources: [
          {
            title: 'Karakter Rigging Rehberi',
            url: 'https://example.com/character-rigging',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'game-3d-mod4',
        title: 'Unity Oyun Motoru Temelleri',
        description: 'Unity arayüzü, asset yönetimi, sahne oluşturma ve temel konseptler',
        duration: '5 saat',
        videoUrl: 'https://www.youtube.com/embed/XtQMytORBmM',
        resources: [
          {
            title: 'Unity Dokümantasyon',
            url: 'https://docs.unity3d.com/',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'game-3d-mod5',
        title: 'C# ile Oyun Programlama',
        description: 'C# temelleri, komponent tabanlı programlama ve Unity API kullanımı',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/9tMvzrqBUP8',
        resources: [
          {
            title: 'Unity için C# Programlama Rehberi',
            url: 'https://example.com/unity-csharp',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['3d modelleme', 'oyun tasarımı', 'blender', 'unity', 'c#', 'game development'],
    totalModules: 5,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Veritabanına bağlan ve kursları ekle
async function seedNewCourses() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Yeni kursları ekle (var olanları silmeden)
    console.log('Yeni kurslar ekleniyor...');
    const result = await Course.insertMany(newCourses);
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
seedNewCourses(); 