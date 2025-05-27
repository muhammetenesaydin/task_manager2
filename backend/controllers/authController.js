const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function for logging
const logRequestDetails = (req, message) => {
  console.log('\n========== REQUEST DETAILS ==========');
  console.log(`${message}`);
  console.log(`PATH: ${req.originalUrl}`);
  console.log(`METHOD: ${req.method}`);
  console.log(`BODY: ${JSON.stringify(req.body, null, 2)}`);
  console.log('=====================================\n');
};

// Helper function for logging errors
const logError = (error, message) => {
  console.error('\n========== ERROR DETAILS ==========');
  console.error(`${message}`);
  console.error(`ERROR MESSAGE: ${error.message}`);
  console.error(`STACK TRACE: ${error.stack}`);
  console.error('====================================\n');
};

// Register a new user
exports.register = async (req, res) => {
  logRequestDetails(req, 'REGISTER REQUEST');
  
  try {
    const { name, surname, username, email, password, confirmPassword } = req.body;
    
    console.log('Validating registration data...');
    
    // Şifre kontrolü
    if (password !== confirmPassword) {
      console.log('Password validation failed: passwords do not match');
      return res.status(400).json({ error: 'Şifreler eşleşmiyor' });
    }
    
    // Email kontrolü
    if (!email.endsWith('@gmail.com')) {
      console.log('Email validation failed: not a Gmail address');
      return res.status(400).json({ error: 'Sadece Gmail adresleri kabul edilmektedir' });
    }
    
    // Kullanıcı adı kontrolü
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log(`Username validation failed: username "${username}" already exists`);
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
    }
    
    // Email kontrolü
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log(`Email validation failed: email "${email}" already exists`);
      return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    console.log('Creating new user...');
    // Create new user
    const user = new User({
      name,
      surname,
      username,
      email,
      password
    });
    
    await user.save();
    console.log(`User created successfully with ID: ${user._id}`);
    
    // Generate JWT token
    console.log('Generating JWT token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '159753', {
      expiresIn: '7d'
    });
    
    console.log('Registration successful');
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logError(error, 'REGISTER ERROR');
    res.status(500).json({ 
      error: 'Kayıt işlemi sırasında bir hata oluştu',
      details: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  logRequestDetails(req, 'LOGIN REQUEST');
  
  try {
    const { username, password } = req.body;
    
    console.log(`Attempting login for user: ${username}`);
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      console.log(`Login failed: user "${username}" not found`);
      return res.status(400).json({ error: 'Geçersiz giriş bilgileri' });
    }
    
    // Hesap aktif mi kontrol et
    if (!user.isActive) {
      console.log(`Login failed: account "${username}" is deactivated`);
      return res.status(400).json({ error: 'Bu hesap dondurulmuş. Lütfen hesabınızı tekrar aktifleştirin.' });
    }
    
    // Check password
    console.log('Checking password...');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: incorrect password');
      return res.status(400).json({ error: 'Geçersiz giriş bilgileri' });
    }
    
    // Generate JWT token
    console.log('Generating JWT token...');
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '159753', {
      expiresIn: '7d'
    });
    
    // Oturum bilgilerini kaydet
    // Tarayıcı ve cihaz bilgilerini al
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    
    // 7 gün sonra token'ın süresi dolacak
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Session oluştur
    await user.addSession({
      token,
      ip,
      device: detectDevice(userAgent),
      browser: detectBrowser(userAgent),
      location: 'Bilinmeyen konum', // Gerçek uygulamada IP bazlı konum hizmeti entegre edilebilir
      expiresAt
    });
    
    console.log(`Login successful for user: ${username}`);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logError(error, 'LOGIN ERROR');
    res.status(500).json({ 
      error: 'Giriş işlemi sırasında bir hata oluştu',
      details: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  logRequestDetails(req, 'GET CURRENT USER REQUEST');
  
  try {
    console.log(`Fetching user with ID: ${req.user._id}`);
    const user = await User.findById(req.user._id)
      .populate({
        path: 'projects.project',
        select: 'name roomCode'
      });
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    console.log('User data retrieved successfully');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        projects: user.projects,
        tags: user.tags
      }
    });
  } catch (error) {
    logError(error, 'GET USER ERROR');
    res.status(500).json({ 
      error: 'Kullanıcı bilgileri alınırken bir hata oluştu',
      details: error.message 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  logRequestDetails(req, 'UPDATE PROFILE REQUEST');
  
  try {
    const { name, surname, email } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Email değişikliği varsa ve başka bir kullanıcı tarafından kullanılıyorsa kontrol et
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingEmail) {
        console.log(`Email validation failed: email "${email}" already exists`);
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
      }
      
      // Email kontrolü
      if (!email.endsWith('@gmail.com')) {
        console.log('Email validation failed: not a Gmail address');
        return res.status(400).json({ error: 'Sadece Gmail adresleri kabul edilmektedir' });
      }
    }
    
    // Update user fields
    if (name) user.name = name;
    if (surname) user.surname = surname;
    if (email) user.email = email;
    
    await user.save();
    
    console.log(`Profile updated successfully for user: ${user._id}`);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    logError(error, 'UPDATE PROFILE ERROR');
    res.status(500).json({ 
      error: 'Profil güncellenirken bir hata oluştu',
      details: error.message 
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  logRequestDetails(req, 'CHANGE PASSWORD REQUEST');
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      console.log('Password change failed: incorrect current password');
      return res.status(400).json({ error: 'Mevcut şifre yanlış' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    console.log(`Password changed successfully for user: ${user._id}`);
    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    logError(error, 'CHANGE PASSWORD ERROR');
    res.status(500).json({ 
      error: 'Şifre değiştirilirken bir hata oluştu',
      details: error.message 
    });
  }
};

// Verify token
exports.verifyToken = async (req, res) => {
  // ... existing code ...
};

// Oturum geçmişini getir
exports.getLoginHistory = async (req, res) => {
  logRequestDetails(req, 'GET LOGIN HISTORY REQUEST');
  
  try {
    // Kullanıcı bilgilerini al
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Önce eski oturumları temizle
    await user.cleanupSessions();
    
    // Aktif oturumları döndür, en yeni en üstte olacak şekilde
    const activeSessions = user.sessions
      .filter(session => session.isActive)
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(session => ({
        id: session._id,
        date: session.createdAt,
        ip: session.ip,
        device: session.device,
        browser: session.browser,
        location: session.location,
        isCurrentSession: req.headers.authorization?.split(' ')[1] === session.token
      }));
    
    console.log(`Retrieved ${activeSessions.length} active sessions for user: ${user._id}`);
    res.json(activeSessions);
  } catch (error) {
    logError(error, 'GET LOGIN HISTORY ERROR');
    res.status(500).json({ 
      error: 'Oturum geçmişi alınırken bir hata oluştu',
      details: error.message 
    });
  }
};

// Oturum sonlandır
exports.terminateSession = async (req, res) => {
  logRequestDetails(req, 'TERMINATE SESSION REQUEST');
  
  try {
    const { sessionId } = req.params;
    
    // Kullanıcı bilgilerini al
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Şu anki oturumu sonlandırmayı engelleyelim
    const currentToken = req.headers.authorization?.split(' ')[1];
    const currentSession = user.sessions.find(s => s.token === currentToken);
    
    if (currentSession && currentSession._id.toString() === sessionId) {
      return res.status(400).json({ error: 'Aktif oturumu sonlandıramazsınız' });
    }
    
    // Oturumu sonlandır
    const terminated = await user.terminateSession(sessionId);
    
    if (!terminated) {
      return res.status(404).json({ error: 'Oturum bulunamadı' });
    }
    
    console.log(`Session terminated: ${sessionId} for user: ${user._id}`);
    res.json({ message: 'Oturum başarıyla sonlandırıldı' });
  } catch (error) {
    logError(error, 'TERMINATE SESSION ERROR');
    res.status(500).json({ 
      error: 'Oturum sonlandırılırken bir hata oluştu',
      details: error.message 
    });
  }
};

// Hesabı dondur
exports.deactivateAccount = async (req, res) => {
  logRequestDetails(req, 'DEACTIVATE ACCOUNT REQUEST');
  
  try {
    // Kullanıcı bilgilerini al
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Hesabı dondur
    user.isActive = false;
    
    // Tüm oturumları sonlandır
    user.sessions.forEach(session => {
      session.isActive = false;
    });
    
    await user.save();
    
    console.log(`Account deactivated for user: ${user._id}`);
    res.json({ message: 'Hesabınız başarıyla donduruldu' });
  } catch (error) {
    logError(error, 'DEACTIVATE ACCOUNT ERROR');
    res.status(500).json({ 
      error: 'Hesap dondurulurken bir hata oluştu',
      details: error.message 
    });
  }
};

// Hesabı sil
exports.deleteAccount = async (req, res) => {
  logRequestDetails(req, 'DELETE ACCOUNT REQUEST');
  
  try {
    const { username } = req.body;
    
    // Kullanıcı bilgilerini al
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı adını doğrula
    if (user.username !== username) {
      console.log(`Username validation failed: ${username} vs ${user.username}`);
      return res.status(400).json({ error: 'Kullanıcı adı doğrulaması başarısız' });
    }
    
    // Kullanıcıya ait projeleri ve görevleri silme (veya başka bir kullanıcıya atama) işlemleri burada yapılabilir
    // TODO: İlişkili verileri temizle
    
    // Kullanıcıyı sil
    await User.deleteOne({ _id: user._id });
    
    console.log(`Account deleted for user: ${user._id}`);
    res.json({ message: 'Hesabınız başarıyla silindi' });
  } catch (error) {
    logError(error, 'DELETE ACCOUNT ERROR');
    res.status(500).json({ 
      error: 'Hesap silinirken bir hata oluştu',
      details: error.message 
    });
  }
};

// Hesap yeniden aktifleştirme
exports.reactivateAccount = async (req, res) => {
  logRequestDetails(req, 'REACTIVATE ACCOUNT REQUEST');
  
  try {
    const { username, password } = req.body;
    
    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    
    if (!user) {
      console.log(`User not found: ${username}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Şifreyi kontrol et
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Reactivation failed: incorrect password');
      return res.status(400).json({ error: 'Geçersiz şifre' });
    }
    
    // Hesabı aktifleştir
    user.isActive = true;
    await user.save();
    
    // Token oluştur
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || '159753', {
      expiresIn: '7d'
    });
    
    console.log(`Account reactivated for user: ${user._id}`);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email
      },
      message: 'Hesabınız başarıyla aktifleştirildi'
    });
  } catch (error) {
    logError(error, 'REACTIVATE ACCOUNT ERROR');
    res.status(500).json({ 
      error: 'Hesap aktifleştirilirken bir hata oluştu',
      details: error.message 
    });
  }
};

// Yardımcı Fonksiyonlar
function detectDevice(userAgent) {
  if (!userAgent) return 'Bilinmeyen Cihaz';
  
  if (userAgent.includes('Android')) {
    return 'Android';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
    return 'iOS';
  } else if (userAgent.includes('Windows')) {
    return 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    return 'macOS';
  } else if (userAgent.includes('Linux')) {
    return 'Linux';
  } else {
    return 'Bilinmeyen Cihaz';
  }
}

function detectBrowser(userAgent) {
  if (!userAgent) return 'Bilinmeyen Tarayıcı';
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Chromium') && !userAgent.includes('Edge')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox') && !userAgent.includes('Seamonkey')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome') && !userAgent.includes('Chromium')) {
    return 'Safari';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    return 'Internet Explorer';
  } else {
    return 'Bilinmeyen Tarayıcı';
  }
}

// Profil fotoğrafı yükleme
exports.uploadProfileImage = async (req, res) => {
  logRequestDetails(req, 'UPLOAD PROFILE IMAGE REQUEST');
  
  try {
    // Kullanıcı kontrolü
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log(`User not found with ID: ${req.user._id}`);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Dosya kontrolü
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'Yüklenecek dosya bulunamadı' });
    }
    
    // Dosya bilgilerini al
    const { filename, path, mimetype, size } = req.file;
    
    // Dosya tipini kontrol et
    if (!mimetype.startsWith('image/')) {
      console.log(`Invalid file type: ${mimetype}`);
      return res.status(400).json({ error: 'Sadece resim dosyaları yüklenebilir' });
    }
    
    // Profil resmi bilgilerini güncelle
    user.profileImage = {
      filename,
      path,
      mimetype,
      size,
      url: `/uploads/profiles/${filename}`,
      updatedAt: new Date()
    };
    
    await user.save();
    
    console.log(`Profile image updated for user: ${user._id}`);
    res.json({
      message: 'Profil fotoğrafı başarıyla güncellendi',
      user: {
        id: user._id,
        name: user.name,
        surname: user.surname,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    logError(error, 'UPLOAD PROFILE IMAGE ERROR');
    res.status(500).json({ 
      error: 'Profil fotoğrafı yüklenirken bir hata oluştu',
      details: error.message 
    });
  }
}; 