import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { Recipe } from "../types";
import { CloseIcon, CheckIcon, PartyIcon } from "../components/Icons";

export default function CookingMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/recipes/${id}`).then((res) => setRecipe(res.data.recipe)).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) { setTimerRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  useEffect(() => {
    const wakeLock = async () => {
      try { if ("wakeLock" in navigator) await (navigator as any).wakeLock.request("screen"); } catch {}
    };
    wakeLock();
  }, []);

  const startTimer = (minutes: number) => { setTimerSeconds(minutes * 60); setTimerRunning(true); };
  const toggleComplete = (idx: number) => {
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };
  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>;
  if (!recipe) return <div className="min-h-screen bg-[#1A1A2E] flex items-center justify-center text-white/50">Resept tapılmadı</div>;

  const step = recipe.steps?.[currentStep];
  const progress = ((currentStep + 1) / recipe.steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#1A1A2E] text-white flex flex-col">
      {/* Status */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors"><CloseIcon size={18} /></button>
        <div className="text-center">
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">{recipe.title}</p>
          <p className="text-xs mt-0.5 text-white/60">Addım {currentStep + 1} / {recipe.steps.length}</p>
        </div>
        <span className="text-sm font-semibold text-white/50">{Math.round(progress)}%</span>
      </div>

      {/* Progress */}
      <div className="mx-4 h-1 bg-white/[0.07] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-rose-400 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center px-8 py-8">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 bg-white/[0.06] text-white/60 text-sm px-4 py-1.5 rounded-full border border-white/[0.06]">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center">{step?.order}</span>
            Addım {step?.order}
          </span>
        </div>

        <p className="text-3xl sm:text-4xl font-bold leading-relaxed text-center mb-8 tracking-tight">{step?.instruction}</p>

        {/* Timer */}
        {step?.timer && !timerRunning && timerSeconds === 0 && (
          <div className="text-center">
            <button onClick={() => startTimer(step.timer!)}
              className="inline-flex items-center gap-2 bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold py-3 px-8 rounded-full text-lg transition-all active:scale-95 border border-white/[0.06]">
              {step.timer} dəq. başlat
            </button>
          </div>
        )}

        {(timerRunning || timerSeconds > 0) && (
          <div className="text-center">
            <div className="text-6xl font-mono font-bold mb-3 tracking-widest">{formatTime(timerSeconds)}</div>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => setTimerRunning(!timerRunning)} className="text-white/50 text-sm underline hover:text-white transition-colors">
                {timerRunning ? "Durdur" : "Davam et"}
              </button>
              <button onClick={() => { setTimerRunning(false); setTimerSeconds(0); }} className="text-white/30 text-sm underline hover:text-white transition-colors">
                Sıfırla
              </button>
            </div>
          </div>
        )}

        {/* Complete button */}
        {!step?.timer && (
          <div className="text-center mt-6">
            <button onClick={() => toggleComplete(currentStep)}
              className={`inline-flex items-center gap-2 font-semibold py-3 px-8 rounded-full text-lg transition-all active:scale-95 ${
                completedSteps.has(currentStep) ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/[0.08] text-white hover:bg-white/[0.14] border border-white/[0.06]"
              }`}>
              <CheckIcon size={18} /> {completedSteps.has(currentStep) ? "Tamamlandı" : "Tamamla"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="sticky bottom-0 px-4 py-5 pb-24 border-t border-white/[0.06] bg-[#1A1A2E]">
        <div className="flex items-center gap-3 max-w-sm mx-auto">
          <button onClick={() => setCurrentStep((p) => Math.max(0, p - 1))} disabled={currentStep === 0}
            className="flex-1 bg-white/[0.06] text-white py-3.5 rounded-xl font-medium disabled:opacity-20 hover:bg-white/[0.12] transition-all active:scale-95">
            ← Geri
          </button>
          {currentStep < recipe.steps.length - 1 ? (
            <button onClick={() => { setCurrentStep((p) => p + 1); setTimerSeconds(0); setTimerRunning(false); }}
              className="flex-1 bg-primary text-white py-3.5 rounded-xl font-medium hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-primary/20">
              İrəli →
            </button>
          ) : (
            <button onClick={() => navigate(`/recipe/${id}`)}
              className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all active:scale-95 shadow-lg shadow-green-500/20">
              <PartyIcon size={20} /> Bitdi!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
