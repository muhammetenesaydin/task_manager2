const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('../models/Course');

// .env dosyasını yükle
dotenv.config();

// MongoDB bağlantısı
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';

// Diğer kurslar
const moreCourses = [
  // Veri Bilimi ve Makine Öğrenmesi
  {
    id: 'data-science-ml',
    title: 'İleri Veri Bilimi ve Makine Öğrenmesi',
    category: 'data-science',
    instructor: 'Prof. Dr. Selin Aydın',
    instructorBio: 'Veri bilimi ve yapay zeka alanında uzman akademisyen, birçok uluslararası projede danışmanlık yapmaktadır.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?scientist',
    level: 'İleri Seviye',
    duration: '32 saat',
    rating: 4.9,
    reviewCount: 412,
    enrolled: 2980,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?datascience',
    coverImage: 'https://source.unsplash.com/random/1200x600/?machinelearning',
    description: 'Python kullanarak ileri düzey veri bilimi ve makine öğrenmesi tekniklerini uygulamalı olarak öğrenin',
    objectives: [
      'Veri işleme ve görselleştirme tekniklerini ileri düzeyde kullanmak',
      'Derin öğrenme modellerini oluşturmak ve eğitmek',
      'Doğal dil işleme ve bilgisayarlı görü uygulamaları geliştirmek',
      'Model performansını değerlendirme ve iyileştirme yöntemlerini öğrenmek',
      'Büyük veri kümeleriyle çalışma ve dağıtık hesaplama'
    ],
    requirements: [
      'Python programlama dilinde orta düzey deneyim',
      'Temel matematik ve istatistik bilgisi',
      'Temel makine öğrenmesi kavramlarına aşinalık'
    ],
    modules: [
      {
        id: 'data-sci-mod1',
        title: 'İleri Veri Analizi ve Görselleştirme',
        description: 'Pandas, NumPy ve ileri veri görselleştirme tekniklerini kullanarak veri analizi',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmQ',
        resources: [
          {
            title: 'Pandas Cheat Sheet',
            url: 'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf',
            type: 'document'
          },
          {
            title: 'Veri Görselleştirme Rehberi',
            url: 'https://example.com/data-visualization-guide',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'data-sci-mod2',
        title: 'Derin Öğrenme Temelleri',
        description: 'Sinir ağları mimarisi, TensorFlow ve Keras ile model oluşturma',
        duration: '8 saat',
        videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
        resources: [
          {
            title: 'TensorFlow Dokümantasyon',
            url: 'https://www.tensorflow.org/tutorials',
            type: 'link'
          }
        ],
        quizzes: [
          {
            id: 'quiz-datasci-1',
            title: 'Derin Öğrenme Quiz',
            questions: [
              {
                id: 'q1-datasci',
                text: 'Hangi aktivasyon fonksiyonu vanishing gradient sorununa çözüm olarak geliştirilmiştir?',
                options: [
                  'Sigmoid',
                  'Tanh',
                  'ReLU',
                  'Softmax'
                ],
                correctOption: 2,
                type: 'multiple_choice'
              },
              {
                id: 'q2-datasci',
                text: 'Aşırı öğrenme (overfitting) için en iyi çözüm yöntemi hangisidir?',
                options: [
                  'Daha fazla katman eklemek',
                  'Daha çok epoch ile eğitmek',
                  'Dropout ve regularizasyon kullanmak',
                  'Learning rate\'i artırmak'
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
        id: 'data-sci-mod3',
        title: 'Bilgisayarlı Görü',
        description: 'CNN mimarileri, görüntü sınıflandırma, nesne tespiti ve segmentasyon',
        duration: '7 saat',
        videoUrl: 'https://www.youtube.com/embed/ArPaAX_PhIs',
        resources: [
          {
            title: 'CNN Mimarileri Karşılaştırması',
            url: 'https://example.com/cnn-architectures',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'data-sci-mod4',
        title: 'Doğal Dil İşleme',
        description: 'NLP teknikleri, RNN, LSTM ve Transformer mimarileri',
        duration: '7 saat',
        videoUrl: 'https://www.youtube.com/embed/8rXD5-xhemo',
        resources: [
          {
            title: 'NLTK ve spaCy Kütüphaneleri',
            url: 'https://example.com/nlp-libraries',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'data-sci-mod5',
        title: 'Model Dağıtımı ve Ürünleştirme',
        description: 'ML modellerini ürünleştirme, API oluşturma ve bulut platformları',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/5UjCJO6Gr_8',
        resources: [
          {
            title: 'ML Modeli Dağıtım Stratejileri',
            url: 'https://example.com/ml-deployment',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['veri bilimi', 'makine öğrenmesi', 'derin öğrenme', 'python', 'yapay zeka', 'NLP', 'bilgisayarlı görü'],
    totalModules: 5,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Blok Zincir ve Kripto Para
  {
    id: 'blockchain-crypto',
    title: 'Blok Zincir ve Kripto Para Teknolojileri',
    category: 'programming',
    instructor: 'Dr. Mert Yılmaz',
    instructorBio: 'Blok zincir teknolojileri ve kriptografi alanında uzman, birçok kripto para projesinde danışman olarak görev almış.',
    instructorAvatar: 'https://source.unsplash.com/random/100x100/?blockchain',
    level: 'Orta Seviye',
    duration: '22 saat',
    rating: 4.6,
    reviewCount: 218,
    enrolled: 1750,
    thumbnailUrl: 'https://source.unsplash.com/random/400x300/?blockchain',
    coverImage: 'https://source.unsplash.com/random/1200x600/?cryptocurrency',
    description: 'Blok zincir teknolojisinin temelleri, akıllı kontratlar ve kripto para uygulamaları geliştirme',
    objectives: [
      'Blok zincir teknolojisinin çalışma prensiplerini öğrenmek',
      'Bitcoin, Ethereum ve diğer kripto paraların teknik altyapısını anlamak',
      'Solidity ile akıllı kontratlar geliştirmek',
      'Dapps (Dağıtık uygulamalar) geliştirme bilgisi kazanmak',
      'Kripto para cüzdanları ve exchange entegrasyonları oluşturmak',
      'Blok zincir güvenliği ve saldırı vektörlerini anlamak'
    ],
    requirements: [
      'Temel programlama deneyimi',
      'Web teknolojileri bilgisi',
      'Kriptografi konseptleri hakkında temel anlayış'
    ],
    modules: [
      {
        id: 'blockchain-mod1',
        title: 'Blok Zincir Teknolojisi Temelleri',
        description: 'Blok zincir çalışma prensibi, konsensus mekanizmaları ve dağıtık defterler',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/bBC-nXj3Ng4',
        resources: [
          {
            title: 'Blok Zincir Temelleri E-Kitap',
            url: 'https://example.com/blockchain-basics.pdf',
            type: 'document'
          },
          {
            title: 'Konsensus Algoritmaları Karşılaştırması',
            url: 'https://example.com/consensus-algorithms',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'blockchain-mod2',
        title: 'Kripto Paralar ve Bitcoin',
        description: 'Bitcoin yapısı, madencilik, cüzdanlar ve işlem mekanizması',
        duration: '5 saat',
        videoUrl: 'https://www.youtube.com/embed/Gc2en3nHxA4',
        resources: [
          {
            title: 'Bitcoin Whitepaper',
            url: 'https://bitcoin.org/bitcoin.pdf',
            type: 'document'
          }
        ],
        quizzes: [
          {
            id: 'quiz-blockchain-1',
            title: 'Bitcoin ve Blok Zincir Quiz',
            questions: [
              {
                id: 'q1-blockchain',
                text: 'Bitcoin\'de bir bloğun ortalama oluşturulma süresi nedir?',
                options: [
                  '1 dakika',
                  '10 dakika',
                  '1 saat',
                  '1 gün'
                ],
                correctOption: 1,
                type: 'multiple_choice'
              },
              {
                id: 'q2-blockchain',
                text: 'Hangisi bir konsensus algoritması değildir?',
                options: [
                  'Proof of Work',
                  'Proof of Stake',
                  'Delegated Proof of Stake',
                  'Proof of Authority'
                ],
                correctOption: 3,
                type: 'multiple_choice'
              }
            ]
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'blockchain-mod3',
        title: 'Ethereum ve Akıllı Kontratlar',
        description: 'Ethereum platformu, EVM, gas ve Solidity programlama',
        duration: '6 saat',
        videoUrl: 'https://www.youtube.com/embed/coQ5dg8wM2o',
        resources: [
          {
            title: 'Solidity Dokümantasyon',
            url: 'https://docs.soliditylang.org/',
            type: 'link'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'blockchain-mod4',
        title: 'Dağıtık Uygulamalar (DApps)',
        description: 'Web3.js, Metamask entegrasyonu ve dapp mimarisi',
        duration: '4 saat',
        videoUrl: 'https://www.youtube.com/embed/2TV0r94p8OY',
        resources: [
          {
            title: 'Web3.js Rehberi',
            url: 'https://example.com/web3js-guide',
            type: 'article'
          }
        ],
        completionStatus: 'not_started'
      },
      {
        id: 'blockchain-mod5',
        title: 'NFT ve DeFi Uygulamaları',
        description: 'NFT standartları, DeFi protokolleri ve uygulama geliştirme',
        duration: '3 saat',
        videoUrl: 'https://www.youtube.com/embed/8wMKq7HvbKI',
        resources: [
          {
            title: 'ERC-721 NFT Standardı',
            url: 'https://example.com/erc721',
            type: 'document'
          }
        ],
        completionStatus: 'not_started'
      }
    ],
    tags: ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'smart contracts', 'nft', 'defi'],
    totalModules: 5,
    completedModules: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Veritabanına bağlan ve kursları ekle
async function seedMoreCourses() {
  try {
    // MongoDB'ye bağlan
    console.log('MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Yeni kursları ekle (var olanları silmeden)
    console.log('Diğer kurslar ekleniyor...');
    const result = await Course.insertMany(moreCourses);
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
seedMoreCourses(); 