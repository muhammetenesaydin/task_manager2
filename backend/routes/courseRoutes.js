const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middlewares/auth');

// Tüm kursları getir
router.get('/', courseController.getAllCourses);

// Kurs kategorilerini getir
router.get('/categories', courseController.getCategories);

// Kurs detaylarını getir
router.get('/:id', courseController.getCourseById);

// Modül içeriğini getir
router.get('/:courseId/modules/:moduleId', courseController.getModuleContent);

// Yeni kurs ekle (sadece admin)
router.post('/', auth, courseController.createCourse);

// Kurs güncelle (sadece admin)
router.put('/:id', auth, courseController.updateCourse);

// Kurs sil (sadece admin)
router.delete('/:id', auth, courseController.deleteCourse);

// Kullanıcıya kurs ata
router.post('/assign', auth, courseController.assignCourseToUser);

// Kullanıcıya atanan kursları getir
router.get('/assigned/:userId', auth, courseController.getAssignedCourses);

// Atanan kurs durumunu güncelle
router.put('/assigned/:userId/:courseId/status', auth, courseController.updateAssignedCourseStatus);

// Modül ilerleme durumunu kaydet
router.post('/:courseId/modules/:moduleId/progress/:userId', auth, courseController.saveModuleProgress);

// Quiz cevaplarını kontrol et
router.post('/:courseId/modules/:moduleId/quizzes/:quizId/submit', auth, courseController.submitQuizAnswer);

module.exports = router; 