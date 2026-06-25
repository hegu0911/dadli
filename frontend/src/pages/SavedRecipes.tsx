import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Recipe } from "../types";
import RecipeCard from "../components/RecipeCard";
import { ArrowLeftIcon, EmptyBookmarkIcon } from "../components/Icons";
import { SkeletonCard } from "../components/Premium";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/feed/explore?limit=50").then((res) => {
      // In a full app, this would be a `/saved` endpoint
      setRecipes(res.data.recipes.filter((_: any, i: number) => i % 3 === 0));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-16">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-100">
        <Link to="/profile/me" className="text-gray-600"><ArrowLeftIcon size={20} /></Link>
        <h1 className="font-semibold text-base">Saxlanılanlar</h1>
      </div>
      <div className="px-4 pt-4">
        {loading ? (
          <><SkeletonCard /><SkeletonCard /></>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16">
            <EmptyBookmarkIcon size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-600">Saxlanılan resept yoxdur</p>
          </div>
        ) : recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
      </div>
    </div>
  );
}
