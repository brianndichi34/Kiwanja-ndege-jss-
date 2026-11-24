import { useEffect, useState } from "react";
import { ReportSheet } from "@/components/school/report-sheet";
import type { Gate } from "@/components/school/gate";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { PeriodBar, useSchoolPeriod } from "@/components/school/period-bar";
import { buildBoards, calendarFor, decorate, learnersForYear, type Decorated } from "@/lib/school/model";
import { liveReportLink, logoDataUrl } from "@/lib/school/brand";
import { extrasFor } from "@/lib/school/extras";
import { childReport, listLearnerReportRecipients, sendLearnerReportSummary } from "@/lib/school/api";
import { downloadReportPdf, qrFor } from "@/lib/school/pdf";
import { canActorAccess } from "@/lib/school/role-access";

export function ResultsView({ ws, flash }: Gate) {
  const subjects = [...ws.subjects].sort((a, b) => a.sort - b.sort);
  const allExams = [...ws.exams].sort((a, b) => a.sort - b.sort);
  const period = useSchoolPeriod(ws);
  const profileForPeriod = { ...ws.profile, activeYearId: period.yearId, activeTermId: period.termId, academicYear: ws.years.find((year) => year.id === period.yearId)?.name ?? ws.profile.academicYear, termName: ws.terms.find((term) => term.id === period.termId)?.name ?? ws.profile.termName, reportTitle: period.calendar?.reportTitle || ws.profile.reportTitle };
  const configuredAssessments = ws.termAssessments.filter((item) => item.yearId === period.yearId && item.termId === period.termId);
  const activeExamIds = configuredAssessments.length ? new Set(configuredAssessments.filter((item) => item.active).map((item) => item.examId)) : null;
  const exams = allExams.filter((exam) => !activeExamIds || activeExamIds.has(exam.id));
  const displayExams = exams.slice(0, Math.max(1, ws.profile.reportExamCount || 2));
  const [learnerId, setLearnerId] = useState(ws.learners[0]?.id ?? "");
  const [extra, setExtra] = useState<Decorated[] | null>(null);
  const [recipients, setRecipients] = useState<Array<{ id:string; label:string; channel:string; address:string }>>([]);
  const [recipientId, setRecipientId] = useState("");
  const [sendChannel, setSendChannel] = useState<"email"|"sms">("email");
  const [sending, setSending] = useState(false);
  const learner = ws.learners.find((item) => item.id === learnerId) ?? ws.learners[0];
  useEffect(() => {
    if (period.current) {
      setExtra(null);
      return;
    }
    childReport({ data: { yearId: period.yearId, termId: period.termId } }).then((result) => setExtra(result.rows)).catch(() => setExtra([]));
  }, [period.current, period.yearId, period.termId]);
  const staffCanSend = ["teacher", "admin", "super_admin"].includes(ws.me.role);
  useEffect(() => {
    if (!staffCanSend || !learner) return;
    listLearnerReportRecipients({ data: { learnerId: learner.id } }).then((rows) => { setRecipients(rows); setRecipientId(rows[0]?.id ?? ""); setSendChannel((rows[0]?.channel as "email"|"sms") ?? "email"); }).catch(() => { setRecipients([]); setRecipientId(""); });
  }, [staffCanSend, learner?.id]);
  if (!learner) return <p className="text-sm text-muted">No learner is linked to this login yet. Ask the school office.</p>;
  const decorated = (period.current ? ws.familyReports : extra) ?? decorate(buildBoards(ws.learners.filter((item) => item.gradeId === learner.gradeId), period.marks, subjects, exams, ws.bands), ws.streams, exams);
  const row = decorated.find((item) => item.learner.id === learner.id);
  const historicalPlacement = ws.marks.find((mark) => mark.learnerId === learner.id && mark.yearId === period.yearId && mark.termId === period.termId);
  const placedLearner = learnersForYear(ws, period.yearId).find((item) => item.id === learner.id);
  const displayGradeId = placedLearner?.gradeId ?? historicalPlacement?.gradeId ?? learner.gradeId;
  const displayStreamId = placedLearner?.streamId ?? historicalPlacement?.streamId ?? learner.streamId;
  const grade = ws.grades.find((item) => item.id === displayGradeId);
  const stream = ws.streams.find((item) => item.id === displayStreamId);
  const calendar = calendarFor(ws.calendars, period.yearId, period.termId);
  const extras = learner ? extrasFor(ws, { ...learner, gradeId: displayGradeId, streamId: displayStreamId }, period.yearId, period.termId, subjects, exams) : undefined;
  if (!grade) return null;
  const canDownload = canActorAccess(ws.roleAccess, ws.me.role, "familyResults", "download");
  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl text-navy">{ws.me.role === "parent" ? "Your children" : "My results"}</h1>
          <p className="text-sm text-muted">{row ? `Position ${row.overall.position ?? "—"} of ${row.overall.outOf} · mean ${row.avgMean?.toFixed(2) ?? "—"} · ${row.level ?? "—"}` : "No marks for this term yet."}</p>
        </div>
        <PeriodBar ws={ws} yearId={period.yearId} termId={period.termId} onYear={period.setYearId} onTerm={period.setTermId} />
        {ws.learners.length > 1 ? (
          <select className={inputClass} value={learner.id} onChange={(event) => setLearnerId(event.target.value)}>
            {ws.learners.map((item) => <option key={item.id} value={item.id}>{item.fullName}</option>)}
          </select>
        ) : null}
        {row && canDownload ? <button className={btnClass} type="button" onClick={async () => {
          try {
            const link = liveReportLink(ws.profile.publicBaseUrl, row.learner.publicCode);
            const qr = ws.profile.showQr ? await qrFor(link) : "";
            const logo = await logoDataUrl(ws.profile.logoData);
            await downloadReportPdf(`${row.learner.fullName}.pdf`.replace(/\s+/g, "_"), [{
              profile: profileForPeriod, grade, stream, subjects, exams: displayExams, row, qr, logo,
              closingDate: calendar?.closingDate, openingDate: calendar?.openingDate, title: calendar?.reportTitle,
              extras,
            }]);
          } catch (error) { flash(errText(error), true); }
        }}>Download report card</button> : null}
      </header>
      {staffCanSend && row ? <section className="no-print rounded-xl border border-info/30 bg-info/5 p-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-xl text-navy">Send report summary to parent</h2><p className="text-xs text-muted">Sends only the selected learner’s subject totals, means and overall mean. The full report remains protected behind the parent portal.</p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-info">{recipients.length} saved contact{recipients.length === 1 ? "" : "s"}</span></div>{recipients.length ? <div className="mt-3 flex flex-wrap items-end gap-2"><label className="min-w-64 flex-1 text-xs font-semibold text-muted">Parent contact<select className={inputClass + " mt-1 w-full"} value={recipientId} onChange={(event) => { const next = recipients.find((item) => item.id === event.target.value); setRecipientId(event.target.value); setSendChannel((next?.channel as "email"|"sms") ?? "email"); }}>{recipients.map((item) => <option key={item.id} value={item.id}>{item.label} · {item.address}</option>)}</select></label><span className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">Delivery: {sendChannel.toUpperCase()}</span><button className={btnClass} type="button" disabled={sending || !recipientId} onClick={async () => { setSending(true); try { await sendLearnerReportSummary({ data: { learnerId: learner.id, yearId: period.yearId, termId: period.termId, recipientId, channel: sendChannel } }); flash(`Report summary sent by ${sendChannel.toUpperCase()}.`); } catch (error) { flash(errText(error), true); } finally { setSending(false); } }}>{sending ? "Sending…" : `Send ${sendChannel.toUpperCase()} summary`}</button></div> : <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">No parent email or phone contact is saved for this learner. Add one in School Services → Parent phone directory first.</p>}</section> : null}
      {row ? <ReportSheet profile={profileForPeriod} grade={grade} stream={stream} subjects={subjects} exams={displayExams} row={row} closingDate={calendar?.closingDate} openingDate={calendar?.openingDate} title={calendar?.reportTitle} extras={extras} /> : <p className="text-sm text-muted">Marks for this term have not been entered.</p>}
    </div>
  );
}
