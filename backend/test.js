// MongoDB bağlantı testi
const mongoose = require('mongoose');

// Doğrudan MongoDB URI'yi burada tanımlıyoruz
const MONGODB_URI = 'mongodb+srv://enes123:enes123@taskmanager.rndak4n.mongodb.net/?retryWrites=true&w=majority&appName=TaskManager';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connection successful!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }); 