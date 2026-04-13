import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { QuestionsPage } from "./pages/QuestionsPage";
import { AdminQuestionsPage } from "./pages/AdminQuestionsPage";

export function App() {
  return (
    <BrowserRouter>
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/questions" element={<QuestionsPage />} />
          <Route path="/admin/questions" element={<AdminQuestionsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
