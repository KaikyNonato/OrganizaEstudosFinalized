
import './App.css'
import Navbar from './components/Navbar'
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SignupPage from './pages/authPages/SignupPage'
import LoginPage from './pages/authPages/LoginPage'
import VerifyEmailPage from './pages/authPages/VerifyEmailPage'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import PerfilPage from './pages/userPages/PerfilPage'
import { Loader } from 'lucide-react'
import ForgotPasswordPage from './pages/authPages/ForgotPasswordPage'
import ResetPasswordPage from './pages/authPages/ResetPasswordPage'
import UpdateUserPage from './pages/userPages/UpdateUserPage'
import MatterPage from './pages/matterPages/MatterPage'
import DrawerSidebar from './components/DrawerSidebar'
import ReviewsPage from './pages/reviewsPages/ReviewsPage'
import TimeLinePage from './pages/timelinePages/TimeLinePage'
import PomodoroPage from './pages/pomodoroPages/PomodoroPage'
import AdminPage from './pages/adminPages/AdminPage'
import ViewPdf from './pages/viewfilesPages/ViewPdf'


const AdminRoute = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}


const ProtectedRoute = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user.isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}

const RedirectAuthenticatedUser = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    // toast.error('Você já está autenticado ou verificado!', {id: 'already-authenticated'});
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

function App() {
  const location = useLocation();
  const { isCheckingAuth, checkAuth, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return (
    <div className='min-h-screen flex justify-center items-center'>
      <Loader className='animate-spin' />
    </div>
  )

  const hideNavbarRoutes = ['/signup', '/login', '/verify-email', '/forgot-password'];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/view-pdf');

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>

        <Route element={<RedirectAuthenticatedUser />}>
          <Route path='/signup' element={<SignupPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/verify-email' element={<VerifyEmailPage />} />
          <Route path='/forgot-password' element={<ForgotPasswordPage />} />
          <Route path='/reset-password/:token' element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path='/perfil' element={<PerfilPage />} />
          <Route path='/update-user' element={<UpdateUserPage />} />
          <Route path='/view-pdf/:subjectId/:publicId' element={<ViewPdf />} />
        </Route>


        <Route element={<DrawerSidebar />}>
          <Route path='/' element={<HomePage />} />
          <Route path='/materias' element={<MatterPage />} />
          <Route path='/revisoes' element={<ReviewsPage />} />
          <Route path='/cronograma' element={<TimeLinePage />} />
          <Route path='/pomodoro' element={<PomodoroPage />} />
        </Route>

        {/* Rotas de Administrador */}
        <Route element={<AdminRoute />}>
          <Route path='/admin' element={<AdminPage />} />
        </Route>

      </Routes>

      <Toaster />
    </>
  )
}

export default App
