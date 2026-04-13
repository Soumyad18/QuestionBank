import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { AdminQuestionsPage } from "./pages/AdminQuestionsPage";
import { AdminManagePage } from "./pages/AdminManagePage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AuthProvider, useAuth } from "./lib/auth";

// A simple wrapper to protect admin routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
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
          
          <Route 
            path="/admin/questions" 
            element={
              <AdminRoute>
                <AdminQuestionsPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/manage" 
            element={
              <AdminRoute>
                <AdminManagePage />
              </AdminRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
