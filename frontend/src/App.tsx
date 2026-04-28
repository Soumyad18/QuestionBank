import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { AdminQuestionsPage } from "./pages/AdminQuestionsPage";
import { AdminManagePage } from "./pages/AdminManagePage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminTagsPage } from "./pages/AdminTagsPage";
import { AdminCompaniesPage } from "./pages/AdminCompaniesPage";
import { AdminSessionsPage } from "./pages/AdminSessionsPage";
import { AdminEmailsPage } from "./pages/AdminEmailsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AuthProvider, useAuth } from "./lib/auth";

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/questions" element={<QuestionsPage />} />

          <Route path="/dashboard" element={<UserRoute><UserDashboardPage /></UserRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategoriesPage /></AdminRoute>} />
          <Route path="/admin/tags" element={<AdminRoute><AdminTagsPage /></AdminRoute>} />
          <Route path="/admin/companies" element={<AdminRoute><AdminCompaniesPage /></AdminRoute>} />
          <Route path="/admin/sessions" element={<AdminRoute><AdminSessionsPage /></AdminRoute>} />
          <Route path="/admin/emails" element={<AdminRoute><AdminEmailsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestionsPage /></AdminRoute>} />
          <Route path="/admin/manage" element={<AdminRoute><AdminManagePage /></AdminRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
