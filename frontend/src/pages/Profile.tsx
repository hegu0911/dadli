import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { User, Recipe } from "../types";
import Avatar from "../components/Avatar";
import { useAuth } from "../context/AuthContext";
import { GridIcon, BookmarkIcon, SettingsIcon, ArrowLeftIcon, EmptyRecipeIcon, EmptyBookmarkIcon } from "../components/Icons";
import { SkeletonProfile, ErrorState, showToast } from "../components/Premium";

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [following, setFollowing] = useState(false);
  const [requested, setRequested] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwn = currentUser?.username === username;
  const effectiveUsername = username === "me" && currentUser ? currentUser.username : username;

  useEffect(() => {
    if (!effectiveUsername) { setLoading(false); return; }
    setLoading(true); setError("");
    api.get(`/users/${effectiveUsername}`).then((res) => {
      setProfile(res.data.user);
      setFollowing(res.data.user.isFollowing || false);
      setRequested(res.data.user.followRequestStatus === "pending");
      if (res.data.user?.id) {
        api.get(`/recipes?userId=${res.data.user.id}`).then((r) => setRecipes(r.data.recipes)).catch(() => {});
      }
    }).catch(() => setError("Istifadeci tapilmadi")).finally(() => setLoading(false));
  }, [effectiveUsername]);

  const toggleFollow = async () => {
    if (!profile || !currentUser) return;
    try {
      const res = await api.post(`/users/${profile.id}/follow`);
      setFollowing(res.data.following);
      setRequested(res.data.requested || false);
      if (profile._count) {
        setProfile({
          ...profile,
          _count: {
            ...profile._count,
            followers: profile._count.followers + (res.data.following ? 1 : res.data.requested ? 0 : -1),
          },
        });
      }
      if (res.data.requested) showToast("Izleme isteyi gonderildi", "success");
      else if (res.data.following) showToast("Izlenir", "success");
      else showToast("Izleme dayandirildi", "success");
    } catch { showToast("Xeta bas verdi", "error"); }
  };

  if (loading) return <SkeletonProfile />;
  if (error) return <ErrorState message={error} />;
  if (!profile) return <ErrorState message="Istifadeci tapilmadi" />;

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="pb-16">
      {/* Gradient Header */}
      <div className="bg-gradient-to-br from-primary/10 via-rose-50 to-white">
        <div className="flex items-center justify-between px-4 h-11">
          <Link to="/" className="text-gray-600"><ArrowLeftIcon size={20} /></Link>
          <p className="text-sm font-semibold">@{profile.username}</p>
          {isOwnProfile ? (
            <Link to="/profile/me/edit" className="text-gray-600"><SettingsIcon size={20} /></Link>
          ) : <div className="w-5" />}
        </div>

        <div className="px-4 pb-4">
          <div className="flex items-start gap-4">
            <Avatar src={profile.avatarUrl} name={profile.displayName || profile.username} size="xl" story />
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="font-bold text-lg truncate">{profile.displayName || profile.username}</h1>
              <p className="text-sm text-gray-500">@{profile.username}</p>
              {profile.location && <p className="text-xs text-gray-400 mt-0.5">{profile.location}</p>}
              {profile.isPrivate && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Gizli hesab
                </span>
              )}
            </div>
          </div>

          {profile.bio && <p className="text-sm text-gray-800 mt-3 leading-relaxed">{profile.bio}</p>}

          {/* Stats Row */}
          <div className="flex items-center justify-around mt-4 bg-white/60 rounded-2xl py-3 px-2 backdrop-blur-sm border border-white/80">
            <div className="text-center">
              <p className="font-bold text-lg">{profile._count?.recipes || 0}</p>
              <p className="text-[11px] text-gray-400">Resept</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="font-bold text-lg">{profile._count?.followers || 0}</p>
              <p className="text-[11px] text-gray-400">Izleyici</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="font-bold text-lg">{profile._count?.following || 0}</p>
              <p className="text-[11px] text-gray-400">Izlenen</p>
            </div>
          </div>

          {/* Action Button */}
          {currentUser && !isOwnProfile ? (
            <button onClick={toggleFollow}
              className={`w-full mt-3 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-sm ${
                requested ? "bg-amber-100 text-amber-800" :
                following ? "bg-gray-100 text-gray-800 hover:bg-gray-200" : "bg-gradient-to-r from-primary to-rose-700 text-white hover:from-rose-700 hover:to-rose-800 shadow-primary/30"
              }`}>
              {requested ? "Istek gonderildi" : following ? "Izleyirsen" : "Izle"}
            </button>
          ) : (
            <Link to="/profile/me/edit" className="block w-full mt-3 py-2.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-800 text-center hover:bg-gray-200 transition-colors shadow-sm">
              Profili redakte et
            </Link>
          )}

          {/* Cuisine Tags */}
          {profile.cuisineTags && Array.isArray(profile.cuisineTags) && profile.cuisineTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.cuisineTags.map((tag, i) => (
                <span key={i} className="bg-rose-50 text-primary text-xs px-3 py-1 rounded-full border border-rose-200">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 sticky top-0 z-10 bg-white">
        <button onClick={() => setActiveTab("posts")}
          className={`flex-1 flex items-center justify-center h-11 text-sm transition-colors ${
            activeTab === "posts" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400"
          }`}>
          <GridIcon size={18} />
        </button>
        <button onClick={() => setActiveTab("saved")}
          className={`flex-1 flex items-center justify-center h-11 text-sm transition-colors ${
            activeTab === "saved" ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-400"
          }`}>
          <BookmarkIcon size={18} />
        </button>
      </div>

      {/* Content */}
      {activeTab === "posts" && recipes.length === 0 ? (
        <div className="text-center py-16 fade-in">
          <EmptyRecipeIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">Hele resept yoxdur</p>
          {isOwnProfile && <Link to="/create" className="text-primary text-sm font-semibold mt-2 inline-block">Ilk resepti paylas</Link>}
        </div>
      ) : activeTab === "posts" ? (
        <div className="grid grid-cols-3 gap-1 p-1">
          {recipes.map((r) => (
            <Link key={r.id} to={`/recipe/${r.id}`} className="aspect-square bg-gray-100 rounded-sm overflow-hidden group relative">
              {r.images && r.images.length > 0 ? (
                <img src={r.images[0].url} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : r.imageUrl ? (
                <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-300 text-xs font-medium">{r.title[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                <span className="text-white text-xs font-semibold flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  {r._count?.likes || 0}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : !isOwnProfile ? (
        <div className="text-center py-16 fade-in">
          <EmptyBookmarkIcon size={48} className="mx-auto mb-3 text-gray-300" />
          <p className="font-semibold text-gray-600">Saxlanilan reseptler</p>
          <p className="text-sm text-gray-400 mt-1">Bu bolme yalniz size ozel</p>
        </div>
      ) : null}
    </div>
  );
}
