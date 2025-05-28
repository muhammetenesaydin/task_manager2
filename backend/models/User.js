const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Oturum geçmişi şeması
const sessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  device: {
    type: String,
    default: 'Bilinmeyen cihaz'
  },
  browser: {
    type: String,
    default: 'Bilinmeyen tarayıcı'
  },
  location: {
    type: String,
    default: 'Bilinmeyen konum'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+@gmail\.com$/, 'Lütfen geçerli bir Gmail adresi giriniz']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    url: String,
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  adminAccessLevel: {
    type: Number,
    default: 0  // 0: normal kullanıcı, 1: admin, 2: superadmin
  },
  lastLoginAttempt: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  projects: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    role: {
      type: String,
      enum: ['yönetici', 'üye'],
      default: 'üye'
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  sessions: [sessionSchema]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Generate a display name from the user's name and surname
userSchema.virtual('displayName').get(function() {
  return `${this.name} ${this.surname}`;
});

// Clean up inactive and expired sessions
userSchema.methods.cleanupSessions = async function() {
  const now = new Date();
  this.sessions = this.sessions.filter(session => 
    session.isActive && session.expiresAt > now
  );
  await this.save();
};

// Add a new session
userSchema.methods.addSession = async function(sessionData) {
  // Önce eski oturumları temizle
  await this.cleanupSessions();
  
  // Yeni oturumu ekle
  this.sessions.push(sessionData);
  await this.save();
  return this.sessions[this.sessions.length - 1];
};

// Terminate a specific session
userSchema.methods.terminateSession = async function(sessionId) {
  const sessionIndex = this.sessions.findIndex(s => s._id.toString() === sessionId);
  if (sessionIndex !== -1) {
    this.sessions[sessionIndex].isActive = false;
    await this.save();
    return true;
  }
  return false;
};

// Başarısız giriş denemelerini sıfırla
userSchema.methods.resetFailedAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.lastLoginAttempt = null;
  await this.save();
};

// Hesabı kilitle
userSchema.methods.lockAccount = async function() {
  this.isActive = false;
  await this.save();
};

// Hesabı aç
userSchema.methods.unlockAccount = async function() {
  this.isActive = true;
  this.failedLoginAttempts = 0;
  this.lastLoginAttempt = null;
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 