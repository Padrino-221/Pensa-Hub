import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { PublicLayout } from './components/layout/PublicLayout';
import { PageLoader } from './components/ui/PageLoader';
import { Landing } from './pages/Landing';
import { About } from './pages/About';
import { MinistriesPage } from './pages/MinistriesPage';
import { Pensice } from './pages/Pensice';
import { PLC } from './pages/PLC';
import { Cenacle } from './pages/Cenacle';
import { Gallery } from './pages/Gallery';
import { NewsEvents } from './pages/NewsEvents';
import { NewsDetail } from './pages/NewsDetail';
import { Leadership } from './pages/Leadership';
import { Resources } from './pages/Resources';
import { Contact } from './pages/Contact';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { MembersPage } from './pages/MembersPage';
import { AttendancePage } from './pages/AttendancePage';
import { FinancePage } from './pages/FinancePage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { UsersPage } from './pages/UsersPage';
import { MessagesPage } from './pages/MessagesPage';
import { SettingsPage } from './pages/SettingsPage';
import {
  canManageMembers,
  canViewAttendance,
  canViewAudit,
  canViewFinance,
  canViewMessages,
  canViewUsers,
  canManageSettings,
} from './lib/permissions';
import type { Role } from './types';

interface ProtectedRouteProps {
  permitted?: (role: Role) => boolean;
  children: ReactNode;
}

function ProtectedRoute({ permitted, children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (permitted && !permitted(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed() {
  const { user, loading } = useAuth();
  if (!loading && user) return <Navigate to="/dashboard" replace />;
  return <LoginPage />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/ministries" element={<MinistriesPage />} />
        <Route path="/community/pensice" element={<Pensice />} />
        <Route path="/community/plc" element={<PLC />} />
        <Route path="/community/cenacle" element={<Cenacle />} />
        <Route path="/community/gallery" element={<Gallery />} />
        <Route path="/community/news" element={<NewsEvents />} />
        <Route path="/community/news/:slug" element={<NewsDetail />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/login" element={<RedirectIfAuthed />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/members"
          element={
            <ProtectedRoute permitted={canManageMembers}>
              <MembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute permitted={canViewAttendance}>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/finance"
          element={
            <ProtectedRoute permitted={canViewFinance}>
              <FinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute permitted={canViewUsers}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute permitted={canViewAudit}>
              <AuditLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute permitted={canViewMessages}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute permitted={canManageSettings}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
