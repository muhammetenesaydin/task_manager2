const mongoose = require('mongoose');
const crypto = require('crypto');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  projectCode: {
    type: String,
    unique: true,
    default: function() {
      // 8 karakterli benzersiz bir kod üret
      return crypto.randomBytes(4).toString('hex').toUpperCase();
    },
    sparse: true // null değerlerine izin ver
  },
  shareCode: {
    type: String,
    unique: true,
    sparse: true // null değerlerine izin ver
  },
  roomCode: {
    type: String,
    unique: true,
    default: function() {
      // 6 karakterli benzersiz bir kod üret
      return crypto.randomBytes(3).toString('hex').toUpperCase();
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [{
      type: String,
      trim: true
    }],
    role: {
      type: String,
      enum: ['yönetici', 'üye'],
      default: 'üye'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  availableTags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// İndeks manuel olarak tanımla - veritabanındaki ile eşitleme için
projectSchema.index({ projectCode: 1 }, { unique: true, sparse: true });
projectSchema.index({ shareCode: 1 }, { unique: true, sparse: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;