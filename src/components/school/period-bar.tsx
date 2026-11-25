import { useMemo, useState } from "react";
import { inputClass } from "@/components/school/gate";
import { calendarFor, periodMarks, type Workspace } from "@/lib/school/model";

export function useSchoolPeriod(ws: Workspace) {
  const [yearId, setYearId] = useState(ws.profile.activeYearId || ws.years[0]?.id || "y2026");
  const [termId, setTermId] = useState(ws.profile.activeTermId || ws.terms[2]?.id || "t3");
  const marks = useMemo(() => periodMarks(ws.marks, yearId, termId), [ws.marks, yearId, termId]);
  const calendar = calendarFor(ws.calendars, yearId, termId);
  const current = yearId === ws.profile.activeYearId && termId === ws.profile.activeTermId;
  return { yearId, termId, setYearId, setTermId, marks, calendar, current };
}

export function PeriodBar({
  ws,
  yearId,
  termId,
  onYear,
  onTerm,
  gradeId,
  onGrade,
}: {
  ws: Workspace;
  yearId: string;
  termId: string;
  onYear: (id: string) => void;
  onTerm: (id: string) => void;
  gradeId?: string;
  onGrade?: (id: string) => void;
}) {
  const calendar = calendarFor(ws.calendars, yearId, termId);
  return (
    <section className="rounded-xl border-2 border-info/30 bg-info/5 p-3 shadow-sm" aria-label="Academic period selection">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-info">Academic period</p><p className="text-xs text-muted">Choose the year, grade, and term for the results shown below.</p></div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy">{ws.years.find((year) => year.id === yearId)?.name ?? yearId} · {ws.terms.find((term) => term.id === termId)?.name ?? termId}</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-bold text-navy">Academic year<select aria-label="Select academic year" className={`${inputClass} mt-1 w-full border-2 border-info/40 bg-white`} value={yearId} onChange={(event) => onYear(event.target.value)}>
          {ws.years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}
        </select></label>
        {gradeId !== undefined && onGrade ? <label className="text-xs font-bold text-navy">Grade<select aria-label="Select grade" className={`${inputClass} mt-1 w-full border-2 border-info/40 bg-white`} value={gradeId} onChange={(event) => onGrade(event.target.value)}>
          {ws.grades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
        </select></label> : null}
        <label className="text-xs font-bold text-navy">Term<select aria-label="Select term" className={`${inputClass} mt-1 w-full border-2 border-info/40 bg-white`} value={termId} onChange={(event) => onTerm(event.target.value)}>
          {ws.terms.map((term) => <option key={term.id} value={term.id}>{term.name}</option>)}
        </select></label>
      </div>
      <p className="mt-2 text-xs text-muted">
        Closing {calendar?.closingDate || "not set"} · Opening {calendar?.openingDate || "not set"}
        {yearId === ws.profile.activeYearId && termId === ws.profile.activeTermId ? " · current term" : ""}
      </p>
    </section>
  );
}
