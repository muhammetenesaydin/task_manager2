import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Avatar,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Autocomplete,
  Tooltip,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import BusinessIcon from '@mui/icons-material/Business';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Tip tanımlamaları
interface Employee {
  id: string;
  name: string;
  surname: string;
  email: string;
  position: string;
  department: string;
  managerId?: string;
  isRegistered: boolean; // Sistemde kayıtlı bir kullanıcı mı?
  userId?: string; // Kayıtlı ise, kullanıcı ID'si
}

interface Department {
  id: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  employees: string[]; // Çalışan ID listesi
}

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  surname?: string;
}

// Mock API servis fonksiyonları
const mockHierarchyService = {
  getEmployees: async (): Promise<Employee[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'e1', name: 'Ahmet', surname: 'Yılmaz', email: 'ahmet@example.com', position: 'CEO', department: 'Yönetim', isRegistered: true, userId: 'u1' },
          { id: 'e2', name: 'Ayşe', surname: 'Demir', email: 'ayse@example.com', position: 'CTO', department: 'Teknoloji', managerId: 'e1', isRegistered: true, userId: 'u2' },
          { id: 'e3', name: 'Mehmet', surname: 'Can', email: 'mehmet@example.com', position: 'CFO', department: 'Finans', managerId: 'e1', isRegistered: true, userId: 'u3' },
          { id: 'e4', name: 'Zeynep', surname: 'Şahin', email: 'zeynep@example.com', position: 'Lead Developer', department: 'Teknoloji', managerId: 'e2', isRegistered: true, userId: 'u5' },
          { id: 'e5', name: 'Mustafa', surname: 'Demir', email: 'mustafa@example.com', position: 'UI/UX Designer', department: 'Teknoloji', managerId: 'e2', isRegistered: false },
          { id: 'e6', name: 'Elif', surname: 'Yıldız', email: 'elif@example.com', position: 'Finans Uzmanı', department: 'Finans', managerId: 'e3', isRegistered: false }
        ]);
      }, 800);
    });
  },
  
  getDepartments: async (): Promise<Department[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'd1', name: 'Yönetim', description: 'Şirket yönetimi', managerId: 'e1', employees: ['e1'] },
          { id: 'd2', name: 'Teknoloji', description: 'Yazılım ve teknoloji ekibi', managerId: 'e2', parentDepartmentId: 'd1', employees: ['e2', 'e4', 'e5'] },
          { id: 'd3', name: 'Finans', description: 'Finans ve muhasebe ekibi', managerId: 'e3', parentDepartmentId: 'd1', employees: ['e3', 'e6'] }
        ]);
      }, 600);
    });
  },
  
  getRegisteredUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'u1', username: 'ahmetyilmaz', email: 'ahmet@example.com', name: 'Ahmet', surname: 'Yılmaz' },
          { id: 'u2', username: 'aysedemir', email: 'ayse@example.com', name: 'Ayşe', surname: 'Demir' },
          { id: 'u3', username: 'mehmetcan', email: 'mehmet@example.com', name: 'Mehmet', surname: 'Can' },
          { id: 'u4', username: 'aliyildirim', email: 'ali@example.com', name: 'Ali', surname: 'Yıldırım' },
          { id: 'u5', username: 'zeynepsahin', email: 'zeynep@example.com', name: 'Zeynep', surname: 'Şahin' },
          { id: 'u6', username: 'canozturk', email: 'can@example.com', name: 'Can', surname: 'Öztürk' }
        ]);
      }, 600);
    });
  },
  
  createEmployee: async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = `e${Math.random().toString(36).substring(2, 5)}`;
        resolve({
          id: newId,
          ...employee
        });
      }, 800);
    });
  },
  
  updateEmployee: async (id: string, employee: Partial<Employee>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Çalışan güncellendi:', id, employee);
        resolve(true);
      }, 800);
    });
  },
  
  deleteEmployee: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Çalışan silindi:', id);
        resolve(true);
      }, 800);
    });
  },
  
  createDepartment: async (department: Omit<Department, 'id'>): Promise<Department> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = `d${Math.random().toString(36).substring(2, 5)}`;
        resolve({
          id: newId,
          ...department
        });
      }, 800);
    });
  },
  
  updateDepartment: async (id: string, department: Partial<Department>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Departman güncellendi:', id, department);
        resolve(true);
      }, 800);
    });
  },
  
  deleteDepartment: async (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Departman silindi:', id);
        resolve(true);
      }, 800);
    });
  }
};

// Özel Departman Ağaç Öğesi bileşeni
interface DepartmentTreeItemProps {
  department: Department;
  departments: Department[];
  employees: Employee[];
  onEditDepartment: (department: Department) => void;
  onDeleteDepartment: (department: Department) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
}

const DepartmentTreeItem: React.FC<DepartmentTreeItemProps> = ({
  department,
  departments,
  employees,
  onEditDepartment,
  onDeleteDepartment,
  onEditEmployee,
  onDeleteEmployee
}) => {
  const [expanded, setExpanded] = useState(false);
  
  // Alt departmanları bul
  const childDepartments = departments.filter(dept => dept.parentDepartmentId === department.id);
  
  // Departman çalışanlarını bul
  const departmentEmployees = employees.filter(emp => department.employees.includes(emp.id));
  
  const handleToggle = () => {
    setExpanded(!expanded);
  };
  
  return (
    <Box sx={{ mb: 1 }}>
      <Paper sx={{ mb: 0.5 }}>
        <ListItem 
          button
          onClick={handleToggle}
          sx={{ 
            borderLeft: '4px solid',
            borderColor: 'primary.main',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>
            <BusinessIcon color="primary" />
          </ListItemIcon>
          <ListItemText primary={department.name} />
          
          <Tooltip title="Düzenle">
            <IconButton 
              size="small" 
              onClick={(e) => { 
                e.stopPropagation();
                onEditDepartment(department);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Sil">
            <IconButton 
              size="small" 
              color="error"
              onClick={(e) => { 
                e.stopPropagation();
                onDeleteDepartment(department);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </ListItem>
      </Paper>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4 }}>
          {/* Departman çalışanları */}
          {departmentEmployees.length > 0 && (
            <List component="div" disablePadding>
              {departmentEmployees.map(employee => (
                <ListItem 
                  key={employee.id}
                  sx={{ 
                    py: 0.5,
                    borderLeft: '2px solid',
                    borderColor: 'grey.300',
                    mb: 0.5
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <PersonIcon color="action" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${employee.name} ${employee.surname}`}
                    secondary={employee.position}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  
                  <Tooltip title="Düzenle">
                    <IconButton 
                      size="small" 
                      onClick={() => onEditEmployee(employee)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  
                  <Tooltip title="Sil">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onDeleteEmployee(employee)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          )}
          
          {/* Alt departmanlar */}
          {childDepartments.map(childDept => (
            <DepartmentTreeItem
              key={childDept.id}
              department={childDept}
              departments={departments}
              employees={employees}
              onEditDepartment={onEditDepartment}
              onDeleteDepartment={onDeleteDepartment}
              onEditEmployee={onEditEmployee}
              onDeleteEmployee={onDeleteEmployee}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

// Şirket hiyerarşisi bileşeni
export const CompanyHierarchy: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog durumları
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState<boolean>(false);
  const [departmentDialogOpen, setDepartmentDialogOpen] = useState<boolean>(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState<boolean>(false);
  
  // Form verileri
  const [formEmployeeData, setFormEmployeeData] = useState<{
    name: string;
    surname: string;
    email: string;
    position: string;
    department: string;
    managerId?: string;
    isRegistered: boolean;
    userId?: string;
  }>({
    name: '',
    surname: '',
    email: '',
    position: '',
    department: '',
    managerId: undefined,
    isRegistered: false,
    userId: undefined
  });
  
  const [formDepartmentData, setFormDepartmentData] = useState<{
    name: string;
    description: string;
    managerId?: string;
    parentDepartmentId?: string;
  }>({
    name: '',
    description: '',
    managerId: undefined,
    parentDepartmentId: undefined
  });
  
  // İlk yüklemede verileri getir
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [employeeData, departmentData, userData] = await Promise.all([
          mockHierarchyService.getEmployees(),
          mockHierarchyService.getDepartments(),
          mockHierarchyService.getRegisteredUsers()
        ]);
        
        setEmployees(employeeData);
        setDepartments(departmentData);
        setRegisteredUsers(userData);
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Form değişikliklerini işle
  const handleEmployeeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormEmployeeData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDepartmentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDepartmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Select değişikliklerini işle
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name === 'department' || name === 'managerId') {
      setFormEmployeeData(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    } else if (name === 'parentDepartmentId' || name === 'managerId') {
      setFormDepartmentData(prev => ({
        ...prev,
        [name]: value || undefined
      }));
    }
  };
  
  // Kayıtlı kullanıcı değişikliğini işle
  const handleRegisteredUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isRegistered = e.target.checked;
    setFormEmployeeData(prev => ({
      ...prev,
      isRegistered,
      userId: isRegistered ? prev.userId : undefined
    }));
  };
  
  // Kayıtlı kullanıcı seçimini işle
  const handleUserSelect = (_event: React.SyntheticEvent, user: User | null) => {
    setFormEmployeeData(prev => ({
      ...prev,
      userId: user?.id,
      name: user?.name || prev.name,
      surname: user?.surname || prev.surname,
      email: user?.email || prev.email
    }));
  };
  
  // Yeni çalışan ekle
  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormEmployeeData({
      name: '',
      surname: '',
      email: '',
      position: '',
      department: departments.length > 0 ? departments[0].id : '',
      managerId: undefined,
      isRegistered: false,
      userId: undefined
    });
    setEmployeeDialogOpen(true);
  };
  
  // Çalışanı düzenle
  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormEmployeeData({
      name: employee.name,
      surname: employee.surname,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      managerId: employee.managerId,
      isRegistered: employee.isRegistered,
      userId: employee.userId
    });
    setEmployeeDialogOpen(true);
  };
  
  // Çalışanı sil
  const handleDeleteEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDeleteConfirmDialogOpen(true);
  };
  
  // Yeni departman ekle
  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setFormDepartmentData({
      name: '',
      description: '',
      managerId: undefined,
      parentDepartmentId: undefined
    });
    setDepartmentDialogOpen(true);
  };
  
  // Departmanı düzenle
  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setFormDepartmentData({
      name: department.name,
      description: department.description || '',
      managerId: department.managerId,
      parentDepartmentId: department.parentDepartmentId
    });
    setDepartmentDialogOpen(true);
  };
  
  // Departmanı sil
  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteConfirmDialogOpen(true);
  };
  
  // Çalışan kaydet
  const handleSaveEmployee = async () => {
    try {
      setSaving(true);
      
      if (selectedEmployee) {
        // Mevcut çalışanı güncelle
        const isSuccess = await mockHierarchyService.updateEmployee(
          selectedEmployee.id, 
          formEmployeeData
        );
        
        if (isSuccess) {
          setEmployees(prev => 
            prev.map(emp => 
              emp.id === selectedEmployee.id
                ? { ...emp, ...formEmployeeData }
                : emp
            )
          );
          
          setSuccess('Çalışan başarıyla güncellendi');
        }
      } else {
        // Yeni çalışan oluştur
        const newEmployee = await mockHierarchyService.createEmployee(
          formEmployeeData as Omit<Employee, 'id'>
        );
        
        setEmployees(prev => [...prev, newEmployee]);
        
        // Departman çalışanlarını güncelle
        const departmentId = formEmployeeData.department;
        if (departmentId) {
          setDepartments(prev => 
            prev.map(dept => 
              dept.id === departmentId
                ? { ...dept, employees: [...dept.employees, newEmployee.id] }
                : dept
            )
          );
        }
        
        setSuccess('Yeni çalışan başarıyla eklendi');
      }
      
      setEmployeeDialogOpen(false);
    } catch (err) {
      setError('Çalışan kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Departman kaydet
  const handleSaveDepartment = async () => {
    try {
      setSaving(true);
      
      if (selectedDepartment) {
        // Mevcut departmanı güncelle
        const isSuccess = await mockHierarchyService.updateDepartment(
          selectedDepartment.id, 
          formDepartmentData
        );
        
        if (isSuccess) {
          setDepartments(prev => 
            prev.map(dept => 
              dept.id === selectedDepartment.id
                ? { 
                    ...dept, 
                    name: formDepartmentData.name,
                    description: formDepartmentData.description,
                    managerId: formDepartmentData.managerId,
                    parentDepartmentId: formDepartmentData.parentDepartmentId
                  }
                : dept
            )
          );
          
          setSuccess('Departman başarıyla güncellendi');
        }
      } else {
        // Yeni departman oluştur
        const newDepartment = await mockHierarchyService.createDepartment({
          name: formDepartmentData.name,
          description: formDepartmentData.description,
          managerId: formDepartmentData.managerId,
          parentDepartmentId: formDepartmentData.parentDepartmentId,
          employees: []
        });
        
        setDepartments(prev => [...prev, newDepartment]);
        setSuccess('Yeni departman başarıyla oluşturuldu');
      }
      
      setDepartmentDialogOpen(false);
    } catch (err) {
      setError('Departman kaydedilirken bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Silme işlemini onayla
  const handleConfirmDelete = async () => {
    try {
      setSaving(true);
      
      if (selectedEmployee) {
        // Çalışanı sil
        const isSuccess = await mockHierarchyService.deleteEmployee(selectedEmployee.id);
        
        if (isSuccess) {
          setEmployees(prev => prev.filter(emp => emp.id !== selectedEmployee.id));
          
          // Departmandan da çalışanı kaldır
          setDepartments(prev => 
            prev.map(dept => 
              dept.employees.includes(selectedEmployee.id)
                ? { ...dept, employees: dept.employees.filter(id => id !== selectedEmployee.id) }
                : dept
            )
          );
          
          setSuccess('Çalışan başarıyla silindi');
        }
      } else if (selectedDepartment) {
        // Departmanı sil
        const isSuccess = await mockHierarchyService.deleteDepartment(selectedDepartment.id);
        
        if (isSuccess) {
          setDepartments(prev => prev.filter(dept => dept.id !== selectedDepartment.id));
          setSuccess('Departman başarıyla silindi');
        }
      }
      
      setDeleteConfirmDialogOpen(false);
    } catch (err) {
      setError('Silme işlemi sırasında bir hata oluştu');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  
  // Snackbar kapatma
  const handleCloseSnackbar = () => {
    setSuccess(null);
    setError(null);
  };
  
  // Departman ağacını oluştur
  const renderDepartmentTree = () => {
    // Kök departmanları bul
    const rootDepartments = departments.filter(dept => !dept.parentDepartmentId);
    
    return (
      <List component="div" sx={{ width: '100%' }}>
        {rootDepartments.map(dept => (
          <DepartmentTreeItem 
            key={dept.id}
            department={dept}
            departments={departments}
            employees={employees}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        ))}
      </List>
    );
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Şirket Hiyerarşisi
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />} 
            onClick={handleAddDepartment}
            sx={{ mr: 2 }}
          >
            Yeni Departman
          </Button>
          <Button 
            variant="contained" 
            color="secondary" 
            startIcon={<AddIcon />} 
            onClick={handleAddEmployee}
          >
            Yeni Çalışan
          </Button>
        </Box>
      </Box>
      <Divider sx={{ mb: 3 }} />
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Organizasyon Şeması
        </Typography>
        <Box sx={{ mt: 2, minHeight: 400 }}>
          {departments.length > 0 ? (
            renderDepartmentTree()
          ) : (
            <Typography align="center" sx={{ mt: 4 }}>
              Henüz bir departman oluşturulmamış.
            </Typography>
          )}
        </Box>
      </Paper>
      
      {/* Çalışan Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={employeeDialogOpen} 
        onClose={() => setEmployeeDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {selectedEmployee ? 'Çalışan Düzenle' : 'Yeni Çalışan Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formEmployeeData.isRegistered}
                    onChange={handleRegisteredUserChange}
                    name="isRegistered"
                  />
                }
                label="Kayıtlı Kullanıcı"
              />
            </Grid>
            
            {formEmployeeData.isRegistered ? (
              <Grid item xs={12}>
                <Autocomplete
                  options={registeredUsers}
                  getOptionLabel={(option) => `${option.name} ${option.surname} (${option.email})`}
                  value={registeredUsers.find(u => u.id === formEmployeeData.userId) || null}
                  onChange={handleUserSelect}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kayıtlı Kullanıcı Seçin"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            ) : null}
            
            <Grid item xs={12} md={6}>
              <TextField
                name="name"
                label="Ad"
                fullWidth
                value={formEmployeeData.name}
                onChange={handleEmployeeFormChange}
                disabled={formEmployeeData.isRegistered && !!formEmployeeData.userId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="surname"
                label="Soyad"
                fullWidth
                value={formEmployeeData.surname}
                onChange={handleEmployeeFormChange}
                disabled={formEmployeeData.isRegistered && !!formEmployeeData.userId}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="E-posta"
                fullWidth
                value={formEmployeeData.email}
                onChange={handleEmployeeFormChange}
                disabled={formEmployeeData.isRegistered && !!formEmployeeData.userId}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="position"
                label="Pozisyon"
                fullWidth
                value={formEmployeeData.position}
                onChange={handleEmployeeFormChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="department-label">Departman</InputLabel>
                <Select
                  labelId="department-label"
                  id="department-select"
                  name="department"
                  value={formEmployeeData.department}
                  label="Departman"
                  onChange={handleSelectChange}
                >
                  {departments.map(dept => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="manager-label">Yönetici</InputLabel>
                <Select
                  labelId="manager-label"
                  id="manager-select"
                  name="managerId"
                  value={formEmployeeData.managerId || ''}
                  label="Yönetici"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>Yönetici Yok</em>
                  </MenuItem>
                  {employees.filter(emp => emp.id !== selectedEmployee?.id).map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} {emp.surname} - {emp.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmployeeDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveEmployee} 
            variant="contained" 
            disabled={saving || !formEmployeeData.name || !formEmployeeData.surname || !formEmployeeData.email || !formEmployeeData.position || !formEmployeeData.department}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Departman Ekleme/Düzenleme Dialog */}
      <Dialog 
        open={departmentDialogOpen} 
        onClose={() => setDepartmentDialogOpen(false)}
        fullWidth
      >
        <DialogTitle>
          {selectedDepartment ? 'Departman Düzenle' : 'Yeni Departman Ekle'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Departman Adı"
                fullWidth
                value={formDepartmentData.name}
                onChange={handleDepartmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Açıklama"
                fullWidth
                multiline
                rows={2}
                value={formDepartmentData.description}
                onChange={handleDepartmentFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="parent-department-label">Üst Departman</InputLabel>
                <Select
                  labelId="parent-department-label"
                  id="parent-department-select"
                  name="parentDepartmentId"
                  value={formDepartmentData.parentDepartmentId || ''}
                  label="Üst Departman"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>Üst Departman Yok</em>
                  </MenuItem>
                  {departments
                    .filter(dept => dept.id !== selectedDepartment?.id)
                    .map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="dept-manager-label">Departman Yöneticisi</InputLabel>
                <Select
                  labelId="dept-manager-label"
                  id="dept-manager-select"
                  name="managerId"
                  value={formDepartmentData.managerId || ''}
                  label="Departman Yöneticisi"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">
                    <em>Yönetici Seçilmedi</em>
                  </MenuItem>
                  {employees.map(emp => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} {emp.surname} - {emp.position}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepartmentDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleSaveDepartment} 
            variant="contained" 
            disabled={saving || !formDepartmentData.name}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Silme Onay Dialog */}
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>Silme İşlemi</DialogTitle>
        <DialogContent>
          {selectedEmployee ? (
            <Typography>
              <strong>{selectedEmployee.name} {selectedEmployee.surname}</strong> adlı çalışanı silmek istediğinize emin misiniz?
            </Typography>
          ) : selectedDepartment ? (
            <Typography>
              <strong>{selectedDepartment.name}</strong> departmanını silmek istediğinize emin misiniz?
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>İptal</Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={saving}
          >
            {saving ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Bildirimler */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 