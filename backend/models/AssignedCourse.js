const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Atanmış kurs modeli
const AssignedCourseSchema = new Schema({
  courseId: { 
    type: String, 
    required: true,
    ref: 'Course'  // Course modeline referans
  },
  userId: { 
    type: Schema.Types.ObjectId, 
    required: true,
    ref: 'User'  // User modeline referans
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  assignedBy: { 
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'overdue'],
    default: 'not-started'
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  progress: { type: Number, default: 0 },
  totalModules: { type: Number, default: 0 },
  completedModules: { type: Number, default: 0 }
}, { timestamps: true });

// Bileşik indeks - bir kurs bir kullanıcıya sadece bir kez atanabilir
AssignedCourseSchema.index({ courseId: 1, userId: 1 }, { unique: true });

// Bir kullanıcının tüm atanan kurslarını bulmak için statik metod
AssignedCourseSchema.statics.findByUserId = function(userId) {
  return this.find({ userId }).populate('courseId');
};

// Son tarihi geçmiş kursları otomatik olarak 'overdue' olarak işaretle
AssignedCourseSchema.pre('find', function() {
  this.updateMany(
    { 
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    },
    { status: 'overdue' }
  );
});

module.exports = mongoose.model('AssignedCourse', AssignedCourseSchema); 