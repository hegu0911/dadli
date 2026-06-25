import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import { ToastContainer } from "./components/Premium";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Explore from "./pages/Explore";
import CreateRecipe from "./pages/CreateRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import CookingMode from "./pages/CookingMode";
import Messages from "./pages/Messages";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import SavedRecipes from "./pages/SavedRecipes";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-white relative">
      <ToastContainer />
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
        <Route path="/recipe/:id" element={<ProtectedRoute><RecipeDetail /></ProtectedRoute>} />
        <Route path="/recipe/:id/cook" element={<ProtectedRoute><CookingMode /></ProtectedRoute>} />
        <Route path="/profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/me/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/saved" element={<ProtectedRoute><SavedRecipes /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <Navbar />}
    </div>
  );
}
