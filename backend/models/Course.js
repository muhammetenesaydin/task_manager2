const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Kurs modül içindeki quiz sorusu şeması
const QuestionSchema = new Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  options: [String],
  correctOption: Number,
  type: { 
    type: String, 
    enum: ['multiple_choice', 'text', 'code'],
    default: 'multiple_choice'
  }
});

// Kurs modül içindeki quiz şeması
const QuizSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  questions: [QuestionSchema]
});

// Kurs içindeki kaynak şeması
const ResourceSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['article', 'video', 'document', 'link'],
    default: 'link'
  }
});

// Kurs modülü şeması
const ModuleSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: String, required: true },
  videoUrl: String,
  resources: [ResourceSchema],
  quizzes: [QuizSchema],
  completionStatus: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  }
});

// Ana kurs şeması
const CourseSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['ai', 'web', 'mobile', 'embedded', 'data-science', 'cyber-security', 'robotics', 'programming']
  },
  instructor: { type: String, required: true },
  instructorBio: String,
  instructorAvatar: String,
  level: { 
    type: String, 
    enum: ['Başlangıç', 'Orta Seviye', 'İleri Seviye'],
    default: 'Başlangıç'
  },
  duration: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  enrolled: { type: Number, default: 0 },
  thumbnailUrl: { type: String, required: true },
  coverImage: String,
  objectives: [String],
  requirements: [String],
  modules: [ModuleSchema],
  completionPercentage: { type: Number, default: 0 },
  lastAccessedModuleId: String,
  tags: [String],
  price: Number,
  discountPrice: Number,
  certificate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  totalModules: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 }
}, { timestamps: true });

// Kaydetmeden önce toplam modül sayısını otomatik hesapla
CourseSchema.pre('save', function(next) {
  if (this.modules) {
    this.totalModules = this.modules.length;
  }
  next();
});

module.exports = mongoose.model('Course', CourseSchema); 