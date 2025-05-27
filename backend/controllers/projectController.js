const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get all projects for current user
exports.getProjects = async (req, res) => {
  try {
    // Sahip olunan projeler
    const ownedProjects = await Project.find({ owner: req.user._id });
    
    // Katılımcı olunan projeler
    const participatedProjects = await Project.find({
      'participants.userId': req.user._id
    });
    
    // Projeleri birleştir
    const projects = [...ownedProjects, ...participatedProjects];
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single project by ID
exports.getProject = async (req, res) => {
  try {
    // MongoDB ObjectId kontrolü ekle
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Geçersiz proje ID formatı' });
    }
    
    const project = await Project.findOne({ 
      _id: req.params.id
    }).populate('tasks');
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Kullanıcı proje sahibi ya da katılımcı mı kontrol et
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === req.user._id.toString()
    );
    
    if (!isOwner && !isParticipant) {
      return res.status(403).json({ error: 'Bu projeye erişim izniniz yok' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    console.log('Proje oluşturma başlatıldı, istek verileri:', req.body);
    console.log('Kullanıcı:', req.user._id);
    
    const { name, description } = req.body;
    
    // Proje oluştur
    const project = new Project({
      name,
      description,
      owner: req.user._id,
      // Benzersiz bir projectCode oluştur
      projectCode: require('crypto').randomBytes(4).toString('hex').toUpperCase()
    });
    
    console.log('Proje nesnesi oluşturuldu:', project);
    
    // Projeyi kaydet
    await project.save();
    console.log('Proje kaydedildi, ID:', project._id);
    
    // Alternatif olarak, kullanıcıyı güncelle
    try {
      // Kullanıcı güncellemeyi ayrı bir sorguyla yap
      await User.findByIdAndUpdate(
        req.user._id,
        { 
          $push: { 
            projects: {
              project: project._id,
              role: 'yönetici'
            } 
          } 
        }
      );
      console.log('Kullanıcı projeleri güncellendi');
    } catch (userError) {
      console.error('Kullanıcı projesi güncellenirken hata:', userError);
      // Kullanıcı güncellenemese bile proje oluştu, uyarı ile döndür
      return res.status(201).json({
        ...project.toObject(),
        warning: 'Proje oluşturuldu ancak kullanıcı profiline eklenemedi'
      });
    }
    
    // Başarılı cevap döndür
    res.status(201).json(project);
  } catch (error) {
    console.error('Proje oluşturma hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    
    await project.save();
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    console.log('Proje silme işlemi başlatıldı, ID:', req.params.id);
    
    const project = await Project.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    
    if (!project) {
      console.log('Proje bulunamadı:', req.params.id);
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    console.log('Proje bulundu, görevler siliniyor');
    
    // Delete all tasks related to this project
    await Task.deleteMany({ project: project._id });
    console.log('Görevler silindi');
    
    // Delete project
    await Project.deleteOne({ _id: project._id });
    console.log('Proje silindi');
    
    // Update user's projects
    try {
      await User.findByIdAndUpdate(
        req.user._id,
        { 
          $pull: { 
            projects: { 
              project: project._id 
            } 
          } 
        }
      );
      console.log('Kullanıcı projeden çıkarıldı');
    } catch (userError) {
      console.error('Kullanıcı güncellenirken hata:', userError);
      // User update failed, but project is already deleted
      return res.json({ 
        message: 'Proje silindi ancak kullanıcı profilinden çıkarılamadı',
        warning: userError.message
      });
    }
    
    res.json({ message: 'Proje başarıyla silindi' });
  } catch (error) {
    console.error('Proje silme hatası:', error);
    res.status(500).json({ error: error.message });
  }
};

// Paylaşım kodu oluşturma
exports.generateShareCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    // MongoDB ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz proje ID formatı' });
    }
    
    // Projeyi bul
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Sadece proje sahibi paylaşım kodu oluşturabilir
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu projeye paylaşım kodu oluşturma yetkiniz yok' });
    }
    
    // Rastgele bir paylaşım kodu oluştur (6 karakter)
    const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Projeyi güncelle
    project.shareCode = shareCode;
    await project.save();
    
    return res.status(200).json({ shareCode });
  } catch (error) {
    console.error('Paylaşım kodu oluşturulurken hata:', error);
    return res.status(500).json({ error: 'Paylaşım kodu oluşturulamadı' });
  }
};

// Paylaşım kodu ile projeye katılma
exports.joinProject = async (req, res) => {
  try {
    const { shareCode } = req.body;
    const userId = req.user._id;
    
    if (!shareCode) {
      return res.status(400).json({ error: 'Paylaşım kodu gereklidir' });
    }
    
    // Projeyi paylaşım kodu ile bul
    const project = await Project.findOne({ shareCode });
    
    if (!project) {
      return res.status(404).json({ error: 'Geçersiz paylaşım kodu' });
    }
    
    // Proje sahibi zaten katılımcı olamaz
    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({ error: 'Kendi projenize katılımcı olarak eklenemezsiniz' });
    }
    
    // Kullanıcı zaten katılımcı mı kontrol et
    const isParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === userId.toString()
    );
    
    if (isParticipant) {
      return res.status(400).json({ error: 'Bu projeye zaten katıldınız' });
    }
    
    // Kullanıcı bilgilerini al
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Katılımcı ekle
    const newParticipant = {
      userId,
      userName: user.name || user.username,
      email: user.email,
      role: 'member',
      joinedAt: new Date()
    };
    
    if (!project.participants) {
      project.participants = [];
    }
    
    project.participants.push(newParticipant);
    await project.save();
    
    return res.status(200).json(project);
  } catch (error) {
    console.error('Projeye katılırken hata:', error);
    return res.status(500).json({ error: 'Projeye katılınamadı' });
  }
};

// Projeden ayrılma
exports.leaveProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    // MongoDB ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz proje ID formatı' });
    }
    
    // Projeyi bul
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Proje sahibi projeden ayrılamaz
    if (project.owner.toString() === userId.toString()) {
      return res.status(400).json({ error: 'Proje sahibi projeden ayrılamaz' });
    }
    
    // Kullanıcıyı katılımcılardan çıkar
    if (project.participants) {
      project.participants = project.participants.filter(
        p => p.userId.toString() !== userId.toString()
      );
      await project.save();
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Projeden ayrılırken hata:', error);
    return res.status(500).json({ error: 'Projeden ayrılınamadı' });
  }
};

// Kullanıcı davet etme
exports.inviteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;
    
    // MongoDB ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz proje ID formatı' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'E-posta adresi gereklidir' });
    }
    
    // Projeyi bul
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Sadece proje sahibi veya admin katılımcılar davet edebilir
    const isOwner = project.owner.toString() === req.user._id.toString();
    const isAdminParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === req.user._id.toString() && p.role === 'admin'
    );
    
    if (!isOwner && !isAdminParticipant) {
      return res.status(403).json({ error: 'Bu projeye kullanıcı davet etme yetkiniz yok' });
    }
    
    // Kullanıcıyı e-posta ile bul
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ error: 'Bu e-posta adresine sahip kullanıcı bulunamadı' });
    }
    
    // Kullanıcı proje sahibi mi kontrol et
    if (project.owner.toString() === user._id.toString()) {
      return res.status(400).json({ error: 'Proje sahibi zaten projede yer alıyor' });
    }
    
    // Kullanıcı zaten katılımcı mı kontrol et
    const isParticipant = project.participants && project.participants.some(
      p => p.userId.toString() === user._id.toString()
    );
    
    if (isParticipant) {
      return res.status(400).json({ error: 'Bu kullanıcı zaten projede yer alıyor' });
    }
    
    // Katılımcı ekle
    const newParticipant = {
      userId: user._id,
      userName: user.name || user.username,
      email: user.email,
      role,
      joinedAt: new Date()
    };
    
    if (!project.participants) {
      project.participants = [];
    }
    
    project.participants.push(newParticipant);
    await project.save();
    
    return res.status(200).json({ success: true, message: 'Kullanıcı başarıyla davet edildi' });
  } catch (error) {
    console.error('Kullanıcı davet edilirken hata:', error);
    return res.status(500).json({ error: 'Kullanıcı davet edilemedi' });
  }
};

// Katılımcıyı çıkarma
exports.removeParticipant = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    // MongoDB ObjectId kontrolü
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Geçersiz ID formatı' });
    }
    
    // Projeyi bul
    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({ error: 'Proje bulunamadı' });
    }
    
    // Sadece proje sahibi katılımcıları çıkarabilir
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Bu projeden katılımcı çıkarma yetkiniz yok' });
    }
    
    // Proje sahibi çıkarılamaz
    if (project.owner.toString() === userId) {
      return res.status(400).json({ error: 'Proje sahibi projeden çıkarılamaz' });
    }
    
    // Kullanıcıyı katılımcılardan çıkar
    if (project.participants) {
      project.participants = project.participants.filter(
        p => p.userId.toString() !== userId
      );
      await project.save();
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Katılımcı çıkarılırken hata:', error);
    return res.status(500).json({ error: 'Katılımcı çıkarılamadı' });
  }
}; 