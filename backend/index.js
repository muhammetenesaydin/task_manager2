const dotenv = require('dotenv');

// Environment variables - dosyanın başında yüklenmelidir
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan'); // HTTP istek loglaması için

// Routes
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courseRoutes'); // Yeni kurs rotalarını ekliyoruz

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB URI - doğrudan tanımlıyoruz
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';
console.log("MongoDB URI:", MONGODB_URI);

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads', {
  maxAge: '1d', // 1 gün önbellekleme
  etag: true,
  lastModified: true
}));

// Morgan - HTTP istek logları için 
app.use(morgan('dev'));

// İstek gövdesi loglaması
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('İstek Gövdesi:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch((err) => {
    console.error('MongoDB bağlantı hatası:');
    console.error(err);
  });

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes); // Yeni kurs rotalarını kaydediyoruz

// Root route
app.get('/', (req, res) => {
  res.send('Task Manager API çalışıyor');
});

// Error handler - tüm hatalar bu middleware üzerinden geçecek
app.use((err, req, res, next) => {
  console.error('HATA OLUŞTU:');
  console.error('URL:', req.originalUrl);
  console.error('Metod:', req.method);
  console.error('Hata mesajı:', err.message);
  console.error('Hata yığını:', err.stack);
  
  res.status(err.status || 500).json({
    error: err.message || 'Sunucu hatası oluştu'
  });
});

// 404 handler - hiçbir rota eşleşmezse
app.use((req, res) => {
  console.log('404 Hatası - Sayfa bulunamadı:', req.originalUrl);
  res.status(404).json({
    error: 'Sayfa bulunamadı'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log(`API URL: http://localhost:${PORT}`);
}); 