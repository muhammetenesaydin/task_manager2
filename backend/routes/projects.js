const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const auth = require('../middlewares/auth');

// All routes are protected with auth middleware
router.use(auth);

// Get all projects
router.get('/', projectController.getProjects);

// Create new project
router.post('/', projectController.createProject);

// Get single project
router.get('/:id', projectController.getProject);

// Update project
router.put('/:id', projectController.updateProject);

// Delete project
router.delete('/:id', projectController.deleteProject);

// Paylaşım kodu oluşturma
router.post('/:id/generate-share-code', projectController.generateShareCode);

// Projeye katılma
router.post('/join', projectController.joinProject);

// Projeden ayrılma
router.post('/:id/leave', projectController.leaveProject);

// Kullanıcı davet etme
router.post('/:id/invite', projectController.inviteUser);

// Katılımcı çıkarma
router.delete('/:id/participants/:userId', projectController.removeParticipant);

module.exports = router; 