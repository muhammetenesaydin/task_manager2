import React, { createContext, useState, useContext, useCallback, ReactNode, useRef } from 'react';
import { Task } from '../types';
import axios from 'axios';
import { normalizeMongoData, normalizeId } from '../utils/dataUtils';
import { taskAPI } from '../services/api';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

interface TaskContextProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  loadTasks: (projectId: string) => Promise<Task[]>;
  addTask: (projectId: string, taskData: Partial<Task>) => Promise<Task | null>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<boolean>;
  clearTasks: () => void;
  addTaskResource: (taskId: string, resource: { type: 'link' | 'file', url: string, description?: string }) => Promise<Task | null>;
  removeTaskResource: (taskId: string, resourceId: string) => Promise<Task | null>;
  assignUserToTask: (taskId: string, userId: string, completed?: boolean) => Promise<boolean>;
  unassignUserFromTask: (taskId: string, userId: string) => Promise<boolean>;
}

const TaskContext = createContext<TaskContextProps | undefined>(undefined);

// Görev istek önbelleği için tanımlama
interface TaskCache {
  [projectId: string]: {
    tasks: Task[];
    timestamp: number;
  };
}

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<TasksState>({
    tasks: [],
    loading: false,
    error: null,
  });

  // Önbellek için bir referans oluştur (re-render'lar arasında korunsun)
  const taskCacheRef = useRef<TaskCache>({});
  // İstek izleme için referans (aynı anda aynı istek için)
  const pendingRequestsRef = useRef<{[key: string]: boolean}>({});
  // En son istek zaman damgası
  const lastRequestTimesRef = useRef<{[key: string]: number}>({});

  // Önbellek için maksimum yaş (30 saniye)
  const CACHE_MAX_AGE = 30 * 1000;
  
  // Tekrar istek yapma aralığı (500ms)
  const DEBOUNCE_TIME = 500;

  // Optimistik UI güncellemesi için helper fonksiyon 
  const updateTaskInState = useCallback((updatedTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(task => 
        normalizeId(task) === normalizeId(updatedTask) ? { ...task, ...updatedTask } : task
      )
    }));
  }, []);
  
  // Kullanıcı adlarını düzeltme yardımcı fonksiyonu
  const sanitizeUserNames = useCallback((task: Task): Task => {
    if (!task.assignedTo || !Array.isArray(task.assignedTo)) return task;
    
    const sanitizedTask = {...task};
    
    sanitizedTask.assignedTo = task.assignedTo.map(assignee => {
      // Kullanıcı nesnesi değilse veya eksikse orijinal hali ile döndür
      if (!assignee || !assignee.user) return assignee;
      
      // Kullanıcı nesnesini kopyala
      const sanitizedAssignee = {...assignee};
      
      // Kullanıcı nesnesi bir obje ise
      if (typeof assignee.user === 'object') {
        // Hash'li kullanıcı adı varsa düzelt
        if (assignee.user.name && assignee.user.name.includes('$2a$')) {
          sanitizedAssignee.user = {
            ...assignee.user,
            name: 'Kullanıcı' + (assignee.user.id ? ` ${assignee.user.id.substr(0, 4)}` : '')
          };
        }
      }
      
      return sanitizedAssignee;
    });
    
    return sanitizedTask;
  }, []);
  
  // Optimistik UI güncellemesi için helper fonksiyon - silme işlemi
  const removeTaskFromState = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => normalizeId(task) !== normalizeId(taskId))
    }));
  }, []);
  
  // Optimistik UI güncellemesi için helper fonksiyon - ekleme işlemi
  const addTaskToState = useCallback((newTask: Task) => {
    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask]
    }));
  }, []);

  // Arka planda görevleri tazeleyen fonksiyon
  const refreshTasksInBackground = useCallback(async (projectId: string) => {
    if (!projectId || pendingRequestsRef.current[projectId]) {
      return;
    }
    
    try {
      pendingRequestsRef.current[projectId] = true;
      
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Arka plan tazelemesi için token bulunamadı');
        pendingRequestsRef.current[projectId] = false;
        return;
      }
      
      console.log(`Arka planda ${projectId} için görevler tazeleniyor...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000);
      
      try {
        const response = await axios.get(`${API_URL}/tasks/project/${projectId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 8000,
          signal: controller.signal
        });
        
        // Zamanlayıcıyı temizle
        clearTimeout(timeoutId);
        
        const loadedTasks = response.data;
        
        // MongoDB'den gelen verileri normalize et
        const normalizedTasks = normalizeMongoData<Task[]>(loadedTasks);
        
        // Görevleri önbelleğe al
        taskCacheRef.current[projectId] = {
          tasks: normalizedTasks,
          timestamp: Date.now()
        };
        
        // State'i sessizce güncelle (loading durumunu değiştirmeden)
        setState(prev => ({
          ...prev,
          tasks: normalizedTasks,
          loading: false,
        }));
        
      } catch (error) {
        // Sessizce hata yönet, kullanıcıya gösterme
        console.log('Arka plan tazelemesinde hata:', error);
        clearTimeout(timeoutId);
      } finally {
        // İsteği kapat
        pendingRequestsRef.current[projectId] = false;
      }
    } catch (error) {
      pendingRequestsRef.current[projectId] = false;
      console.log('Arka plan tazelemesi genel hatası:', error);
    }
  }, []);

  // Projeye ait görevleri getir
  const loadTasks = useCallback(async (projectId: string): Promise<Task[]> => {
    try {
      if (!projectId) {
        console.error('loadTasks: projectId eksik veya boş');
        return [];
      }
      
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log(`${projectId} için görevler yükleniyor...`);
      
      // Önbellekten yükle
      if (taskCacheRef.current[projectId] && (Date.now() - taskCacheRef.current[projectId].timestamp) < CACHE_MAX_AGE) {
        const cachedTasks = taskCacheRef.current[projectId].tasks;
        console.log(`${projectId} için önbellekten ${cachedTasks.length} görev yüklendi`);
        
        // Önbellekteki verileri kontrol et - özellikle hash'lenmiş kullanıcı adları
        const hasInvalidUserNames = cachedTasks.some(task => 
          task.assignedTo && task.assignedTo.some(assignee => 
            assignee.user.name && assignee.user.name.includes('$2a$')
          )
        );
        
        if (hasInvalidUserNames) {
          console.log('Önbellekte hash\'lenmiş kullanıcı adları tespit edildi, önbellek temizleniyor');
          delete taskCacheRef.current[projectId];
        } else {
          setState(prev => ({
            ...prev,
            tasks: cachedTasks,
            loading: false,
          }));
          
          // Belirli bir süre sonra arka planda tazele
          setTimeout(() => {
            refreshTasksInBackground(projectId);
          }, 50);
          
          return cachedTasks;
        }
      }
      
      // API'den yükle
      console.log(`${projectId} için görevler API'den yükleniyor...`);
      const tasksFromAPI = await taskAPI.getTasks(projectId);
      console.log(`${projectId} için API'den ${tasksFromAPI.length} görev yüklendi`);
      
      // Kullanıcı adlarını düzelt
      const tasks = tasksFromAPI.map(task => sanitizeUserNames(task));
      
      // Önbelleğe al
      taskCacheRef.current[projectId] = {
        tasks,
        timestamp: Date.now()
      };
      
      // State'i güncelle
      setState(prev => ({
        ...prev,
        tasks,
        loading: false,
      }));
      
      return tasks;
    } catch (error: any) {
      console.error('Görevler yüklenirken hata oluştu:', error);
      let errorMessage = 'Görevler yüklenemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return [];
    }
  }, [refreshTasksInBackground, sanitizeUserNames]);

  // Yeni görev eklendiğinde önbelleği temizleyen yardımcı fonksiyon
  const invalidateTaskCache = useCallback((projectId: string) => {
    if (projectId && taskCacheRef.current[projectId]) {
      console.log(`${projectId} için görev önbelleği temizleniyor`);
      delete taskCacheRef.current[projectId];
    }
  }, []);

  // Yeni görev oluştur
  const addTask = useCallback(async (projectId: string, taskData: Partial<Task>): Promise<Task | null> => {
    if (!projectId) {
      console.error('addTask: projectId eksik veya boş');
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Token doğrudan alınıyor
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı, görev eklenemiyor');
        setState(prev => ({
          ...prev,
          error: 'Oturum bilgileriniz eksik veya süresi dolmuş',
          loading: false,
        }));
        return null;
      }
      
      console.log(`Görev ekleniyor, proje ID: ${projectId}, görev verileri:`, taskData);
      
      // Default status değeri ayarlayalım
      const taskWithDefaults = {
        ...taskData,
        status: taskData.status || 'yapiliyor'
      };
      
      // Hızlı yanıt için AbortController ekle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Görev ekleme işlemi zaman aşımına uğradı, iptal ediliyor...');
        controller.abort();
      }, 15000); // 15 saniye sonra iptal et
      
      // İstek yapılandırması
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        timeout: 15000,
        signal: controller.signal
      };
      
      try {
        // Token açıkça belirtiliyor
        const response = await axios.post(`${API_URL}/tasks/project/${projectId}`, taskWithDefaults, config);
        
        // AbortController için zamanlayıcıyı temizle
        clearTimeout(timeoutId);
        
        const newTask = response.data;
        console.log('Yeni görev oluşturuldu (ham veri):', newTask);
        
        // MongoDB'den gelen veriyi normalize et
        const normalizedTask = normalizeMongoData<Task>(newTask);
        console.log('Yeni görev normalize edildi:', normalizedTask);
        
        // Kullanıcı adlarını düzelt
        const sanitizedTask = sanitizeUserNames(normalizedTask);
        
        // Görev eklendiğinde proje önbelleğini temizle
        invalidateTaskCache(projectId);
        
        setState(prev => ({
          ...prev,
          tasks: [...prev.tasks, sanitizedTask],
          loading: false,
        }));
        
        return sanitizedTask;
      } catch (requestError: any) {
        // AbortController için zamanlayıcıyı temizle
        clearTimeout(timeoutId);
        
        console.error('Görev oluşturma isteği hatası:', requestError);
        let errorMessage = 'Görev oluşturulamadı';
        
        if (requestError.name === 'AbortError' || requestError.code === 'ECONNABORTED') {
          errorMessage = 'Sunucu yanıt vermiyor, lütfen daha sonra tekrar deneyin';
        } else if (requestError.response?.data?.error) {
          errorMessage = requestError.response.data.error;
          console.error('Sunucu hata mesajı:', errorMessage);
        } else if (requestError.message) {
          errorMessage = requestError.message;
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        
        return null;
      }
    } catch (error: any) {
      console.error('Görev oluşturma genel hatası:', error);
      let errorMessage = 'Görev oluşturulamadı: Beklenmeyen bir hata oluştu';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        console.error('Sunucu hata mesajı:', errorMessage);
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Sunucu yanıt vermiyor, lütfen daha sonra tekrar deneyin';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    }
  }, [invalidateTaskCache, sanitizeUserNames]);

  // Görevi güncelle
  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>): Promise<Task | null> => {
    if (!taskId) {
      console.error('updateTask: taskId eksik veya boş');
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Token doğrudan alınıyor
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Token bulunamadı, görev güncellenemiyor');
        setState(prev => ({
          ...prev,
          error: 'Oturum bilgileriniz eksik veya süresi dolmuş',
          loading: false,
        }));
        return null;
      }
      
      console.log(`Görev güncelleniyor, ID: ${taskId}, güncellenen veriler:`, taskData);
      
      // Güncellemeden önce görev bilgilerini al
      const existingTask = state.tasks.find(t => normalizeId(t) === normalizeId(taskId));
      
      // Optimistik UI güncellemesi - UI'ı hemen güncelle, API cevabını bekleme
      if (existingTask) {
        // Optimistik olarak görev durumunu hemen güncelle
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => 
            normalizeId(task) === normalizeId(taskId) 
              ? { ...task, ...taskData, updatedAt: new Date() } 
              : task
          ),
        }));
      }
      
      // Hızlı yanıt için AbortController ekle
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Görev güncelleme işlemi zaman aşımına uğradı, iptal ediliyor...');
        controller.abort();
      }, 10000); // 10 saniye sonra iptal et
      
      try {
        // Token açıkça belirtiliyor
        const response = await axios.put(`${API_URL}/tasks/${taskId}`, taskData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          },
          timeout: 10000,
          signal: controller.signal
        });
        
        // AbortController için zamanlayıcıyı temizle
        clearTimeout(timeoutId);
        
        const updatedTask = response.data;
        console.log('Görev güncellendi (ham veri):', updatedTask);
        
        // Kullanıcı adlarını düzelt
        const sanitizedTask = sanitizeUserNames(updatedTask);
        
        // Önbelleği güncelle (ilgili projeyi bul)
        const affectedProjectId = updatedTask.project || (existingTask?.project as string);
        if (affectedProjectId) {
          console.log(`${affectedProjectId} projesi için önbellek temizleniyor`);
          invalidateTaskCache(affectedProjectId);
        }
        
        // Güncellenen görevi state'te de güncelle - hem id hem de _id ile eşleştir
        setState(prev => ({
          ...prev,
          tasks: prev.tasks.map(task => 
            normalizeId(task) === normalizeId(taskId) ? { ...task, ...sanitizedTask } : task
          ),
          loading: false,
        }));
        
        // Bu görev durum güncellemesiyse, projeye ait tüm görevleri yeniden yükle
        if (taskData.status && existingTask?.status !== taskData.status) {
          console.log('Görev durumu değişti, tüm görevler yenileniyor');
          if (affectedProjectId) {
            setTimeout(() => {
              refreshTasksInBackground(affectedProjectId);
            }, 500);
          }
        }
        
        return sanitizedTask;
      } catch (requestError: any) {
        // AbortController için zamanlayıcıyı temizle
        clearTimeout(timeoutId);
        
        console.error('Görev güncelleme isteği hatası:', requestError);
        let errorMessage = 'Görev güncellenemedi';
        
        if (requestError.name === 'AbortError' || requestError.code === 'ECONNABORTED') {
          errorMessage = 'Sunucu yanıt vermiyor, lütfen daha sonra tekrar deneyin';
        } else if (requestError.response?.data?.error) {
          errorMessage = requestError.response.data.error;
          console.error('Sunucu hata mesajı:', errorMessage);
        } else if (requestError.message) {
          errorMessage = requestError.message;
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        
        return null;
      }
    } catch (error: any) {
      console.error('Görev güncelleme genel hatası:', error);
      let errorMessage = 'Görev güncellenemedi: Beklenmeyen bir hata oluştu';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Sunucu yanıt vermiyor, lütfen daha sonra tekrar deneyin';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    }
  }, [invalidateTaskCache, sanitizeUserNames, refreshTasksInBackground, state.tasks]);

  // Görevi sil
  const deleteTask = useCallback(async (taskId: string): Promise<boolean> => {
    if (!taskId) {
      console.error('TaskContext - deleteTask: taskId eksik veya boş');
      return false;
    }
    
    try {
      console.log('TaskContext - Görev silme işlemi başlatılıyor, ID:', taskId);
      
      // ID biçimini kontrol et - MongoDB ObjectID biçiminde mi?
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(taskId);
      if (!isValidObjectId) {
        console.error('TaskContext - Geçersiz görev ID formatı:', taskId);
        return false;
      }
      
      // Silmeden önce görev bilgilerini al (önbelleği güncellemek için)
      const taskToDelete = state.tasks.find(task => 
        normalizeId(task) === normalizeId(taskId)
      );
      
      // Görev yoksa veya bulunamadıysa başarısız kabul et
      if (!taskToDelete) {
        console.error('TaskContext - Silinecek görev bulunamadı');
        return false;
      }
      
      const affectedProjectId = taskToDelete.project as string;
      console.log('TaskContext - Etkilenecek proje ID:', affectedProjectId);
      
      // Token kontrolü
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('TaskContext - Token bulunamadı!');
        return false;
      }
      
      // *** ÖNEMLİ: OPTİMİSTİK UI GÜNCELLEMESİ ***
      // API yanıtını beklemeden önce kullanıcı arayüzünü güncelle
      // Bu sayede işlem anında tamamlanmış gibi görünür ve kullanıcı deneyimi artar
      removeTaskFromState(taskId);
      
      // Eğer önbellekte veri varsa güncelle
      if (affectedProjectId && taskCacheRef.current[affectedProjectId]) {
        taskCacheRef.current[affectedProjectId].tasks = 
          taskCacheRef.current[affectedProjectId].tasks.filter(
            task => normalizeId(task) !== normalizeId(taskId)
          );
      }
      
      // API'yi çağır, ama kullanıcı arayüzünü bloklamadan
      try {
        // taskAPI doğrudan kullan - awaited çağrı yap
        console.log('TaskContext - taskAPI.deleteTask çağrılıyor:', taskId);
        const success = await taskAPI.deleteTask(taskId);
        console.log('TaskContext - API silme işlemi sonucu:', success);
        
        if (!success && affectedProjectId) {
          console.warn('TaskContext - Silme işlemi başarısız oldu, güncel verileri yeniden yüklüyorum');
          setTimeout(() => {
            refreshTasksInBackground(affectedProjectId);
          }, 500);
          // UI'da task görünmez kalmalı - başarısız olsa bile
          return true;
        }
        
        return true;
      } catch (apiError: any) {
        console.error('TaskContext - API silme işlemi hatası:', apiError);
        
        // Hatayı analiz et
        let errorMessage = 'Bilinmeyen hata';
        if (apiError.message) {
          errorMessage = apiError.message;
        }
        
        console.error('TaskContext - Hata mesajı:', errorMessage);
        
        // Eğer "not found" hatası ise, zaten silinmiş demektir - başarılı kabul et
        if (errorMessage.includes('bulunamadı') || errorMessage.includes('not found')) {
          console.log('TaskContext - Görev zaten silinmiş, başarılı kabul ediliyor');
          return true;
        }
        
        // Eğer yetki hatası ise, güncel verileri yeniden yükle ama başarısız bildir
        if (errorMessage.includes('yetki') || errorMessage.includes('permission')) {
          if (affectedProjectId) {
            setTimeout(() => {
              refreshTasksInBackground(affectedProjectId);
            }, 500);
          }
          return false;
        }
        
        // Eğer geçersiz ID hatası ise
        if (errorMessage.includes('geçersiz') || errorMessage.includes('invalid')) {
          console.error('TaskContext - Geçersiz ID hatası');
          return false;
        }
        
        // Diğer hatalar için UI güncellemeyi geri al
        if (taskToDelete) {
          console.log('TaskContext - UI güncellemesi geri alınıyor');
          addTaskToState(taskToDelete);
        }
        
        // Yeniden veri yükle
        if (affectedProjectId) {
          setTimeout(() => {
            refreshTasksInBackground(affectedProjectId);
          }, 500);
        }
        
        return false;
      }
    } catch (error: any) {
      console.error('TaskContext - Görev silme genel hatası:', error);
      return false;
    }
  }, [state.tasks, removeTaskFromState, addTaskToState, refreshTasksInBackground]);

  // Görevleri temizle
  const clearTasks = useCallback(() => {
    console.log('Görevler temizleniyor');
    setState(prev => ({
      ...prev,
      tasks: [],
      error: null,
    }));
  }, []);

  // Kaynak (link/dosya) ekleme
  const addTaskResource = useCallback(async (
    taskId: string, 
    resource: { type: 'link' | 'file', url: string, description?: string }
  ): Promise<Task | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // API çağrısı
      const updatedTask = await taskAPI.addTaskResource(taskId, resource);
      
      // Görevi state'de güncelle
      updateTaskInState(updatedTask);
      
      return updatedTask;
    } catch (error: any) {
      console.error('Kaynak eklenirken hata oluştu:', error);
      let errorMessage = 'Kaynak eklenemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [updateTaskInState]);
  
  // Kaynağı görevden silme
  const removeTaskResource = useCallback(async (taskId: string, resourceId: string): Promise<Task | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // API çağrısı
      const updatedTask = await taskAPI.removeTaskResource(taskId, resourceId);
      
      // Görevi state'de güncelle
      updateTaskInState(updatedTask);
      
      return updatedTask;
    } catch (error: any) {
      console.error('Kaynak silinirken hata oluştu:', error);
      let errorMessage = 'Kaynak silinemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [updateTaskInState]);

  // Göreve kullanıcı atama
  const assignUserToTask = useCallback(async (taskId: string, userId: string, completed = false): Promise<boolean> => {
    try {
      // taskId kontrolü
      if (!taskId || taskId === 'undefined') {
        console.error('assignUserToTask: Geçersiz görev ID');
        return false;
      }
      
      // userId kontrolü
      if (!userId || userId === 'undefined') {
        console.error('assignUserToTask: Geçersiz kullanıcı ID');
        return false;
      }
      
      // Önce görevin hangi projeye ait olduğunu bul
      const currentTask = state.tasks.find(t => normalizeId(t) === normalizeId(taskId));
      const projectId = currentTask?.project as string;
      
      console.log(`Kullanıcı göreve atanıyor: ${userId} -> ${taskId}, tamamlandı: ${completed}`);
      
      // API'ye istek gönder
      const updatedTask = await taskAPI.assignUserToTask(taskId, userId, completed);
      console.log('API yanıtı:', updatedTask);
      
      if (!updatedTask) {
        console.error('Kullanıcı atama başarısız: API boş yanıt döndü');
        return false;
      }
      
      // Sanitize işlemi uygula
      const sanitizedTask = sanitizeUserNames(updatedTask);
      
      // Görevi state'de güncelle
      updateTaskInState(sanitizedTask);
      
      // Ayrıca projeleri de doğrudan güncelle
      try {
        // ProjectContext'e erişim için biraz düzensiz bir yol
        const projectContext = window.projectContextRef?.current;
        if (projectContext && typeof projectContext.loadProjects === 'function') {
          console.log('ProjectContext üzerinden projeleri yeniliyorum');
          setTimeout(() => {
            projectContext.loadProjects();
          }, 300);
        }
      } catch (err) {
        console.error('ProjectContext erişim hatası:', err);
      }
      
      // Eğer completed=true ise, görev durumunu da tamamlandı yap
      if (completed) {
        console.log('Kullanıcı tamamlandı olarak işaretlendi, görevi de tamamlanıyor');
        try {
          // Görevi completed durumuna getir
          const updatedTaskStatus = await taskAPI.updateTask(taskId, { 
            status: 'tamamlandi',
            force_refresh: true // Bu parametre API'ye gidecek ve özel işlem yapması sağlanacak
          } as any); // API çağrısı için ek parametrelere izin vermek için 'any' kullanıyoruz
          
          if (updatedTaskStatus) {
            // State'i güncelle
            updateTaskInState(updatedTaskStatus);
            
            // Projeyi güncelle
            if (projectId) {
              console.log('Proje verilerini yeniliyorum:', projectId);
              // Daha uzun bekleme süresi ile birden fazla güncelleme çağrısı yap
              setTimeout(() => {
                loadTasks(projectId);
              }, 300);
              
              setTimeout(() => {
                // ProjectContext'i elle güncellemeye çalış
                try {
                  const projectContext = (window as any).projectContextRef?.current;
                  if (projectContext && typeof projectContext.loadProjects === 'function') {
                    console.log('ProjectContext üzerinden projeleri yeniliyorum (2. deneme)');
                    projectContext.loadProjects();
                  }
                } catch (err) {
                  console.error('ProjectContext erişim hatası (2):', err);
                }
              }, 600);
            }
          }
        } catch (err) {
          console.error('Görev durumu güncellenirken hata:', err);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Kullanıcı atama sırasında hata:', error);
      return false;
    }
  }, [updateTaskInState, sanitizeUserNames, loadTasks, state.tasks]);

  // Kullanıcıyı görevden çıkar
  const unassignUserFromTask = useCallback(async (taskId: string, userId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      console.log(`Kullanıcı görevden çıkarılıyor: taskId=${taskId}, userId=${userId}`);
      
      // API çağrısı
      const updatedTask = await taskAPI.unassignUserFromTask(taskId, userId);
      
      // Kullanıcı bilgilerini düzelt
      if (updatedTask.assignedTo && Array.isArray(updatedTask.assignedTo)) {
        updatedTask.assignedTo = updatedTask.assignedTo.map((assignee: any) => {
          if (!assignee || !assignee.user) return assignee;
          
          let fixedAssignee = {...assignee};
          
          // Kullanıcı bir obje ise ve hash'li veri içeriyorsa düzelt
          if (typeof assignee.user === 'object') {
            if (assignee.user.name && assignee.user.name.includes('$2a$')) {
              console.warn('Hash\'li kullanıcı adı tespit edildi, düzeltiliyor:', assignee.user.id);
              fixedAssignee.user = {
                ...assignee.user,
                name: 'Kullanıcı' + (assignee.user.id ? ` ${assignee.user.id.substr(0, 4)}` : '')
              };
            }
          }
          // Kullanıcı sadece ID ise
          else if (typeof assignee.user === 'string') {
            console.warn('String kullanıcı ID tespit edildi, nesne oluşturuluyor:', assignee.user);
            fixedAssignee.user = {
              id: assignee.user,
              _id: assignee.user,
              name: 'Kullanıcı ' + assignee.user.substr(0, 4)
            };
          }
          
          return fixedAssignee;
        });
      }
      
      // Sanitize işlemi uygula
      const sanitizedTask = sanitizeUserNames(updatedTask);
      
      // Görevi state'de güncelle
      updateTaskInState(sanitizedTask);
      
      setState(prev => ({ ...prev, loading: false }));
      return true;
    } catch (error) {
      console.error('Kullanıcı görevden çıkarılamadı:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Kullanıcı görevden çıkarılamadı'
      }));
      return false;
    }
  }, [updateTaskInState, sanitizeUserNames]);

  const value = {
    tasks: state.tasks,
    loading: state.loading,
    error: state.error,
    loadTasks,
    addTask,
    updateTask,
    deleteTask,
    clearTasks,
    addTaskResource,
    removeTaskResource,
    assignUserToTask,
    unassignUserFromTask
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext; 