import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { projectAPI, taskAPI } from '../services/api';
import { Task, Project } from '../types';
import Calendar from '../components/Calendar';

const CalendarPage: React.FC = () => {
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskDialogOpen, setNewTaskDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  
  // Projeleri ve görevleri yükle
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Projeleri getir
        const projectsData = await projectAPI.getProjects();
        setProjects(projectsData);
        
        // Her projedeki görevleri getir
        const allTasks: Task[] = [];
        for (const project of projectsData) {
          try {
            const projectTasks = await taskAPI.getTasks(project.id);
            // Görevlere proje adını ekle
            const tasksWithProject = projectTasks.map(task => ({
              ...task,
              projectName: project.name
            })) as Task[];
            allTasks.push(...tasksWithProject);
          } catch (err) {
            console.error(`${project.name} projesine ait görevler yüklenirken hata:`, err);
          }
        }
        setTasks(allTasks);
      } catch (err) {
        console.error('Veriler yüklenirken hata oluştu:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Göreve tıklandığında ilgili proje sayfasına yönlendir
  const handleTaskClick = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.project) {
      navigate(`/projects/${task.project}?taskId=${taskId}`);
    }
  };
  
  // Takvimde yeni görev oluştur
  const handleNewTask = (date: Date) => {
    setSelectedDate(date);
    setNewTaskDialogOpen(true);
  };
  
  // Yeni görev oluştur
  const handleCreateTask = async () => {
    if (!selectedProject || !newTaskTitle || !selectedDate) {
      return;
    }
    
    try {
      const newTask = await taskAPI.createTask(selectedProject, {
        title: newTaskTitle,
        description: newTaskDescription,
        deadline: selectedDate,
        status: 'yapiliyor'
      });
      
      // Yeni görevi listeye ekle
      const project = projects.find(p => p.id === selectedProject);
      if (project) {
        const taskWithProject = {
          ...newTask,
          projectName: project.name
        } as Task;
        setTasks(prevTasks => [...prevTasks, taskWithProject]);
      }
      
      // Diyaloğu kapat ve formu temizle
      setNewTaskDialogOpen(false);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedProject('');
      setSelectedDate(null);
    } catch (err) {
      console.error('Görev oluşturulurken hata:', err);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">Takvim yükleniyor...</Typography>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            color: isLightMode ? 'text.primary' : 'white',
            textShadow: isLightMode ? 'none' : '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          Görev Takvimi
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          paragraph
        >
          Görevlerinizi takvim formatında görüntüleyin ve takviminize aktarın.
        </Typography>
        
        <Paper 
          elevation={isLightMode ? 1 : 3}
          sx={{ 
            mt: 3, 
            p: 3,
            borderRadius: 2,
            backgroundColor: isLightMode ? 'white' : 'background.paper'
          }}
        >
          <Calendar 
            tasks={tasks} 
            onTaskClick={handleTaskClick} 
            onNewTask={handleNewTask}
          />
        </Paper>
      </Box>
      
      {/* Yeni Görev Diyaloğu */}
      <Dialog 
        open={newTaskDialogOpen} 
        onClose={() => setNewTaskDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Yeni Görev Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              required
              fullWidth
              label="Görev Başlığı"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            
            <TextField
              fullWidth
              label="Açıklama"
              multiline
              rows={3}
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
            />
            
            <TextField
              select
              required
              fullWidth
              label="Proje"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              SelectProps={{
                native: true
              }}
            >
              <option value="" disabled>Proje Seçin</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </TextField>
            
            {selectedDate && (
              <TextField
                fullWidth
                label="Son Tarih"
                value={selectedDate.toLocaleDateString('tr-TR')}
                InputProps={{
                  readOnly: true
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTaskDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleCreateTask}
            variant="contained"
            disabled={!newTaskTitle || !selectedProject}
          >
            Oluştur
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CalendarPage; 