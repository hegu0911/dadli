import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Notification } from "../types";
import { ArrowLeftIcon, HeartIcon, MessageIcon, ProfileIcon, BookmarkIcon, CheckIcon } from "../components/Icons";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import { showToast } from "../components/Premium";

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications").then((res) => {
      setNotifications(res.data.notifications || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { showToast("Xeta", "error"); }
  };

  const handleClick = (n: Notification) => {
    if (n.recipeId) {
      navigate(`/recipe/${n.recipeId}`);
    } else if (n.type === "follow" || n.type === "follow_request" || n.type === "follow_accepted") {
      navigate(`/profile/${n.actor.username}`);
    }
  };

  const icons: Record<string, React.ReactNode> = {
    like: <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500"><HeartIcon size={16} /></div>,
    comment: <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><MessageIcon size={16} /></div>,
    follow: <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500"><ProfileIcon size={16} /></div>,
    follow_request: <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500"><ProfileIcon size={16} /></div>,
    follow_accepted: <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500"><CheckIcon size={16} /></div>,
    save: <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-primary"><BookmarkIcon size={16} /></div>,
    message: <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><MessageIcon size={16} /></div>,
  };

  const labels: Record<string, string> = {
    like: " reseptini beyendi",
    comment: " reseptine serh yazdi",
    follow: " sizi izlemeye basladi",
    follow_request: " sizi izlemek isteyir",
    follow_accepted: " izleme isteyini qebul etdi",
    save: " reseptini saxlandi",
    message: " size mesaj gonderdi",
  };

  const unread = notifications.filter((n) => !n.read);
  const read = notifications.filter((n) => n.read);

  if (loading) {
    return (
      <div className="pb-16">
        <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
          <div className="flex items-center gap-3"><ArrowLeftIcon size={20} className="text-gray-300" /><h1 className="font-semibold text-base">Bildirisler</h1></div>
        </div>
        <div className="text-center py-20 text-gray-400">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16">
      <div className="flex items-center justify-between px-4 h-12 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-gray-600"><ArrowLeftIcon size={20} /></Link>
          <h1 className="font-semibold text-base">Bildirisler</h1>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary font-semibold">Hamsini oxu</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <HeartIcon size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-semibold text-gray-600">Hale bildiris yoxdur</p>
          <p className="text-sm mt-1">Reseptleri beyen ve serh yaz</p>
        </div>
      ) : (
        <div>
          {unread.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yeni</p>
            </div>
          )}
          {unread.map((n) => (
            <button key={n.id} onClick={() => handleClick(n)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left bg-primary/5 border-b border-gray-50`}>
              <div className="flex-shrink-0">{icons[n.type] || icons.like}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className="font-semibold">{n.actor.displayName || n.actor.username}</span>
                  <span className="text-gray-600">{labels[n.type] || ""}</span>
                  {n.recipe && <span className="font-semibold"> "{n.recipe.title}"</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString("az")}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
            </button>
          ))}

          {read.length > 0 && (
            <div className="px-4 py-2 mt-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Evvel</p>
            </div>
          )}
          {read.map((n) => (
            <button key={n.id} onClick={() => handleClick(n)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left border-b border-gray-50">
              <div className="flex-shrink-0">{icons[n.type] || icons.like}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-800">{n.actor.displayName || n.actor.username}</span>
                  {labels[n.type] || ""}
                  {n.recipe && <span className="font-semibold"> "{n.recipe.title}"</span>}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString("az")}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
