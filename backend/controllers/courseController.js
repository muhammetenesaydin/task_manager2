const Course = require('../models/Course');
const AssignedCourse = require('../models/AssignedCourse');
const User = require('../models/User');

// Tüm kursları getir
exports.getAllCourses = async (req, res) => {
  try {
    // Kategori filtresi varsa uygula
    const filter = {};
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    // Arama filtresi varsa uygula
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    const courses = await Course.find(filter).select('-modules');
    res.json(courses);
  } catch (error) {
    console.error('Kurslar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kurs detaylarını getir
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Kurs detayları getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Modül içeriğini getir
exports.getModuleContent = async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId });
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    const module = course.modules.find(m => m.id === req.params.moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Modül bulunamadı' });
    }
    
    res.json(module);
  } catch (error) {
    console.error('Modül içeriği getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Yeni kurs ekle
exports.createCourse = async (req, res) => {
  try {
    // Benzersiz ID oluştur
    const courseId = `${req.body.category}-${Date.now()}`;
    
    const newCourse = new Course({
      ...req.body,
      id: courseId
    });
    
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Kurs eklenirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kurs güncelle
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { id: req.params.id }, 
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    res.json(course);
  } catch (error) {
    console.error('Kurs güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kurs sil
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ id: req.params.id });
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    // Bu kursla ilgili tüm atamaları da sil
    await AssignedCourse.deleteMany({ courseId: req.params.id });
    
    res.json({ message: 'Kurs başarıyla silindi' });
  } catch (error) {
    console.error('Kurs silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kullanıcıya kurs ata
exports.assignCourseToUser = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    
    // Kurs ve kullanıcı gerçekten var mı kontrol et
    const course = await Course.findOne({ id: courseId });
    const user = await User.findById(userId);
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Son tarih hesapla - varsayılan 30 gün
    const dueDate = req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    // Atanmış kurs oluştur
    const assignedCourse = new AssignedCourse({
      courseId: course.id,
      userId: user._id,
      title: course.title,
      category: course.category,
      image: course.thumbnailUrl,
      assignedBy: req.body.assignedBy || req.user?._id,
      assignedDate: new Date(),
      dueDate,
      status: 'not-started',
      priority: req.body.priority || 'medium',
      progress: 0,
      totalModules: course.totalModules || course.modules?.length || 0,
      completedModules: 0
    });
    
    await assignedCourse.save();
    res.status(201).json(assignedCourse);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Bu kurs kullanıcıya zaten atanmış' });
    }
    
    console.error('Kurs atanırken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kullanıcıya atanan kursları getir
exports.getAssignedCourses = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Kullanıcı gerçekten var mı kontrol et
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    const assignedCourses = await AssignedCourse.find({ userId });
    res.json(assignedCourses);
  } catch (error) {
    console.error('Atanan kurslar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Atanan kurs durumunu güncelle
exports.updateAssignedCourseStatus = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const { status, progress } = req.body;
    
    const assignedCourse = await AssignedCourse.findOne({ userId, _id: courseId });
    
    if (!assignedCourse) {
      return res.status(404).json({ message: 'Atanan kurs bulunamadı' });
    }
    
    assignedCourse.status = status || assignedCourse.status;
    
    if (progress !== undefined) {
      assignedCourse.progress = progress;
    }
    
    if (status === 'completed') {
      assignedCourse.completedModules = assignedCourse.totalModules;
      assignedCourse.progress = 100;
    }
    
    await assignedCourse.save();
    res.json(assignedCourse);
  } catch (error) {
    console.error('Kurs durumu güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Modül ilerleme durumunu kaydet
exports.saveModuleProgress = async (req, res) => {
  try {
    const { userId, courseId, moduleId } = req.params;
    const { status, progress } = req.body;
    
    // Kurs gerçekten var mı kontrol et
    const course = await Course.findOne({ id: courseId });
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    // Modül gerçekten var mı kontrol et
    const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
    
    if (moduleIndex === -1) {
      return res.status(404).json({ message: 'Modül bulunamadı' });
    }
    
    // Modül durumunu güncelle
    course.modules[moduleIndex].completionStatus = status;
    
    // Tamamlanan modül sayısını hesapla
    const completedModules = course.modules.filter(m => m.completionStatus === 'completed').length;
    
    // Kurs ilerleme durumunu güncelle
    const courseProgress = Math.round((completedModules / course.modules.length) * 100);
    
    // Atanan kurs varsa onu da güncelle
    const assignedCourse = await AssignedCourse.findOne({ userId, courseId });
    
    if (assignedCourse) {
      assignedCourse.completedModules = completedModules;
      assignedCourse.progress = courseProgress;
      
      // Tüm modüller tamamlandıysa kursu tamamlanmış olarak işaretle
      if (completedModules === course.modules.length) {
        assignedCourse.status = 'completed';
      } else if (assignedCourse.status === 'not-started') {
        assignedCourse.status = 'in-progress';
      }
      
      await assignedCourse.save();
    }
    
    // Son erişilen modülü güncelle
    course.lastAccessedModuleId = moduleId;
    course.completionPercentage = courseProgress;
    
    await course.save();
    
    res.json({ message: 'İlerleme kaydedildi', progress: courseProgress });
  } catch (error) {
    console.error('Modül ilerlemesi kaydedilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Quiz cevaplarını kontrol et
exports.submitQuizAnswer = async (req, res) => {
  try {
    const { courseId, moduleId, quizId } = req.params;
    const { answers } = req.body;
    
    // Kurs gerçekten var mı kontrol et
    const course = await Course.findOne({ id: courseId });
    
    if (!course) {
      return res.status(404).json({ message: 'Kurs bulunamadı' });
    }
    
    // Modül gerçekten var mı kontrol et
    const module = course.modules.find(m => m.id === moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Modül bulunamadı' });
    }
    
    // Quiz gerçekten var mı kontrol et
    const quiz = module.quizzes?.find(q => q.id === quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz bulunamadı' });
    }
    
    // Cevapları değerlendir (basit değerlendirme)
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;
    
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = quiz.questions.find(q => q.id === answer.questionId);
      
      if (!question) continue;
      
      if (question.type === 'multiple_choice' && answer.selectedOption === question.correctOption) {
        correctAnswers++;
      } else if (question.type === 'text' && answer.text === question.answer) {
        correctAnswers++;
      }
      // Kod soruları için daha karmaşık bir değerlendirme gerekebilir
    }
    
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 70; // %70 başarı kriteri
    
    res.json({
      score,
      passed,
      correctAnswers,
      totalQuestions,
      feedback: passed 
        ? 'Tebrikler! Quizi başarıyla tamamladınız.' 
        : 'Quizi geçmek için daha fazla çalışmanız gerekiyor.'
    });
  } catch (error) {
    console.error('Quiz cevapları değerlendirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// Kurs kategorilerini getir
exports.getCategories = async (req, res) => {
  try {
    const categories = [
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
    
    res.json(categories);
  } catch (error) {
    console.error('Kategoriler getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}; 