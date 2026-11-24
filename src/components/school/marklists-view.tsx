import { useState } from "react";
import type { Gate } from "@/components/school/gate";
import { canActorAccess } from "@/lib/school/role-access";
import { buildBoards, decorate, learnersForYear, periodMarks } from "@/lib/school/model";
import { btnClass, errText, inputClass } from "@/components/school/gate";
import { PeriodBar, useSchoolPeriod } from "@/components/school/period-bar";
import { logoDataUrl } from "@/lib/school/brand";
import { downloadMarklist } from "@/lib/school/pdf";
import { learnersForMarklist } from "@/lib/school/marklist";
import { writeXlsxFromMatrix } from "@/lib/school/sheet";

export function MarklistsView({ ws, flash }: Gate) {
  const subjects = [...ws.subjects].sort((a, b) => a.sort - b.sort);
  const canDownload = canActorAccess(ws.roleAccess, ws.me.role, "marklists", "download");
  const allExams = [...ws.exams].sort((a, b) => a.sort - b.sort);
  const period = useSchoolPeriod(ws);
  const configuredAssessments = ws.termAssessments.filter((item) => item.yearId === period.yearId && item.termId === period.termId);
  const activeExamIds = configuredAssessments.length ? new Set(configuredAssessments.filter((item) => item.active).map((item) => item.examId)) : null;
  const exams = allExams.filter((exam) => !activeExamIds || activeExamIds.has(exam.id));
  const [gradeId, setGradeId] = useState(ws.grades[0]?.id ?? "");
  const [streamId, setStreamId] = useState(ws.streams.find((stream) => stream.gradeId === gradeId)?.id ?? "");
  const [examId, setExamId] = useState(exams[0]?.id ?? "");
  const [subjectId, setSubjectId] = useState("all");
  const [filled, setFilled] = useState(true);
  const [blankRows, setBlankRows] = useState(0);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [bestGrade, setBestGrade] = useState("all");
  const grade = ws.grades.find((item) => item.id === gradeId);
  const streams = ws.streams.filter((stream) => stream.gradeId === gradeId);
  const stream = streams.find((item) => item.id === streamId) ?? streams[0];

  function getLearners() {
    if (!grade || !stream) return [];
    const learners = learnersForMarklist(ws, period.yearId, gradeId, stream.id);
    return learners.map((learner) => ({
      roll: learner.roll,
      fullName: learner.fullName,
      gender: learner.gender,
      admissionNumber: learner.admissionNumber,
      scores: Object.fromEntries(subjects.map((subject) => {
        if (!filled) return [subject.id, null];
        const mark = period.marks.find((item) => item.learnerId === learner.id && item.gradeId === gradeId && item.streamId === stream.id && item.subjectId === subject.id && item.examId === examId);
        return [subject.id, mark?.score ?? null];
      })),
    }));
  }

  function exportExcel() {
    if (!grade || !stream) return;
    const learners = getLearners();
    const subjectOnly = subjectId === "all" ? null : subjects.find((subject) => subject.id === subjectId) ?? null;
    const yearName = ws.years.find((item) => item.id === period.yearId)?.name ?? period.yearId;
    const termName = ws.terms.find((item) => item.id === period.termId)?.name ?? period.termId;
    const columns = subjectOnly ? ["Roll", "Admission Number", "Learner Name", "Gender", "Score"] : ["Roll", "Admission Number", "Learner Name", "Gender", ...subjects.map((subject) => subject.name)];
    const values = learners.map((learner) => subjectOnly
      ? [learner.roll, learner.admissionNumber ?? "", learner.fullName, learner.gender, filled ? learner.scores[subjectOnly.id] ?? "" : ""]
      : [learner.roll, learner.admissionNumber ?? "", learner.fullName, learner.gender, ...subjects.map((subject) => filled ? learner.scores[subject.id] ?? "" : "")]);
    const workbook = writeXlsxFromMatrix([
      [ws.profile.name],
      ["Year", yearName, "Term", termName],
      ["Grade", grade.name, "Stream", stream.name],
      ["Assessment", exams.find((exam) => exam.id === examId)?.name ?? "", "Subject", subjectOnly?.name ?? "All subjects"],
      [],
      columns,
      ...values,
    ], { sheetName: `${grade.name} ${stream.name}`, orientation, headerRow: 6 });
    const blob = new Blob([workbook], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${grade.name}-${stream.name}-${yearName}-${termName}-${subjectOnly?.shortName ?? "all"}-marklist.xlsx`.replace(/[^a-zA-Z0-9._-]+/g, "_");
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    flash(`Excel workbook downloaded with ${learners.length} learner row(s).`);
  }

  async function download() {
    if (!grade || !stream) return;
    try {
      const learners = getLearners();
      const subjectOnly = subjectId === "all" ? null : subjects.find((subject) => subject.id === subjectId) ?? null;
      const year = ws.years.find((item) => item.id === period.yearId)?.name ?? "";
      const term = ws.terms.find((item) => item.id === period.termId)?.name ?? "";
      await downloadMarklist({
        fileName: `${grade.name}-${stream.name}-${year}-${term}-${subjectOnly?.shortName ?? "all"}-marklist.pdf`.replace(/\s+/g, "_"),
        profile: ws.profile,
        grade,
        streamName: stream.name,
        examName: exams.find((exam) => exam.id === examId)?.name ?? "",
        subjects,
        learners,
        blankRows,
        subjectOnly,
        logo: await logoDataUrl(ws.profile.logoData),
        periodLabel: `${term} ${year}`,
        orientation,
      });
      flash(`PDF mark list downloaded in ${orientation} orientation with ${learners.length} learner row(s).`);
    } catch (error) {
      flash(errText(error), true);
    }
  }

  const rosterCount = grade && stream ? learnersForMarklist(ws, period.yearId, gradeId, stream.id).length : 0;
  const gradeLearners = learnersForYear(ws, period.yearId).filter((learner) => learner.gradeId === gradeId);
  const gradeBoards = decorate(buildBoards(gradeLearners, periodMarks(ws.marks, period.yearId, period.termId), subjects, exams, ws.bands), ws.streams, exams);
  const subjectSummary = subjects.map((subject) => {
    const ranked = gradeBoards.map((board) => ({ board, value: board.cells.find((cell) => cell.subjectId === subject.id)?.byExam[examId] ?? null })).filter((item): item is { board: typeof gradeBoards[number]; value: number } => item.value != null).sort((a, b) => b.value - a.value || a.board.learner.fullName.localeCompare(b.board.learner.fullName));
    return { subject, total: ranked.reduce((sum, item) => sum + item.value, 0), mean: ranked.length ? ranked.reduce((sum, item) => sum + item.value, 0) / ranked.length : null, top: ranked[0]?.board.learner.fullName ?? "—", position: ranked.length ? `1 of ${ranked.length}` : "—" };
  });
  const bestGradeRows = gradeBoards.filter((board) => bestGrade === "all" || board.level === bestGrade).sort((a, b) => (b.avgMean ?? -1) - (a.avgMean ?? -1));

  return (
    <div className="max-w-3xl space-y-4">
      <header>
        <h1 className="font-serif text-3xl text-navy">Mark lists</h1>
        <p className="text-sm text-muted">Download the complete stream roster as a paginated PDF or a real Excel workbook. Choose page orientation for either format.</p>
      </header>
      <PeriodBar ws={ws} yearId={period.yearId} termId={period.termId} onYear={period.setYearId} onTerm={period.setTermId} />
      <div className="grid gap-3 rounded-md border border-line bg-card p-4 sm:grid-cols-2">
        <select className={inputClass} value={gradeId} onChange={(event) => { setGradeId(event.target.value); const next = ws.streams.find((item) => item.gradeId === event.target.value); setStreamId(next?.id ?? ""); }} aria-label="Grade">
          {ws.grades.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className={inputClass} value={stream?.id ?? ""} onChange={(event) => setStreamId(event.target.value)} aria-label="Stream">
          {streams.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select className={inputClass} value={examId} onChange={(event) => setExamId(event.target.value)} aria-label="Assessment">
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
        <select className={inputClass} value={subjectId} onChange={(event) => setSubjectId(event.target.value)} aria-label="Subject">
          <option value="all">All subjects</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
        <label className="text-sm">Page orientation
          <select className={`${inputClass} mt-1`} value={orientation} onChange={(event) => setOrientation(event.target.value as "portrait" | "landscape")}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={filled} onChange={(event) => setFilled(event.target.checked)} /> Include marks already entered</label>
        <label className="text-sm">Extra blank rows
          <input className={`${inputClass} mt-1`} type="number" min={0} max={40} value={blankRows} onChange={(event) => setBlankRows(Number(event.target.value))} />
        </label>
      </div>
      <section className="rounded-md border border-emerald-200 bg-emerald-50/60 p-4"><h2 className="font-serif text-xl text-navy">Grade subject totals, means and positions</h2><p className="mt-1 text-xs text-muted">Totals and means use the selected assessment. Subject leaders are ranked across all learners in the selected grade.</p><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[42rem] text-left text-sm"><thead><tr className="border-b border-emerald-200 text-xs uppercase text-muted"><th className="p-2">Subject</th><th className="p-2">Total marks</th><th className="p-2">Subject mean</th><th className="p-2">Best position</th><th className="p-2">Top learner</th></tr></thead><tbody>{subjectSummary.map((item) => <tr key={item.subject.id} className="border-b border-emerald-200/70"><td className="p-2 font-semibold">{item.subject.name}</td><td className="p-2">{item.total || "—"}</td><td className="p-2">{item.mean == null ? "—" : item.mean.toFixed(1)}</td><td className="p-2">{item.position}</td><td className="p-2">{item.top}</td></tr>)}</tbody></table></div></section>
      <section className="rounded-md border border-violet-200 bg-violet-50/60 p-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-serif text-xl text-navy">Best grades list</h2><p className="mt-1 text-xs text-muted">Filter learners in the selected grade by their overall performance level.</p></div><select className={inputClass} value={bestGrade} onChange={(event) => setBestGrade(event.target.value)}><option value="all">All performance levels</option>{ws.bands.slice().sort((a, b) => b.minScore - a.minScore).map((band) => <option key={band.code} value={band.code}>{band.code} · {band.subjectRemark}</option>)}</select></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{bestGradeRows.slice(0, 20).map((board, index) => <div key={board.learner.id} className="rounded-lg border border-violet-200 bg-white/80 p-3"><strong>{index + 1}. {board.learner.fullName}</strong><p className="text-xs text-muted">{board.level ?? "Not graded"} · mean {board.avgMean == null ? "—" : board.avgMean.toFixed(1)} · {ws.streams.find((item) => item.id === board.learner.streamId)?.name ?? ""}</p></div>)}{!bestGradeRows.length ? <p className="text-sm text-muted">No learners match this performance level yet.</p> : null}</div></section>
      <p className="text-sm text-muted">{rosterCount} learner(s) in this stream will be included. Long lists automatically continue on additional PDF pages.</p>
      <div className="flex flex-wrap gap-2">{canDownload ? <><button className={btnClass} type="button" onClick={download}>Download PDF mark list</button><button className={btnClass} type="button" onClick={exportExcel}>Download Excel workbook (.xlsx)</button></> : <p className="text-sm text-muted">Downloads are disabled for this role group.</p>}</div>
    </div>
  );
}
