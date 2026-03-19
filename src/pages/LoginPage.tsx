import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
        <div className="p-8 text-center bg-muted/30 border-b">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <span className="text-primary-foreground font-bold text-3xl">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">POS Enterprise</h1>
          <p className="text-muted-foreground mt-2 text-sm">Welcome back! Please sign in to your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg flex items-start gap-3 text-destructive animate-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Mail size={18} />
                </div>
                <input 
                  required
                  type="email" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-semibold">Password</label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type="password" 
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-1">
            <input type="checkbox" id="remember" className="rounded border-muted-foreground/30 text-primary focus:ring-primary/20" />
            <label htmlFor="remember" className="text-xs text-muted-foreground font-medium cursor-pointer">Remember me for 30 days</label>
          </div>

          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="p-6 bg-muted/10 border-t text-center">
          <p className="text-xs text-muted-foreground">
            Don't have an account? <span className="text-primary font-bold cursor-pointer hover:underline">Contact Administrator</span>
          </p>
        </div>
      </div>
    </div>
  );
}
