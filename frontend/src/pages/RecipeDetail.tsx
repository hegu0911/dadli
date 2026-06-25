import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Recipe, Comment } from "../types";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { ArrowLeftIcon, HeartIcon, HeartFilledIcon, BookmarkIcon, BookmarkFilledIcon, ClockIcon, ChefHatIcon, UsersIcon, CommentIcon, CloseIcon, FoodIcon, CameraIcon } from "../components/Icons";
import { SkeletonCard, ErrorState, showToast } from "../components/Premium";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageIdx, setImageIdx] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  useEffect(() => {
    setLoading(true); setError("");
    api.get(`/recipes/${id}`).then((res) => {
      setRecipe(res.data.recipe);
      setComments(res.data.recipe.comments || []);
    }).catch(() => setError("Resept tapılmadı")).finally(() => setLoading(false));
  }, [id]);

  const toggleLike = async () => {
    if (!user || !recipe) return;
    try {
      const res = await api.post(`/interactions/${id}/like`);
      setLiked(res.data.liked);
      setRecipe({ ...recipe, _count: { ...recipe._count, likes: res.data.count } });
    } catch { showToast("Xəta", "error"); }
  };

  const toggleSave = async () => {
    if (!user) return;
    try {
      const res = await api.post(`/interactions/${id}/save`);
      setSaved(res.data.saved);
      showToast(saved ? "Çıxarıldı" : "Saxlanıldı", "success");
    } catch { showToast("Xəta", "error"); }
  };

  const addComment = async () => {
    if (!commentText.trim() || !user) return;
    try {
      const res = await api.post(`/interactions/${id}/comments`, { text: commentText });
      setComments((prev) => [res.data.comment, ...prev]);
      setCommentText("");
    } catch { showToast("Xəta", "error"); }
  };

  if (loading) return <div className="pb-16"><SkeletonCard /><SkeletonCard /></div>;
  if (error || !recipe) return <ErrorState message={error || "Resept tapılmadı"} />;

  const difficultyLabel = recipe.difficulty === "easy" ? "Asan" : recipe.difficulty === "medium" ? "Orta" : "Çətin";

  return (
    <div className="pb-16 max-w-lg mx-auto">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 glass flex items-center justify-between px-4 h-12 border-b border-gray-100">
        <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900"><ArrowLeftIcon size={22} /></button>
        <span className="text-sm font-semibold">Resept</span>
        <button onClick={toggleSave} className={`transition-colors ${saved ? "text-primary" : "text-gray-700 hover:text-primary"}`}>
          {saved ? <BookmarkFilledIcon size={22} /> : <BookmarkIcon size={22} />}
        </button>
      </div>

      {/* Hero Image / Carousel */}
      {recipe.images && recipe.images.length > 0 ? (
        <div className="relative w-full aspect-[4/3] bg-gray-100">
          <img
            src={recipe.images[imageIdx].url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          {recipe.images.length > 1 && (
            <>
              {imageIdx > 0 && (
                <button onClick={() => setImageIdx((i) => i - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
              )}
              {imageIdx < recipe.images.length - 1 && (
                <button onClick={() => setImageIdx((i) => i + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
                </button>
              )}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {recipe.images.map((_, i) => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imageIdx ? "bg-white" : "bg-white/50"}`} />
                ))}
              </div>
            </>
          )}
        </div>
      ) : recipe.imageUrl ? (
        <img src={recipe.imageUrl} alt={recipe.title} className="w-full aspect-[4/3] object-cover" />
      ) : (
        <div className="w-full aspect-[4/3] bg-gradient-to-br from-rose-50 via-white to-rose-100/30 flex items-center justify-center">
          <FoodIcon size={80} className="opacity-40" />
        </div>
      )}

      {/* Title Section */}
      <div className="px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h1 className="font-bold text-2xl tracking-tight mb-2">{recipe.title}</h1>
          <p className="text-gray-500 text-sm mb-4">{recipe.description}</p>

          {/* Meta Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.totalTime && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <ClockIcon size={14} /> {recipe.totalTime} dəq
              </span>
            )}
            {recipe.difficulty && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <ChefHatIcon size={14} /> {difficultyLabel}
              </span>
            )}
            {recipe.servings && (
              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-full">
                <UsersIcon size={14} /> {recipe.servings}
              </span>
            )}
            {recipe.cuisine && <span className="bg-rose-50 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{recipe.cuisine}</span>}
            {recipe.diet && <span className="bg-green-50 text-green-600 text-xs font-medium px-3 py-1.5 rounded-full">{recipe.diet}</span>}
          </div>

          {/* Author */}
          <Link to={`/profile/${recipe.author.username}`} className="flex items-center gap-3 pt-3 border-t border-gray-100">
            <Avatar src={recipe.author.avatarUrl} name={recipe.author.displayName || recipe.author.username} size="md" />
            <div>
              <p className="text-sm font-semibold">{recipe.author.displayName || recipe.author.username}</p>
              <p className="text-xs text-gray-400">@{recipe.author.username}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-5 px-4 py-3 border-b border-gray-100 mx-4">
        <button onClick={toggleLike} className={`flex items-center gap-1.5 transition-colors ${liked ? "text-red-500" : "text-gray-700 hover:text-red-500"}`}>
          {liked ? <HeartFilledIcon size={24} /> : <HeartIcon size={24} />}
          <span className="text-sm font-semibold">{recipe._count?.likes || 0}</span>
        </button>
        <button onClick={() => setCommentsOpen(true)} className="flex items-center gap-1.5 text-gray-700 hover:text-gray-900 transition-colors">
          <CommentIcon size={24} />
          <span className="text-sm font-semibold">{comments.length}</span>
        </button>
        <button onClick={toggleSave} className={`flex items-center gap-1.5 transition-colors ${saved ? "text-primary" : "text-gray-700 hover:text-primary"}`}>
          <BookmarkIcon size={24} />
          <span className="text-sm font-semibold">{recipe._count?.saves || 0}</span>
        </button>
        {user && (
          <button onClick={() => navigate(`/recipe/${id}/cook`)} className="ml-auto bg-primary text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-rose-600 active:scale-95 transition-all shadow-sm">
            Bişir
          </button>
        )}
      </div>

      {/* Ingredients */}
      <div className="px-4 py-4 mx-4 border-b border-gray-100">
        <h2 className="font-bold text-base mb-3">Tərkiblər</h2>
        <ul className="space-y-2.5">
          {recipe.ingredients?.map((ing, i) => (
            <li key={i} className="flex items-center gap-3 text-sm group">
              <span className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0 group-hover:bg-primary transition-colors" />
              <span className="font-semibold text-gray-900 min-w-[60px]">{ing.amount} {ing.unit === "stəkan" ? "st." : ing.unit}</span>
              <span className="text-gray-700">{ing.name}</span>
              {ing.alternative && <span className="text-gray-400 text-xs">({ing.alternative})</span>}
            </li>
          ))}
        </ul>
      </div>

      {/* Steps */}
      <div className="px-4 py-4 mx-4 border-b border-gray-100">
        <h2 className="font-bold text-base mb-3">Addımlar</h2>
        <ol className="space-y-4">
          {recipe.steps?.map((step, i) => (
            <li key={i} className="flex gap-3 group">
              <span className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-primary transition-colors">
                {step.order}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">{step.instruction}</p>
                {step.timer && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                    <ClockIcon size={12} /> {step.timer} dəq
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Hashtags */}
      {recipe.hashtags && recipe.hashtags.length > 0 && (
        <div className="px-4 py-3 mx-4 flex flex-wrap gap-1.5">
          {recipe.hashtags.map((tag, i) => <span key={i} className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer">{tag}</span>)}
        </div>
      )}

      {/* Comments Overlay Panel */}
      {commentsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setCommentsOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2">
              <h3 className="font-bold text-lg">Şərhlər ({comments.length})</h3>
              <button onClick={() => setCommentsOpen(false)} className="text-gray-400 hover:text-gray-600"><CloseIcon size={20} /></button>
            </div>
            {user ? (
              <div className="flex items-center gap-2 mb-4">
                <Avatar src={user.avatarUrl} name={user.displayName || user.username} size="sm" />
                <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200 focus-within:bg-white focus-within:border-gray-300 transition-all">
                  <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" placeholder="Şərh yaz..." value={commentText}
                    onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment()} />
                  <button onClick={addComment} disabled={!commentText.trim()} className="text-primary font-semibold text-sm disabled:opacity-30">Göndər</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="block text-sm text-primary font-semibold mb-4" onClick={() => setCommentsOpen(false)}>Şərh yazmaq üçün daxil ol</Link>
            )}
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Hələ şərh yoxdur. İlk şərhi sən yaz!</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <Avatar src={c.user.avatarUrl} name={c.user.displayName || c.user.username} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{c.user.displayName || c.user.username}</p>
                    <p className="text-sm text-gray-800">{c.text}</p>
                    {c.replies && c.replies.map((r) => (
                      <div key={r.id} className="flex gap-2 mt-2 ml-3">
                        <Avatar src={r.user.avatarUrl} name={r.user.displayName || r.user.username} size="sm" />
                        <div>
                          <p className="text-xs font-semibold">{r.user.displayName || r.user.username}</p>
                          <p className="text-sm text-gray-800">{r.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
