import React, { createContext, useState, useContext, useCallback, ReactNode, useRef } from 'react';
import { Project } from '../types';
import { projectAPI } from '../services/api';

// ProjectContext için global referans
declare global {
  interface Window {
    projectContextRef?: {
      current: ProjectContextProps | null;
    };
  }
}

interface ProjectsState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
}

interface ProjectContextProps {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<Project[]>;
  getProject: (projectId: string) => Promise<Project | null>;
  createProject: (projectData: Partial<Project>) => Promise<Project | null>;
  updateProject: (projectId: string, projectData: Partial<Project>) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
  clearSelectedProject: () => void;
  generateShareCode: (projectId: string) => Promise<string>;
  joinProject: (shareCode: string) => Promise<Project | null>;
  leaveProject: (projectId: string) => Promise<boolean>;
  inviteUserToProject: (projectId: string, email: string, role?: 'admin' | 'member') => Promise<boolean>;
  removeParticipant: (projectId: string, userId: string) => Promise<boolean>;
  getProjectStatus: (projectId: string) => Promise<{isCompleted: boolean, completedTasks: number, totalTasks: number}>;
}

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [state, setState] = useState<ProjectsState>({
    projects: [],
    selectedProject: null,
    loading: false,
    error: null,
  });

  // Context değeri için ref oluştur
  const contextValueRef = useRef<ProjectContextProps | null>(null);

  // Tüm projeleri yükleme
  const loadProjects = useCallback(async (): Promise<Project[]> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      console.log('ProjectContext: Projeler API\'den yeniden yükleniyor...');
      const data = await projectAPI.getProjects();
      
      // Projeleri işle ve görev durumlarını kontrol et
      console.log('ProjectContext: Yüklenen projeler:', data.length);
      
      // API tarafında proje durumlarını almak ve güncellemek için
      if (data.length > 0) {
        for (const project of data) {
          if (project.tasks && project.tasks.length > 0) {
            try {
              // Projenin durumunu API'den doğrudan kontrol et
              const statusResult = await projectAPI.getProjectStatus(project.id);
              
              // Eğer durum API'den farklıysa, yerel durumu güncelle
              const localCompleted = !project.tasks.some(t => t.status !== 'tamamlandi');
              if (statusResult.isCompleted !== localCompleted) {
                console.log(`Proje durumu farklı: ${project.name}, API: ${statusResult.isCompleted ? 'Tamamlandı' : 'Aktif'}, Yerel: ${localCompleted ? 'Tamamlandı' : 'Aktif'}`);
                
                // Görev dizisini API ile uyumlu hale getir
                project.tasks = project.tasks.map(task => {
                  // Eğer proje tamamlanmış sayılıyorsa ve görev tamamlanmamış gözüküyorsa güncelle
                  if (statusResult.isCompleted && task.status !== 'tamamlandi') {
                    return { ...task, status: 'tamamlandi' };
                  }
                  return task;
                });
              }
            } catch (err) {
              console.error(`Proje durumu kontrol edilirken hata: ${project.name}`, err);
            }
          }
        }
      }
      
      data.forEach(project => {
        if (project.tasks && project.tasks.length > 0) {
          console.log(`Proje: ${project.name}, Görev sayısı: ${project.tasks.length}`);
          console.log(`  Tamamlanan görevler: ${project.tasks.filter(t => t.status === 'tamamlandi').length}`);
          console.log(`  Proje durumu: ${!project.tasks.some(t => t.status !== 'tamamlandi') ? 'Tamamlandı' : 'Aktif'}`);
        }
      });
      
      setState(prev => ({
        ...prev,
        projects: data,
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      console.error('Projeler yüklenirken hata:', error);
      let errorMessage = 'Projeler yüklenemedi';
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
  }, []);

  // Tekil proje getirme
  const getProject = useCallback(async (projectId: string): Promise<Project | null> => {
    if (!projectId) {
      console.error('getProject: projectId eksik veya boş');
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const data = await projectAPI.getProjectById(projectId);
      
      console.log('Seçilen proje:', data);
      
      setState(prev => ({
        ...prev,
        selectedProject: data,
        loading: false,
      }));
      
      return data;
    } catch (error: any) {
      console.error('Proje detayı alınırken hata:', error);
      let errorMessage = 'Proje detayı alınamadı';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    }
  }, []);

  // Yeni proje oluşturma
  const createProject = useCallback(async (projectData: Partial<Project>): Promise<Project | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const newProject = await projectAPI.createProject(projectData);
      
      setState(prev => ({
        ...prev,
        projects: [...prev.projects, newProject],
        loading: false,
      }));
      
      return newProject;
    } catch (error: any) {
      console.error('Proje oluşturma hatası:', error);
      let errorMessage = 'Proje oluşturulamadı';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    }
  }, []);

  // Proje güncelleme
  const updateProject = useCallback(async (projectId: string, projectData: Partial<Project>): Promise<Project | null> => {
    if (!projectId) {
      console.error('updateProject: projectId eksik veya boş');
      return null;
    }
    
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const updatedProject = await projectAPI.updateProject(projectId, projectData);
      
      // Güncellenmiş projeyi projeler listesinde ve seçili projede güncelle
      setState(prev => ({
        ...prev,
        projects: prev.projects.map(project => 
          project.id === projectId ? updatedProject : project
        ),
        selectedProject: prev.selectedProject?.id === projectId 
          ? updatedProject 
          : prev.selectedProject,
        loading: false,
      }));
      
      return updatedProject;
    } catch (error: any) {
      console.error('Proje güncelleme hatası:', error);
      let errorMessage = 'Proje güncellenemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return null;
    }
  }, []);

  // Proje silme
  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    if (!projectId) {
      console.error('deleteProject: projectId eksik veya boş');
      return false;
    }
    
    try {
      console.log('ProjectContext: Proje silme işlemi başlatılıyor, ID:', projectId);
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await projectAPI.deleteProject(projectId);
      console.log('ProjectContext: Proje silme API sonucu:', result);
      
      if (result) {
        // Silinen projeyi listeden kaldır
        setState(prev => {
          console.log('ProjectContext: State güncelleniyor, silinen proje ID:', projectId);
          console.log('ProjectContext: Mevcut projeler:', prev.projects.map(p => ({ id: p.id, name: p.name })));
          
          const updatedProjects = prev.projects.filter(project => project.id !== projectId);
          console.log('ProjectContext: Güncellenen projeler:', updatedProjects.map(p => ({ id: p.id, name: p.name })));
          
          return {
            ...prev,
            projects: updatedProjects,
            selectedProject: prev.selectedProject?.id === projectId 
              ? null 
              : prev.selectedProject,
            loading: false,
          };
        });
        
        return true;
      } else {
        console.error('ProjectContext: Proje silme işlemi başarısız oldu');
        setState(prev => ({
          ...prev,
          error: 'Proje silme işlemi başarısız oldu',
          loading: false,
        }));
        return false;
      }
    } catch (error: any) {
      console.error('ProjectContext: Proje silme hatası:', error);
      let errorMessage = 'Proje silinemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return false;
    }
  }, []);

  // Seçili projeyi temizleme
  const clearSelectedProject = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedProject: null,
    }));
  }, []);

  // Proje paylaşım kodu oluşturma
  const generateShareCode = useCallback(async (projectId: string): Promise<string> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const shareCode = await projectAPI.generateShareCode(projectId);
      
      // Güncellenmiş projeyi almak için proje detaylarını yeniden yükle
      await getProject(projectId);
      
      return shareCode;
    } catch (error: any) {
      console.error('Paylaşım kodu oluşturma hatası:', error);
      let errorMessage = 'Paylaşım kodu oluşturulamadı';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      throw error;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getProject]);

  // Proje kodunu kullanarak projeye katılma
  const joinProject = useCallback(async (shareCode: string): Promise<Project | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const joinedProject = await projectAPI.joinProject(shareCode);
      
      // Projeleri tekrar yükle
      await loadProjects();
      
      return joinedProject;
    } catch (error: any) {
      console.error('Projeye katılma hatası:', error);
      let errorMessage = 'Projeye katılınamadı';
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
  }, [loadProjects]);
  
  // Projeden ayrılma
  const leaveProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await projectAPI.leaveProject(projectId);
      
      if (result) {
        // Projeden ayrıldıktan sonra projeleri tekrar yükle
        await loadProjects();
        
        // Eğer seçili projeden ayrıldıysak, seçimi temizle
        if (state.selectedProject?.id === projectId) {
          clearSelectedProject();
        }
      }
      
      return result;
    } catch (error: any) {
      console.error('Projeden ayrılma hatası:', error);
      let errorMessage = 'Projeden ayrılınamadı';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [loadProjects, clearSelectedProject, state.selectedProject?.id]);
  
  // Projeye kullanıcı davet etme
  const inviteUserToProject = useCallback(async (
    projectId: string, 
    email: string, 
    role: 'admin' | 'member' = 'member'
  ): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await projectAPI.inviteUserToProject(projectId, email, role);
      
      // Projeyi tekrar yükleyerek katılımcı listesini güncelle
      if (result && state.selectedProject?.id === projectId) {
        await getProject(projectId);
      }
      
      return result;
    } catch (error: any) {
      console.error('Kullanıcı davet etme hatası:', error);
      let errorMessage = 'Kullanıcı davet edilemedi';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getProject, state.selectedProject?.id]);
  
  // Proje katılımcısını çıkarma
  const removeParticipant = useCallback(async (projectId: string, userId: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await projectAPI.removeParticipant(projectId, userId);
      
      // Projeyi tekrar yükleyerek katılımcı listesini güncelle
      if (result && state.selectedProject?.id === projectId) {
        await getProject(projectId);
      }
      
      return result;
    } catch (error: any) {
      console.error('Katılımcı çıkarma hatası:', error);
      let errorMessage = 'Katılımcı çıkarılamadı';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      
      return false;
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [getProject, state.selectedProject?.id]);

  // Bir projenin tamamlanma durumunu elde etme
  const getProjectStatus = useCallback(async (projectId: string): Promise<{isCompleted: boolean, completedTasks: number, totalTasks: number}> => {
    try {
      if (!projectId) {
        console.error('getProjectStatus: projectId eksik veya boş');
        return { isCompleted: false, completedTasks: 0, totalTasks: 0 };
      }
      
      const result = await projectAPI.getProjectStatus(projectId);
      
      // Eğer proje tamamlandıysa, projeleri otomatik olarak güncelle
      if (result.isCompleted) {
        console.log(`Proje tamamlandı tespit edildi (ID: ${projectId}), projeler güncellenecek`);
        
        // Projeleri güncelle (varolan projelerin kopyasını kullanarak hızlı güncelleme yap)
        setState(prev => {
          // Mevcut projeler dizisini kopyala
          const updatedProjects = [...prev.projects];
          
          // Tamamlanan projeyi bul ve güncelle
          const projectIndex = updatedProjects.findIndex(p => p.id === projectId);
          if (projectIndex !== -1) {
            // Projenin görevlerini güncelle
            const updatedProject = updatedProjects[projectIndex];
            if (updatedProject && updatedProject.tasks && updatedProject.tasks.length > 0) {
              updatedProject.tasks = updatedProject.tasks.map(task => ({
                ...task,
                status: 'tamamlandi'
              }));
            }
          }
          
          return {
            ...prev,
            projects: updatedProjects
          };
        });
        
        // Ayrıca backend'den en güncel verileri almak için projeleri yükle
        // Bu işlemi sonraki event loop'a atayarak önce UI güncellemesinin gerçekleşmesini sağla
        setTimeout(() => {
          loadProjects();
        }, 100);
      }
      
      return result;
    } catch (error) {
      console.error('Proje durumu kontrol edilirken hata:', error);
      return { isCompleted: false, completedTasks: 0, totalTasks: 0 };
    }
  }, [loadProjects]);

  const value = {
    projects: state.projects,
    selectedProject: state.selectedProject,
    loading: state.loading,
    error: state.error,
    loadProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    clearSelectedProject,
    generateShareCode,
    joinProject,
    leaveProject,
    inviteUserToProject,
    removeParticipant,
    getProjectStatus
  };

  // Context değerini ref'e kaydet ve global olarak erişilebilir yap
  contextValueRef.current = value;
  window.projectContextRef = { current: value };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};

export const useProjectContext = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext; 