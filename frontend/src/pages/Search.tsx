import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import { SearchIcon, FireIcon, FoodIcon } from "../components/Icons";
import { SkeletonCard, showToast } from "../components/Premium";

const popularItems = [
  { name: "Plov" },
  { name: "Dolma" },
  { name: "Baklava" },
  { name: "Toyuq" },
  { name: "Salat" },
  { name: "Sobe" },
  { name: "Balig" },
  { name: "Kofte" },
  { name: "Pendir" },
];

export default function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Recipe[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"search" | "ingredients">("search");

  const doSearch = useCallback(async () => {
    if (!query.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true); setSearched(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(query)}&type=${mode}`);
      setResults(res.data.recipes || []);
    } catch { showToast("Axtaris xetasi", "error"); }
    finally { setLoading(false); }
  }, [query, mode]);

  useEffect(() => { const d = setTimeout(doSearch, 400); return () => clearTimeout(d); }, [query, doSearch]);

  return (
    <div className="pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 py-3">
          <div className="relative">
            <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="ig-input pl-10" placeholder="Resept adi ve ya terkib..." value={query}
              onChange={(e) => setQuery(e.target.value)} autoFocus />
          </div>
          {/* Mode Toggle */}
          <div className="flex items-center gap-3 mt-2.5">
            <button onClick={() => setMode("search")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${mode === "search" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              Ada gore
            </button>
            <button onClick={() => setMode("ingredients")}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${mode === "ingredients" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              Terkibe gore
            </button>
          </div>
        </div>
      </div>

      {/* Popular Grid (always visible when not searching) */}
      {!searched && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-1.5 mb-3">
            <FireIcon size={14} className="text-primary" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Populyar</span>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {popularItems.map((item) => (
              <button key={item.name} onClick={() => setQuery(item.name)}
                className="flex flex-col items-center gap-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl py-3 transition-colors active:scale-95">
                <FoodIcon size={24} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-600">{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searched && (
        <div className="px-4 pt-3">
          {loading ? (
            <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
          ) : results.length > 0 ? (
            <>
              <p className="text-xs text-gray-400 mb-3">{results.length} netice tapildi</p>
              {results.map((r: any) => (
                <div key={r.id}>
                  <RecipeCard recipe={r} />
                  {r.matchPercentage && (
                    <div className="text-sm text-gray-500 -mt-3 mb-3 px-1">
                      <span className="text-xs font-medium text-green-600">{r.matchPercentage}% uygun</span>
                      {r.matchedIngredients && r.matchedIngredients.length > 0 && (
                        <span className="text-xs text-gray-400">({r.matchedIngredients.join(", ")})</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-16 fade-in">
              <SearchIcon size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-gray-600">Netice tapilmadi</p>
              <p className="text-sm text-gray-400 mt-1">Fergli soz ve ya torkib axtarin</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
