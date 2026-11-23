import { useState } from "react";
import { submitPublicParentContact } from "@/lib/school/api";

export function PublicParentContact({ code, learnerName }: { code: string; learnerName: string }) {
  const [phone, setPhone] = useState("");
  const [parentName, setParentName] = useState("");
  const [relationship, setRelationship] = useState<"" | "father" | "mother">("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "busy" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("busy");
    setMessage("");
    try {
      await submitPublicParentContact({ data: { code, phone, parentName, relationship, website } });
      setStatus("success");
      setMessage("Thank you. The parent phone number has been securely sent to the school.");
      setPhone("");
      setParentName("");
      setRelationship("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send the details. Please try again.");
    }
  }

  return (
    <section className="mb-5 rounded-2xl border-2 border-red-300 bg-gradient-to-br from-red-50 via-white to-rose-50 p-5 shadow-lg" aria-labelledby="parent-details-heading">
      <div className="flex gap-3">
        <div className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-full bg-red-600 text-xl font-black text-white" aria-hidden="true">!</div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-red-700">Important parent request</p>
          <h2 id="parent-details-heading" className="mt-1 font-serif text-2xl font-bold text-red-900">PLEASE ADD PARENT DETAILS</h2>
          <p className="mt-1 text-sm font-medium text-red-900/80">Please add a parent phone number so Kiwanja Ndege JSS can reach your family when needed.</p>
        </div>
      </div>
      <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-semibold text-navy sm:col-span-2">Student / learner
          <input className="mt-1 w-full rounded-lg border border-red-200 bg-red-50/60 px-3 py-2 text-sm font-semibold text-navy" value={learnerName} readOnly aria-readonly="true" />
          <span className="mt-1 block text-xs font-normal text-muted">Filled automatically from this secure report link.</span>
        </label>
        <label className="text-sm font-semibold text-navy sm:col-span-2">Parent phone number <span className="text-red-600">*</span>
          <input className="mt-1 w-full rounded-lg border-2 border-red-300 bg-white px-3 py-2 text-sm focus:border-red-600 focus:outline-none" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. +254 7xx xxx xxx" required maxLength={60} value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-navy">Parent name <span className="font-normal text-muted">(optional)</span>
          <input className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" autoComplete="name" maxLength={120} placeholder="Your name (optional)" value={parentName} onChange={(event) => setParentName(event.target.value)} />
        </label>
        <label className="text-sm font-semibold text-navy">Relationship <span className="font-normal text-muted">(optional)</span>
          <select className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm" value={relationship} onChange={(event) => setRelationship(event.target.value as typeof relationship)}>
            <option value="">Choose if you wish</option><option value="father">Father</option><option value="mother">Mother</option>
          </select>
        </label>
        <label className="hidden" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label>
        <button className="rounded-lg bg-red-700 px-4 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2" type="submit" disabled={status === "busy"}>{status === "busy" ? "Sending securely…" : "Send parent phone number"}</button>
      </form>
      {message ? <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-semibold ${status === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`} role={status === "error" ? "alert" : "status"}>{message}</p> : null}
      <p className="mt-3 text-xs text-red-900/70">Your phone number is shared only with authorized Kiwanja Ndege school staff for school communication. The report below is unchanged.</p>
    </section>
  );
}
