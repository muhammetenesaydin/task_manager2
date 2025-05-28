import React, { ReactNode, useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { CssBaseline, Snackbar, Alert, GlobalStyles, Box, CircularProgress } from '@mui/material';

// Eager loaded pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Components
import NavigationBar from './components/NavigationBar';
import GlobalLoader from './components/GlobalLoader';
import Footer from './components/Footer';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { TaskProvider } from './context/TaskContext';
import { LoadingProvider } from './context/LoadingContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Lazy loaded pages
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const ProjectDetailPage = lazy(() => import('./pages/ProjectDetailPage'));
const CreateProjectPage = lazy(() => import('./pages/CreateProjectPage'));
const TeamPage = lazy(() => import('./pages/TeamPage'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const CourseDetailPage = lazy(() => import('./pages/CourseDetailPage'));
const LearningAdminPage = lazy(() => import('./pages/LearningAdminPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

// Özel global stiller
const getGlobalStyles = (mode: 'light' | 'dark') => ({
  body: {
    background: mode === 'light' 
      ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' 
      : 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: mode === 'light'
        ? 'url("/images/pattern-light.svg")'
        : 'url("/images/pattern-dark.svg")',
      opacity: 0.05,
      zIndex: -1,
    }
  },
});

interface ProtectedRouteProps {
  children: ReactNode;
}

// Protected route component
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, checkTokenValidity } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  
  useEffect(() => {
    // Component mount olduğunda token geçerliliğini kontrol et
    const verifyToken = async () => {
      try {
        // Token kontrolünü sadece gerektiğinde yap
        if (user) {
          // Kullanıcı bilgisi zaten varsa, hemen içeriği göster
          setIsChecking(false);
          return;
        }
        
        // localStorage veya sessionStorage'da token var mı kontrol et
        const localToken = localStorage.getItem('token');
        const sessionToken = sessionStorage.getItem('token');
        
        // Hiç token yoksa doğrudan login sayfasına yönlendir
        if (!localToken && !sessionToken) {
          navigate('/login');
          return;
        }
        
        // Token geçerliliğini kontrol et
        const isValid = await checkTokenValidity();
        
        if (!isValid) {
          navigate('/login');
        }
      } catch (err) {
        console.error('Token kontrolü sırasında hata:', err);
        navigate('/login');
      } finally {
        setIsChecking(false);
      }
    };
    
    verifyToken();
  }, [checkTokenValidity, navigate, user]);
  
  // Kontrol ediliyorsa yükleniyor göster
  if (isChecking) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress /> {/* GlobalLoader yerine daha hafif bir component kullan */}
      </Box>
    );
  }
  
  // Kullanıcı yoksa login sayfasına yönlendir
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

// TokenRefresher bileşeni - token geçerliliğini kontrol eder, ancak daha seyrek
const TokenRefresher: React.FC = () => {
  const { checkTokenValidity, user } = useAuth();
  const [lastCheck, setLastCheck] = useState<number>(0);
  
  useEffect(() => {
    // Kullanıcı yoksa token kontrolü yapma
    if (!user) return;
    
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheck;
    
    // İlk yükleme anında veya son kontrolden bu yana 10 dakika geçtiyse token kontrolü yap
    if (lastCheck === 0 || timeSinceLastCheck > 600000) {
      const checkToken = async () => {
        try {
          await checkTokenValidity();
          setLastCheck(Date.now());
        } catch (err) {
          console.error('Token kontrolü sırasında hata:', err);
        }
      };
      
      checkToken();
    }
    
    // 10 dakikada bir token kontrolü (5 dakikadan arttırıldı)
    const interval = setInterval(() => {
      checkTokenValidity()
        .then(() => setLastCheck(Date.now()))
        .catch(err => console.error('Zamanlanmış token kontrolünde hata:', err));
    }, 600000); // 10 dakika
    
    return () => clearInterval(interval);
  }, [checkTokenValidity, user, lastCheck]);
  
  return null;
};

// API bağlantı durumu kontrolü - iyileştirilmiş
const ApiConnectionStatus: React.FC = () => {
  const { isServerReachable } = useAuth();
  const [showMessage, setShowMessage] = useState(false);
  const [dismissCount, setDismissCount] = useState(0);
  
  // API bağlantı durumu değiştiğinde mesajı göster veya gizle
  useEffect(() => {
    if (!isServerReachable) {
      // Kullanıcı mesajı 3'ten fazla kapattıysa, artık rahatsız etmeyelim
      if (dismissCount < 3) {
        setShowMessage(true);
      }
    } else {
      // Bağlantı geri geldiğinde sayacı sıfırla
      setDismissCount(0);
      setShowMessage(false);
    }
  }, [isServerReachable, dismissCount]);
  
  const handleClose = () => {
    setShowMessage(false);
    setDismissCount(prev => prev + 1);
  };
  
  return (
    <Snackbar 
      open={!isServerReachable && showMessage} 
      autoHideDuration={10000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert 
        severity="error" 
        sx={{ width: '100%' }}
        onClose={handleClose}
      >
        API sunucusuna bağlanılamıyor. Lütfen internet bağlantınızı ve sunucu durumunu kontrol edin.
      </Alert>
    </Snackbar>
  );
};

function AppContent() {
  return (
    <>
      <Router>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          minHeight: '100vh'
        }}>
          <NavigationBar />
          <TokenRefresher />
          <ApiConnectionStatus />
          <GlobalLoader />
          <Box sx={{ flex: 1 }}>
            <Suspense fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
              </Box>
            }>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute>
                      <ProjectsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/create" 
                  element={
                    <ProtectedRoute>
                      <CreateProjectPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects/:projectId" 
                  element={
                    <ProtectedRoute>
                      <ProjectDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/team" 
                  element={
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/team/:projectId" 
                  element={
                    <ProtectedRoute>
                      <TeamPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning" 
                  element={
                    <ProtectedRoute>
                      <LearningPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/learning/:courseId" 
                  element={
                    <ProtectedRoute>
                      <LearningPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/course/:courseId" 
                  element={
                    <ProtectedRoute>
                      <CourseDetailPage />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/learning/admin" element={<LearningAdminPage />} />
                <Route 
                  path="/calendar" 
                  element={
                    <ProtectedRoute>
                      <CalendarPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={<AdminPanel />} 
                />
                {/* Geçersiz route durumunda projeler sayfasına yönlendir */}
                <Route 
                  path="*" 
                  element={<Navigate to="/projects" />} 
                />
              </Routes>
            </Suspense>
          </Box>
          <Footer />
        </Box>
      </Router>
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppWithTheme />
    </ThemeProvider>
  );
}

function AppWithTheme() {
  // Özel tema hook ile tema modunu al
  const { theme, mode } = useTheme();
  
  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={getGlobalStyles(mode)} />
      <LoadingProvider>
        <AuthProvider>
          <ProjectProvider>
            <TaskProvider>
              <AppContent />
            </TaskProvider>
          </ProjectProvider>
        </AuthProvider>
      </LoadingProvider>
    </>
  );
}

export default App;
