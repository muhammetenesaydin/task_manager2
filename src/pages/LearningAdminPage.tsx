import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardActions,
  SelectChangeEvent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useAuth } from '../context/AuthContext';
import learningService, { LearningPath, LearningStep, StepContent } from '../services/learningService';

// Ana yönetici sayfası bileşeni
const LearningAdminPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Dialog durumları
  const [pathDialogOpen, setPathDialogOpen] = useState<boolean>(false);
  const [stepDialogOpen, setStepDialogOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  
  // Düzenleme state'leri
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [selectedStep, setSelectedStep] = useState<LearningStep | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);
  
  // Form verileri
  const [formPathData, setFormPathData] = useState<{
    title: string;
    description: string;
    category: string;
  }>({
    title: '',
    description: '',
    category: ''
  });
  
  const [formStepData, setFormStepData] = useState<{
    name: string;
    content: {
      title: string;
      description: string;
      videoUrl: string;
    }
  }>({
    name: '',
    content: {
      title: '',
      description: '',
      videoUrl: ''
    }
  });
  
  // İlk yüklemede veriler getir
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Tüm yolları ve kategorileri getir
        const [pathsData, categoriesData] = await Promise.all([
          learningService.getLearningPaths(),
          learningService.getCategories()
        ]);
        
        setPaths(pathsData);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Veri yüklenirken hata oluştu:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Tab değişikliği işleyicisi
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };
  
  // Öğrenme yolu düzenleme modunu aç
  const handleEditPath = (path: LearningPath) => {
    setSelectedPath(path);
    setFormPathData({
      title: path.title,
      description: path.description,
      category: '' // Kategorinin ID'si buraya gelmeli
    });
    setEditMode(true);
    setPathDialogOpen(true);
  };
  
  // Yeni öğrenme yolu oluşturma modunu aç
  const handleNewPath = () => {
    setSelectedPath(null);
    setFormPathData({
      title: '',
      description: '',
      category: ''
    });
    setEditMode(false);
    setPathDialogOpen(true);
  };
  
  // Öğrenme yolu oluştur/güncelle
  const handleSavePath = async () => {
    try {
      setLoading(true);
      
      if (editMode && selectedPath) {
        // Mevcut yolu güncelle
        await learningService.updateLearningPath(selectedPath.id, {
          title: formPathData.title,
          description: formPathData.description
        });
        
        setSuccessMessage('Öğrenme yolu başarıyla güncellendi');
      } else {
        // Yeni yol oluştur
        await learningService.createLearningPath(formPathData.category, {
          title: formPathData.title,
          description: formPathData.description,
          steps: []
        });
        
        setSuccessMessage('Yeni öğrenme yolu başarıyla oluşturuldu');
      }
      
      // Güncel verileri getir
      const updatedPaths = await learningService.getLearningPaths();
      setPaths(updatedPaths);
      
      // Dialog'u kapat
      setPathDialogOpen(false);
    } catch (err) {
      console.error('Öğrenme yolu kaydedilirken hata oluştu:', err);
      setError('Öğrenme yolu kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Öğrenme yolu silme
  const handleDeletePath = async (pathId: string) => {
    try {
      setLoading(true);
      
      await learningService.deleteLearningPath(pathId);
      
      // Güncel verileri getir
      const updatedPaths = await learningService.getLearningPaths();
      setPaths(updatedPaths);
      
      setSuccessMessage('Öğrenme yolu başarıyla silindi');
    } catch (err) {
      console.error('Öğrenme yolu silinirken hata oluştu:', err);
      setError('Öğrenme yolu silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Adım düzenleme modunu aç
  const handleEditStep = (step: LearningStep) => {
    setSelectedStep(step);
    setFormStepData({
      name: step.name,
      content: {
        title: step.content.title,
        description: step.content.description,
        videoUrl: step.content.videoUrl || ''
      }
    });
    setEditMode(true);
    setStepDialogOpen(true);
  };
  
  // Yeni adım oluşturma modunu aç
  const handleNewStep = (path: LearningPath) => {
    setSelectedPath(path);
    setSelectedStep(null);
    setFormStepData({
      name: '',
      content: {
        title: '',
        description: '',
        videoUrl: ''
      }
    });
    setEditMode(false);
    setStepDialogOpen(true);
  };
  
  // Adım oluştur/güncelle
  const handleSaveStep = async () => {
    try {
      setLoading(true);
      
      if (editMode && selectedStep) {
        // Mevcut adımı güncelle
        await learningService.updateLearningStep(selectedStep.id, {
          name: formStepData.name,
          content: {
            ...selectedStep.content,
            title: formStepData.content.title,
            description: formStepData.content.description,
            videoUrl: formStepData.content.videoUrl
          }
        });
        
        setSuccessMessage('Adım başarıyla güncellendi');
      } else if (selectedPath) {
        // Yeni adım oluştur
        await learningService.createLearningStep(selectedPath.id, {
          name: formStepData.name,
          content: {
            title: formStepData.content.title,
            description: formStepData.content.description,
            videoUrl: formStepData.content.videoUrl,
            resources: []
          }
        });
        
        setSuccessMessage('Yeni adım başarıyla oluşturuldu');
      }
      
      // Güncel verileri getir
      const updatedPaths = await learningService.getLearningPaths();
      setPaths(updatedPaths);
      
      // Dialog'u kapat
      setStepDialogOpen(false);
    } catch (err) {
      console.error('Adım kaydedilirken hata oluştu:', err);
      setError('Adım kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Adım silme
  const handleDeleteStep = async (stepId: string) => {
    try {
      setLoading(true);
      
      await learningService.deleteStep(stepId);
      
      // Güncel verileri getir
      const updatedPaths = await learningService.getLearningPaths();
      setPaths(updatedPaths);
      
      setSuccessMessage('Adım başarıyla silindi');
    } catch (err) {
      console.error('Adım silinirken hata oluştu:', err);
      setError('Adım silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  // Form Input değişikliklerini işle
  const handlePathInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormPathData({
      ...formPathData,
      [name]: value
    });
  };
  
  const handleStepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('content.')) {
      const contentField = name.split('.')[1];
      setFormStepData({
        ...formStepData,
        content: {
          ...formStepData.content,
          [contentField]: value
        }
      });
    } else {
      setFormStepData({
        ...formStepData,
        [name]: value
      });
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setSuccessMessage(null);
    setError(null);
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Eğitim Platformu Yönetimi
        </Typography>
        
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/learning')}
        >
          Eğitim Platformuna Dön
        </Button>
      </Box>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Öğrenme Yolları" />
          <Tab label="Kategoriler" />
          <Tab label="İstatistikler" />
        </Tabs>
      </Paper>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
      
      {successMessage && (
        <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>
      )}
      
      {activeTab === 0 && (
        <Box sx={{ mt: 2 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleNewPath}
            >
              Yeni Öğrenme Yolu Ekle
            </Button>
          </Box>
          
          {paths.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                Henüz öğrenme yolu bulunmuyor
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                "Yeni Öğrenme Yolu Ekle" butonuna tıklayarak başlayın
              </Typography>
            </Paper>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {paths.map((path) => (
                <Box key={path.id || path.title} sx={{ width: { xs: '100%', md: '48%' } }}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" component="div" fontWeight={600}>
                          {path.title}
                        </Typography>
                        <Box>
                          <IconButton onClick={() => handleEditPath(path)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeletePath(path.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        {path.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" fontWeight={600}>
                        Adımlar ({path.steps.length})
                      </Typography>
                      
                      {path.steps.length > 0 ? (
                        <List dense>
                          {path.steps.map((step) => (
                            <ListItem
                              key={step.id}
                              secondaryAction={
                                <Box>
                                  <IconButton edge="end" onClick={() => handleEditStep(step)}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton edge="end" onClick={() => handleDeleteStep(step.id)}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              }
                            >
                              <ListItemText
                                primary={step.name}
                                secondary={step.content.title}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                          Bu öğrenme yolunda henüz adım bulunmuyor
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<AddIcon />}
                        onClick={() => handleNewStep(path)}
                      >
                        Yeni Adım Ekle
                      </Button>
                    </CardActions>
                  </Card>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
      
      {/* Öğrenme Yolu Düzenleme/Oluşturma Dialog */}
      <Dialog 
        open={pathDialogOpen} 
        onClose={() => setPathDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editMode ? 'Öğrenme Yolu Düzenle' : 'Yeni Öğrenme Yolu Oluştur'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                name="title"
                label="Başlık"
                value={formPathData.title}
                onChange={handlePathInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Box>
            <Box>
              <TextField
                name="description"
                label="Açıklama"
                value={formPathData.description}
                onChange={handlePathInputChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
            </Box>
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Kategori</InputLabel>
                <Select
                  name="category"
                  value={formPathData.category}
                  onChange={handlePathInputChange}
                  disabled={editMode}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPathDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSavePath} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Adım Düzenleme/Oluşturma Dialog */}
      <Dialog 
        open={stepDialogOpen} 
        onClose={() => setStepDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editMode ? 'Adım Düzenle' : 'Yeni Adım Oluştur'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <TextField
                name="name"
                label="Adım Adı"
                value={formStepData.name}
                onChange={handleStepInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Box>
            <Box>
              <TextField
                name="content.title"
                label="İçerik Başlığı"
                value={formStepData.content.title}
                onChange={handleStepInputChange}
                fullWidth
                required
                margin="normal"
              />
            </Box>
            <Box>
              <TextField
                name="content.description"
                label="İçerik Açıklaması"
                value={formStepData.content.description}
                onChange={handleStepInputChange}
                fullWidth
                multiline
                rows={5}
                margin="normal"
              />
            </Box>
            <Box>
              <TextField
                name="content.videoUrl"
                label="Video URL (YouTube)"
                value={formStepData.content.videoUrl}
                onChange={handleStepInputChange}
                fullWidth
                margin="normal"
                placeholder="https://www.youtube.com/embed/VIDEO_ID"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStepDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveStep} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LearningAdminPage; 