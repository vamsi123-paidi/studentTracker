import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import './App.css'
import AdminDashboard from "./admin/AdminDashboard"
import StudentDashboard from "./student/StudentDashboard";
import StudentAnalytics from "./student/StudentAnalytics"
import StudentHistory from "./student/StudentHistory";
import StudentPerformance from "./student/StudentPerformance";
import ProtectedRoute from "./components/protectedRoute";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/analytics"
          element={
            <ProtectedRoute role="student">
              <StudentAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/history"
          element={
            <ProtectedRoute role="student">
              <StudentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/performance"
          element={
            <ProtectedRoute role="student">
              <StudentPerformance />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
