const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Get all tasks for a project
exports.getTasks = async (req, res) => {
  try {
    console.log('-----------------------------------------------------------');
    console.log('GÖREV LİSTESİ İSTEĞİ ALINDI');
    console.log('Proje ID:', req.params.projectId);
    console.log('Kullanıcı ID:', req.user._id);
    
    // ProjectId kontrol ediliyor
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId)) {
      console.error('Geçersiz proje ID formatı:', req.params.projectId);
      return res.status(400).json({ error: 'Geçersiz proje ID formatı' });
    }
    
    // Proje kontrolü - eskiden sadece owner kontrolü vardı, şimdi esnekleştirildi
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      console.error('Proje bulunamadı:', req.params.projectId);
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    console.log('Proje bulundu:', project._id);
    
    // Görevleri getir
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo.user', 'name email');
    console.log('Bulunan görev sayısı:', tasks.length);
    
    res.json(tasks);
  } catch (error) {
    console.error('Görev listesi alınırken hata oluştu:', error);
    res.status(500).json({ error: error.message });
  }
  console.log('-----------------------------------------------------------');
};

// Get single task by ID
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Check if task belongs to a project owned by current user
    const project = await Project.findOne({
      _id: task.project,
      owner: req.user._id
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create task
exports.createTask = async (req, res) => {
  try {
    console.log(`Yeni task oluşturma isteği, Proje ID: ${req.params.projectId}`);
    console.log('Task verileri:', req.body);
    
    // İstek önbelleğini engelle - önbellek sorunlarını önlemek için
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Project validation
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
      console.log(`Proje bulunamadı, ID: ${req.params.projectId}`);
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Proje sahibi kontrolü
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    
    // Proje üyesi kontrolü - collaborators yerine members kullan
    const isProjectMember = project.members && project.members.some(
      member => member.user && member.user.toString() === req.user._id.toString()
    );
    
    console.log(`Yetki kontrolü: isProjectOwner=${isProjectOwner}, isProjectMember=${isProjectMember}`);
    
    if (!isProjectOwner && !isProjectMember) {
      console.log(`Yetki hatası, kullanıcı: ${req.user._id}, project owner: ${project.owner}`);
      return res.status(403).json({ error: 'Bu projeye görev ekleme yetkiniz yok' });
    }
    
    // Default priority and status if not provided
    if (!req.body.priority) req.body.priority = "normal";
    if (!req.body.status) req.body.status = "yapilacak";
    
    // Create task
    console.log('Yeni Task oluşturuluyor...');
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      deadline: req.body.deadline,
      tags: req.body.tags,
      owner: req.user._id,
      project: project._id
    });
    
    // Save task
    const savedTask = await task.save();
    console.log(`Yeni Task kaydedildi, ID: ${savedTask._id}`);
    
    // Araya kısa bir bekleme ekleyelim (MongoDB tutarlılığı için)
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Add task to project (project.save() yerine updateOne kullanarak)
    const updateResult = await Project.updateOne(
      { _id: project._id },
      { $push: { tasks: savedTask._id } }
    );
    
    console.log(`Task, projeye eklendi: ${project._id}, güncelleme sonucu:`, updateResult);
    
    // Eğer güncelleme başarısız olduysa task'ı da silelim (tutarlılık için)
    if (!updateResult.acknowledged || updateResult.modifiedCount !== 1) {
      console.error(`Proje güncellenemedi, task siliniyor: ${savedTask._id}`);
      await Task.deleteOne({ _id: savedTask._id });
      return res.status(500).json({ error: 'Görev projeye eklenemedi, lütfen tekrar deneyin' });
    }
    
    // Return success
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Task oluşturma hatası:', error.message);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('Validasyon hataları:', messages);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo, priority, tags, deadline } = req.body;
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Hem proje sahibi hem de görev sahibi güncelleme yapabilir
    const project = await Project.findOne({
      _id: task.project
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Yetki kontrolü
    const isTaskOwner = task.owner && task.owner.toString() === req.user._id.toString();
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    
    // Proje üyesi kontrolü
    const isProjectMember = project.members && project.members.some(
      member => member.user && member.user.toString() === req.user._id.toString()
    );
    
    // Düzenleme yetkisi kontrolü
    if (!isTaskOwner && !isProjectOwner && !isProjectMember) {
      return res.status(403).json({ error: 'Bu görevi düzenleme yetkiniz yok' });
    }
    
    // Kullanıcı görev sahibi değilse sadece status güncelleyebilir
    if (!isTaskOwner && !isProjectOwner && Object.keys(req.body).some(key => key !== 'status')) {
      return res.status(403).json({ error: 'Sadece görev durumunu değiştirebilirsiniz' });
    }
    
    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (tags) task.tags = tags;
    if (deadline !== undefined) task.deadline = deadline;
    if (assignedTo) task.assignedTo = assignedTo;
    
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    console.log(`⚠️ Task silme işlemi başlatıldı, Task ID: ${req.params.id}, Kullanıcı ID: ${req.user._id}`);
    
    // Geçerli taskId kontrolü
    const taskId = req.params.id;
    if (!taskId || !taskId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log(`❌ Geçersiz task ID format: ${taskId}`);
      return res.status(400).json({
        error: 'Geçersiz görev ID formatı',
        success: false
      });
    }
    
    // İstek önbelleğini engelle - önbellek sorunlarını önlemek için
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Task var mı kontrol et
    const task = await Task.findById(taskId);
    
    if (!task) {
      console.log(`❌ Task bulunamadı, ID: ${taskId}`);
      return res.status(404).json({
        error: 'Görev bulunamadı',
        success: false
      });
    }
    
    console.log(`✅ Task bulundu, proje ID: ${task.project}`);
    
    // Sadece görev sahibi veya proje sahibi silebilir
    const project = await Project.findOne({
      _id: task.project
    });
    
    if (!project) {
      console.log(`❌ Proje bulunamadı, ID: ${task.project}`);
      return res.status(404).json({
        error: 'Proje bulunamadı',
        success: false
      });
    }
    
    // Yetkiler kontrol ediliyor
    const isTaskOwner = task.owner && task.owner.toString() === req.user._id.toString();
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    
    // Proje üyesi kontrolü
    const isProjectMember = project.members && project.members.some(
      member => member.user && member.user.toString() === req.user._id.toString()
    );
    
    // Silme yetkisi kontrolü - sadece görev sahibi, proje sahibi veya yönetici rolündeki üyeler silebilir
    const isManagerMember = project.members && project.members.some(
      member => member.user && 
               member.user.toString() === req.user._id.toString() && 
               member.role === 'yönetici'
    );
    
    if (!isTaskOwner && !isProjectOwner && !isManagerMember) {
      console.log(`❌ Yetki hatası, kullanıcı: ${req.user._id}, task owner: ${task.owner}, project owner: ${project.owner}`);
      return res.status(403).json({
        error: 'Bu görevi silme yetkiniz yok',
        success: false
      });
    }
    
    console.log(`✅ Silme yetkisi var, task siliniyor: ${task._id}`);
    
    try {
      // İşlemler arasında çok kısa bekleme ekleyelim - veritabanı tutarlılığı için
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Delete task (daha güvenli bir yöntem olarak deleteOne kullanıyoruz)
      const deleteResult = await Task.deleteOne({ _id: task._id });
      
      if (deleteResult.deletedCount !== 1) {
        console.log(`❌ Task silme başarısız oldu: ${JSON.stringify(deleteResult)}`);
        return res.status(500).json({
          error: 'Görev silinirken bir hata oluştu',
          success: false
        });
      }
      
      console.log(`✅ Task silindi, şimdi projeden kaldırılıyor: ${project._id}, task ID: ${task._id}`);
      
      // Kısa bir bekleme daha ekleyelim
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Remove task from project's tasks (daha güvenli bir yöntem, update kullanıyoruz)
      const updateResult = await Project.updateOne(
        { _id: project._id },
        { $pull: { tasks: task._id } }
      );
      
      console.log('Proje güncelleme sonucu:', JSON.stringify(updateResult));
      
      console.log('🎉 Task silme işlemi tamamlandı');
      
      return res.status(200).json({
        message: 'Görev başarıyla silindi',
        success: true
      });
    } catch (innerError) {
      console.error('❌ Task silme DB hatası:', innerError);
      return res.status(500).json({
        error: 'Veritabanı işlemi başarısız: ' + innerError.message,
        success: false
      });
    }
  } catch (error) {
    console.error('❌ Task silme genel hatası:', error);
    return res.status(500).json({
      error: error.message,
      success: false
    });
  }
};

// Kaynak ekleme (link/dosya)
exports.addTaskResource = async (req, res) => {
  try {
    // TaskId kontrolü
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz görev ID formatı' });
    }
    
    // Görev kontrolü
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Proje kontrolü
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Erişim kontrolü (görev sahibi, proje sahibi veya katılımcı)
    const isTaskOwner = task.owner && task.owner.toString() === req.user._id.toString();
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    const isParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (!isTaskOwner && !isProjectOwner && !isParticipant) {
      return res.status(403).json({ error: 'Bu göreve kaynak ekleme yetkiniz yok' });
    }
    
    // Kaynak verilerini doğrula
    const { type, url, description } = req.body;
    
    if (!type || !url) {
      return res.status(400).json({ error: 'Tip ve URL alanları zorunludur' });
    }
    
    if (type !== 'link' && type !== 'file') {
      return res.status(400).json({ error: 'Geçersiz kaynak tipi. "link" veya "file" olmalıdır' });
    }
    
    // Yeni kaynak oluştur
    const newResource = {
      type,
      url,
      description,
      addedBy: req.user._id,
      addedAt: new Date()
    };
    
    // Resources dizisini oluştur (eğer yoksa)
    if (!task.resources) {
      task.resources = [];
    }
    
    // Kaynağı ekle
    task.resources.push(newResource);
    await task.save();
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Kaynak eklenirken hata:', error);
    res.status(500).json({ error: error.message });
  }
};

// Kaynak silme
exports.removeTaskResource = async (req, res) => {
  try {
    // TaskId ve ResourceId kontrolü
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz görev ID formatı' });
    }
    
    const taskId = req.params.id;
    const resourceId = req.params.resourceId;
    
    // Görev kontrolü
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Proje kontrolü
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Erişim kontrolü (görev sahibi, proje sahibi veya katılımcı)
    const isTaskOwner = task.owner && task.owner.toString() === req.user._id.toString();
    const isProjectOwner = project.owner.toString() === req.user._id.toString();
    const isParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (!isTaskOwner && !isProjectOwner && !isParticipant) {
      return res.status(403).json({ error: 'Bu görevden kaynak silme yetkiniz yok' });
    }
    
    // Kaynağı sil
    if (!task.resources) {
      return res.status(404).json({ error: 'Görevde kaynak bulunamadı' });
    }
    
    // Kaynağı bul
    const resourceIndex = task.resources.findIndex(
      resource => resource._id.toString() === resourceId
    );
    
    if (resourceIndex === -1) {
      return res.status(404).json({ error: 'Kaynak bulunamadı' });
    }
    
    // Kaynağı çıkar
    task.resources.splice(resourceIndex, 1);
    await task.save();
    
    res.json(task);
  } catch (error) {
    console.error('Kaynak silinirken hata:', error);
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcı ata
exports.assignUser = async (req, res) => {
  try {
    console.log('Kullanıcı atama işlemi başlatıldı:', req.params.id, req.body.userId);
    
    const { id } = req.params;
    const { userId } = req.body;
    
    // ID formatlarını kontrol et
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Geçersiz ID formatı:', id, userId);
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    // Kullanıcının varlığını kontrol et
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      console.error('Kullanıcı bulunamadı:', userId);
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    console.log('Kullanıcı bulundu:', user._id, user.name, user.email);
    
    // Göreve ata
    const task = await Task.findByIdAndUpdate(
      id,
      { 
        $push: { 
          assignedTo: { 
            user: userId, 
            assignedAt: new Date() 
          } 
        } 
      },
      { new: true }
    );
    
    // Görev var mı kontrol et
    if (!task) {
      console.error('Görev bulunamadı:', id);
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Kullanıcı bilgilerini doldur
    const populatedTask = await Task.findById(id).populate('assignedTo.user', 'name email username');
    
    console.log('Atama sonrası görev durumu:', populatedTask._id, 
      'Atanan kullanıcılar:', populatedTask.assignedTo.map(a => ({ 
        id: a.user._id, 
        name: a.user.name, 
        email: a.user.email 
      }))
    );
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Kullanıcı atama hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Kullanıcıyı görevden çıkar
exports.unassignUser = async (req, res) => {
  try {
    console.log('Kullanıcı görevden çıkarma işlemi başlatıldı:', req.params.id, req.body.userId);
    
    const { id } = req.params;
    const { userId } = req.body;
    
    // ID formatlarını kontrol et
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Geçersiz ID formatı:', id, userId);
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    // Görevi güncelle
    const task = await Task.findByIdAndUpdate(
      id,
      { $pull: { assignedTo: { user: userId } } },
      { new: true }
    );
    
    // Görev var mı kontrol et
    if (!task) {
      console.error('Görev bulunamadı:', id);
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }
    
    // Kullanıcı bilgilerini doldur
    const populatedTask = await Task.findById(id).populate('assignedTo.user', 'name email username');
    
    console.log('Görevden çıkarma sonrası görev durumu:', populatedTask._id, 
      'Kalan kullanıcılar:', populatedTask.assignedTo.map(a => ({ 
        id: a.user._id, 
        name: a.user.name, 
        email: a.user.email 
      }))
    );
    
    res.json(populatedTask);
  } catch (error) {
    console.error('Kullanıcı görevden çıkarma hatası:', error);
    res.status(500).json({ error: error.message });
  }
}; 