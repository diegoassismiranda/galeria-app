import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage        from './pages/LoginPage'
import SignupPage       from './pages/SignupPage'
import ForgotPassword   from './pages/ForgotPassword'
import Dashboard        from './pages/Dashboard'
import AlbumPage        from './pages/AlbumPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  return !user ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login"  element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/album/:id" element={<PrivateRoute><AlbumPage /></PrivateRoute>} />
      <Route path="*"       element={<Navigate to="/" replace />} />
    </Routes>
  )
}
