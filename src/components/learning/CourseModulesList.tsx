import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Typography,
  Divider,
  IconButton,
  Badge,
  Paper,
  ListItemButton,
  LinearProgress
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

interface Module {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  locked: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  completed: boolean;
  locked: boolean;
}

interface CourseModulesListProps {
  modules: Module[];
  currentLessonId: string;
  onLessonSelect: (moduleId: string, lessonId: string) => void;
}

const CourseModulesList: React.FC<CourseModulesListProps> = ({
  modules,
  currentLessonId,
  onLessonSelect
}) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    modules.reduce((acc, module) => {
      // İlk modülü veya içinde aktif dersi olan modülü otomatik olarak aç
      const hasCurrentLesson = module.lessons.some(lesson => lesson.id === currentLessonId);
      acc[module.id] = hasCurrentLesson || modules.indexOf(module) === 0;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const getLessonIcon = (type: string, completed: boolean, locked: boolean) => {
    if (locked) return <LockIcon fontSize="medium" sx={{ color: '#aaa' }} />;
    if (completed) return <CheckCircleIcon fontSize="medium" sx={{ color: '#4caf50', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }} />;
    
    switch (type) {
      case 'video':
        return <OndemandVideoIcon fontSize="medium" sx={{ color: '#1976d2', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }} />;
      case 'reading':
        return <DescriptionIcon fontSize="medium" sx={{ color: '#2196f3', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }} />;
      case 'quiz':
        return <QuizIcon fontSize="medium" sx={{ color: '#ff9800', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }} />;
      case 'assignment':
        return <AssignmentIcon fontSize="medium" sx={{ color: '#f44336', filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.2))' }} />;
      default:
        return <OndemandVideoIcon fontSize="medium" />;
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const getModuleProgress = (module: Module) => {
    const completedLessons = module.lessons.filter(lesson => lesson.completed).length;
    return {
      completed: completedLessons,
      total: module.lessons.length,
      percentage: Math.round((completedLessons / module.lessons.length) * 100)
    };
  };

  return (
    <Paper
      elevation={3}
      sx={{
        maxHeight: '80vh',
        overflow: 'auto',
        borderRadius: 2,
        bgcolor: '#ffffff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          p: 2.5, 
          fontWeight: 700, 
          bgcolor: '#6a1b9a', 
          color: 'white',
          borderBottom: '1px solid #e0e0e0',
          fontSize: '1.2rem',
          letterSpacing: '0.5px'
        }}
      >
        Kurs İçeriği
      </Typography>
      
      <List component="nav" disablePadding sx={{ width: '100%' }}>
        {modules.map((module) => {
          const progress = getModuleProgress(module);
          
          return (
            <Box key={module.id}>
              <ListItemButton
                onClick={() => toggleModule(module.id)}
                sx={{
                  py: 2.5,
                  px: 3,
                  borderLeft: '4px solid',
                  borderLeftColor: module.locked ? 'grey.300' : (module.completed ? '#4caf50' : '#9c27b0'),
                  bgcolor: module.locked 
                    ? 'rgba(0,0,0,0.05)' 
                    : (expandedModules[module.id] ? 'rgba(156, 39, 176, 0.06)' : '#ffffff')
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 700, 
                          color: module.locked ? '#999' : '#212121',
                          fontSize: expandedModules[module.id] ? '1.15rem' : '1rem',
                          lineHeight: 1.3,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {module.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#555',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                          ml: 2,
                          flexShrink: 0
                        }}
                      >
                        {progress.completed}/{progress.total} • {module.duration}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1.2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.7 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#666',
                            fontSize: '0.85rem',
                            fontWeight: 500
                          }}
                        >
                          {progress.percentage}% tamamlandı
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress.percentage} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: 'rgba(0,0,0,0.08)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progress.percentage === 100 ? '#4caf50' : '#9c27b0'
                          }
                        }} 
                      />
                    </Box>
                  }
                />
                {expandedModules[module.id] ? 
                  <ExpandLessIcon sx={{ color: '#9c27b0', fontSize: '1.5rem' }} /> : 
                  <ExpandMoreIcon sx={{ color: '#555', fontSize: '1.5rem' }} />
                }
              </ListItemButton>
              
              <Collapse in={expandedModules[module.id]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {module.lessons.map((lesson) => (
                    <ListItemButton
                      key={lesson.id}
                      selected={currentLessonId === lesson.id}
                      onClick={() => !lesson.locked && onLessonSelect(module.id, lesson.id)}
                      sx={{
                        pl: 6,
                        pr: 3,
                        py: 1.8,
                        bgcolor: currentLessonId === lesson.id ? 'rgba(156, 39, 176, 0.1)' : 'transparent',
                        opacity: lesson.locked ? 0.6 : 1,
                        pointerEvents: lesson.locked ? 'none' : 'auto',
                        '&:hover': {
                          bgcolor: lesson.locked ? undefined : 'rgba(156, 39, 176, 0.05)'
                        },
                        borderLeft: currentLessonId === lesson.id ? '3px solid #9c27b0' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getLessonIcon(lesson.type, lesson.completed, lesson.locked)}
                      </ListItemIcon>
                      <ListItemText
                        primary={lesson.title}
                        primaryTypographyProps={{
                          variant: 'body1',
                          color: lesson.locked ? '#999' : (lesson.completed ? '#4caf50' : '#212121'),
                          sx: {
                            textDecoration: lesson.completed ? 'none' : 'none',
                            fontWeight: currentLessonId === lesson.id ? 600 : 500,
                            fontSize: '0.95rem'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#666',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mr: 1
                          }}
                        >
                          {lesson.duration}
                        </Typography>
                        
                        {currentLessonId === lesson.id && (
                          <PlayCircleOutlineIcon 
                            sx={{ 
                              color: '#9c27b0',
                              fontSize: '1.2rem',
                              filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'
                            }} 
                          />
                        )}
                        
                        {lesson.completed && (
                          <CheckCircleIcon 
                            sx={{ 
                              color: '#4caf50',
                              fontSize: '1.2rem',
                              filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.1))'
                            }} 
                          />
                        )}
                      </Box>
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
              <Divider sx={{ height: 1 }} />
            </Box>
          );
        })}
      </List>
    </Paper>
  );
};

export default CourseModulesList; 