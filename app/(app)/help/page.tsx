"use client";

import { useMemo, useState } from "react";
import { FAQS } from "@/lib/faqs";

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => FAQS.filter((faq) => `${faq.question} ${faq.answer} ${faq.category}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-sm font-medium text-blue-600">Help centre</p><h1 className="mt-1 text-2xl font-bold text-slate-950">FAQs and TrailPilot Assistant</h1><p className="mt-1 text-sm text-slate-500">Find quick answers or use the AI assistant in the bottom-right corner.</p></div><input className="input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search FAQs..." /><div className="grid gap-4 md:grid-cols-2">{filtered.map((faq) => <details key={faq.question} className="card group"><summary className="cursor-pointer list-none font-semibold text-slate-900">{faq.question}<span className="float-right text-blue-600">+</span></summary><p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p><span className="mt-3 inline-block text-xs font-medium uppercase tracking-wide text-slate-400">{faq.category}</span></details>)}</div>{filtered.length === 0 && <div className="card text-sm text-slate-500">No matching FAQ found. Ask the TrailPilot Assistant instead.</div>}</div>;
}
