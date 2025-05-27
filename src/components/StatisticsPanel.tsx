import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Divider, 
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tab,
  Tabs
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import { Task, Project, User, Participant } from '../types';

interface StatisticsPanelProps {
  tasks: Task[];
  project?: Project;
  user?: User;
  participants?: Participant[];
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ tasks, project, user, participants }) => {
  const [tabValue, setTabValue] = React.useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Veri olmadığında gösterilecek durum
  if (!tasks || tasks.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" color="text.secondary">
          İstatistikler için henüz yeterli veri bulunmamaktadır
        </Typography>
      </Paper>
    );
  }

  // Görev sayımlarını hesapla
  const completedTasks = tasks.filter(task => task.status === 'tamamlandi').length;
  const inProgressTasks = tasks.filter(task => task.status === 'yapiliyor').length;
  const pendingTasks = tasks.filter(task => task.status === 'beklemede').length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Öncelik dağılımını hesapla
  const highPriorityTasks = tasks.filter(task => task.priority === 'yüksek').length;
  const normalPriorityTasks = tasks.filter(task => task.priority === 'normal').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'düşük').length;

  // Durum Dağılımı - Pie Chart için veri
  const statusData = [
    { name: 'Beklemede', value: pendingTasks, color: '#FFC107' },
    { name: 'Yapılıyor', value: inProgressTasks, color: '#2196F3' },
    { name: 'Tamamlandı', value: completedTasks, color: '#4CAF50' }
  ];

  // Öncelik Dağılımı - Bar Chart için veri
  const priorityData = [
    { name: 'Düşük', value: lowPriorityTasks, color: '#4CAF50' },
    { name: 'Normal', value: normalPriorityTasks, color: '#2196F3' },
    { name: 'Yüksek', value: highPriorityTasks, color: '#F44336' }
  ];

  // Son 7 gün için tarihler
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date,
      label: date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })
    };
  });

  // Son 7 günde tamamlanan görevler
  const weeklyCompletionData = last7Days.map(day => {
    const count = tasks.filter(task => {
      if (!task.updatedAt) return false;
      const taskDate = new Date(task.updatedAt);
      return task.status === 'tamamlandi' && 
        taskDate.getDate() === day.date.getDate() &&
        taskDate.getMonth() === day.date.getMonth() &&
        taskDate.getFullYear() === day.date.getFullYear();
    }).length;
    
    return {
      date: day.label,
      tamamlanan: count
    };
  });

  // En aktif kullanıcılar (en çok tamamlanan göreve sahip)
  const userCompletionMap: Record<string, { id: string, name: string, completed: number }> = {};
  
  tasks.forEach(task => {
    if (task.assignedTo && task.assignedTo.length > 0) {
      task.assignedTo.forEach(assigned => {
        const userId = assigned.user.id;
        const userName = assigned.user.name || 
          (participants?.find(p => p.userId === userId)?.userName || `Kullanıcı ${userId.substring(0, 4)}`);
        
        if (!userCompletionMap[userId]) {
          userCompletionMap[userId] = {
            id: userId,
            name: userName,
            completed: 0
          };
        }
        
        if (task.status === 'tamamlandi') {
          userCompletionMap[userId].completed += 1;
        }
      });
    }
  });
  
  const topUsers = Object.values(userCompletionMap)
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

  // Eğer user prop'u varsa, kullanıcı görevlerini hesapla
  let userTasks: Task[] = [];
  let userCompletedTasks = 0;
  let userInProgressTasks = 0;
  let userPendingTasks = 0;

  if (user) {
    userTasks = tasks.filter(task => 
      task.assignedTo?.some(assigned => assigned.user.id === user.id)
    );
    
    userCompletedTasks = userTasks.filter(task => task.status === 'tamamlandi').length;
    userInProgressTasks = userTasks.filter(task => task.status === 'yapiliyor').length;
    userPendingTasks = userTasks.filter(task => task.status === 'beklemede').length;
  }

  const userCompletionRate = userTasks.length > 0 ? (userCompletedTasks / userTasks.length) * 100 : 0;

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
          İstatistik Paneli
        </Typography>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              minHeight: '48px',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              py: 1,
              transition: 'all 0.3s ease',
              '&.Mui-selected': {
                color: 'primary.main'
              },
              '&:hover': {
                color: 'primary.main',
                opacity: 0.8,
                backgroundColor: 'rgba(156, 39, 176, 0.04)'
              }
            },
            '& .MuiTabs-indicator': {
              height: 4,
              borderRadius: '2px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }
          }}
        >
          <Tab label="Proje İstatistikleri" icon={<GroupIcon sx={{ mr: 1 }} />} iconPosition="start" />
          <Tab label="Kişisel İstatistikler" icon={<PersonIcon sx={{ mr: 1 }} />} iconPosition="start" />
        </Tabs>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      {tabValue === 0 ? (
        // Proje İstatistikleri
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Tamamlanma Oranı */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Görev Tamamlanma Oranı
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress 
                  variant="determinate" 
                  value={completionRate} 
                  size={140} 
                  thickness={5}
                  sx={{ color: '#4CAF50' }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    {`${Math.round(completionRate)}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                {completedTasks} / {totalTasks} görev tamamlandı
              </Typography>
            </Box>
          </Box>
          
          {/* Durum Dağılımı */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
            <Box sx={{ height: 200, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Görev Durumu Dağılımı
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} görev`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          
          {/* Öncelik Dağılımı */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
            <Box sx={{ height: 200, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Öncelik Dağılımı
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} görev`, '']} />
                  <Bar dataKey="value">
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          
          {/* Haftalık Tamamlanan Görevler */}
          <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
            <Box sx={{ height: 300, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Son 7 Günde Tamamlanan Görevler
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} görev`, 'Tamamlanan']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="tamamlanan" 
                    stroke="#4CAF50" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          
          {/* En Aktif Kullanıcılar */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                En Aktif Kullanıcılar
              </Typography>
              <List>
                {topUsers.length > 0 ? topUsers.map((user, index) => (
                  <ListItem key={user.id} sx={{ px: 1 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: `hsl(${index * 60}, 70%, 50%)` }}>
                        {user.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={user.name}
                      secondary={`${user.completed} görev tamamladı`}
                    />
                  </ListItem>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Henüz veri bulunmamaktadır
                  </Typography>
                )}
              </List>
            </Box>
          </Box>
        </Box>
      ) : (
        // Kişisel İstatistikler
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Kullanıcının Görev Tamamlanma Oranı */}
          <Box sx={{ width: { xs: '100%', md: 'calc(33.33% - 16px)' } }}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Kişisel Tamamlanma Oranı
              </Typography>
              {user ? (
                <>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress 
                      variant="determinate" 
                      value={userCompletionRate} 
                      size={140} 
                      thickness={5}
                      sx={{ color: '#7B1FA2' }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                        {`${Math.round(userCompletionRate)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    {userCompletedTasks} / {userTasks.length} görev tamamlandı
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Kullanıcı bilgisi mevcut değil
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Görevlerin Durumu */}
          <Box sx={{ width: { xs: '100%', md: 'calc(66.66% - 8px)' } }}>
            <Box sx={{ height: 200, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Görevlerimin Durumu
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[
                    { name: 'Beklemede', value: userPendingTasks },
                    { name: 'Yapılıyor', value: userInProgressTasks },
                    { name: 'Tamamlandı', value: userCompletedTasks }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8">
                    <Cell fill="#FFC107" />
                    <Cell fill="#2196F3" />
                    <Cell fill="#4CAF50" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
          
          {/* Kişisel Haftalık Performans */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{ height: 300, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, textAlign: 'center' }}>
                Haftalık Performans
              </Typography>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={last7Days.map(day => {
                    const completedCount = userTasks.filter(task => {
                      if (!task.updatedAt) return false;
                      const taskDate = new Date(task.updatedAt);
                      return task.status === 'tamamlandi' && 
                        taskDate.getDate() === day.date.getDate() &&
                        taskDate.getMonth() === day.date.getMonth() &&
                        taskDate.getFullYear() === day.date.getFullYear();
                    }).length;

                    const inProgressCount = userTasks.filter(task => {
                      if (!task.updatedAt) return false;
                      const taskDate = new Date(task.updatedAt);
                      return task.status === 'yapiliyor' && 
                        taskDate.getDate() === day.date.getDate() &&
                        taskDate.getMonth() === day.date.getMonth() &&
                        taskDate.getFullYear() === day.date.getFullYear();
                    }).length;
                    
                    return {
                      date: day.label,
                      tamamlanan: completedCount,
                      yapiliyor: inProgressCount
                    };
                  })}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="tamamlanan" stroke="#4CAF50" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="yapiliyor" stroke="#2196F3" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default StatisticsPanel; 