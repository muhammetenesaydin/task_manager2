import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { CircularProgress, Box } from '@mui/material';
import { authAPI } from '../services/api';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Sağlık kontrolü durumunu ve zaman damgasını takip et
let lastConnectionCheck = 0;
let isConnectionCheckInProgress = false;
const connectionCheckCache = { isAvailable: true, timestamp: 0 };
const HEALTH_CHECK_INTERVAL = 300000; // 5 dakika (ms)

// API bağlantısını kontrol et (debounce mekanizması ile)
const isServerAvailable = async (): Promise<boolean> => {
  try {
    const now = Date.now();
    
    // Son kontrolden bu yana 5 dakika geçmediyse önbelleği kullan
    if (now - connectionCheckCache.timestamp < HEALTH_CHECK_INTERVAL) {
      return connectionCheckCache.isAvailable;
    }
    
    // Eğer kontrol zaten yapılıyorsa yeni istek gönderme
    if (isConnectionCheckInProgress) {
      return connectionCheckCache.isAvailable; // Son bilinen değeri kullan
    }
    
    isConnectionCheckInProgress = true;
    console.log('API bağlantısı kontrol ediliyor...');
    
    try {
      // İlk önce auth sağlık kontrolünü deneyelim
      const authResponse = await axios.get(`${API_URL}/auth/health`, { 
        timeout: 3000,
        validateStatus: (status) => true,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      lastConnectionCheck = now;
      connectionCheckCache.timestamp = now;
      isConnectionCheckInProgress = false;
      
      if (authResponse.status === 200 || authResponse.status === 304) {
        console.log('Auth servis sağlık kontrolü başarılı:', authResponse.status);
        connectionCheckCache.isAvailable = true;
        return true;
      }
      
      console.log('Auth servis sağlık kontrolü yanıt kodu:', authResponse.status);
      
      if (authResponse.status < 500) {
        // 4xx hataları durumunda yine de sunucu çalışıyor demektir
        connectionCheckCache.isAvailable = true;
        return true;
      }
      
      // Şimdi de tasks API'si deneyelim
      try {
        const tasksResponse = await axios.get(`${API_URL}/tasks/health`, { 
          timeout: 3000,
          validateStatus: (status) => true,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (tasksResponse.status === 200 || tasksResponse.status === 304) {
          console.log('Tasks servis sağlık kontrolü başarılı:', tasksResponse.status);
          connectionCheckCache.isAvailable = true;
          return true;
        }
        
        if (tasksResponse.status < 500) {
          // 4xx hataları durumunda yine de sunucu çalışıyor demektir
          connectionCheckCache.isAvailable = true;
          return true;
        }
      } catch (tasksError: any) {
        console.warn('Tasks servis sağlık kontrolünde hata:', tasksError.message);
      }
      
      // Tüm kontroller başarısız olduysa bağlantı yok demektir
      connectionCheckCache.isAvailable = false;
      return false;
    } catch (error) {
      console.error('API bağlantı kontrolü hatası:', error);
      isConnectionCheckInProgress = false;
      connectionCheckCache.isAvailable = false;
      return false;
    }
  } catch (err) {
    console.error('API bağlantı kontrolü genel hatası:', err);
    isConnectionCheckInProgress = false;
    connectionCheckCache.isAvailable = false;
    return false;
  }
};

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 8000 // 10 saniyeden 8 saniyeye düşürülüyor
});

// Token ile yapılacak istekler için interceptor
api.interceptors.request.use(
  config => {
    try {
      // Önce localStorage'a bak
      let token = localStorage.getItem('token');
      
      // localStorage'da yoksa sessionStorage'a bak
      if (!token) {
        token = sessionStorage.getItem('token');
      }
      
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.error('Token interceptor hatası:', err);
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Hata durumunda otomatik çıkış için response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    // 401 (Unauthorized) hatası durumunda otomatik çıkış
    if (error.response && error.response.status === 401) {
      console.warn('Yetkisiz erişim hatası tespit edildi, ancak otomatik çıkış yapılmayacak');
      console.log('Oturum durumu kullanıcı tarafından kontrol edilecek');
      
      // Token ve kullanıcı bilgisini silmeyelim, bunun yerine
      // checkTokenValidity fonksiyonunun kullanıcı tarafından çağrıldığında
      // doğru sonuç vermesini sağlayalım. Bu sayede sayfa yenilemesi veya
      // yönlendirme olmadan devam edilebilir.
    }
    return Promise.reject(error);
  }
);

// Kullanıcı ve context tipleri
interface User {
  id: string;
  username: string;
  email: string;
  role: string; // 'user', 'admin', 'manager' gibi değerler alabilir
  name?: string;
  surname?: string;
}

// Oturum geçmişi verisi
interface SessionHistory {
  id: string;
  date: Date | string;
  ip: string;
  device: string;
  browser: string;
  location?: string;
  isCurrentSession?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
  checkTokenValidity: () => Promise<boolean>;
  isServerReachable: boolean;
  updateProfile: (userData: { name?: string; surname?: string; email?: string }) => Promise<boolean>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<boolean>;
  uploadProfileImage?: (imageFile: File) => Promise<boolean>;
  getLoginHistory: () => Promise<SessionHistory[]>;
  terminateSession: (sessionId: string) => Promise<boolean>;
  deactivateAccount: () => Promise<boolean>;
  deleteAccount: (username: string) => Promise<boolean>;
}

interface RegisterData {
  name: string;
  surname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Context oluştur
const AuthContext = createContext<AuthContextType | null>(null);

// Provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isServerReachable, setIsServerReachable] = useState(true); // Başlangıçta bağlantı var kabul edilir
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [lastTokenCheck, setLastTokenCheck] = useState<number>(0);
  
  // Çıkış yap - logout fonksiyonunu önce tanımlayalım
  const logout = useCallback(() => {
    console.log('Oturum kapatılıyor...');
    
    // localStorage'daki verileri temizle
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // sessionStorage'daki verileri temizle
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    setUser(null);
    setToken(null);
  }, []);

  // API bağlantısını kontrol etme - 5 dakikada bir kontrol et
  useEffect(() => {
    const checkApiConnection = async () => {
      if (isCheckingConnection) return;
      
      try {
        setIsCheckingConnection(true);
        const isAvailable = await isServerAvailable();
        
        if (!isAvailable) {
          console.warn('API sunucusuna erişilemiyor');
        }
        
        // Sadece eğer değişiklik varsa state'i güncelle
        setIsServerReachable(prev => {
          if (prev !== isAvailable) {
            console.log('API bağlantı durumu değişti:', isAvailable ? 'bağlı' : 'bağlantı yok');
          }
          return isAvailable;
        });
      } catch (err) {
        console.error('API bağlantı kontrolü sırasında hata:', err);
      } finally {
        setIsCheckingConnection(false);
      }
    };
    
    // İlk açılışta ve her 5 dakikada bir kontrol et (60 saniyeden değiştirildi)
    checkApiConnection();
    const interval = setInterval(checkApiConnection, HEALTH_CHECK_INTERVAL);
    
    return () => clearInterval(interval);
  }, [isCheckingConnection]);

  // Token doğrulama işlemi
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    try {
      // Önce localStorage'a bak (kalıcı oturum)
      let token = localStorage.getItem('token');
      let storage = localStorage;
      
      // localStorage'da yoksa sessionStorage'a bak (geçici oturum)
      if (!token) {
        token = sessionStorage.getItem('token');
        storage = sessionStorage;
      }
      
      if (!token) {
        return false;
      }
      
      // Son kontrol zamanı kontrolü - daha uzun bir süre kullan
      const now = Date.now();
      if (now - lastTokenCheck < 60000) { // 30 saniyeden 60 saniyeye çıkarıldı
        return true; // Son 1 dakika içinde kontrol edildiyse tekrar API'ye istek yapma
      }
      
      try {
        // API isteği yoluyla token geçerliliğini kontrol et - timeout süresini azalt
        const response = await api.get('/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
          timeout: 3000 // 5000'den 3000'e düşürüldü
        });
        
        // Kontrol zamanını güncelle
        setLastTokenCheck(now);
        
        if (response.status === 200) {
          // Eğer tokenimiz var ama user state'imiz yoksa, storage'dan yükle
          if (!user) {
            const userString = storage.getItem('user');
            if (userString) {
              try {
                const userData = JSON.parse(userString);
                setUser(userData);
                setToken(token);
              } catch (parseErr) {
                console.error('Kullanıcı verisi ayrıştırılamadı:', parseErr);
              }
            }
          }
          
          return true;
        }
        
        // Token geçerli değilse oturumu kapat
        logout();
        return false;
      } catch (apiError: any) {
        // 401 veya 403 hatası gelirse token geçersizdir
        if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
          logout();
          return false;
        }
        
        // Diğer hata durumlarında, ağ hatası olabilir, kullanıcıyı hemen çıkış yaptırmayalım
        // Eğer token varsa geçerli sayalım
        if (token) {
          return true;
        }
        
        return false;
      }
    } catch (err) {
      console.error('Token doğrulama hatası:', err);
      // Genel hata durumunda oturumu kapat
      logout();
      return false;
    }
  }, [lastTokenCheck, logout, user, setToken, setUser, setLastTokenCheck]);

  // İlk yükleme ve oturum bilgilerini alma
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        // Önce localStorage'a bak (kalıcı oturum)
        let storedToken = localStorage.getItem('token');
        let storedUser = localStorage.getItem('user');
        let storage = localStorage;
        let isRemembered = true;
        
        // localStorage'da yoksa sessionStorage'a bak (geçici oturum)
        if (!storedToken || !storedUser) {
          storedToken = sessionStorage.getItem('token');
          storedUser = sessionStorage.getItem('user');
          storage = sessionStorage;
          isRemembered = false;
        }
        
        // Token ve kullanıcı kontrolü
        if (storedToken && storedUser) {
          // Token formatını kontrol et
          if (!isValidToken(storedToken)) {
            console.error('Saklanan token geçersiz formatda, oturum kapatılıyor');
            logout();
            setLoading(false);
            setInitialized(true);
            return;
          }
          
          console.log('Kayıtlı kullanıcı bilgisi bulundu, oturum açılıyor:', isRemembered ? '(Kalıcı oturum)' : '(Geçici oturum)');
          setToken(storedToken);
          setLastTokenCheck(Date.now()); // Token kontrolü için timestamp'i güncelle
          
          try {
            const userData = JSON.parse(storedUser);
            
            // Profil resmi URL'sini düzelt - tam API URL'i ile birleştir
            if (userData.profileImage && userData.profileImage.url) {
              // URL zaten http veya https ile başlamıyorsa API URL'ini başına ekle
              if (!userData.profileImage.url.startsWith('http')) {
                const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
                userData.profileImage.url = `${baseUrl}${userData.profileImage.url}`;
                console.log('Depolanan profil resmi URL düzeltildi:', userData.profileImage.url);
                
                // Düzeltilmiş veriyi storage'a geri kaydet
                storage.setItem('user', JSON.stringify(userData));
              }
            }
            
            setUser(userData);
            console.log('Oturum açıldı:', userData.username);
            
            // "Beni hatırla" tercih kaydını güncelle
            localStorage.setItem('remember_me', isRemembered ? 'true' : 'false');
          } catch (parseError) {
            console.error('Kullanıcı verisi JSON olarak ayrıştırılamadı', parseError);
            logout();
          }
        } else {
          console.log('Kayıtlı oturum bilgisi bulunamadı');
        }
      } catch (err) {
        console.error('Kullanıcı bilgileri yüklenirken hata oluştu:', err);
        logout();
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    loadUser();
  }, [logout]);

  // Token formatını kontrol eden yardımcı fonksiyon
  const isValidToken = (token: string): boolean => {
    if (!token) return false;
    
    // Token formatını kontrol et (örnek: JWT kontrolü)
    // JWT formatı: xxxxx.yyyyy.zzzzz
    const parts = token.split('.');
    return parts.length === 3;
  };

  // Hata mesajını temizle
  const clearError = () => setError(null);

  // Login fonksiyonunu güncelle
  const login = async (username: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      const isAvailable = await isServerAvailable();
      if (!isAvailable) {
        setError('Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol edin.');
        setLoading(false);
        return false;
      }
      
      console.log('Login işlemi başlatılıyor:', { username, rememberMe });
      
      const response = await api.post('/auth/login', { username, password });
      const responseData = response.data;
      
      // API cevabı farklı formatlarda olabilir, uygun şekilde işleyelim
      const userData = responseData.user || responseData;
      const newToken = responseData.token || responseData.accessToken;
      
      if (newToken && userData) {
        setToken(newToken);
        setUser(userData);
        
        // "Beni hatırla" durumuna göre saklama lokasyonu seçimi
        if (rememberMe) {
          // Kalıcı oturum - localStorage'a kaydet
          localStorage.setItem('token', newToken);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // sessionStorage'dan temizle
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          
          // Tercih kaydı
          localStorage.setItem('remember_me', 'true');
        } else {
          // Geçici oturum - sessionStorage'a kaydet
          sessionStorage.setItem('token', newToken);
          sessionStorage.setItem('user', JSON.stringify(userData));
          
          // localStorage'dan temizle
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Tercih kaydı
          localStorage.setItem('remember_me', 'false');
        }
        
        console.log('Login başarılı:', userData.username, rememberMe ? '(Kalıcı oturum)' : '(Geçici oturum)');
        setLoading(false);
        return true;
      }
      
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setLoading(false);
      return false;
    } catch (err: any) {
      console.error('Login hatası:', err);
      
      // API hatası mı yoksa ağ hatası mı kontrol et
      if (err.response) {
        // API'den gelen hata
        const errorMsg = err.response.data?.error || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.';
        setError(errorMsg);
      } else if (err.request) {
        // Yanıt alınamadı (ağ hatası)
        const errorMsg = 'Sunucuya erişilemiyor. Lütfen internet bağlantınızı kontrol edin.';
        setError(errorMsg);
      } else {
        // İstek göndermeden önce bir hata oluştu
        setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
      
      setLoading(false);
      return false;
    }
  };

  // Kayıt ol
  const register = async (userData: RegisterData): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      // Gerçek API isteği
      const response = await api.post('/auth/register', userData);
      
      const responseData = response.data;
      const userToStore = responseData.user || responseData;
      const tokenToStore = responseData.token || responseData.accessToken;
      
      if (!tokenToStore) {
        throw new Error('Token alınamadı');
      }
      
      localStorage.setItem('user', JSON.stringify(userToStore));
      localStorage.setItem('token', tokenToStore);
      
      setUser(userToStore);
      setToken(tokenToStore);
      setLastTokenCheck(Date.now());
      return true;
    } catch (err: any) {
      console.error('Register error:', err);
      
      if (err.code === 'ECONNABORTED' || err.message === 'Network Error') {
        setError('Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.');
      } else {
        setError(err.response?.data?.error || 'Kayıt olurken bir hata oluştu');
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı profilini güncelle
  const updateProfile = async (userData: { name?: string; surname?: string; email?: string }): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Profil güncellemesi başlatılıyor:', userData);
      
      const response = await authAPI.updateProfile(userData);
      const updatedUser = response.user;
      
      // User state'i güncelle
      if (updatedUser) {
        const newUserData = { ...user, ...updatedUser };
        setUser(newUserData);
        
        // Storage'daki kullanıcı bilgilerini güncelle
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(newUserData));
        
        console.log('Profil başarıyla güncellendi');
      }
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Profil güncellenirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };
  
  // Şifre değiştir
  const changePassword = async (passwords: { currentPassword: string; newPassword: string }): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Şifre değiştirme işlemi başlatılıyor');
      
      await authAPI.changePassword(passwords);
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Şifre değiştirilirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Oturum geçmişini al
  const getLoginHistory = async (): Promise<SessionHistory[]> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Oturum geçmişi alınıyor...');
      const response = await authAPI.getLoginHistory();
      
      // Tarih formatını düzeltelim
      const formattedData = response.map((session: any) => ({
        ...session,
        date: new Date(session.date)
      }));
      
      setLoading(false);
      return formattedData;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Oturum geçmişi alınırken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return [];
    }
  };
  
  // Oturum sonlandır
  const terminateSession = async (sessionId: string): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Oturum sonlandırılıyor...', sessionId);
      await authAPI.terminateSession(sessionId);
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Oturum sonlandırılırken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };
  
  // Hesabı dondur
  const deactivateAccount = async (): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Hesap dondurma işlemi başlatılıyor...');
      await authAPI.deactivateAccount();
      
      // Hesap dondurulduğunda otomatik çıkış yap
      logout();
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Hesap dondurulurken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };
  
  // Hesabı sil
  const deleteAccount = async (username: string): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Hesap silme işlemi başlatılıyor...');
      await authAPI.deleteAccount(username);
      
      // Hesap silindiğinde otomatik çıkış yap
      logout();
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Hesap silinirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };
  
  // Profil fotoğrafı yükleme
  const uploadProfileImage = async (imageFile: File): Promise<boolean> => {
    clearError();
    setLoading(true);
    
    try {
      console.log('Profil fotoğrafı yükleme işlemi başlatılıyor...');
      const response = await authAPI.uploadProfileImage(imageFile);
      
      if (response && response.user) {
        // Profil resim URL'sini düzelt - tam API URL'i ile birleştir
        if (response.user.profileImage && response.user.profileImage.url) {
          // URL zaten http veya https ile başlamıyorsa API URL'ini başına ekle
          if (!response.user.profileImage.url.startsWith('http')) {
            const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
            response.user.profileImage.url = `${baseUrl}${response.user.profileImage.url}`;
            console.log('Düzeltilmiş profil resmi URL:', response.user.profileImage.url);
          }
        }
        
        // User state'i güncelle
        const newUserData = { ...user, ...response.user };
        setUser(newUserData);
        
        // Storage'daki kullanıcı bilgilerini güncelle
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(newUserData));
        
        console.log('Profil fotoğrafı başarıyla yüklendi');
      }
      
      setLoading(false);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Profil fotoğrafı yüklenirken bir hata oluştu';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Uygulama hala ilk yüklemesini tamamlamadıysa, yükleniyor göster
  if (!initialized) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading,
        error,
        login,
        register,
        logout,
        setUser,
        clearError,
        checkTokenValidity,
        isServerReachable,
        updateProfile,
        changePassword,
        getLoginHistory,
        terminateSession,
        deactivateAccount,
        deleteAccount,
        uploadProfileImage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Context kullanımı için hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 