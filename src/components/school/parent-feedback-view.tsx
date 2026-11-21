import { useState, type FormEvent } from "react";
import type { Gate } from "@/components/school/gate";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { isAdmin } from "@/lib/school/model";
import { submitQrParentFeedback } from "@/lib/school/api";
import { QrParentFeedbackInbox } from "@/components/school/qr-parent-feedback-inbox";

export function ParentFeedbackView({ ws, flash }: Gate) {
  const staff = ws.me.role === "teacher" || isAdmin(ws.me.role);
  if (staff) return <div className="max-w-5xl space-y-5"><header><h1 className="font-serif text-3xl text-navy">Parent Feedback</h1><p className="text-sm text-muted">Review messages sent from the feedback area below the public report cards and reply to families from one dashboard.</p></header><QrParentFeedbackInbox flash={flash} /></div>;
  if (ws.me.role !== "parent" && ws.me.role !== "student") return null;
  return <FamilyFeedbackForm ws={ws} flash={flash} />;
}

function FamilyFeedbackForm({ ws, flash }: Pick<Gate, "ws" | "flash">) {
  const [learnerId, setLearnerId] = useState(ws.learners[0]?.id ?? "");
  const [parentName, setParentName] = useState(ws.me.fullName);
  const [parentEmail, setParentEmail] = useState(ws.me.email);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const learner = ws.learners.find((item) => item.id === learnerId);
  async function send(event: FormEvent) {
    event.preventDefault();
    if (!learner) return;
    setBusy(true);
    try {
      await submitQrParentFeedback({ data: { code: learner.publicCode, parentName, parentEmail, message } });
      setMessage("");
      flash("Your feedback was sent to the school.");
    } catch (error) { flash(errText(error), true); }
    finally { setBusy(false); }
  }
  return <div className="max-w-3xl space-y-5"><header><h1 className="font-serif text-3xl text-navy">Parent Feedback</h1><p className="text-sm text-muted">Send a private message to the school about a linked learner. This is also available below each public report card.</p></header><form className="rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-5 shadow-card" onSubmit={send}><label className="block text-sm font-semibold">Learner<select className={inputClass + " mt-1"} value={learnerId} onChange={(event) => setLearnerId(event.target.value)}>{ws.learners.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}</select></label><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="block text-sm font-semibold">Your name<input className={inputClass + " mt-1"} required maxLength={120} value={parentName} onChange={(event) => setParentName(event.target.value)} /></label><label className="block text-sm font-semibold">Email (optional)<input className={inputClass + " mt-1"} type="email" maxLength={200} value={parentEmail} onChange={(event) => setParentEmail(event.target.value)} /></label></div><label className="mt-3 block text-sm font-semibold">Message<textarea className={inputClass + " mt-1 min-h-32"} required minLength={4} maxLength={1500} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write your feedback or question for the school…" /></label><button className={btnClass + " mt-4"} type="submit" disabled={busy || !learner}>{busy ? "Sending…" : "Send feedback"}</button></form></div>;
}
