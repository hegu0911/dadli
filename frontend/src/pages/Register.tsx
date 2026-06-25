import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WarningIcon } from "../components/Icons";

export default function Register() {
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(username, email, password, displayName || undefined);
    } catch (err: any) {
      setError(err.response?.data?.error || "Xeta bas verdi");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto bg-white">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
          <span className="text-white text-2xl font-bold">D</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Hesab yarat</h1>
        <p className="text-gray-500 text-sm mt-1">DADLY-e qosul</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
            <WarningIcon size={14} className="inline text-red-500" /> {error}
          </div>
        )}
        <input type="text" className="ig-input" value={username} onChange={(e) => setUsername(e.target.value)}
          placeholder="Istifadeci adi" required minLength={2} maxLength={15} />
        <input type="text" className="ig-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Ad (isteye bagli)" maxLength={30} />
        <input type="email" className="ig-input" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" required />
        <input type="password" className="ig-input" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Sifre (en azi 6 simvol)" required minLength={6} />
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-semibold py-3 rounded-xl hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/30 text-sm">
          {loading ? "Qeydiyyat..." : "Qeydiyyatdan kec"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-8">
        Hesabin var? <Link to="/login" className="text-primary font-semibold hover:underline">Daxil ol</Link>
      </p>
    </div>
  );
}
