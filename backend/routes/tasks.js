const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const auth = require('../middlewares/auth');
const mongoose = require('mongoose');

// Loglama middleware'i ekle
router.use((req, res, next) => {
  console.log(`Task Route: ${req.method} ${req.originalUrl}`);
  console.log('Request Headers:', req.headers.authorization ? 'Authorization: Bearer xxx...' : 'No Auth Header');
  next();
});

// Health check endpoint (public, auth yok)
router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    message: 'Tasks API is running',
    dbStatus: dbStatus,
    timestamp: new Date().toISOString(),
    apiVersion: '1.0.1'
  });
});

// Debug endpoint (sadece development ortamında kullanılabilir)
router.get('/debug', (req, res) => {
  // Sadece development ortamında kullanılabilir
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Debug endpoint sadece development ortamında kullanılabilir' });
  }
  
  const connectionState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.status(200).json({
    server: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version
    },
    database: {
      status: connectionState[mongoose.connection.readyState],
      name: mongoose.connection.name,
      host: mongoose.connection.host,
      models: Object.keys(mongoose.models)
    },
    request: {
      headers: req.headers,
      ip: req.ip,
      method: req.method,
      path: req.path
    }
  });
});

// Diğer tüm routes auth middleware ile korunuyor
router.use(auth);

// Get all tasks for a project
router.get('/project/:projectId', taskController.getTasks);

// Create new task for a project
router.post('/project/:projectId', taskController.createTask);

// Get single task
router.get('/:id', taskController.getTask);

// Update task
router.put('/:id', taskController.updateTask);

// Kullanıcı ata endpointi
router.post('/:id/assign', taskController.assignUser);

// Kullanıcıyı görevden çıkarma endpointi
router.post('/:id/unassign', taskController.unassignUser);

// Delete task
router.delete('/:id', taskController.deleteTask);

// Görev kaynağı ekleme
router.post('/:id/resources', taskController.addTaskResource);

// Görev kaynağı silme
router.delete('/:id/resources/:resourceId', taskController.removeTaskResource);

// Hata ayıklama için catch-all middleware ekle
router.use((err, req, res, next) => {
  console.error('Task routes hata:', err);
  console.error('Hatanın stack trace:', err.stack);
  console.error('İstek URL:', req.originalUrl, 'Metot:', req.method);
  
  // İstemciye hata yanıtı gönder
  res.status(500).json({ 
    error: 'Sunucu hatası: ' + err.message, 
    success: false 
  });
});

module.exports = router; 