# Mukuyu timetable advanced studio

## Scope

Upgrade only the timetable section of the supplied Mukuyu school portal. Preserve authentication, learners, marks, reports, school services, existing timetable data, existing PDF output, and deployment structure.

## Implementation approach

The current aSc-inspired generator, conflict checks, availability rules, teacher contracts, class rules, relations, versions, publishing, filters, and PDF export remain the foundation. The update is additive:

- `migrations/0023_timetable_advanced_studio.sql` stores 25 new scheduling capabilities without altering existing rows.
- `src/lib/school/timetable-advanced.ts` provides pure utilities for optimization profiles, teacher load analysis, class-gap detection, version comparison, week cycles, and ICS event generation.
- `src/components/school/timetable-advanced-studio.tsx` adds a visible timetable command center for profile selection, cycle/approval state, load and gap indicators, and the 25 feature groups.
- `timetable-view.tsx` mounts the advanced studio beside the existing operations and export flows.

## Design

**Design movement:** editorial academic command center. The existing Mukuyu paper-and-navy language is retained, with an indigo/sky operations surface for advanced controls.

**Core principles:** preserve the current workflow, make constraints visible, separate hard conflicts from optimization preferences, and keep every advanced feature reversible and auditable.

**Interaction philosophy:** existing forms and generation remain familiar; advanced planning is exposed as a focused studio with clear profiles, workflow state, indicators, and progressive disclosure.

## 25 feature outcomes

Drag movement, live clash highlighting, undo/redo foundations, visual conflict records, weighted optimization profiles, essential lesson priorities, multi-week cycles, Week A/B schedules, blackout dates, absences, substitute suggestions, capacity/equipment matching, co-teaching, split/combined classes, synchronized electives, school events, exam sessions/invigilation, workload analytics, version comparison, approval workflow, change history, CSV/XLSX/JSON import jobs, PDF/CSV/XLSX/ICS exports, subscriptions/share links, calendar links, duty rota, sync snapshots, and feature flags are represented by the advanced studio and additive timetable tables.

## Project structure

- `src/components/school/timetable-view.tsx`: existing timetable page and integration point.
- `src/components/school/timetable-operations.tsx`: existing ASC-style configuration and validation controls.
- `src/components/school/timetable-advanced-studio.tsx`: new advanced command center.
- `src/lib/school/timetable-engine.ts`: existing pure generator and audit engine.
- `src/lib/school/timetable-advanced.ts`: new analysis/export helper functions.
- `migrations/0023_timetable_advanced_studio.sql`: additive persistence model.
