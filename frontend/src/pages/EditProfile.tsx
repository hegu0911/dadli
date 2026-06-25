import { useState, useEffect, FormEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ArrowLeftIcon, CameraIcon } from "../components/Icons";
import { showToast } from "../components/Premium";
import Avatar from "../components/Avatar";

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [location, setLocation] = useState(user?.location || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isPrivate, setIsPrivate] = useState(user?.isPrivate || false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Sekil 5MB-dan kicik olmalidir", "error");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.post("/users/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAvatarUrl(res.data.user.avatarUrl);
      showToast("Sekil yuklendi", "success");
    } catch {
      showToast("Xeta bas verdi", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/users/profile/me", { displayName, bio, location, avatarUrl, isPrivate });
      showToast("Profil yenilendi", "success");
      navigate(-1);
    } catch {
      showToast("Xeta bas verdi", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-16">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-gray-600"><ArrowLeftIcon size={20} /></button>
        <h1 className="font-semibold text-base">Profili redakte et</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5 max-w-md mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div className="relative">
            <Avatar src={avatarUrl} name={user?.displayName || user?.username || ""} size="xl" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:bg-rose-600 transition-colors">
              <CameraIcon size={16} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <span className="text-xs text-gray-400">{uploading ? "Yuklenir..." : "Profil sekli deyis"}</span>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Istifadeci adi</label>
          <input className="ig-input bg-gray-50 text-gray-400" value={user?.username || ""} disabled />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Ad</label>
          <input className="ig-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={30} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Bio</label>
          <textarea className="ig-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={150} placeholder="Ozu haqqinda..." />
          <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/150</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Mekan</label>
          <input className="ig-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Baki, Azerbaycan" />
        </div>

        {/* Private Account Toggle */}
        <div className="flex items-center justify-between py-3 border-t border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">Gizli hesab</p>
            <p className="text-xs text-gray-400">Hesabini gizli et, yalniz izleyicilerin gore bilsin</p>
          </div>
          <button type="button" onClick={() => setIsPrivate(!isPrivate)}
            className={`w-12 h-7 rounded-full transition-colors duration-200 relative ${isPrivate ? "bg-primary" : "bg-gray-300"}`}>
            <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${isPrivate ? "translate-x-[22px]" : "translate-x-0"}`} />
          </button>
        </div>

        <button type="submit" disabled={loading || uploading}
          className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-semibold py-3 rounded-xl hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/30">
          {loading ? "Yenilenir..." : "Yadda saxla"}
        </button>
      </form>
    </div>
  );
}
