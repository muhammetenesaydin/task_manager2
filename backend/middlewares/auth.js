const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Kullanıcı önbelleği - performans için
const userCache = {
  cache: {},
  maxAge: 5 * 60 * 1000, // 5 dakika
  
  // Kullanıcıyı önbellekten al
  get: function(userId) {
    const cachedData = this.cache[userId];
    if (cachedData && Date.now() - cachedData.timestamp < this.maxAge) {
      return cachedData.user;
    }
    return null;
  },
  
  // Kullanıcıyı önbelleğe ekle
  set: function(userId, user) {
    this.cache[userId] = {
      user: user,
      timestamp: Date.now()
    };
  },
  
  // Belirli aralıklarla eski önbellek verilerini temizle
  cleanup: function() {
    const now = Date.now();
    for (const userId in this.cache) {
      if (now - this.cache[userId].timestamp > this.maxAge) {
        delete this.cache[userId];
      }
    }
  }
};

// Her 10 dakikada bir önbelleği temizle
setInterval(() => {
  userCache.cleanup();
}, 10 * 60 * 1000);

const auth = async (req, res, next) => {
  try {
    // Health endpoint için loglama yapmayalım
    const isHealthEndpoint = req.originalUrl.includes('/health');
    if (!isHealthEndpoint) {
      console.log(`Auth Middleware for: ${req.method} ${req.originalUrl}`);
    }
    
    // Get token from header
    const authHeader = req.header('Authorization');
    
    // Check if Authorization header exists
    if (!authHeader) {
      if (!isHealthEndpoint) {
        console.log(`Authorization header bulunamadı: ${req.method} ${req.originalUrl}`);
      }
      return res.status(401).json({ error: 'Lütfen kimlik doğrulaması yapın' });
    }
    
    if (!isHealthEndpoint) {
      console.log('Auth header mevcut, token çıkarılıyor');
    }
    
    // Extract token with proper format check
    let token = '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else {
      token = authHeader; // Try to use as-is if no Bearer prefix
    }
    
    if (!token || token.trim() === '') {
      if (!isHealthEndpoint) {
        console.log('Geçerli token bulunamadı, auth header formatı yanlış olabilir');
      }
      return res.status(401).json({ error: 'Geçerli token bulunamadı' });
    }
    
    try {
      // Verify token
      if (!isHealthEndpoint) {
        console.log('Token doğrulanıyor...');
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '159753');
      
      if (!isHealthEndpoint) {
        console.log('JWT token başarıyla doğrulandı, user ID:', decoded.id);
      }
      
      // Öncelikle önbellekten kullanıcıyı almayı dene
      let user = userCache.get(decoded.id);
      
      // Önbellekte yoksa veritabanından al
      if (!user) {
        user = await User.findById(decoded.id);
        
        if (user) {
          // Kullanıcıyı önbelleğe ekle
          userCache.set(decoded.id, user);
        }
      }
      
      if (!user) {
        if (!isHealthEndpoint) {
          console.log('Kullanıcı bulunamadı:', decoded.id);
        }
        return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
      }
      
      if (!isHealthEndpoint) {
        console.log('Kullanıcı doğrulandı:', user._id, 'İstek erişimine izin verildi');
      }
      
      // Add user to request
      req.user = user;
      next();
    } catch (tokenError) {
      if (!isHealthEndpoint) {
        console.error('Token doğrulama hatası:', tokenError.message);
      }
      
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token süresi doldu, lütfen tekrar giriş yapın' });
      }
      return res.status(401).json({ error: 'Geçersiz token' });
    }
  } catch (error) {
    console.error('Kimlik doğrulama hatası:', error.message);
    res.status(401).json({ error: 'Lütfen kimlik doğrulaması yapın' });
  }
};

module.exports = auth; 