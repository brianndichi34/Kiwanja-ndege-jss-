import { useState } from "react";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { requestParentRegistration, verifyParentRegistration } from "@/lib/school/api";

export function ParentRegistration({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<"details" | "verify" | "review">("details");
  const [requestId, setRequestId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [additionalLearnerName, setAdditionalLearnerName] = useState("");
  const [website, setWebsite] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitDetails(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const combinedLearnerName = [learnerName, additionalLearnerName].map((value) => value.trim()).filter(Boolean).join(" ");
      const rawResult = await requestParentRegistration({ data: { email, fullName, phone, learnerName: combinedLearnerName, website } });
      const result = typeof rawResult === "string" ? JSON.parse(rawResult) as { ok: boolean; message?: string; requestId?: string; learnerName?: string } : rawResult;
      if (!result.ok) { setError(result.message ?? "Parent registration could not be completed."); return; }
      if (!result.requestId || !result.learnerName) { setError("Parent registration returned an incomplete response. Please try again."); return; }
      setRequestId(result.requestId);
      setStep("verify"); setSuccess(`Learner ${result.learnerName} was selected automatically. A verification code and temporary password were sent to ${email}. They expire in 10 minutes.`);
    } catch (reason) { setError(errText(reason)); } finally { setBusy(false); }
  }
  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await verifyParentRegistration({ data: { requestId, code } }); setSuccess("Email verified. Sign in with the temporary password from the email, then choose a new password before entering the parent portal."); }
    catch (reason) { setError(errText(reason)); } finally { setBusy(false); }
  }

  return <section className="mt-4 rounded-xl border-2 border-info/30 bg-card p-4 shadow-sm" aria-labelledby="parent-registration-heading">
    <div className="flex items-start justify-between gap-3"><div><h3 id="parent-registration-heading" className="font-serif text-xl text-navy">Create a parent account</h3><p className="mt-1 text-xs leading-5 text-muted">Enter your email, contact number, and learner’s name. A first name or surname can work if it uniquely identifies the learner. We’ll email a verification code to confirm your email and create your account.</p></div><button type="button" className="text-xs font-semibold text-info underline" onClick={onDone}>Close</button></div>
    {step === "details" ? <form className="mt-4 space-y-3" onSubmit={submitDetails}>
      <label className="block text-sm font-medium">Your email address<input className={`${inputClass} mt-1`} type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="block text-sm font-medium">Your full name<input className={`${inputClass} mt-1`} autoComplete="name" maxLength={120} value={fullName} onChange={(event) => setFullName(event.target.value)} required /></label>
      <label className="block text-sm font-medium">Contact number <span className="text-bad">(required)</span><input className={`${inputClass} mt-1`} type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. +254 7xx xxx xxx" value={phone} onChange={(event) => setPhone(event.target.value)} required /></label>
      <label className="block text-sm font-medium">Learner’s Name<input className={`${inputClass} mt-1`} placeholder="Full name, first name, or surname" value={learnerName} onChange={(event) => setLearnerName(event.target.value)} required /></label>
      <label className="block text-sm font-medium">Additional learner name <span className="font-normal text-muted">(optional for similar names)</span><input className={`${inputClass} mt-1`} placeholder="Other name or surname if needed" value={additionalLearnerName} onChange={(event) => setAdditionalLearnerName(event.target.value)} /></label>
      <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
      {error ? <p className="text-sm text-bad" role="alert">{error}</p> : null}
      <button className={`${btnClass} w-full`} disabled={busy} type="submit">{busy ? "Matching learner and sending code…" : "Match learner and email me a verification code"}</button>
    </form> : step === "review" ? <div className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold">School office review required</p><p className="mt-1">{success}</p><p className="mt-2 text-xs">Please keep this email address available. No verification code is issued until the learner is selected by an authorised super admin.</p></div> : <form className="mt-4 space-y-3" onSubmit={verify}>
      <p className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{success}</p>
      <label className="block text-sm font-medium">Email verification code<input className={`${inputClass} mt-1 tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required /></label>
      <p className="rounded-lg border border-line bg-paper/60 p-3 text-xs leading-5 text-muted">Your verification email also contains a temporary password. It expires in 10 minutes. After verification, sign in with it and change it before continuing.</p>
      {error ? <p className="text-sm text-bad" role="alert">{error}</p> : null}
      <button className={`${btnClass} w-full`} disabled={busy} type="submit">{busy ? "Verifying email…" : "Confirm email and activate parent account"}</button>
    </form>}
    <p className="mt-3 text-xs leading-5 text-muted">Email verification confirms access to the email address, not guardianship by itself. The contact number is recorded as entered and is not phone-verified. For learner-record corrections or access concerns, contact the school office. To add another learner later, sign in again with the same parent email and that learner’s name.</p>
  </section>;
}
