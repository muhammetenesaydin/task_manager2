const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + req.user._id + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    // Only accept images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Sadece resim dosyaları yüklenebilir'), false);
    }
    cb(null, true);
  }
});

// Loglama middleware'i ekle (Health endpoint dışındaki istekler için)
router.use((req, res, next) => {
  // Health endpoint için log oluşturma
  if (!req.originalUrl.includes('/health')) {
    console.log(`Auth Route: ${req.method} ${req.originalUrl}`);
    console.log('Request Headers:', req.headers.authorization ? 'Authorization: Bearer xxx...' : 'No Auth Header');
  }
  next();
});

// Public routes
// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Health check endpoint (public)
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Auth service is running',
    dbStatus: dbStatus,
    timestamp: new Date().toISOString(),
    apiVersion: '1.0.1'
  });
});

// Protected routes (require authentication)
// Get current user
router.get('/me', auth, authController.getMe);

// Verify token
router.get('/verify', auth, authController.verifyToken);

// Update profile
router.put('/profile', auth, authController.updateProfile);

// Change password
router.put('/password', auth, authController.changePassword);

// Get login history
router.get('/login-history', auth, authController.getLoginHistory);

// Terminate session
router.delete('/sessions/:sessionId', auth, authController.terminateSession);

// Deactivate account
router.put('/deactivate', auth, authController.deactivateAccount);

// Delete account
router.delete('/account', auth, authController.deleteAccount);

// Upload profile image
router.post('/profile/image', auth, upload.single('profileImage'), authController.uploadProfileImage);

// Reactivate account (public)
router.post('/reactivate', authController.reactivateAccount);

// Hata ayıklama için catch-all middleware ekle
router.use((err, req, res, next) => {
  // Health endpoint hataları için daha az log oluştur
  if (!req.originalUrl.includes('/health')) {
    console.error('Auth routes hata:', err);
    console.error('Hatanın stack trace:', err.stack);
    console.error('İstek URL:', req.originalUrl, 'Metot:', req.method);
  }
  
  // İstemciye hata yanıtı gönder
  res.status(500).json({ 
    error: 'Auth sunucu hatası: ' + err.message, 
    success: false 
  });
});

module.exports = router; 