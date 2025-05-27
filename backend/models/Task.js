const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['yapiliyor', 'beklemede', 'tamamlandi'],
    default: 'yapiliyor'
  },
  priority: {
    type: String,
    enum: ['düşük', 'normal', 'yüksek'],
    default: 'normal'
  },
  tags: [{
    type: String,
    trim: true
  }],
  project: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deadline: {
    type: Date
  },
  assignedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  assignedByTag: [{
    tag: {
      type: String,
      trim: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: [{
    type: {
      type: String,
      enum: ['link', 'file'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: {
      type: String,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Dosya alanları - file tipi için
    filename: {
      type: String
    },
    originalName: {
      type: String
    },
    path: {
      type: String
    },
    mimetype: {
      type: String

    },
    size: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

// Daha fazla log için pre-save middleware ekleyelim
taskSchema.pre('save', function(next) {
  console.log('Task pre-save hook çalıştı');
  console.log('Kaydedilecek görev:', JSON.stringify(this.toObject(), null, 2));
  next();
});

// Hata ayıklama için
taskSchema.post('save', function(doc, next) {
  console.log('Task post-save hook çalıştı, görev kaydedildi:', doc._id);
  next();
});

// Hata durumunda
taskSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('Task post-save error hook çalıştı, hata:', error);
    next(error);
  } else {
    next();
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 