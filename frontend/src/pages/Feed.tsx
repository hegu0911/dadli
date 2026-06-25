import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Recipe, StoryGroup } from "../types";
import RecipeCard from "../components/RecipeCard";
import Avatar from "../components/Avatar";
import { MessageIcon, CameraIcon, PlusIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import { SkeletonCard, ErrorState, showToast } from "../components/Premium";
import StoryViewer from "../components/StoryViewer";

export default function Feed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stories, setStories] = useState<StoryGroup[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/feed/explore?page=${page}&limit=5`);
      if (page === 1) {
        setRecipes(res.data.recipes);
      } else {
        setRecipes((prev) => [...prev, ...res.data.recipes]);
      }
      setHasMore(page < res.data.totalPages);
    } catch (err) {
      setError("Feed yüklenmedi");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  useEffect(() => {
    api.get("/stories").then((res) => setStories(res.data.stories || [])).catch(() => {});
  }, []);

  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("image", file);
      await api.post("/stories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Story paylaşıldı", "success");
      api.get("/stories").then((res) => setStories(res.data.stories || [])).catch(() => {});
    } catch { showToast("Xeta", "error"); }
    e.target.value = "";
  };

  if (error && page === 1) {
    return (
      <div className="pb-16">
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DADLY" className="h-7" />
          </div>
        </div>
        <ErrorState message={error} onRetry={loadFeed} />
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="DADLY" className="h-7" />
          </div>
          <div className="flex items-center gap-4">
            <Link to="/messages" className="text-gray-600 hover:text-gray-900 transition-colors">
              <MessageIcon size={22} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="border-b border-gray-100">
        <div className="flex gap-5 px-4 py-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:border-primary transition-colors">
              <PlusIcon size={24} className="text-gray-400" />
            </div>
            <span className="text-[11px] text-gray-400">Senin</span>
          </button>
          {stories.map((group, idx) => (
            <button key={group.user.id} onClick={() => setActiveStoryIndex(idx)}
              className="flex flex-col items-center gap-1 flex-shrink-0">
              <Avatar src={group.user.avatarUrl} name={group.user.displayName || group.user.username} size="lg" story />
              <span className="text-[11px] text-gray-600 truncate max-w-[64px]">{group.user.displayName || group.user.username}</span>
            </button>
          ))}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleStoryUpload} />
      </div>

      {/* Feed */}
      <div className="pt-1">
        {loading && page === 1 ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : (
          recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)
        )}

        {loading && page > 1 && (
          <div className="flex justify-center py-6">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {hasMore && !loading && recipes.length > 0 && (
          <div className="px-4 py-4">
            <button onClick={() => setPage((p) => p + 1)}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-semibold text-gray-600 transition-colors active:scale-[0.99]">
              Daha cox yukle
            </button>
          </div>
        )}
      </div>

      {/* Story Viewer */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <StoryViewer
          stories={stories}
          initialIndex={activeStoryIndex}
          onClose={() => setActiveStoryIndex(null)}
        />
      )}
    </div>
  );
}
