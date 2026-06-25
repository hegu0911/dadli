import { useState, useRef, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { ArrowLeftIcon, CloseIcon, CameraIcon } from "../components/Icons";
import { showToast } from "../components/Premium";

interface IngredientRow { name: string; amount: number; unit: string; }
interface StepRow { instruction: string; }

export default function CreateRecipe() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [servings, setServings] = useState(1);
  const [category, setCategory] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [ingredients, setIngredients] = useState<IngredientRow[]>([{ name: "", amount: 1, unit: "g" }]);
  const [steps, setSteps] = useState<StepRow[]>([{ instruction: "" }]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const addIngredient = () => setIngredients((prev) => [...prev, { name: "", amount: 1, unit: "g" }]);
  const removeIngredient = (i: number) => setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: keyof IngredientRow, value: string | number) => {
    setIngredients((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };
  const addStep = () => setSteps((prev) => [...prev, { instruction: "" }]);
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i));
  const updateStep = (i: number, value: string) => {
    setSteps((prev) => prev.map((item, idx) => idx === i ? { ...item, instruction: value } : item));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - imageFiles.length;
    const toAdd = files.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setImagePreviews((prev) => [...prev, ev.target!.result as string]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { showToast("Resept adi teleb olunur", "error"); return; }
    if (ingredients.filter(i => i.name.trim()).length === 0) { showToast("En azi 1 terkib elave edin", "error"); return; }
    if (steps.filter(s => s.instruction.trim()).length === 0) { showToast("En azi 1 addim elave edin", "error"); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      const payload = {
        title, description, prepTime, cookTime, difficulty, servings, category, cuisine,
        ingredients: ingredients.filter((i) => i.name.trim()),
        steps: steps.filter((s) => s.instruction.trim()).map((s, idx) => ({ ...s, order: idx + 1 })),
      };
      formData.append("data", JSON.stringify(payload));
      imageFiles.forEach((f) => formData.append("images", f));

      const res = await api.post("/recipes", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast("Resept paylasildi!", "success");
      navigate(`/recipe/${res.data.recipe.id}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Xeta bas verdi", "error");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 px-4 h-12 border-b border-gray-100 sticky top-0 z-10 bg-white/90 backdrop-blur-md">
        <button onClick={() => navigate(-1)} className="text-gray-600"><ArrowLeftIcon size={20} /></button>
        <h1 className="font-semibold text-base">Yeni resept</h1>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 max-w-md mx-auto">
        {/* Image Upload */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Sekiller (1-3)</label>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((preview, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200">
                <img src={preview} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center">
                  <CloseIcon size={12} className="text-white" />
                </button>
              </div>
            ))}
            {imageFiles.length < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-primary transition-colors bg-gray-50">
                <CameraIcon size={20} className="text-gray-400" />
                <span className="text-[10px] text-gray-400">Sekil elave et</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Reseptin adi *</label>
          <input className="ig-input" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={60} placeholder="Meselen: Sah Plov" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Qisa tesvir</label>
          <textarea className="ig-input" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Resept haqqinda..." />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Hazirliq</label>
            <div className="relative">
              <input type="number" className="ig-input pr-8" value={prepTime || ""} onChange={(e) => setPrepTime(Number(e.target.value))} min={0} placeholder="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">deq</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Bisirme</label>
            <div className="relative">
              <input type="number" className="ig-input pr-8" value={cookTime || ""} onChange={(e) => setCookTime(Number(e.target.value))} min={0} placeholder="0" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">deq</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Porsiya</label>
            <input type="number" className="ig-input" value={servings} onChange={(e) => setServings(Number(e.target.value))} min={1} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Cetinlik</label>
            <select className="ig-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Asan</option>
              <option value="medium">Orta</option>
              <option value="hard">Cetin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Methex</label>
            <input className="ig-input" value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="azeri, italyan..." />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Kateqoriya</label>
          <input className="ig-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Meselen: Esas yemek, Desert" />
        </div>

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Terkibler *</label>
            <button type="button" onClick={addIngredient} className="text-primary text-xs font-semibold hover:text-rose-600 transition-colors">+ Elave et</button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-1 items-stretch">
                <input className="ig-input flex-[8] text-xl py-4" placeholder="Terkib adi" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} />
                <input type="number" className="ig-input w-12 text-base py-4" placeholder="0" value={ing.amount || ""} onChange={(e) => updateIngredient(i, "amount", Number(e.target.value))} step="any" />
                <select className="ig-input w-14 text-base py-4" value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)}>
                  <option value="g">q</option><option value="kg">kq</option>
                  <option value="ml">ml</option><option value="stekan">stekan</option>
                  <option value="x.q">x.q</option><option value="c.q">c.q</option>
                  <option value="eded">eded</option>
                </select>
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)} className="text-gray-300 hover:text-red-400 px-1 transition-colors"><CloseIcon size={18} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Addimlar *</label>
            <button type="button" onClick={addStep} className="text-primary text-xs font-semibold hover:text-rose-600 transition-colors">+ Elave et</button>
          </div>
          <div className="space-y-2">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-7 h-7 mt-2 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <div className="flex-1">
                  <textarea className="ig-input text-sm" rows={2} placeholder={`Addim ${i + 1}`} value={step.instruction} onChange={(e) => updateStep(i, e.target.value)} />
                </div>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="text-gray-300 hover:text-red-400 mt-2 transition-colors"><CloseIcon size={18} /></button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-semibold py-3.5 rounded-xl hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/30 text-sm">
          {submitting ? "Paylasilir..." : "Resepti paylas"}
        </button>
      </form>
    </div>
  );
}
