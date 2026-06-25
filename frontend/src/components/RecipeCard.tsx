import { Link } from "react-router-dom";
import { Recipe } from "../types";
import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import Avatar from "./Avatar";
import { HeartIcon, HeartFilledIcon, CommentIcon, BookmarkIcon, BookmarkFilledIcon, MoreHorizontalIcon, EditIcon, TrashIcon, HideIcon, FlagIcon, DownloadIcon, SendMessageIcon, SearchIcon, FoodIcon } from "./Icons";
import { showToast, Modal } from "./Premium";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User } from "../types";

interface Props {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(recipe.isLiked || false);
  const [saved, setSaved] = useState(recipe.isSaved || false);
  const [likeCount, setLikeCount] = useState(recipe._count?.likes || 0);
  const [animating, setAnimating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [followingUsers, setFollowingUsers] = useState<User[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwn = user?.id === recipe.author.id;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (shareOpen && user?.id) {
      api.get(`/users/${user.id}/following`).then(res => {
        setFollowingUsers(res.data.following || []);
      }).catch(() => {});
    }
  }, [shareOpen, user?.id]);

  useEffect(() => {
    if (!userSearch.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(userSearch)}&type=users`);
        setSearchResults(res.data.users || []);
      } catch { setSearchResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  const toggleLike = async () => {
    try {
      const res = await api.post(`/interactions/${recipe.id}/like`);
      setLiked(res.data.liked);
      setLikeCount(res.data.count);
      if (!liked) { setAnimating(true); setTimeout(() => setAnimating(false), 300); }
    } catch { showToast("Xeta bas verdi", "error"); }
  };

  const toggleSave = async () => {
    try {
      const res = await api.post(`/interactions/${recipe.id}/save`);
      setSaved(res.data.saved);
      showToast(saved ? "Saxlanilandan cixarildi" : "Saxlanildi", "success");
    } catch { showToast("Xeta bas verdi", "error"); }
  };

  const handleDelete = async () => {
    if (!confirm("Resepti silmek istediyinize eminsiniz?")) return;
    try {
      await api.delete(`/recipes/${recipe.id}`);
      showToast("Resept silindi", "success");
      setMenuOpen(false);
    } catch { showToast("Xeta", "error"); }
  };

  const handleReport = () => { setMenuOpen(false); setReportOpen(true); };

  const submitReport = () => {
    if (!reportText.trim()) { showToast("Sikayetinizi yazin", "error"); return; }
    showToast("Sikayetiniz gonderildi", "success");
    setReportOpen(false);
    setReportText("");
  };

  const downloadPDF = () => {
    const ingText = Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map((i: any) => `- ${i.amount} ${i.unit} ${i.name}`).join("\n") : "";
    const stepText = Array.isArray(recipe.steps)
      ? recipe.steps.map((s: any) => `${s.order}. ${s.instruction}`).join("\n") : "";
    const text = [
      `Resept: ${recipe.title}`,
      `Muellif: ${recipe.author.displayName || recipe.author.username}`,
      `Hazirlama: ${recipe.totalTime || ""} deq  Cetinlik: ${recipe.difficulty || ""}`,
      "", "TERKIBLER:", ingText, "", "ADIMLAR:", stepText,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setMenuOpen(false);
    showToast("Resept endirildi", "success");
  };

  const sendToUser = async (targetUser: User) => {
    try {
      const msg = `${recipe.title} reseptine bax: ${window.location.origin}/recipe/${recipe.id}`;
      await api.post(`/messages/${targetUser.id}`, { content: msg });
      setShareOpen(false);
      showToast(`${targetUser.displayName || targetUser.username} adli istifadeciye gonderildi`, "success");
    } catch { showToast("Xeta bas verdi", "error"); }
  };

  const difficultyLabel = recipe.difficulty === "easy" ? "Asan" : recipe.difficulty === "medium" ? "Orta" : "Cetin";

  return (
    <div className="mb-4 bg-white rounded-xl overflow-hidden border border-gray-100">
      {/* Card Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/profile/${recipe.author.username}`} className="flex items-center gap-2.5">
          <Avatar src={recipe.author.avatarUrl} name={recipe.author.displayName || recipe.author.username} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight">{recipe.author.displayName || recipe.author.username}</p>
            <p className="text-[11px] text-gray-400">{recipe.location || recipe.cuisine || "Yemek"}</p>
          </div>
        </Link>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 hover:text-gray-600 transition-colors">
            <MoreHorizontalIcon size={20} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 slide-up">
              {isOwn ? (
                <>
                  <button onClick={() => { setMenuOpen(false); navigate(`/recipe/${recipe.id}`); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                    <EditIcon size={16} className="text-gray-500" /> Redakte et
                  </button>
                  <button onClick={handleDelete}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5">
                    <TrashIcon size={16} className="text-red-500" /> Sil
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setMenuOpen(false); showToast("Gizledildi", "success"); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                    <HideIcon size={16} className="text-gray-500" /> Gizlet
                  </button>
                  <button onClick={handleReport}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                    <FlagIcon size={16} className="text-gray-500" /> Bildir
                  </button>
                  <button onClick={toggleSave}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                    <BookmarkIcon size={16} className="text-gray-500" /> {saved ? "Saxlanilib" : "Saxla"}
                  </button>
                  <button onClick={downloadPDF}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2.5">
                    <DownloadIcon size={16} className="text-gray-500" /> PDF endir
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Image */}
      <Link to={`/recipe/${recipe.id}`}>
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full aspect-square object-cover bg-gray-50" loading="lazy" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-rose-50 via-white to-rose-100/30 flex items-center justify-center relative group">
            <FoodIcon size={60} className="opacity-40 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/[0.02] to-transparent" />
          </div>
        )}
      </Link>

      {/* Card Actions */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <button onClick={toggleLike} className={`transition-all active:scale-125 ${liked ? "text-red-500" : "text-gray-900 hover:text-red-500"}`}>
            {liked ? <HeartFilledIcon size={24} className={animating ? "like-animate" : ""} /> : <HeartIcon size={24} />}
          </button>
          <Link to={`/recipe/${recipe.id}`} className="text-gray-900 hover:text-gray-600 transition-colors">
            <CommentIcon size={24} />
          </Link>
          <button onClick={() => setShareOpen(true)} className="text-gray-900 hover:text-gray-600 transition-colors">
            <SendMessageIcon size={22} />
          </button>
        </div>
        <button onClick={toggleSave} className={`transition-all active:scale-125 ${saved ? "text-primary" : "text-gray-900 hover:text-primary"}`}>
          {saved ? <BookmarkFilledIcon size={24} /> : <BookmarkIcon size={24} />}
        </button>
      </div>

      {/* Likes Count */}
      <div className="px-4 pb-1">
        <p className="text-sm font-semibold text-gray-900">
          {likeCount} <span className="font-normal text-gray-500">beyenme</span>
        </p>
      </div>

      {/* Title + Description */}
      <div className="px-4 pb-1">
        <Link to={`/recipe/${recipe.id}`}>
          <p className="text-sm">
            <span className="font-semibold text-gray-900">{recipe.title}</span>
            {recipe.description && <span className="text-gray-600 ml-1">{recipe.description}</span>}
          </p>
        </Link>
        <div className="flex items-center gap-3 mt-1.5">
          {recipe.totalTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {recipe.totalTime} deq
            </span>
          )}
          {recipe.difficulty && <span className="text-[11px] text-gray-400">{difficultyLabel}</span>}
          {recipe.servings && <span className="text-[11px] text-gray-400">{recipe.servings} porsiya</span>}
        </div>
      </div>

      {/* Comments link */}
      <Link to={`/recipe/${recipe.id}`} className="block px-4 pb-3 text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
        Butun sherhlere bax ({recipe._count?.comments || 0})
      </Link>

      {/* Report Modal */}
      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Resepti bildir">
        <p className="text-sm text-gray-500 mb-3">Sikayetinizi yazin:</p>
        <textarea className="ig-input mb-3" rows={4} value={reportText}
          onChange={(e) => setReportText(e.target.value)} placeholder="Sikayetinizin sebebi..." />
        <button onClick={submitReport}
          className="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-rose-600 transition-all active:scale-[0.98] text-sm">
          Gonderr
        </button>
      </Modal>

      {/* Share Modal - User selector */}
      <Modal open={shareOpen} onClose={() => setShareOpen(false)} title="Istifadeciye gonder">
        <div className="relative mb-3">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="ig-input pl-9" placeholder="Istifadeci adi..." value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)} autoFocus />
        </div>
        {userSearch.trim() ? (
          searchResults.length > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-1">
              {searchResults.filter((u: any) => u.id !== user?.id).map((u: any) => (
                <button key={u.id} onClick={() => sendToUser(u)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <Avatar src={u.avatarUrl} name={u.displayName || u.username} size="sm" />
                  <div>
                    <p className="text-sm font-semibold">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Istifadeci tapilmadi</p>
          )
        ) : (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Izlediklerin</p>
            {followingUsers.length > 0 ? (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {followingUsers.filter((u: any) => u.id !== user?.id).map((u: any) => (
                  <button key={u.id} onClick={() => sendToUser(u)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left">
                    <Avatar src={u.avatarUrl} name={u.displayName || u.username} size="sm" />
                    <div>
                      <p className="text-sm font-semibold">{u.displayName || u.username}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">Hale izlediyin istifadeci yoxdur</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
