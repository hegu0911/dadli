import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { WarningIcon } from "../components/Icons";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || "Xeta bas verdi");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 max-w-sm mx-auto bg-white">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-rose-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30">
          <span className="text-white text-3xl font-bold">D</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-rose-700 bg-clip-text text-transparent">DADLY</h1>
        <p className="text-gray-500 text-sm mt-2">Dadli reseptler, sosial dad</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
            <WarningIcon size={14} className="inline text-red-500" /> {error}
          </div>
        )}
        <input type="email" className="ig-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" className="ig-input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sifre" required />
        <button type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-rose-700 text-white font-semibold py-3 rounded-xl hover:from-rose-700 hover:to-rose-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/30 text-sm">
          {loading ? "Daxil olunur..." : "Daxil ol"}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400">
          Hesabin yoxdur?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Qeydiyyatdan kec</Link>
        </p>
      </div>
    </div>
  );
}
