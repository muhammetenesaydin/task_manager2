import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Collapse,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Container,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  OutlinedInput,
  Card,
  CardContent
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { useProjectContext } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';

// Tip tanımlamaları
interface TeamMember {
  id: string;
  name: string;
  role: string;
  title?: string;
  expertise?: string[];
  isOwner?: boolean;
  isAdmin?: boolean;
  avatarColor?: string;
  groupId?: string;
}

interface TeamGroup {
  id: string;
  name: string;
  members: TeamMember[];
}

interface ProjectTeam {
  name?: string;
  owner: TeamMember;
  admins: TeamMember[];
  groups: TeamGroup[];
  members: TeamMember[];
}

interface Project {
  id: string;
  name: string;
  owner?: string;
  participants?: Participant[];
  status?: string;
  tasks?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
  // Diğer proje özellikleri buraya eklenebilir
}

interface Participant {
  userId: string;
  userName?: string;
  email?: string;
  role?: string;
}

// Helper functions to determine project status and color
const getProjectStatus = (project: Project): string => {
  // If status is explicitly defined, use it
  if (project.status) {
    return project.status;
  }
  
  // Otherwise determine status based on tasks
  if (!project.tasks || project.tasks.length === 0) {
    return 'Yeni';
  }
  
  const completedTasks = project.tasks.filter(task => task.status === 'tamamlandi').length;
  const totalTasks = project.tasks.length;
  
  if (completedTasks === totalTasks) {
    return 'Tamamlandı';
  } else if (completedTasks === 0) {
    return 'Aktif';
  } else {
    const progress = Math.round((completedTasks / totalTasks) * 100);
    return progress > 75 ? 'Son Aşama' : 'Devam Ediyor';
  }
};

const getProjectStatusColor = (project: Project): string => {
  const status = getProjectStatus(project);
  
  switch (status) {
    case 'Tamamlandı':
      return '#4caf50'; // Green
    case 'Son Aşama':
      return '#8bc34a'; // Light Green
    case 'Devam Ediyor':
      return '#2196f3'; // Blue
    case 'Aktif':
      return '#ff9800'; // Orange
    case 'Yeni':
      return '#9c27b0'; // Purple
    default:
      return '#9e9e9e'; // Grey
  }
};

// Helper function to modify alert styles for better readability
const getReadableAlertStyles = (baseStyles = {}) => ({
  ...baseStyles,
  bgcolor: 'rgba(255, 255, 255, 0.9)',
  color: '#0288d1',
  '& .MuiAlert-message': {
    fontWeight: 600,
    color: '#0288d1'
  },
  '& .MuiAlert-icon': {
    color: '#0288d1'
  }
});

// Takım ağacı bileşeni
const TeamTree: React.FC<{ 
  projectTeam: ProjectTeam,
  onAddMember: () => void,
  onAddGroup: () => void,
  onEditMember: (member: TeamMember) => void,
  onRemoveMember: (memberId: string) => void,
  onEditGroup: (group: TeamGroup) => void,
  onRemoveGroup: (groupId: string) => void
}> = ({ 
  projectTeam, 
  onAddMember, 
  onAddGroup, 
  onEditMember, 
  onRemoveMember,
  onEditGroup,
  onRemoveGroup
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  
  // Kullanıcının proje sahibi olup olmadığını kontrol et
  const isOwner = user?.id === projectTeam.owner.id;
  
  // Kullanıcının kendisi olup olmadığını kontrol et
  const isCurrentUser = (memberId: string) => user?.id === memberId;
  
  // Grup açma/kapama işleyicisi
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };
  
  // İlk render'da tüm grupları açık olarak ayarla
  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    projectTeam.groups.forEach(group => {
      initialState[group.id] = true;
    });
    setExpandedGroups(initialState);
  }, [projectTeam.groups]);
  
  return (
    <Box>
      {/* Proje Sahibi */}
                      <Paper
                  elevation={3}
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'center', sm: 'flex-start' },
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: 4,
                    px: { xs: 2, sm: 3 },
                    py: { xs: 3, sm: 2 },
                    mb: 3,
                    borderLeft: '5px solid #1976d2',
                    boxShadow: '0 10px 25px rgba(25, 118, 210, 0.15), 0 5px 12px rgba(25, 118, 210, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    backdropFilter: 'blur(8px)',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(235, 245, 255, 0.85) 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      boxShadow: '0 15px 35px rgba(25, 118, 210, 0.2), 0 8px 20px rgba(25, 118, 210, 0.1)',
                      transform: 'translateY(-3px)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(235, 245, 255, 0.9) 100%)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(45deg, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0) 100%)',
                      zIndex: 0
                    }
                  }}
      >
        <Avatar 
          sx={{ 
            bgcolor: projectTeam.owner.avatarColor || '#1976d2', 
            color: '#fff', 
            mr: { xs: 0, sm: 2 },
            mb: { xs: 2, sm: 0 },
            width: { xs: 60, sm: 50 },
            height: { xs: 60, sm: 50 },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '2px solid white'
          }}
        >
          {projectTeam.owner.name[0]}
        </Avatar>
        <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 0.5,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}>
            <Typography variant="h6" fontWeight={700} color="#1976d2">
              {projectTeam.owner.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, sm: 2 } }}>
              <Chip 
                icon={<StarIcon />} 
                label="Proje Kurucusu" 
                size="small" 
                color="primary" 
                sx={{ 
                  fontWeight: 600, 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                  '& .MuiChip-icon': { color: '#fff' }
                }} 
              />
              <Chip 
                icon={<AdminPanelSettingsIcon />} 
                label={isCurrentUser(projectTeam.owner.id) ? "Yönetici (Ben)" : "Yönetici"} 
                size="small" 
                color="secondary" 
                sx={{ 
                  fontWeight: 600, 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                  '& .MuiChip-icon': { color: '#fff' }
                }} 
              />
            </Box>
          </Box>
          <Typography variant="body1" fontWeight={500} color="#333" sx={{ mb: 1 }}>
            {projectTeam.owner.role}
          </Typography>
          {projectTeam.owner.expertise && projectTeam.owner.expertise.length > 0 && (
            <Box sx={{ 
              mt: 1, 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              {projectTeam.owner.expertise.map((skill) => (
                <Chip 
                  key={skill} 
                  label={skill} 
                  size="small" 
                  color="info"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Proje Yöneticileri (Admin) */}
      {projectTeam.admins.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              color="#000000" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '1.1rem',
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <AdminPanelSettingsIcon sx={{ mr: 1, color: '#9c27b0', fontSize: 30 }} />
              Proje Yöneticileri
            </Typography>
            {isOwner && (
              <Button 
                startIcon={<AddIcon />} 
                size="small"
                variant="contained"
                color="secondary"
                sx={{
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 8,
                  boxShadow: '0 4px 10px rgba(156, 39, 176, 0.2)',
                  '&:hover': {
                    boxShadow: '0 6px 15px rgba(156, 39, 176, 0.3)',
                    transform: 'translateY(-2px)'
                  }
                }}
                onClick={onAddMember}
              >
                Yönetici Ekle
              </Button>
            )}
          </Box>
          <Box sx={{ 
            ml: { xs: 1, sm: 3 }, 
            pl: 2, 
            borderLeft: '3px dashed #9c27b0',
            transition: 'all 0.3s ease'
          }}>
            {projectTeam.admins.map((admin, index) => (
              <Paper
                key={admin.id}
                elevation={2}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'center', sm: 'flex-start' },
                  bgcolor: '#fff',
                  borderRadius: 3,
                  px: { xs: 2, sm: 3 },
                  py: { xs: 3, sm: 2 },
                  mb: 2,
                  boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
                  borderLeft: '3px solid #9c27b0',
                  transition: 'all 0.3s ease',
                  animation: `fadeSlideIn 0.4s ease-out ${0.1 * index}s both`,
                  '@keyframes fadeSlideIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateX(-20px)'
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateX(0)'
                    }
                  },
                  '&:hover': {
                    boxShadow: '0 5px 15px rgba(0,0,0,0.12)',
                    backgroundColor: '#fafafa',
                    transform: 'translateX(5px)'
                  }
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: admin.avatarColor || '#9c27b0', 
                    color: '#fff', 
                    mr: { xs: 0, sm: 2 },
                    mb: { xs: 2, sm: 0 },
                    width: { xs: 50, sm: 45 },
                    height: { xs: 50, sm: 45 },
                    boxShadow: '0 3px 8px rgba(0,0,0,0.12)',
                    border: '2px solid white'
                  }}
                >
                  {admin.name[0]}
                </Avatar>
                <Box sx={{ 
                  flexGrow: 1,
                  textAlign: { xs: 'center', sm: 'left' } 
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    flexDirection: { xs: 'column', sm: 'row' },
                    mb: { xs: 1, sm: 0 }
                  }}>
                    <Typography variant="subtitle1" fontWeight={700} color="#000000">
                      {admin.name}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={isCurrentUser(admin.id) ? "Admin (Ben)" : "Admin"} 
                      color="secondary" 
                      sx={{ fontSize: '0.7rem', fontWeight: 700, boxShadow: '0 2px 4px rgba(156, 39, 176, 0.15)' }} 
                    />
                  </Box>
                  <Typography variant="body2" color="#333333" fontWeight={500} sx={{ mb: 1 }}>
                    {admin.role}
                  </Typography>
                  {admin.expertise && admin.expertise.length > 0 && (
                    <Box sx={{ 
                      mt: 1, 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: 0.5,
                      justifyContent: { xs: 'center', sm: 'flex-start' }
                    }}>
                      {admin.expertise.map((skill) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>
                {isOwner && (
                  <Box sx={{ 
                    display: 'flex', 
                    mt: { xs: 2, sm: 0 },
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                  }}>
                    <Tooltip title="Düzenle">
                      <IconButton 
                        size="small" 
                        onClick={() => onEditMember(admin)}
                        sx={{ 
                          color: '#9c27b0',
                          mr: 1,
                          backgroundColor: 'rgba(156, 39, 176, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(156, 39, 176, 0.15)'
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kaldır">
                      <IconButton 
                        size="small" 
                        onClick={() => onRemoveMember(admin.id)}
                        sx={{ 
                          color: '#f44336',
                          backgroundColor: 'rgba(244, 67, 54, 0.08)',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.15)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>
      )}
      
      {/* Takım Grupları */}
      {(projectTeam.groups.length > 0 || isOwner) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              color="#000000"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '1.1rem',
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <GroupIcon sx={{ mr: 1, color: '#388e3c', fontSize: 30 }} />
              Ekipler
            </Typography>
            {isOwner && (
              <Box>
                <Button 
                  startIcon={<AddIcon />} 
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={onAddGroup}
                  sx={{ mr: 1 }}
                >
                  Ekip Ekle
                </Button>
              </Box>
            )}
          </Box>
          
          {projectTeam.groups.map(group => (
            <Box key={group.id} sx={{ mb: 3 }}>
              <Paper
                elevation={2}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 4,
                  px: 3,
                  py: 1.5,
                  mb: 1,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05), 0 6px 10px rgba(76, 175, 80, 0.08)',
                  border: '2px solid rgba(76, 175, 80, 0.8)',
                  backdropFilter: 'blur(8px)',
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 255, 240, 0.85) 100%)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(0,0,0,0.08), 0 8px 16px rgba(76, 175, 80, 0.12)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <GroupIcon sx={{ color: '#388e3c', mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700} color="#388e3c">
                    {group.name}
                  </Typography>
                  <Typography variant="body2" color="#000000" fontWeight={500}>
                    {group.members.length} Kişi
                  </Typography>
                </Box>
                {isOwner && (
                  <Box sx={{ display: 'flex', mr: 1 }}>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => onEditGroup(group)} sx={{ color: '#388e3c' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kaldır">
                      <IconButton size="small" onClick={() => onRemoveGroup(group.id)} sx={{ color: '#f44336' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
                <IconButton size="small" onClick={() => toggleGroup(group.id)}>
                  {expandedGroups[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Paper>
              
              <Collapse in={expandedGroups[group.id]} timeout="auto" unmountOnExit>
                <Box sx={{ ml: 3, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                  {group.members.map(member => (
                    <Paper
                      key={member.id}
                      elevation={1}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: 4,
                        px: 3,
                        py: 1.5,
                        mb: 2,
                        boxShadow: '0 8px 15px rgba(0,0,0,0.03), 0 3px 8px rgba(0,0,0,0.03)',
                        backdropFilter: 'blur(6px)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.04)',
                        '&:hover': {
                          boxShadow: '0 10px 20px rgba(0,0,0,0.05), 0 6px 10px rgba(0,0,0,0.04)',
                          transform: 'translateY(-2px)',
                          bgcolor: 'rgba(255, 255, 255, 0.95)'
                        }
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: member.avatarColor || '#9e9e9e', 
                          color: '#fff', 
                          mr: 2 
                        }}
                      >
                        {member.name[0]}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} color="#333">
                            {member.name}
                          </Typography>
                          {member.isAdmin && (
                            <Chip 
                              size="small" 
                              label={isCurrentUser(member.id) ? "Admin (Ben)" : "Admin"} 
                              color="primary" 
                              variant="outlined" 
                              sx={{ fontSize: '0.7rem', fontWeight: 600 }} 
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {member.role}
                        </Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {member.expertise && member.expertise.length > 0 ? (
                            member.expertise.map((skill) => (
                              <Chip 
                                key={skill} 
                                label={skill} 
                                size="small" 
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="#000000" fontWeight={500} sx={{ 
                              textAlign: { xs: 'center', sm: 'left' },
                              display: 'block'
                            }}>
                              Uzmanlık alanı belirtilmemiş
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {isOwner && (
                        <Box>
                          <Tooltip title="Düzenle">
                            <IconButton size="small" onClick={() => onEditMember(member)} sx={{ color: '#2196f3' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Kaldır">
                            <IconButton size="small" onClick={() => onRemoveMember(member.id)} sx={{ color: '#f44336' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Paper>
                  ))}
                  {group.members.length === 0 && (
                    <Alert severity="info" sx={{ 
                      mb: 2,
                      ...getReadableAlertStyles()
                    }}>
                      Bu ekipte henüz üye bulunmuyor.
                    </Alert>
                  )}
                  {isOwner && (
                    <Button 
                      startIcon={<AddIcon />} 
                      size="small"
                      onClick={onAddMember}
                      sx={{ mb: 2 }}
                    >
                      Üye Ekle
                    </Button>
                  )}
                </Box>
              </Collapse>
            </Box>
          ))}
          {projectTeam.groups.length === 0 && isOwner && (
            <Alert severity="info" sx={{ 
              mb: 2,
              ...getReadableAlertStyles()
            }}>
              Henüz ekip bulunmuyor. Yeni bir ekip ekleyin.
            </Alert>
          )}
        </Box>
      )}
      
      {/* Genel Üyeler */}
      {(projectTeam.members.length > 0 || isOwner) && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700} 
              color="#000000"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                fontSize: '1.1rem',
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <PersonIcon sx={{ mr: 1, color: '#607d8b', fontSize: 30 }} />
              Diğer Katılımcılar
            </Typography>
            {isOwner && (
              <Button 
                startIcon={<AddIcon />} 
                size="small"
                variant="outlined"
                color="info"
                onClick={onAddMember}
              >
                Üye Ekle
              </Button>
            )}
          </Box>
          
          <Box sx={{ ml: 3, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
            {projectTeam.members.map(member => (
              <Paper
                key={member.id}
                elevation={1}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#fff',
                  borderRadius: 3,
                  px: 3,
                  py: 1.5,
                  mb: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: member.avatarColor || '#9e9e9e', 
                    color: '#fff', 
                    mr: 2 
                  }}
                >
                  {member.name[0]}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle1" fontWeight={600} color="#333">
                      {member.name}
                    </Typography>
                    {member.isAdmin && (
                      <Chip 
                        size="small" 
                        label={isCurrentUser(member.id) ? "Admin (Ben)" : "Admin"} 
                        color="primary" 
                        variant="outlined" 
                        sx={{ fontSize: '0.7rem', fontWeight: 600 }} 
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {member.expertise && member.expertise.length > 0 ? (
                      member.expertise.map((skill) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          color="info"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ))
                    ) : (
                      <Typography variant="caption" color="#000000" fontWeight={500} sx={{ 
                        textAlign: { xs: 'center', sm: 'left' },
                        display: 'block'
                      }}>
                        Uzmanlık alanı belirtilmemiş
                      </Typography>
                    )}
                  </Box>
                </Box>
                {isOwner && (
                  <Box>
                    <Tooltip title="Düzenle">
                      <IconButton size="small" onClick={() => onEditMember(member)} sx={{ color: '#2196f3' }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Kaldır">
                      <IconButton size="small" onClick={() => onRemoveMember(member.id)} sx={{ color: '#f44336' }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Paper>
            ))}
            {projectTeam.members.length === 0 && (
                              <Alert severity="info" sx={{ 
                  mb: 2,
                  ...getReadableAlertStyles()
              }}>
                Henüz ekip dışı üye bulunmuyor.
              </Alert>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Üye Ekleme/Düzenleme Diyaloğu
interface MemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (member: Partial<TeamMember>) => void;
  member?: TeamMember;
  groups: TeamGroup[];
  title: string;
  isOwner: boolean;
}

const MemberDialog: React.FC<MemberDialogProps> = ({ open, onClose, onSave, member, groups, title, isOwner }) => {
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    expertise: [],
    isAdmin: false
  });
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  
  // Form verilerini üye verisiyle doldur
  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id,
        name: member.name,
        role: member.role,
        expertise: member.expertise || [],
        isAdmin: member.isAdmin || false,
        avatarColor: member.avatarColor
      });
      
      // Eğer üye bir gruba aitse, grubu seç
      const foundGroup = groups.find(group => 
        group.members.some(m => m.id === member.id)
      );
      
      if (foundGroup) {
        setSelectedGroup(foundGroup.id);
      } else {
        setSelectedGroup('');
      }
    } else {
      // Yeni üye ekleme durumunda formu sıfırla
      setFormData({
        name: '',
        role: '',
        expertise: [],
        isAdmin: false,
        avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16) // Rastgele renk
      });
      setSelectedGroup('');
    }
  }, [member, groups]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleExpertiseChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      expertise: typeof value === 'string' ? value.split(',') : value,
    }));
  };
  
  const handleAdminChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      isAdmin: event.target.value === 'true'
    }));
  };
  
  const handleGroupChange = (event: SelectChangeEvent<string>) => {
    setSelectedGroup(event.target.value);
  };
  
  const handleSave = () => {
    onSave({ 
      ...formData, 
      groupId: selectedGroup || undefined 
    });
    onClose();
  };
  
  const EXPERTISE_AREAS = [
    'Yapay Zeka',
    'Veri Bilimi',
    'Web Geliştirme',
    'Mobil Uygulama',
    'Gömülü Sistemler',
    'UI/UX Tasarım',
    'DevOps',
    'Ağ Güvenliği',
    'Sistem Yönetimi',
    'Veritabanı',
    'IoT',
    'Oyun Geliştirme',
    'Blockchain',
    'Bulut Bilişim',
    'Test Mühendisliği'
  ];
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Ad Soyad"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Rol / Pozisyon"
            name="role"
            value={formData.role || ''}
            onChange={handleChange}
            fullWidth
            placeholder="Örn: Frontend Geliştirici, Veri Bilimci, Tasarımcı"
            required
          />
          <FormControl fullWidth>
            <InputLabel id="expertise-label">Uzmanlık Alanları</InputLabel>
            <Select
              labelId="expertise-label"
              id="expertise"
              multiple
              value={formData.expertise || []}
              onChange={handleExpertiseChange}
              input={<OutlinedInput label="Uzmanlık Alanları" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 48 * 4.5 + 8,
                    width: 250,
                  },
                },
              }}
            >
              {EXPERTISE_AREAS.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="group-label">Ekip</InputLabel>
            <Select
              labelId="group-label"
              id="group"
              value={selectedGroup}
              onChange={handleGroupChange}
              label="Ekip"
              sx={{ 
                '& .MuiSelect-select': { 
                  fontWeight: 500, 
                  color: '#000000'
                }
              }}
            >
              <MenuItem value="" sx={{ fontWeight: 500, color: '#000000' }}>
                <em>Ekip Yok (Genel Katılımcı)</em>
              </MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id} sx={{ fontWeight: 500, color: '#000000' }}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isOwner && (
            <FormControl fullWidth>
              <InputLabel id="admin-label" sx={{ fontWeight: 600, color: '#000000' }}>Yönetici Yetkisi</InputLabel>
              <Select
                labelId="admin-label"
                id="admin"
                value={formData.isAdmin ? 'true' : 'false'}
                onChange={handleAdminChange}
                label="Yönetici Yetkisi"
                sx={{ 
                  '& .MuiSelect-select': { 
                    fontWeight: 500, 
                    color: '#000000'
                  }
                }}
              >
                <MenuItem value="false" sx={{ fontWeight: 500, color: '#000000' }}>Hayır</MenuItem>
                <MenuItem value="true" sx={{ fontWeight: 500, color: '#000000' }}>Evet (Admin)</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!formData.name || !formData.role}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Ekip Ekleme/Düzenleme Diyaloğu
interface GroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (group: Partial<TeamGroup>) => void;
  group?: TeamGroup;
  title: string;
}

const GroupDialog: React.FC<GroupDialogProps> = ({ open, onClose, onSave, group, title }) => {
  const [formData, setFormData] = useState<Partial<TeamGroup>>({
    name: ''
  });
  
  // Form verilerini grup verisiyle doldur
  useEffect(() => {
    if (group) {
      setFormData({
        id: group.id,
        name: group.name
      });
    } else {
      setFormData({
        name: ''
      });
    }
  }, [group]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    onSave(formData);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden'
        }
      }}
    >
      <Box sx={{ 
        bgcolor: 'rgba(156, 39, 176, 0.04)',
        borderBottom: '1px solid rgba(156, 39, 176, 0.1)',
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center'
      }}>
        <GroupIcon sx={{ color: '#9c27b0', mr: 1.5, fontSize: 30 }} />
        <DialogTitle sx={{ 
          p: 0, 
          fontWeight: 700, 
          color: '#000000',
          fontSize: '1.25rem'
        }}>
          {title}
        </DialogTitle>
      </Box>
      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography fontWeight={600} color="#000000">Ekip Adı</Typography>
                <Box 
                  component="span"
                  sx={{ color: '#e91e63', ml: 0.5, fontWeight: 'bold' }}
                >
                  *
                </Box>
              </Box>
            }
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            fullWidth
            required
            placeholder="Örn: Frontend Ekibi, Yapay Zeka Ekibi"
            InputLabelProps={{
              sx: { fontWeight: 600 }
            }}
            InputProps={{
              sx: { 
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(156, 39, 176, 0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(156, 39, 176, 0.6)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#9c27b0'
                }
              }
            }}
            helperText="Ekip adını belirtin"
            FormHelperTextProps={{
              sx: { fontWeight: 500 }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(0,0,0,0.05)',
        bgcolor: 'rgba(156, 39, 176, 0.02)' 
      }}>
        <Button 
          onClick={onClose}
          sx={{ 
            fontWeight: 600,
            color: '#555',
            borderRadius: 2,
            px: 3
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="secondary"
          disabled={!formData.name}
          sx={{ 
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            boxShadow: '0 4px 12px rgba(156, 39, 176, 0.25)'
          }}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Ana sayfa bileşeni
const TeamPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { selectedProject, getProject, loading, projects } = useProjectContext();
  const { user } = useAuth();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Dialog durumları
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Düzenlenen üye/grup
  const [selectedMember, setSelectedMember] = useState<TeamMember | undefined>(undefined);
  const [selectedGroup, setSelectedGroup] = useState<TeamGroup | undefined>(undefined);
  const [deleteAction, setDeleteAction] = useState<{ type: 'member' | 'group', id: string } | null>(null);
  
  // Proje takım verisi
  const [projectTeam, setProjectTeam] = useState<ProjectTeam | null>(null);

  // URL'de belirtilmişse ve ilk render'da proje ID'yi ayarla
  useEffect(() => {
    if (projectId) {
      setSelectedProjectId(projectId);
      
      // Proje detaylarını getir
      if (projectId) {
        loadProjectDetails(projectId);
      }
    }
  }, [projectId]);
  
  // Projenin detaylarını yükle
  const loadProjectDetails = async (projectId: string) => {
    try {
      setError(null);
      const projectData = await getProject(projectId);
      
      if (projectData) {
        // Projeden takım verisi oluştur
        const teamData = createTeamDataFromProject(projectData);
        setProjectTeam(teamData);
      } else {
        setError('Proje bulunamadı');
      }
    } catch (err) {
      console.error('Proje detayları yüklenirken hata:', err);
      setError('Proje verilerini yüklerken bir hata oluştu');
    }
  };
  
  // Projeden takım verisini oluştur
  const createTeamDataFromProject = (project: any): ProjectTeam => {
    // Varsayılan takım verisini oluştur
    const teamData: ProjectTeam = {
      name: project.name,
      owner: {
        id: project.owner || '',
        name: 'Proje Sahibi',  // Varsayılan değer
        role: 'Proje Kurucusu',
        isOwner: true,
        isAdmin: true, // Proje sahibi otomatik olarak admin
        avatarColor: '#1976d2',
        expertise: []
      },
      admins: [],
      groups: [], // Statik gruplar yerine boş dizi
      members: []
    };
    
    // Proje katılımcılarını ilgili gruplara ayır
    if (project.participants && project.participants.length > 0) {
      project.participants.forEach((participant: Participant) => {
        if (participant.userId === project.owner) {
          // Proje sahibiyse zaten eklemiştik, isim ve avatar gibi bilgileri güncelle
          teamData.owner.name = participant.userName || 'Proje Sahibi';
          return;
        }
        
        const member: TeamMember = {
          id: participant.userId,
          name: participant.userName || participant.email || 'İsimsiz Kullanıcı',
          role: participant.role === 'admin' ? 'Proje Yöneticisi' : 'Ekip Üyesi',
          isAdmin: participant.role === 'admin',
          avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16), // Rastgele renk
          expertise: []
        };
        
        // Admin ise admins listesine ekle
        if (participant.role === 'admin') {
          teamData.admins.push(member);
        } else {
          // Şimdilik tüm normal üyeleri genel üyelere listesine ekle
          teamData.members.push(member);
        }
      });
    }
    
    return teamData;
  };
  
  // Kullanıcının projeye ait olup olmadığını kontrol et
  const isUserInProject = (projectTeam: ProjectTeam | null, userId: string | undefined): boolean => {
    if (!projectTeam || !userId) return false;
    
    // Proje sahibi mi?
    if (projectTeam.owner.id === userId) return true;
    
    // Admin mi?
    if (projectTeam.admins.some(admin => admin.id === userId)) return true;
    
    // Gruplardaki üyelerden biri mi?
    if (projectTeam.groups.some(group => 
      group.members.some(member => member.id === userId))) return true;
    
    // Genel üyelerden biri mi?
    if (projectTeam.members.some(member => member.id === userId)) return true;
    
    return false;
  };
  
  // Üye ekleme/düzenleme diyaloğunu açma
  const handleAddMember = () => {
    setSelectedMember(undefined);
    setMemberDialogOpen(true);
  };

  // Üye düzenleme diyaloğunu açma
  const handleEditMember = (member: TeamMember) => {
    setSelectedMember(member);
    setMemberDialogOpen(true);
  };

  // Üye silmeyi onaylama diyaloğunu açma
  const handleRemoveMember = (memberId: string) => {
    setDeleteAction({ type: 'member', id: memberId });
    setConfirmDialogOpen(true);
  };

  // Ekip ekleme diyaloğunu açma
  const handleAddGroup = () => {
    setSelectedGroup(undefined);
    setGroupDialogOpen(true);
  };

  // Ekip düzenleme diyaloğunu açma
  const handleEditGroup = (group: TeamGroup) => {
    setSelectedGroup(group);
    setGroupDialogOpen(true);
  };

  // Ekip silmeyi onaylama diyaloğunu açma
  const handleRemoveGroup = (groupId: string) => {
    setDeleteAction({ type: 'group', id: groupId });
    setConfirmDialogOpen(true);
  };

  // Üye kaydetme
  const handleSaveMember = (member: Partial<TeamMember>) => {
    if (!projectTeam) return;
    
    const currentTeam: ProjectTeam = { ...projectTeam };
    const groupId = member.groupId;
    
    // Gruplandırma işlemi yapıldıktan sonra groupId'yi üyeden kaldır
    const memberData = { ...member };
    if ('groupId' in memberData) {
      delete (memberData as any).groupId;
    }
    
    if (member.id) {
      // Mevcut üye güncelleme
      // 1. Admin listesinden güncelle/kaldır
      if (member.isAdmin) {
        if (!currentTeam.admins.some(admin => admin.id === member.id)) {
          // Admin değilse admin yap
          currentTeam.admins = currentTeam.admins.filter(admin => admin.id !== member.id);
          currentTeam.admins.push({ ...memberData } as TeamMember);
        } else {
          // Zaten adminse, güncelle
          currentTeam.admins = currentTeam.admins.map(admin => 
            admin.id === member.id ? { ...admin, ...memberData } as TeamMember : admin
          );
        }
      } else {
        // Admin değilse listeden çıkar
        currentTeam.admins = currentTeam.admins.filter(admin => admin.id !== member.id);
      }
      
      // 2. Tüm gruplardan kaldır (daha sonra doğru gruba eklenecek)
      currentTeam.groups = currentTeam.groups.map(group => ({
        ...group,
        members: group.members.filter(m => m.id !== member.id)
      }));
      
      // 3. Genel üyelerden kaldır
      currentTeam.members = currentTeam.members.filter(m => m.id !== member.id);
      
      // 4. Grubu belirtilmişse o gruba ekle, değilse genel üyelere ekle
      if (groupId) {
        const targetGroup = currentTeam.groups.find(g => g.id === groupId);
        if (targetGroup) {
          targetGroup.members.push({ ...memberData } as TeamMember);
        }
      } else {
        currentTeam.members.push({ ...memberData } as TeamMember);
      }
      
      setSnackbarMessage('Üye başarıyla güncellendi');
    } else {
      // Yeni üye ekleme
      const newMember = { 
        ...memberData, 
        id: 'user' + Math.floor(Math.random() * 10000) 
      } as TeamMember;
      
      // Admin yetkisi varsa admin listesine ekle
      if (newMember.isAdmin) {
        currentTeam.admins.push(newMember);
      }
      
      // Belirtilen gruba veya genel üyelere ekle
      if (groupId) {
        const targetGroup = currentTeam.groups.find(g => g.id === groupId);
        if (targetGroup) {
          targetGroup.members.push(newMember);
        }
      } else {
        currentTeam.members.push(newMember);
      }
      
      setSnackbarMessage('Yeni üye başarıyla eklendi');
    }
    
    // Proje ekibini güncelle
    setProjectTeam(currentTeam);
    
    setSnackbarOpen(true);
  };

  // Ekip kaydetme
  const handleSaveGroup = (group: Partial<TeamGroup>) => {
    if (!projectTeam) return;
    
    const currentTeam: ProjectTeam = { ...projectTeam };
    
    if (group.id) {
      // Mevcut ekibi güncelle
      currentTeam.groups = currentTeam.groups.map(g => 
        g.id === group.id ? { ...g, name: group.name || g.name } : g
      );
      setSnackbarMessage('Ekip başarıyla güncellendi');
    } else {
      // Yeni ekip ekle
      const newGroup = {
        id: 'group' + Math.floor(Math.random() * 10000),
        name: group.name || 'Yeni Ekip',
        members: []
      };
      currentTeam.groups.push(newGroup);
      setSnackbarMessage('Yeni ekip başarıyla eklendi');
    }
    
    // Proje ekibini güncelle
    setProjectTeam(currentTeam);
    
    setSnackbarOpen(true);
  };

  // Onaylama diyaloğundan sonra silme işlemi
  const handleConfirmDelete = () => {
    if (!deleteAction || !projectTeam) return;
    
    const currentTeam: ProjectTeam = { ...projectTeam };
    
    if (deleteAction.type === 'member') {
      // Üye silme
      const memberId = deleteAction.id;
      
      // Admin listesinden sil
      currentTeam.admins = currentTeam.admins.filter(admin => admin.id !== memberId);
      
      // Tüm gruplardan sil
      currentTeam.groups = currentTeam.groups.map(group => ({
        ...group,
        members: group.members.filter(m => m.id !== memberId)
      }));
      
      // Genel üyelerden sil
      currentTeam.members = currentTeam.members.filter(m => m.id !== memberId);
      
      setSnackbarMessage('Üye başarıyla silindi');
    } else if (deleteAction.type === 'group') {
      // Ekip silme
      const groupId = deleteAction.id;
      
      // Silinecek grup
      const groupToDelete = currentTeam.groups.find(g => g.id === groupId);
      
      // Gruptaki üyeleri genel üyelere taşı
      if (groupToDelete) {
        currentTeam.members = [...currentTeam.members, ...groupToDelete.members];
      }
      
      // Grubu sil
      currentTeam.groups = currentTeam.groups.filter(g => g.id !== groupId);
      
      setSnackbarMessage('Ekip başarıyla silindi');
    }
    
    // Proje ekibini güncelle
    setProjectTeam(currentTeam);
    
    setConfirmDialogOpen(false);
    setDeleteAction(null);
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ 
        minHeight: '100vh', 
        py: 6, 
        px: 4, 
        borderRadius: 2,
        background: 'linear-gradient(135deg, #f8fcff 0%, #faf6ff 100%)',
        boxShadow: 'inset 0 0 100px rgba(255,255,255,0.9)'
      }}>
        <Box sx={{ maxWidth: 1000, mx: 'auto', mb: 5 }}>
          <Box
            sx={{
              mb: 4,
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              py: 4,
              px: { xs: 2, md: 4 },
              backgroundImage: 'linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(187, 134, 252, 0.12) 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(156, 39, 176, 0.1)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Dekoratif elementler */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: '-20px', 
                right: '-20px', 
                width: '160px', 
                height: '160px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(156, 39, 176, 0.05)',
                zIndex: 0
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                top: '20px', 
                right: '40%', 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(156, 39, 176, 0.03)',
                zIndex: 0
              }} 
            />

                          <Box sx={{ 
                position: 'relative', 
                zIndex: 1,
                width: '100%',
                maxWidth: 800,
                mx: 'auto'
              }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    mb: 3,
                    background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    mx: 'auto',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -10,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: { xs: 100, sm: 150, md: 180 },
                      height: 4,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, rgba(156, 39, 176, 0.2), rgba(156, 39, 176, 0.6), rgba(156, 39, 176, 0.2))'
                    }
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-flex',
                      position: 'relative',
                      mr: 2,
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        width: '130%',
                        height: '130%',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(156, 39, 176, 0.15) 0%, rgba(156, 39, 176, 0) 70%)',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: -1
                      }
                    }}
                  >
                    <GroupIcon sx={{ fontSize: { xs: 35, sm: 40, md: 45 }, color: '#9c27b0' }} />
                  </Box>
                  TAKIM HİYERARŞİSİ
                </Typography>
              
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  maxWidth: '700px',
                  color: '#000000',
                  textAlign: 'center',
                  mx: 'auto',
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  lineHeight: 1.6,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  mb: 2,
                  px: 2
                }}
              >
                Proje içi organizasyon yapısını ve ekip hiyerarşisini aşağıda görebilirsiniz.
                Projelerinizi seçerek takım üyelerini görüntüleyebilir ve yönetebilirsiniz.
              </Typography>
            </Box>
          </Box>
          
          {/* Seçili proje başlığı */}
          {selectedProjectId && projectTeam && (
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4, 
                px: 4,
                py: 3,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                backgroundImage: 'linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(156, 39, 176, 0.05) 100%)',
                boxShadow: '0 6px 20px rgba(156, 39, 176, 0.15)',
                border: '1px solid rgba(156, 39, 176, 0.3)',
                transition: 'all 0.3s ease-in-out',
                transform: 'translateY(0)',
                animation: 'fadeIn 0.5s ease-out',
                '@keyframes fadeIn': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}
            >
              {/* Dekoratif elementler */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: '-15px', 
                  right: '-15px', 
                  width: '100px', 
                  height: '100px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(156, 39, 176, 0.01) 0%, rgba(156, 39, 176, 0) 70%)',
                  zIndex: 0
                }}
              />
              
              <Avatar 
                sx={{ 
                  background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                  width: 56, 
                  height: 56, 
                  mr: 2,
                  boxShadow: '0 4px 8px rgba(156, 39, 176, 0.3)',
                  border: '2px solid rgba(255,255,255,0.8)',
                  zIndex: 1
                }}
              >
                {projectTeam.name?.charAt(0).toUpperCase() || 'P'}
              </Avatar>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h5" 
                  fontWeight={700} 
                  sx={{
                    background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {projectTeam.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FolderIcon sx={{ fontSize: 16, color: '#9c27b0', mr: 0.5, opacity: 0.8 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Seçili proje
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          {/* Proje kartları görünümü */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" fontWeight={700} color="#000000" mb={3} display="flex" alignItems="center" justifyContent="center" width="100%" textAlign="center">
              <FolderIcon sx={{ mr: 1.5, color: '#9c27b0', fontSize: 28 }} />
              Projeleriniz
            </Typography>
            
            {projects.length > 0 ? (
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, 
                gap: 3,
                width: '100%',
                justifyContent: 'center',
                animation: 'fadeInUp 0.6s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(20px)'
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)'
                  }
                }
              }}>
                {projects.map((project, index) => (
                  <Card 
                    key={project.id} 
                    sx={{ 
                      cursor: 'pointer',
                      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      border: selectedProjectId === project.id ? '2px solid #9c27b0' : '1px solid rgba(156, 39, 176, 0.08)',
                      borderRadius: 4,
                      position: 'relative',
                      overflow: 'hidden',
                      height: '100%',
                      bgcolor: selectedProjectId === project.id ? 'rgba(156, 39, 176, 0.05)' : 'rgba(255, 255, 255, 0.9)',
                      boxShadow: selectedProjectId === project.id 
                        ? '0 15px 30px rgba(156, 39, 176, 0.2), 0 8px 15px rgba(156, 39, 176, 0.15)'
                        : '0 10px 25px -5px rgba(0,0,0,0.08), 0 6px 10px -8px rgba(0,0,0,0.05)',
                      '&:hover': {
                        transform: 'translateY(-12px) scale(1.02)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 15px 20px rgba(156, 39, 176, 0.1)',
                        borderColor: '#9c27b0',
                        bgcolor: 'rgba(255, 255, 255, 1)',
                        '&:before': {
                          opacity: 1
                        }
                      },
                      '&:before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
                        opacity: 0.7,
                        transition: 'opacity 0.4s ease',
                        zIndex: 0
                      },
                      mx: 'auto',
                      maxWidth: '100%',
                      animation: `fadeIn 0.5s ease-out ${0.1 * index}s both`,
                      '@keyframes fadeIn': {
                        '0%': {
                          opacity: 0,
                          transform: 'translateY(30px)'
                        },
                        '100%': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      }
                    }}
                    onClick={() => {
                      setSelectedProjectId(project.id);
                      navigate(`/team/${project.id}`, { replace: true });
                      loadProjectDetails(project.id);
                    }}
                  >
                    {/* Seçili proje için özel gösterge */}
                    {selectedProjectId === project.id && (
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          top: 0, 
                          left: 0, 
                          right: 0, 
                          height: '6px',
                          background: 'linear-gradient(90deg, #9c27b0, #d85aff)'
                        }}
                      />
                    )}
                    
                    {/* Dekoratif elementler */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        width: '150px', 
                        height: '150px', 
                        borderRadius: '50%', 
                        background: 'radial-gradient(circle, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0) 70%)',
                        transform: 'translate(30%, -30%)',
                        zIndex: 0
                      }}
                    />
                    
                    <CardContent sx={{ 
                      p: 3, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        mb: 2, 
                        position: 'relative', 
                        zIndex: 1,
                        width: '100%'
                      }}>
                        <Box 
                          sx={{ 
                            position: 'relative',
                            mb: 2
                          }}
                        >
                          <Avatar 
                            sx={{ 
                              background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)',
                              width: 70,
                              height: 70,
                              mb: 2,
                              color: selectedProjectId === project.id ? '#9c27b0' : '#1976d2',
                              fontWeight: 'bold',
                              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                              border: '3px solid',
                              borderColor: getProjectStatusColor(project),
                              fontSize: '1.8rem',
                              position: 'relative',
                              zIndex: 1
                            }}
                          >
                            {project.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              right: -5,
                              bgcolor: getProjectStatusColor(project),
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              py: 0.5,
                              px: 1.2,
                              borderRadius: 10,
                              boxShadow: '0 4px 8px rgba(0,0,0,0.12)',
                              border: '2px solid #fff',
                              zIndex: 2,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {getProjectStatus(project)}
                          </Box>
                        </Box>
                        <Typography 
                          variant="h6" 
                          fontWeight={600}
                          sx={{
                            color: '#000000',
                            fontSize: '1.1rem',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            hyphens: 'auto',
                            width: '100%',
                            textAlign: 'center',
                            lineHeight: 1.3
                          }}
                        >
                          {project.name || 'İsimsiz Proje'}
                        </Typography>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        color="#000000"
                        sx={{ 
                          mb: 2, 
                          position: 'relative', 
                          zIndex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          textAlign: 'center',
                          fontWeight: 700,
                          px: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        {project.description || 'Proje ekip hiyerarşisini görüntülemek için tıklayın.'}
                      </Typography>
                      
                      {/* Proje meta bilgileri */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        mb: 2,
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        alignItems: 'center'
                      }}>
                        {/* Son güncelleme tarihi */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: 2,
                            py: 0.8,
                            px: 1.5,
                            border: '1px solid rgba(25, 118, 210, 0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <AccessTimeIcon sx={{ fontSize: 16, color: '#1976d2', mr: 0.8 }} />
                            <Typography variant="body2" color="#000000" fontWeight={700}>
                              Son güncelleme: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Katılımcı bilgisi */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: 2,
                            py: 0.8,
                            px: 1.5,
                            border: '1px solid rgba(156, 39, 176, 0.2)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            backdropFilter: 'blur(8px)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                              transform: 'translateY(-2px)'
                            }
                          }}>
                            <PeopleIcon sx={{ fontSize: 16, color: '#9c27b0', mr: 0.8 }} />
                            <Typography variant="body2" color="#000000" fontWeight={700}>
                              {project.participants?.length || 0} katılımcı
                            </Typography>
                          </Box>

                          {/* Görev durumu - eğer varsa */}
                          {project.tasks && (
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              bgcolor: 'rgba(255, 255, 255, 0.8)', 
                              borderRadius: 2,
                              py: 0.8,
                              px: 1.5,
                              border: '1px solid rgba(76, 175, 80, 0.2)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                              backdropFilter: 'blur(8px)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                                transform: 'translateY(-2px)'
                              }
                            }}>
                              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#2e7d32', mr: 0.8 }} />
                              <Typography variant="body2" color="#000000" fontWeight={700}>
                                {project.tasks?.filter(t => t.status === 'tamamlandi').length || 0}/{project.tasks?.length || 0} görev
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mt: 'auto',
                        position: 'relative',
                        zIndex: 1,
                        width: '100%'
                      }}>
                        {selectedProjectId === project.id ? (
                          <Chip 
                            label="Seçili" 
                            color="secondary"
                            size="small"
                            sx={{ 
                              fontWeight: 700,
                              background: 'linear-gradient(135deg, #9c27b0, #d85aff)',
                              boxShadow: '0 6px 10px rgba(156, 39, 176, 0.3)',
                              py: 0.5,
                              px: 1,
                              fontSize: '0.85rem',
                              color: '#ffffff',
                              height: 28,
                              borderRadius: 7
                            }}
                          />
                        ) : (
                          <Chip 
                            label="Seç" 
                            color="default"
                            size="small"
                            variant="outlined"
                            sx={{ 
                              fontWeight: 'bold',
                              borderWidth: 2,
                              borderRadius: 7,
                              bgcolor: 'rgba(255,255,255,0.9)',
                              border: '2px solid rgba(156, 39, 176, 0.3)',
                              color: '#9c27b0',
                              boxShadow: '0 3px 6px rgba(0,0,0,0.04)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                border: '2px solid #9c27b0',
                                boxShadow: '0 4px 8px rgba(156, 39, 176, 0.15)',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                bgcolor: 'rgba(156, 39, 176, 0.02)', 
                borderRadius: 3, 
                p: 5, 
                textAlign: 'center',
                border: '1px dashed rgba(156, 39, 176, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden',
                width: '100%',
                maxWidth: 600,
                mx: 'auto'
              }}>
                {/* Dekoratif elementler */}
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    top: '-40px', 
                    right: '-40px', 
                    width: '180px', 
                    height: '180px', 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(156, 39, 176, 0.06) 0%, rgba(156, 39, 176, 0) 70%)',
                    zIndex: 0
                  }}
                />
                <Box 
                  sx={{ 
                    position: 'absolute', 
                    bottom: '-30px', 
                    left: '-30px', 
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    background: 'radial-gradient(circle, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0) 65%)',
                    zIndex: 0
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(156, 39, 176, 0.08)',
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 3,
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.15)'
                    }}
                  >
                    <FolderIcon sx={{ fontSize: 40, color: '#9c27b0' }} />
                  </Avatar>
                  
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    gutterBottom
                    sx={{
                      background: 'linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Henüz Projeniz Bulunmuyor
                  </Typography>
                  <Typography variant="body1" color="#000000" fontWeight={500} mb={4} sx={{ 
                    maxWidth: 500, 
                    mx: 'auto',
                    textAlign: 'center',
                    lineHeight: 1.5
                  }}>
                    Proje oluşturarak ekip hiyerarşisi oluşturmaya başlayabilirsiniz.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/projects/create')}
                    sx={{ 
                      borderRadius: '10px',
                      py: 1.2,
                      px: 3,
                      background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                      boxShadow: '0 3px 6px rgba(156, 39, 176, .3)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)',
                        boxShadow: '0 4px 10px rgba(156, 39, 176, .45)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Proje Oluştur
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : selectedProjectId && projectTeam ? (
            <Box 
              sx={{ 
                bgcolor: '#f7f9ff', 
                p: { xs: 2, md: 4 }, 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: '1px solid rgba(156, 39, 176, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Dekoratif elementler */}
              <Box 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(156, 39, 176, 0.04) 0%, rgba(156, 39, 176, 0) 70%)',
                  transform: 'translate(30%, -30%)',
                  zIndex: 0
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  width: '200px', 
                  height: '200px', 
                  borderRadius: '50%', 
                  background: 'radial-gradient(circle, rgba(156, 39, 176, 0.04) 0%, rgba(156, 39, 176, 0) 70%)',
                  transform: 'translate(-30%, 30%)',
                  zIndex: 0
                }}
              />
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700, 
                      color: '#9c27b0',
                      display: 'flex', 
                      alignItems: 'center'
                    }}
                  >
                    <GroupIcon sx={{ mr: 2, fontSize: 30 }} />
                    {projectTeam.name}
                  </Typography>
                  <Chip 
                    label="Organizasyon Yapısı" 
                    color="secondary" 
                    sx={{ fontWeight: 700, color: '#000000' }} 
                  />
                </Box>
                <Divider sx={{ mb: 4 }} />
                
                {/* Hiyerarşi görünümü */}
                <TeamTree 
                  projectTeam={projectTeam}
                  onAddMember={handleAddMember}
                  onEditMember={handleEditMember}
                  onRemoveMember={handleRemoveMember}
                  onAddGroup={handleAddGroup}
                  onEditGroup={handleEditGroup}
                  onRemoveGroup={handleRemoveGroup}
                />
                
                <Box sx={{ mt: 5, mb: 3, display: 'flex', gap: 2 }}>
                  {user?.id === projectTeam.owner.id && (
                    <>
                      <Button 
                        variant="contained" 
                        color="secondary" 
                        sx={{ 
                          fontWeight: 600,
                          borderRadius: '8px',
                          background: 'linear-gradient(45deg, #9c27b0 30%, #bb86fc 90%)',
                          boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)',
                            boxShadow: '0 4px 8px 2px rgba(156, 39, 176, .4)'
                          }
                        }}
                        startIcon={<AddIcon />}
                        onClick={handleAddGroup}
                      >
                        Ekip Ekle
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        sx={{ 
                          fontWeight: 600,
                          borderRadius: '8px',
                          borderWidth: '1.5px',
                          borderColor: '#9c27b0',
                          color: '#9c27b0',
                          '&:hover': {
                            borderColor: '#7b1fa2',
                            backgroundColor: 'rgba(156, 39, 176, 0.04)',
                            boxShadow: '0 2px 6px rgba(156, 39, 176, 0.2)'
                          }
                        }}
                        startIcon={<AddIcon />}
                        onClick={handleAddMember}
                      >
                        Üye Ekle
                      </Button>
                    </>
                  )}
                </Box>
                <Typography variant="body2" color="#000000" fontWeight={500} textAlign="center">
                  * Bu sayfa şu an demo modunda çalışmaktadır. Gerçek veri entegrasyonu yakında eklenecektir.
                </Typography>
              </Box>
            </Box>
          ) : projects.length > 0 && !selectedProjectId ? (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%', 
                py: 3
            }}>
              <Alert 
                severity="info" 
                variant="outlined"
                icon={<InfoOutlinedIcon sx={{ color: '#9c27b0', fontSize: '1.5rem' }} />}
                sx={{ 
                  borderColor: 'rgba(156, 39, 176, 0.4)', 
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: '#9c27b0',
                  '& .MuiAlert-message': {
                    fontWeight: 600,
                    fontSize: '1rem',
                    textAlign: 'center',
                    color: '#9c27b0'
                  },
                  borderRadius: 3,
                  py: 2.5,
                  px: 3,
                  width: { xs: '100%', sm: '80%', md: '60%' },
                  mx: 'auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  animation: 'pulse 2s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)' },
                    '50%': { boxShadow: '0 4px 25px rgba(156, 39, 176, 0.2)' },
                    '100%': { boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)' }
                  }
                }}
              >
                Lütfen ekip organizasyonunu görüntülemek için bir proje seçin.
              </Alert>
            </Box>
          ) : projects.length === 0 ? (
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                width: '100%', 
                py: 3
            }}>
              <Alert 
                severity="info" 
                variant="outlined"
                icon={<InfoOutlinedIcon sx={{ color: '#9c27b0', fontSize: '1.5rem' }} />}
                sx={{ 
                  borderColor: 'rgba(156, 39, 176, 0.4)', 
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  color: '#9c27b0',
                  '& .MuiAlert-message': {
                    fontWeight: 600,
                    fontSize: '1rem',
                    textAlign: 'center',
                    color: '#9c27b0'
                  },
                  borderRadius: 3,
                  py: 2.5,
                  px: 3,
                  width: { xs: '100%', sm: '80%', md: '60%' },
                  mx: 'auto',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                  animation: 'pulse 2s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)' },
                    '50%': { boxShadow: '0 4px 25px rgba(156, 39, 176, 0.2)' },
                    '100%': { boxShadow: '0 4px 20px rgba(156, 39, 176, 0.1)' }
                  }
                }}
              >
                Lütfen ekip organizasyonunu görüntülemek için bir proje seçin.
              </Alert>
            </Box>
          ) : null}
        </Box>
      </Box>
      
      {/* Üye Ekle/Düzenle Diyaloğu */}
      <MemberDialog 
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        onSave={handleSaveMember}
        member={selectedMember}
        groups={projectTeam ? projectTeam.groups : []}
        title={selectedMember ? "Üye Düzenle" : "Yeni Üye Ekle"}
        isOwner={user?.id === (projectTeam?.owner?.id ?? '')}
      />
      
      {/* Ekip Ekle/Düzenle Diyaloğu */}
      <GroupDialog
        open={groupDialogOpen}
        onClose={() => setGroupDialogOpen(false)}
        onSave={handleSaveGroup}
        group={selectedGroup}
        title={selectedGroup ? "Ekip Düzenle" : "Yeni Ekip Ekle"}
      />
      
      {/* Onay Diyaloğu */}
      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          color: '#000000',
          borderBottom: '1px solid rgba(156, 39, 176, 0.2)',
          pb: 2
        }}>
          Silme İşlemini Onayla
        </DialogTitle>
        <DialogContent sx={{ mt: 2, py: 2, minWidth: { xs: 280, sm: 350 } }}>
          <Typography sx={{ fontWeight: 500, color: '#000000' }}>
            {deleteAction?.type === 'member' 
              ? 'Bu üyeyi silmek istediğinize emin misiniz?' 
              : 'Bu ekibi silmek istediğinize emin misiniz? Ekipteki üyeler genel katılımcılar listesine eklenecektir.'
            }
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ 
              fontWeight: 600,
              color: '#333333',
              borderRadius: 2
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            sx={{ 
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: '0 3px 8px rgba(244, 67, 54, 0.25)'
            }}
          >
            Sil
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirim */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          sx={{ 
            width: '100%',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            borderRadius: 2,
            fontWeight: 600,
            '& .MuiAlert-icon': { fontSize: '1.4rem' }
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeamPage; 