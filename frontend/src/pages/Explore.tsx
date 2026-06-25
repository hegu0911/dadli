import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Recipe } from "../types";
import { FireIcon, SearchIcon, FoodIcon } from "../components/Icons";
import { SkeletonCard, ErrorState } from "../components/Premium";

const categories = ["Azərbaycan", "İtalyan", "Desert", "Şorba", "Salat", "Vejetaryen", "Vegan", "Keto", "Tez bişən", "Bayram"];

export default function Explore() {
  const [trending, setTrending] = useState<Recipe[]>([]);
  const [latest, setLatest] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true); setError("");
    Promise.all([
      api.get("/feed/trending"),
      api.get("/feed/explore?limit=12"),
    ]).then(([trendRes, latestRes]) => {
      setTrending(trendRes.data.recipes);
      setLatest(latestRes.data.recipes);
    }).catch(() => setError("Məlumat yüklənmədi"))
    .finally(() => setLoading(false));
  }, []);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="pb-16">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-12">
          <h1 className="font-bold text-lg">Kəşf</h1>
          <Link to="/search" className="text-gray-600 hover:text-gray-900"><SearchIcon size={22} /></Link>
        </div>
      </div>

      {/* Categories scroll */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button key={cat} className="px-4 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm font-medium whitespace-nowrap hover:bg-gray-200 active:bg-gray-300 transition-colors">
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="px-4 pt-4"><SkeletonCard /><SkeletonCard /></div>
      ) : (
        <>
          {/* Trending row */}
          {trending.length > 0 && (
            <div className="px-4 py-4">
              <div className="flex items-center gap-1.5 mb-3">
                <FireIcon size={16} className="text-primary" />
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trenddə</h2>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {trending.slice(0, 4).map((r) => (
                  <Link key={r.id} to={`/recipe/${r.id}`} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FoodIcon size={24} className="text-gray-300" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                      <span className="text-white text-[10px] font-medium truncate">{r.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Latest grid */}
          <div className="px-4 pb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Son reseptlər</h2>
            <div className="grid grid-cols-3 gap-1">
              {latest.map((r) => (
                <Link key={r.id} to={`/recipe/${r.id}`} className="aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                  {r.imageUrl ? (
                    <img src={r.imageUrl} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><FoodIcon size={32} className="text-gray-300" /></div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
