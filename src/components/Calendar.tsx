import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Popover,
  Fade
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  CloudDownload as CloudDownloadIcon,
  Add as AddIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { Task } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CalendarProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onNewTask?: (date: Date) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

// ICS dosyası oluşturmak için yardımcı fonksiyon
const createICSFile = (tasks: Task[]): string => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Görev Yöneticisi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  tasks.forEach(task => {
    const startDate = task.createdAt ? new Date(task.createdAt) : new Date();
    const endDate = task.deadline ? new Date(task.deadline) : new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // 1 saatlik süre varsayılan

    // ICS formatına uygun tarihler
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    icsContent.push('BEGIN:VEVENT');
    icsContent.push(`UID:task-${task.id}@gorevsistemi`);
    icsContent.push(`DTSTAMP:${formatDate(new Date())}`);
    icsContent.push(`DTSTART:${formatDate(startDate)}`);
    icsContent.push(`DTEND:${formatDate(endDate)}`);
    icsContent.push(`SUMMARY:${task.title}`);
    icsContent.push(`DESCRIPTION:${task.description || ''}`);
    
    // Öncelik bilgisi
    if (task.priority) {
      let priority = '5'; // Normal
      if (task.priority === 'high' || task.priority === 'yüksek') priority = '1';
      if (task.priority === 'low' || task.priority === 'düşük') priority = '9';
      icsContent.push(`PRIORITY:${priority}`);
    }

    // Kategoriler (etiketler)
    if (task.tags && task.tags.length > 0) {
      icsContent.push(`CATEGORIES:${task.tags.join(',')}`);
    }

    // Durum
    let status = 'NEEDS-ACTION';
    if (task.status === 'tamamlandi') status = 'COMPLETED';
    if (task.status === 'beklemede') status = 'IN-PROCESS';
    icsContent.push(`STATUS:${status}`);

    icsContent.push('END:VEVENT');
  });

  icsContent.push('END:VCALENDAR');
  return icsContent.join('\r\n');
};

// Görevleri ICS formatında indirme
const downloadTasksAsICS = (tasks: Task[], filename = 'gorevler.ics') => {
  const icsContent = createICSFile(tasks);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Calendar: React.FC<CalendarProps> = ({ tasks, onTaskClick, onNewTask }) => {
  const { mode } = useTheme();
  const isLightMode = mode === 'light';
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportPeriod, setExportPeriod] = useState('month');
  const [exportTasks, setExportTasks] = useState<Task[]>([]);
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // Generate array of years (current year +/- 10 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 21}, (_, i) => currentYear - 10 + i);
  
  // Months in Turkish
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  // Günleri Türkçe göster
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  // Open date picker
  const handleOpenDatePicker = (event: React.MouseEvent<HTMLElement>) => {
    setDatePickerAnchorEl(event.currentTarget);
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth());
  };
  
  // Close date picker
  const handleCloseDatePicker = () => {
    setDatePickerAnchorEl(null);
  };
  
  // Apply selected date
  const handleDatePickerApply = () => {
    const newDate = new Date();
    newDate.setFullYear(selectedYear);
    newDate.setMonth(selectedMonth);
    newDate.setDate(1); // First day of month
    setCurrentDate(newDate);
    handleCloseDatePicker();
  };
  
  // Takvim için günleri oluştur
  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Ayın ilk günü
    const firstDayOfMonth = new Date(year, month, 1);
    // Ayın son günü
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Haftanın hangi gününde başlıyor (0: Pazar, 1: Pazartesi, ..., 6: Cumartesi)
    // Türkiye'de hafta Pazartesi başladığı için, 0 yerine 1'den başlıyoruz
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Pazar günü ise
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    // Önceki ayın son günlerini ekle
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const date = new Date(year, month - 1, prevMonthDays - firstDayOfWeek + i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: tasks.filter(task => {
          const deadline = task.deadline ? new Date(task.deadline) : null;
          return deadline && 
                 deadline.getDate() === date.getDate() && 
                 deadline.getMonth() === date.getMonth() && 
                 deadline.getFullYear() === date.getFullYear();
        })
      });
    }
    
    // Mevcut ayın günlerini ekle
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: today.getDate() === i && 
                 today.getMonth() === month &&
                 today.getFullYear() === year,
        tasks: tasks.filter(task => {
          const deadline = task.deadline ? new Date(task.deadline) : null;
          return deadline && 
                 deadline.getDate() === i && 
                 deadline.getMonth() === month && 
                 deadline.getFullYear() === year;
        })
      });
    }
    
    // Gelecek ayın ilk günlerini ekle
    const daysNeeded = 42 - days.length; // 6 satır x 7 gün = 42 günlük takvim
    for (let i = 1; i <= daysNeeded; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        tasks: tasks.filter(task => {
          const deadline = task.deadline ? new Date(task.deadline) : null;
          return deadline && 
                 deadline.getDate() === i && 
                 deadline.getMonth() === date.getMonth() && 
                 deadline.getFullYear() === date.getFullYear();
        })
      });
    }
    
    setCalendarDays(days);
  }, [currentDate, tasks]);
  
  // Önceki aya git
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };
  
  // Sonraki aya git
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };
  
  // Bugüne git
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Dışa aktarma işlemini başlat
  const handleExport = () => {
    setExportDialogOpen(true);
    // Varsayılan olarak mevcut ayın görevlerini seç
    const currentMonthTasks = tasks.filter(task => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return taskDate.getMonth() === currentDate.getMonth() && 
             taskDate.getFullYear() === currentDate.getFullYear();
    });
    setExportTasks(currentMonthTasks);
  };
  
  // Dışa aktarma dönemini değiştir
  const handleExportPeriodChange = (event: SelectChangeEvent<string>) => {
    const period = event.target.value;
    setExportPeriod(period);
    
    // Seçilen döneme göre görevleri filtrele
    let filteredTasks: Task[] = [];
    const now = new Date();
    
    switch (period) {
      case 'all':
        filteredTasks = [...tasks];
        break;
      case 'month':
        filteredTasks = tasks.filter(task => {
          if (!task.deadline) return false;
          const taskDate = new Date(task.deadline);
          return taskDate.getMonth() === currentDate.getMonth() && 
                 taskDate.getFullYear() === currentDate.getFullYear();
        });
        break;
      case 'week':
        const today = now.getDate();
        const dayOfWeek = now.getDay() || 7; // 0 (Pazar) yerine 7 kullan
        const startOfWeek = new Date(now.setDate(today - dayOfWeek + 1));
        const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
        
        filteredTasks = tasks.filter(task => {
          if (!task.deadline) return false;
          const taskDate = new Date(task.deadline);
          return taskDate >= startOfWeek && taskDate <= endOfWeek;
        });
        break;
      case 'day':
        filteredTasks = tasks.filter(task => {
          if (!task.deadline) return false;
          const taskDate = new Date(task.deadline);
          return taskDate.getDate() === now.getDate() && 
                 taskDate.getMonth() === now.getMonth() && 
                 taskDate.getFullYear() === now.getFullYear();
        });
        break;
    }
    
    setExportTasks(filteredTasks);
  };
  
  // Dışa aktarma işlemini tamamla
  const handleExportConfirm = () => {
    downloadTasksAsICS(exportTasks);
    setExportDialogOpen(false);
  };
  
  // Statüse göre görevin rengini belirle
  const getTaskColor = (task: Task) => {
    switch (task.status) {
      case 'tamamlandi':
        return isLightMode ? '#4caf50' : '#81c784';
      case 'beklemede':
        return isLightMode ? '#ff9800' : '#ffb74d';
      default:
        return isLightMode ? '#2196f3' : '#64b5f6';
    }
  };
  
  // Önceliğe göre görevin rengini belirle
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'yüksek':
        return isLightMode ? '#f44336' : '#e57373';
      case 'düşük':
        return isLightMode ? '#8bc34a' : '#aed581';
      default:
        return isLightMode ? '#9e9e9e' : '#e0e0e0';
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Takvim Başlığı ve Kontroller */}
      <Paper 
        elevation={isLightMode ? 1 : 3}
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isLightMode ? 'white' : 'background.paper',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={goToPreviousMonth} 
            size="small"
            sx={{
              backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              '&:hover': {
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'
              }
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <Box
            onClick={handleOpenDatePicker}
            sx={{ 
              display: 'inline-flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              '&:hover': {
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center', fontWeight: 'medium' }}>
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Typography>
            <CalendarIcon fontSize="small" sx={{ ml: 1, color: isLightMode ? 'action.active' : 'text.secondary' }} />
          </Box>
          <IconButton 
            onClick={goToNextMonth} 
            size="small"
            sx={{
              backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              '&:hover': {
                backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)'
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
          <Tooltip title="Bugüne Git">
            <IconButton 
              onClick={goToToday} 
              size="small" 
              sx={{ 
                ml: 1,
                backgroundColor: isLightMode ? 'rgba(63, 81, 181, 0.08)' : 'rgba(63, 81, 181, 0.15)',
                color: isLightMode ? '#3f51b5' : '#7986cb',
                '&:hover': {
                  backgroundColor: isLightMode ? 'rgba(63, 81, 181, 0.15)' : 'rgba(63, 81, 181, 0.25)'
                }
              }}
            >
              <TodayIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Box>
          <Button 
            variant="contained" 
            startIcon={<CloudDownloadIcon />}
            onClick={handleExport}
            color="primary"
            sx={{ 
              mr: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 3
              }
            }}
          >
            Dışa Aktar
          </Button>
        </Box>
      </Paper>
      
      {/* Date Picker Popover */}
      <Popover
        open={Boolean(datePickerAnchorEl)}
        anchorEl={datePickerAnchorEl}
        onClose={handleCloseDatePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        TransitionComponent={Fade}
      >
        <Paper sx={{ p: 3, width: 320 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
            Tarih Seçin
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="month-select-label">Ay</InputLabel>
              <Select
                labelId="month-select-label"
                id="month-select"
                value={selectedMonth.toString()}
                label="Ay"
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {months.map((month: string, index: number) => (
                  <MenuItem key={index} value={index}>
                    {month}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel id="year-select-label">Yıl</InputLabel>
              <Select
                labelId="year-select-label"
                id="year-select"
                value={selectedYear.toString()}
                label="Yıl"
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {years.map((year: number) => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={handleCloseDatePicker} color="inherit" size="small">
              İptal
            </Button>
            <Button 
              onClick={handleDatePickerApply} 
              variant="contained" 
              color="primary"
              size="small"
            >
              Uygula
            </Button>
          </Box>
        </Paper>
      </Popover>
      
      {/* Hafta Günleri */}
      <Grid container spacing={1} sx={{ mb: 1 }}>
        {weekDays.map((day: string, index: number) => (
          <Grid key={index} size={12/7}>
            <Paper 
              sx={{ 
                p: 1, 
                textAlign: 'center',
                backgroundColor: isLightMode ? '#e0e0e0' : 'rgba(255, 255, 255, 0.12)',
                fontWeight: 'bold',
                borderRadius: 1,
                color: isLightMode ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.9)'
              }}
            >
              {day}
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Takvim Günleri */}
      <Grid container spacing={1}>
        {calendarDays.map((day: CalendarDay, index: number) => (
          <Grid key={index} size={12/7}>
            <Paper 
              elevation={day.isToday ? 6 : 1}
              sx={{ 
                p: 1, 
                height: 120, 
                overflow: 'auto',
                backgroundColor: day.isToday 
                  ? (isLightMode ? 'rgba(63, 81, 181, 0.15)' : 'rgba(63, 81, 181, 0.25)') 
                  : day.isCurrentMonth 
                    ? (isLightMode ? 'white' : 'background.paper')  
                    : (isLightMode ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.02)'),
                border: day.isToday ? `2px solid ${isLightMode ? '#3f51b5' : '#7986cb'}` : 'none',
                position: 'relative',
                '&:hover .add-button': {
                  opacity: 1
                },
                borderRadius: 2
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography 
                  variant={day.isToday ? "subtitle2" : "body2"}
                  sx={{ 
                    fontWeight: day.isToday ? 'bold' : day.isCurrentMonth ? 'medium' : 'light',
                    color: day.isToday
                      ? (isLightMode ? '#1a237e' : '#c5cae9')
                      : day.isCurrentMonth 
                        ? (isLightMode ? 'text.primary' : 'text.primary') 
                        : (isLightMode ? 'text.disabled' : 'text.disabled'),
                    fontSize: day.isToday ? '0.95rem' : '0.875rem'
                  }}
                >
                  {day.date.getDate()}
                </Typography>
                
                {/* Yeni görev ekleme butonu */}
                {onNewTask && (
                  <IconButton 
                    size="small" 
                    className="add-button"
                    onClick={() => onNewTask(day.date)}
                    sx={{ 
                      width: 22, 
                      height: 22, 
                      opacity: 0, 
                      transition: 'opacity 0.2s',
                      backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.2)'
                      }
                    }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              
              {/* Gün için görevler */}
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 0.5 
              }}>
                {day.tasks.slice(0, 3).map((task: Task) => (
                  <Tooltip 
                    key={task.id} 
                    title={
                      <>
                        <Typography variant="subtitle2">{task.title}</Typography>
                        {task.deadline && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: 'bold' }}>
                            Son Tarih: {new Date(task.deadline).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {task.description 
                            ? (task.description.length > 100 
                                ? task.description.substring(0, 97) + '...' 
                                : task.description)
                            : ''
                          }
                        </Typography>
                        {task.priority && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            Öncelik: {task.priority}
                          </Typography>
                        )}
                      </>
                    }
                    placement="top"
                    arrow
                  >
                    <Chip 
                      label={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {task.title.length > 15 ? task.title.substring(0, 12) + '...' : task.title}
                          </Typography>
                          {task.deadline && (
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', ml: 0.5, opacity: 0.9 }}>
                              {new Date(task.deadline).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                            </Typography>
                          )}
                        </Box>
                      }
                      size="small"
                      onClick={() => onTaskClick(task.id)}
                      sx={{ 
                        backgroundColor: getTaskColor(task),
                        color: 'white',
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 'auto',
                        py: 0.5,
                        '&:hover': {
                          boxShadow: `0 1px 4px ${isLightMode ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.5)'}`
                        }
                      }}
                    />
                  </Tooltip>
                ))}
                {day.tasks.length > 3 && (
                  <Chip 
                    label={`+${day.tasks.length - 3} daha`}
                    size="small"
                    variant="outlined"
                    onClick={() => {}}
                    sx={{ 
                      width: '100%',
                      justifyContent: 'center',
                      borderColor: isLightMode ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
                    }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      
      {/* Dışa Aktarma Diyaloğu */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Görevleri Takvime Aktar</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" paragraph>
            Görevlerinizi ICS formatında dışa aktararak takvim uygulamanıza (Google Calendar, Apple Calendar, Outlook vb.) ekleyebilirsiniz.
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="export-period-label">Dışa Aktarılacak Dönem</InputLabel>
            <Select
              labelId="export-period-label"
              value={exportPeriod}
              label="Dışa Aktarılacak Dönem"
              onChange={handleExportPeriodChange}
            >
              <MenuItem value="all">Tüm Görevler</MenuItem>
              <MenuItem value="month">Bu Ay</MenuItem>
              <MenuItem value="week">Bu Hafta</MenuItem>
              <MenuItem value="day">Bugün</MenuItem>
            </Select>
          </FormControl>
          
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
            Dışa aktarılacak görev sayısı: <strong>{exportTasks.length}</strong>
          </Typography>
          
          {exportTasks.length > 0 ? (
            <Box sx={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 1
            }}>
              {exportTasks.map((task: Task) => (
                <Box 
                  key={task.id} 
                  sx={{ 
                    p: 1, 
                    mb: 0.5, 
                    borderLeft: '3px solid', 
                    borderLeftColor: getTaskColor(task),
                    backgroundColor: isLightMode ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '0 4px 4px 0'
                  }}
                >
                  <Typography variant="subtitle2">{task.title}</Typography>
                  {task.deadline && (
                    <Typography variant="caption" color="text.secondary">
                      Son Tarih: {new Date(task.deadline).toLocaleDateString('tr-TR')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Seçilen dönemde dışa aktarılacak görev bulunamadı.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleExportConfirm}
            variant="contained"
            disabled={exportTasks.length === 0}
          >
            İndir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Calendar; 