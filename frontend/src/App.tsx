import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import LoginPage from './pages/LoginPage'
import EmployeePage from './pages/EmployeePage'
import AdminPage from './pages/AdminPage'
import ActionPage from './pages/ActionPage'
import ChangePasswordPage from './pages/ChangePasswordPage'

function ProtectedRoute({ children, role }: { children: JSX.Element; role?: string }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.mustChangePassword) return <Navigate to="/change-password" replace />
  return user.role === 'Manager' ? <Navigate to="/admin" replace /> : <Navigate to="/employee" replace />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/action" element={<ActionPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route
              path="/employee"
              element={
                <ProtectedRoute role="Employee">
                  <EmployeePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="Manager">
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
