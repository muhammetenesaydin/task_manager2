import axios from 'axios';
import { Task, Project } from '../types';

// API temel URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// JWT token'ını localStorage veya sessionStorage'dan alma
const getToken = () => {
  try {
    // Önce localStorage'a bak (kalıcı oturum)
    let token = localStorage.getItem('token');
    
    // localStorage'da yoksa sessionStorage'a bak (geçici oturum)
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    // Token varsa format kontrolü yap
    if (token) {
      // JWT formatı: xxxxx.yyyyy.zzzzz
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Geçersiz token formatı, token temizleniyor');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        return null;
      }
      
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Token alınırken hata oluştu:', error);
    return null;
  }
};

// Axios instance oluşturma
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // 10 saniyeden 8 saniyeye düşürülüyor
});

// İstek için Authorization header'ını ayarlama
api.interceptors.request.use(
  (config) => {
    try {
      const token = getToken();
      
      // İstisna olmadığı ve ayarlanmış config.headers olduğu sürece devam et
      if (config.headers) {
        if (token) {
          // Token'ı ekleyelim
          config.headers['Authorization'] = `Bearer ${token}`;
          
          // Bazı özel endpoint'lerde log yazmayalım (sağlık kontrolü gibi)
          if (!config.url?.includes('/health')) {
            console.log(`API isteği gönderiliyor (${config.method?.toUpperCase()}): ${config.url}`);
          }
        } else {
          // Token bulunamadıysa Authorization headerını temizle
          delete config.headers['Authorization'];
          
          // Sadece yetkili endpoint'lerde uyarı ver
          if (!config.url?.includes('/auth/login') && 
              !config.url?.includes('/auth/register') && 
              !config.url?.includes('/health')) {
            console.warn(`API isteği için token bulunamadı (${config.method?.toUpperCase()}): ${config.url}`);
          }
        }
      }
      
      return config;
    } catch (error) {
      console.error('API isteği yapılırken hata:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Herhangi bir hata durumunda kullanıcı dostu hata gösterimi
api.interceptors.response.use(
  response => {
    // Sağlık kontrolü için logları gösterme
    if (!response.config.url?.includes('/health')) {
      // Başarılı yanıtları sadece önemli durumlarda logla
      if (response.config.method !== 'get') {
        console.log(`API yanıtı başarılı (${response.status}): ${response.config.method?.toUpperCase()} ${response.config.url}`);
      }
    }
    return response;
  },
  error => {
    // Aborted hatası için özel işleme
    if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
      console.warn('API isteği zaman aşımı ile iptal edildi:', error.config?.url);
      error.friendlyMessage = 'İstek zaman aşımına uğradı, lütfen tekrar deneyin.';
      return Promise.reject(error);
    }
    
    // Herhangi bir yanıt yoksa veya network hatası varsa
    if (!error.response) {
      console.error('API yanıtı alınamadı:', error.message);
      // İstemcide hatayı göstermek için mesajı iyileştir
      error.friendlyMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.';
      return Promise.reject(error);
    }
    
    // Sağlık kontrolü için logları gösterme
    if (!error.config?.url?.includes('/health')) {
      console.error(`API hatası (${error.response.status}): ${error.config?.method?.toUpperCase()} ${error.config?.url}`, 
        error.response?.data?.error || error.message);
    }
    
    // 401 (Unauthorized) hatası durumunda
    if (error.response.status === 401) {
      // Sağlık kontrolü için yetki hatalarını yok say
      if (!error.config?.url?.includes('/health')) {
        console.warn('Yetkisiz erişim hatası tespit edildi:', error.response.data?.error);
        
        // Oturum hatası mesajını kaydet
        error.authError = true;
        error.friendlyMessage = 'Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.';
      }
    }
    
    return Promise.reject(error);
  }
);

// Project API fonksiyonları
export const projectAPI = {
  // Tüm projeleri getirme
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      
      // MongoDB _id ile client id uyumunu sağla
      const projects = response.data.map((project: any) => ({
        ...project,
        id: project.id || project._id
      }));
      
      return projects;
    } catch (error) {
      console.error('Projeler alınırken hata oluştu:', error);
      return []; // Hata durumunda boş array döndür
    }
  },

  // Projenin tamamlanma durumunu kontrol etme
  getProjectStatus: async (projectId: string): Promise<{isCompleted: boolean, completedTasks: number, totalTasks: number}> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      let tasks;
      
      try {
        // İlk önce özel endpoint'i deneyeceğiz
        const response = await api.get(`/projects/${projectId}/tasks?nocache=${Date.now()}`);
        tasks = response.data;
      } catch (error) {
        // Endpoint bulunamadıysa, normal tasks endpoint'ini kullanabiliriz
        console.log('Özel endpoint bulunamadı, normal tasks endpoint\'i kullanılıyor');
        const response = await api.get(`/tasks/project/${projectId}?nocache=${Date.now()}`);
        tasks = response.data;
      }
      
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((task: any) => task.status === 'tamamlandi').length;
      const isCompleted = totalTasks > 0 && completedTasks === totalTasks;
      
      console.log(`Proje durumu (API): ${projectId}, Tamamlanan: ${completedTasks}/${totalTasks}, Durum: ${isCompleted ? 'Tamamlandı' : 'Aktif'}`);
      
      return { isCompleted, completedTasks, totalTasks };
    } catch (error) {
      console.error('Proje durumu kontrol edilirken hata oluştu:', error);
      return { isCompleted: false, completedTasks: 0, totalTasks: 0 };
    }
  },

  // Tekil proje detayı getirme
  getProjectById: async (projectId: string): Promise<Project> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      const response = await api.get(`/projects/${projectId}`);
      
      // MongoDB _id ile client id uyumunu sağla
      const project = response.data;
      return {
        ...project,
        id: project.id || project._id
      };
    } catch (error) {
      console.error('Proje detayı alınırken hata oluştu:', error);
      throw error;
    }
  },

  // Yeni proje oluşturma
  createProject: async (projectData: Partial<Project>): Promise<Project> => {
    try {
      const response = await api.post('/projects', projectData);
      
      // MongoDB _id ile client id uyumunu sağla
      const project = response.data;
      return {
        ...project,
        id: project.id || project._id
      };
    } catch (error) {
      console.error('Proje oluşturulurken hata oluştu:', error);
      throw error;
    }
  },

  // Proje güncelleme
  updateProject: async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      const response = await api.put(`/projects/${projectId}`, projectData);
      
      // MongoDB _id ile client id uyumunu sağla
      const project = response.data;
      return {
        ...project,
        id: project.id || project._id
      };
    } catch (error) {
      console.error('Proje güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Proje silme
  deleteProject: async (projectId: string): Promise<boolean> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      console.log('API silme işlemi başlatılıyor, Proje ID:', projectId);
      
      // Hızlı yanıt için özel ayarlar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 saniye sonra iptal et
      
      const response = await api.delete(`/projects/${projectId}`, {
        signal: controller.signal,
        timeout: 5000 // Daha düşük timeout
      });
      
      clearTimeout(timeoutId);
      console.log('API silme cevabı:', response.data);
      
      return true;
    } catch (error: any) {
      console.error('Proje silinirken hata oluştu:', error);
      
      // Hata detaylarını kontrol et
      if (error.response) {
        console.error('Hata yanıtı:', error.response.status, error.response.data);
      } else if (error.name === 'AbortError') {
        console.error('İstek zaman aşımı nedeniyle iptal edildi');
      }
      
      throw error;
    }
  },

  // Proje paylaşım kodu oluşturma
  generateShareCode: async (projectId: string): Promise<string> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      const response = await api.post(`/projects/${projectId}/generate-share-code`);
      return response.data.shareCode;
    } catch (error) {
      console.error('Paylaşım kodu oluşturulurken hata oluştu:', error);
      throw error;
    }
  },

  // Proje kodunu kullanarak projeye katılma
  joinProject: async (shareCode: string): Promise<Project> => {
    try {
      if (!shareCode || shareCode.trim() === '') {
        throw new Error('Geçersiz paylaşım kodu');
      }
      
      const response = await api.post('/projects/join', { shareCode });
      
      // MongoDB _id ile client id uyumunu sağla
      const project = response.data;
      return {
        ...project,
        id: project.id || project._id
      };
    } catch (error) {
      console.error('Projeye katılırken hata oluştu:', error);
      throw error;
    }
  },

  // Projeden ayrılma
  leaveProject: async (projectId: string): Promise<boolean> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      await api.post(`/projects/${projectId}/leave`);
      return true;
    } catch (error) {
      console.error('Projeden ayrılırken hata oluştu:', error);
      throw error;
    }
  },

  // Proje kodunu kullanarak projeye katılma
  inviteUserToProject: async (projectId: string, email: string, role: 'admin' | 'member' = 'member'): Promise<boolean> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      await api.post(`/projects/${projectId}/invite`, { email, role });
      return true;
    } catch (error) {
      console.error('Kullanıcı davet edilirken hata oluştu:', error);
      throw error;
    }
  },

  // Proje katılımcısını çıkarma
  removeParticipant: async (projectId: string, userId: string): Promise<boolean> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      await api.delete(`/projects/${projectId}/participants/${userId}`);
      return true;
    } catch (error) {
      console.error('Katılımcı çıkarılırken hata oluştu:', error);
      throw error;
    }
  },
};

// Task API fonksiyonları
export const taskAPI = {
  // Projeye ait tüm görevleri getirme
  getTasks: async (projectId: string): Promise<Task[]> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        return []; // Hata durumunda boş array döndür
      }
      
      const response = await api.get(`/tasks/project/${projectId}`);
      
      // MongoDB _id ile client id uyumunu sağla
      return response.data.map((task: any) => ({
        ...task,
        id: task.id || task._id
      }));
    } catch (error) {
      console.error('Görevler alınırken hata oluştu:', error);
      return []; // Hata durumunda boş array döndür
    }
  },

  // Tekil görev detayı getirme
  getTaskById: async (taskId: string): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      const response = await api.get(`/tasks/${taskId}`);
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Görev detayı alınırken hata oluştu:', error);
      throw error;
    }
  },

  // Yeni görev oluşturma
  createTask: async (projectId: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      // projectId kontrolü
      if (!projectId || projectId === 'undefined') {
        console.error('Geçersiz proje ID:', projectId);
        throw new Error('Geçersiz proje ID');
      }
      
      const url = `/tasks/project/${projectId}`;
      
      // Default status değeri ayarlayalım
      const taskWithDefaults = {
        ...taskData,
        status: taskData.status || 'yapiliyor'
      };
      
      const response = await api.post(url, taskWithDefaults);
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error: any) {
      console.error('Görev oluşturulurken hata oluştu:', error);
      
      if (error.response?.data?.error) {
        console.error('Sunucu hata mesajı:', error.response.data.error);
      }
      
      throw error;
    }
  },

  // Görev güncelleme
  updateTask: async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      const response = await api.put(`/tasks/${taskId}`, taskData);
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Görev güncellenirken hata oluştu:', error);
      throw error;
    }
  },

  // Görev silme
  deleteTask: async (taskId: string): Promise<boolean> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('API - Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      // MongoDB ObjectID formatı kontrolü
      if (!taskId.match(/^[0-9a-fA-F]{24}$/)) {
        console.error('API - Geçersiz MongoDB ID formatı:', taskId);
        throw new Error('Geçersiz görev ID formatı');
      }
      
      console.log('API - Silme işlemi başlatılıyor, Görev ID:', taskId);
      
      // Hızlı yanıt için özel ayarlar
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('API - Silme işlemi zaman aşımına uğradı, iptal ediliyor...');
        controller.abort();
      }, 8000); // 5 saniyeden 8 saniyeye çıkarıldı
      
      try {
        console.log('API - DELETE isteği gönderiliyor:', `/tasks/${taskId}`);
        
        // Token kontrolü
        const token = getToken();
        if (!token) {
          console.error('API - Token bulunamadı, işlem iptal ediliyor');
          clearTimeout(timeoutId);
          throw new Error('Oturum bilgileri eksik');
        }
        
        const response = await api.delete(`/tasks/${taskId}`, {
          signal: controller.signal,
          timeout: 8000, // Daha uzun timeout
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
        
        clearTimeout(timeoutId);
        console.log('API - Görev silme cevabı:', response.status, response.data);
        
        return response.data?.success || true;
      } catch (requestError: any) {
        clearTimeout(timeoutId);
        
        // Eğer istek zaman aşımına uğradıysa veya iptal edildiyse
        if (requestError.name === 'AbortError' || requestError.code === 'ECONNABORTED') {
          console.error('API - Silme isteği zaman aşımına uğradı veya iptal edildi');
          throw new Error('İstek zaman aşımına uğradı');
        }
        
        // Server yanıt verdiyse ve hata döndüyse
        if (requestError.response) {
          console.error('API - Server hata yanıtı:', requestError.response.status, requestError.response.data);
          
          // Tekrar istekten önce kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // 401 veya 403 durumları için özel mesaj
          if (requestError.response.status === 401) {
            throw new Error('Oturum süresi dolmuş');
          } else if (requestError.response.status === 403) {
            throw new Error('Bu işlem için yetkiniz yok');
          } else if (requestError.response.status === 404) {
            console.warn('API - 404: Görev bulunamadı, muhtemelen zaten silinmiş');
            return true; // Görev zaten silinmiş, başarılı kabul et
          } else {
            throw new Error(requestError.response.data?.error || 'Sunucu hatası');
          }
        }
        
        // Diğer hatalar
        console.error('API - Silme isteği diğer hata:', requestError.message);
        throw requestError;
      }
    } catch (error: any) {
      console.error('API - Görev silme genel hatası:', error.message);
      throw error;
    }
  },

  // Göreve kaynak (link/dosya) ekleme
  addTaskResource: async (taskId: string, resource: { type: 'link' | 'file', url: string, description?: string }): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      const response = await api.post(`/tasks/${taskId}/resources`, resource);
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Göreve kaynak eklenirken hata oluştu:', error);
      throw error;
    }
  },

  // Görevden kaynak silme
  removeTaskResource: async (taskId: string, resourceId: string): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      const response = await api.delete(`/tasks/${taskId}/resources/${resourceId}`);
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Görevden kaynak silinirken hata oluştu:', error);
      throw error;
    }
  },

  // Göreve kullanıcı atama
  assignUserToTask: async (taskId: string, userId: string, completed?: boolean): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      // userId kontrolü
      if (!userId || userId === 'undefined') {
        console.error('Geçersiz kullanıcı ID:', userId);
        throw new Error('Geçersiz kullanıcı ID');
      }

      console.log(`API - Kullanıcı göreve atanıyor: ${userId} -> ${taskId}, tamamlandı: ${completed}`);
      
      const response = await api.post(`/tasks/${taskId}/assign`, { userId, completed }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      
      // Kullanıcı adlarının düzgün gelmesi için onarım yapalım
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo = task.assignedTo.map((assignee: any) => {
          if (!assignee || !assignee.user) return assignee;
          
          // Kullanıcı bir string ID ise, boş bir obje oluştur
          if (typeof assignee.user === 'string') {
            console.log('String ID kullanıcı tespit edildi, düzeltiliyor:', assignee.user);
            assignee.user = {
              id: assignee.user,
              _id: assignee.user,
              name: `Kullanıcı ${assignee.user.substr(0, 4)}`
            };
          }
          // Hash'li parolalar ve kullanıcı adları varsa temizle
          else if (typeof assignee.user === 'object') {
            if (assignee.user.name && assignee.user.name.includes('$2a$')) {
              console.log('Hash\'li kullanıcı adı tespit edildi, düzeltiliyor:', assignee.user._id || assignee.user.id);
              assignee.user.name = `Kullanıcı ${(assignee.user._id || assignee.user.id).substr(0, 4)}`;
            }
          }
          
          // Eğer bu kullanıcıya özel completed değeri verilmişse güncelle
          if (completed !== undefined && 
              ((typeof assignee.user === 'object' && (assignee.user.id === userId || assignee.user._id === userId)) || 
               (typeof assignee.user === 'string' && assignee.user === userId))) {
            assignee.completed = completed;
            if (completed) {
              assignee.completedAt = new Date();
            } else {
              delete assignee.completedAt;
            }
          }
          
          return assignee;
        });
      }
      
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Kullanıcı göreve atanırken hata oluştu:', error);
      throw error;
    }
  },

  // Kullanıcıyı görevden çıkarma
  unassignUserFromTask: async (taskId: string, userId: string): Promise<Task> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('Geçersiz görev ID:', taskId);
        throw new Error('Geçersiz görev ID');
      }
      
      // userId kontrolü
      if (!userId || userId === 'undefined') {
        console.error('Geçersiz kullanıcı ID:', userId);
        throw new Error('Geçersiz kullanıcı ID');
      }

      console.log(`API - Kullanıcı görevden çıkarılıyor: ${userId} -> ${taskId}`);
      
      const response = await api.post(`/tasks/${taskId}/unassign`, { userId }, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      // MongoDB _id ile client id uyumunu sağla
      const task = response.data;
      
      // Kullanıcı adlarının düzgün gelmesi için onarım yapalım
      if (task.assignedTo && Array.isArray(task.assignedTo)) {
        task.assignedTo = task.assignedTo.map((assignee: any) => {
          if (!assignee || !assignee.user) return assignee;
          
          // Kullanıcı bir string ID ise, boş bir obje oluştur
          if (typeof assignee.user === 'string') {
            console.log('String ID kullanıcı tespit edildi, düzeltiliyor:', assignee.user);
            assignee.user = {
              id: assignee.user,
              _id: assignee.user,
              name: `Kullanıcı ${assignee.user.substr(0, 4)}`
            };
          }
          // Hash'li parolalar ve kullanıcı adları varsa temizle
          else if (typeof assignee.user === 'object') {
            if (assignee.user.name && assignee.user.name.includes('$2a$')) {
              console.log('Hash\'li kullanıcı adı tespit edildi, düzeltiliyor:', assignee.user._id || assignee.user.id);
              assignee.user.name = `Kullanıcı ${(assignee.user._id || assignee.user.id).substr(0, 4)}`;
            }
          }
          
          return assignee;
        });
      }
      
      return {
        ...task,
        id: task.id || task._id
      };
    } catch (error) {
      console.error('Kullanıcı görevden çıkarılırken hata oluştu:', error);
      throw error;
    }
  },
};

// Authentication API fonksiyonları
export const authAPI = {
  // Kullanıcı girişi
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      throw error;
    }
  },

  // Kullanıcı kaydı
  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Kayıt olunurken hata oluştu:', error);
      throw error;
    }
  },

  // Kullanıcı bilgilerini getirme
  getUser: async () => {
    try {
      const response = await api.get('/auth/me');
      
      // Profil resmi URL'sini düzelt - tam API URL'i ile birleştir
      if (response.data && response.data.profileImage && response.data.profileImage.url) {
        // URL zaten http veya https ile başlamıyorsa API URL'ini başına ekle
        if (!response.data.profileImage.url.startsWith('http')) {
          const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
          response.data.profileImage.url = `${baseUrl}${response.data.profileImage.url}`;
          console.log('API\'den alınan profil resmi URL düzeltildi:', response.data.profileImage.url);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Kullanıcı bilgileri alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Kullanıcı profilini güncelleme
  updateProfile: async (userData: { name?: string; surname?: string; email?: string }) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Kullanıcı şifresini değiştirme
  changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
    try {
      const response = await api.put('/auth/password', passwords);
      return response.data;
    } catch (error) {
      console.error('Şifre değiştirilirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Oturum geçmişini getirme
  getLoginHistory: async () => {
    try {
      const response = await api.get('/auth/login-history');
      return response.data;
    } catch (error) {
      console.error('Oturum geçmişi alınırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Belirli bir oturumu sonlandırma
  terminateSession: async (sessionId: string) => {
    try {
      const response = await api.delete(`/auth/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Oturum sonlandırılırken hata oluştu:', error);
      throw error;
    }
  },
  
  // Hesabı dondurma
  deactivateAccount: async () => {
    try {
      const response = await api.put('/auth/deactivate');
      return response.data;
    } catch (error) {
      console.error('Hesap dondurulurken hata oluştu:', error);
      throw error;
    }
  },
  
  // Hesabı silme
  deleteAccount: async (username: string) => {
    try {
      const response = await api.delete('/auth/account', {
        data: { username }
      });
      return response.data;
    } catch (error) {
      console.error('Hesap silinirken hata oluştu:', error);
      throw error;
    }
  },
  
  // Profil fotoğrafı yükleme
  uploadProfileImage: async (imageFile: File) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      
      const response = await api.post('/auth/profile/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Profil fotoğrafı yüklenirken hata oluştu:', error);
      throw error;
    }
  }
};

export default api; 