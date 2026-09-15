"use client";

import { useState } from "react";

export default function UpgradePage() {
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const upiId = process.env.NEXT_PUBLIC_PREMIUM_UPI_ID || "Contact TrailPilot owner for UPI ID";
  const qrUrl = process.env.NEXT_PUBLIC_PREMIUM_UPI_QR_URL;

  async function submitPayment() {
    setLoading(true); setMessage("");
    const response = await fetch("/api/billing/manual-upi", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ upiReference: reference, note }) });
    const data = await response.json();
    setMessage(response.ok ? "Payment submitted. The product owner will verify it and unlock Premium." : (data.error || "Could not submit payment details."));
    if (response.ok) { setReference(""); setNote(""); }
    setLoading(false);
  }

  return <div className="mx-auto max-w-3xl space-y-6"><div><p className="text-sm font-medium text-blue-600">TrailPilot Premium</p><h1 className="mt-1 text-2xl font-bold text-slate-950">Upgrade with UPI</h1><p className="mt-2 text-sm text-slate-500">Pay manually using UPI, submit the transaction reference, and the product owner will verify and activate your Premium plan.</p></div>{message && <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{message}</div>}<div className="card border-blue-200 bg-blue-50/40"><span className="badge bg-blue-600 text-white">Premium</span><h2 className="mt-3 text-xl font-semibold text-slate-900">Complete TrailPilot CRM</h2><p className="mt-1 text-sm text-slate-500">Premium price: ₹{Number(process.env.NEXT_PUBLIC_PREMIUM_PRICE_INR || "4999").toLocaleString("en-IN")}</p><div className="mt-5 grid gap-5 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1 · Pay by UPI</p><div className="mt-2 rounded-lg border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">UPI ID</p><p className="mt-1 break-all text-lg font-bold text-slate-900">{upiId}</p>{qrUrl && <img src={qrUrl} alt="Premium UPI QR code" className="mt-4 h-40 w-40 rounded border border-slate-200 object-contain" />}</div></div><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2 · Submit proof</p><div className="mt-2 space-y-3"><input required className="input" value={reference} onChange={(event) => setReference(event.target.value)} placeholder="UPI transaction reference / UTR" /><textarea className="textarea" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note" /><button className="btn-primary w-full" disabled={loading || reference.trim().length < 4} onClick={() => void submitPayment()}>{loading ? "Submitting..." : "Submit payment for verification"}</button></div></div></div></div><div className="card"><h2 className="font-semibold text-slate-900">Premium includes</h2><ul className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2"><li>✓ Advanced analytics and circular graphs</li><li>✓ AI itinerary generation</li><li>✓ WhatsApp automation</li><li>✓ Hotel OS module</li><li>✓ Print, PDF and Excel exports</li><li>✓ Owner profile and integrations</li></ul></div></div>;
}
