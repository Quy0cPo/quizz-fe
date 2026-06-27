import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";

export function AdminLoginScreen({ onLoginSuccess, onBack }: { onLoginSuccess: (token: string, username: string) => void; onBack: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      onLoginSuccess(data.token, data.username);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenFrame variant="centered" maxWidth="md">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-50 tracking-tight">Admin Area</h2>
            <p className="text-sm font-medium text-slate-400">Login required</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-400 ml-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="admin"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-400 ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 bg-slate-950 border border-slate-800 rounded-xl px-4 text-slate-200 outline-none focus:border-indigo-500/50 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" size="lg" className="w-full h-12 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login to Dashboard"}
          </Button>
        </form>
      </motion.div>
    </ScreenFrame>
  );
}
