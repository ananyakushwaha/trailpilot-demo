"use client";

import { useEffect, useState } from "react";

type Feature = { key: string; label: string; description: string; enabled: boolean; premiumOnly: boolean };
type Agency = { id: string; name: string; email: string; plan: "FREE" | "PREMIUM"; createdAt: string };
type UpgradeRequest = { id: string; upiReference: string; note: string | null; createdAt: string; agency: { name: string; email: string } };

export default function ControlPanelPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [upgradeRequests, setUpgradeRequests] = useState<UpgradeRequest[]>([]);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load(panelPassword = password) {
    setLoading(true);
    const response = await fetch("/api/admin/platform", { headers: { "x-control-panel-password": panelPassword } });
    if (!response.ok) { setMessage(response.status === 401 ? "Incorrect control-panel password." : "Control panel is not configured yet."); setLoading(false); return false; }
    const data = await response.json();
    setFeatures(data.features);
    setAgencies(data.agencies);
    setUpgradeRequests(data.upgradeRequests ?? []);
    setLoading(false);
    setUnlocked(true);
    return true;
  }

  useEffect(() => { setLoading(false); }, []);

  async function update(body: object, key: string) {
    setSaving(key);
    setMessage("");
    const response = await fetch("/api/admin/platform", { method: "PATCH", headers: { "Content-Type": "application/json", "x-control-panel-password": password }, body: JSON.stringify(body) });
    setSaving(null);
    if (response.ok) {
      setMessage("Saved successfully.");
      await load();
    } else {
      setMessage("Could not save this change.");
    }
  }

  if (!unlocked) return <div className="mx-auto max-w-md"><div className="card"><p className="text-sm font-medium text-blue-600">Restricted area</p><h1 className="mt-1 text-xl font-bold text-slate-950">Product control panel</h1><p className="mt-2 text-sm text-slate-500">Enter the control-panel password to manage services and business subscriptions.</p><form className="mt-5 space-y-3" onSubmit={(event) => { event.preventDefault(); void load(); }}><input autoFocus required type="password" className="input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Control-panel password" />{message && <p className="text-sm text-red-600">{message}</p>}<button className="btn-primary w-full" disabled={loading}>{loading ? "Checking..." : "Open control panel"}</button></form></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-medium text-blue-600">TrailPilot Admin</p><h1 className="text-2xl font-bold text-slate-950">Product control panel</h1><p className="mt-1 text-sm text-slate-500">Control which services are available to businesses and manage their subscription access.</p></div>
        <button className="btn-primary" disabled={saving === "unlock-all"} onClick={() => update({ action: "unlock-all" }, "unlock-all")}>Unlock every feature</button>
      </div>
      {message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}

      {upgradeRequests.length > 0 && <section className="card"><div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Pending UPI upgrades</h2><p className="text-sm text-slate-500">Check your UPI account, then approve the matching transaction.</p></div><div className="space-y-3">{upgradeRequests.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4"><div><p className="font-medium text-slate-900">{item.agency.name}</p><p className="text-xs text-slate-600">{item.agency.email} · UPI reference: <strong>{item.upiReference}</strong></p>{item.note && <p className="mt-1 text-xs text-slate-500">{item.note}</p>}</div><div className="flex gap-2"><button className="btn-secondary" disabled={saving === item.id} onClick={() => update({ action: "upi-request", requestId: item.id, decision: "REJECTED" }, item.id)}>Reject</button><button className="btn-primary" disabled={saving === item.id} onClick={() => update({ action: "upi-request", requestId: item.id, decision: "APPROVED" }, item.id)}>Approve Premium</button></div></div>)}</div></section>}

      <section className="card">
        <div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Service access</h2><p className="text-sm text-slate-500">Lock a service globally while it is being tested, upgraded or maintained.</p></div>
        <div className="divide-y divide-slate-100">
          {features.map((feature) => <div key={feature.key} className="flex items-center justify-between gap-4 py-4"><div><div className="flex items-center gap-2"><p className="font-medium text-slate-900">{feature.label}</p>{feature.premiumOnly && <span className="badge bg-amber-100 text-amber-700">Premium</span>}</div><p className="text-sm text-slate-500">{feature.description}</p></div><button aria-label={`${feature.enabled ? "Lock" : "Unlock"} ${feature.label}`} disabled={saving === feature.key} onClick={() => update({ action: "feature", key: feature.key, enabled: !feature.enabled }, feature.key)} className={`relative h-7 w-12 rounded-full transition ${feature.enabled ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${feature.enabled ? "left-6" : "left-1"}`} /></button></div>)}
        </div>
      </section>

      <section className="card"><div className="mb-4"><h2 className="text-lg font-semibold text-slate-900">Business subscriptions</h2><p className="text-sm text-slate-500">Review agencies and manually grant or remove Premium access.</p></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400"><th className="px-3 py-3">Business</th><th className="px-3 py-3">Owner email</th><th className="px-3 py-3">Plan</th><th className="px-3 py-3">Action</th></tr></thead><tbody>{agencies.map((agency) => <tr key={agency.id} className="border-b border-slate-100"><td className="px-3 py-3 font-medium text-slate-900">{agency.name}</td><td className="px-3 py-3 text-slate-500">{agency.email}</td><td className="px-3 py-3"><span className={`badge ${agency.plan === "PREMIUM" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{agency.plan}</span></td><td className="px-3 py-3"><button className="text-sm font-medium text-blue-600 hover:text-blue-800" disabled={saving === agency.id} onClick={() => update({ action: "agency-plan", agencyId: agency.id, plan: agency.plan === "PREMIUM" ? "FREE" : "PREMIUM" }, agency.id)}>{agency.plan === "PREMIUM" ? "Move to Free" : "Grant Premium"}</button></td></tr>)}</tbody></table></div></section>
    </div>
  );
}
