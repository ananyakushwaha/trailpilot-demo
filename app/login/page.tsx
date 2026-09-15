"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api-client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [portal, setPortal] = useState<"agency" | "hotel" | "control">("agency");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password, portal }),
      });
      router.push(portal === "control" ? "/control-panel" : "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{portal === "control" ? "Product Control Panel Login" : portal === "hotel" ? "Hotel Owner Login" : "Agency Owner Login"}</h1>
        <p className="mt-1 text-sm text-slate-500">{portal === "control" ? "For the TrailPilot product owner and platform administrator." : portal === "hotel" ? "Manage hotel arrivals, guests and stay requests." : "Manage your agency, team and customer operations."}</p>

        <div className="mt-5 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          <button type="button" onClick={() => setPortal("agency")} className={`rounded-md px-2 py-2 text-xs font-medium ${portal === "agency" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Agency Owner</button>
          <button type="button" onClick={() => setPortal("hotel")} className={`rounded-md px-2 py-2 text-xs font-medium ${portal === "hotel" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500"}`}>Hotel Owner</button>
          <button type="button" onClick={() => setPortal("control")} className={`rounded-md px-2 py-2 text-xs font-medium ${portal === "control" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Product Control Panel</button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              required
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={portal === "control" ? "admin@trailpilot.com" : portal === "hotel" ? "hotel@yourhotel.com" : "owner@youragency.com"}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              required
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </label>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Signing in..." : portal === "control" ? "Login to Control Panel" : portal === "hotel" ? "Login as Hotel Owner" : "Login as Agency Owner"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to TrailPilot?{" "}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Create an agency account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
