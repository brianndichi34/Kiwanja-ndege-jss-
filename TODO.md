# Mukuyu timetable advanced studio

- [x] Preserve the existing ASC-style generator, timetable periods, breaks, rooms, availability, weekly requirements, teacher contracts, class rules, subject constraints, lesson relations, versions, publishing, filters, PDFs, and email delivery.
- [x] Add an advanced timetable studio with optimization profiles, week-cycle selection, approval state, teacher-load analysis, class-gap analysis, and progressive feature details.
- [x] Add additive migration support for 25 advanced scheduling features: drag movement foundations, live conflicts, undo/redo, optimization profiles, lesson priorities, multi-week cycles, Week A/B, blackout dates, absences, substitutions, resource requirements, co-teaching, split/combined classes, electives, events, exams, invigilation, approvals, change history, import/export jobs, subscriptions, secure share tokens, calendar links, duty rota, sync snapshots, and feature flags.
- [x] Add pure utility functions for load analysis, gap detection, timetable version comparison, cycle week calculation, optimization weights, and ICS events.
- [ ] Apply migration 0023 to staging/production and connect the advanced persistence actions to the existing server API.
- [ ] Run the project’s full dependency-backed typecheck, lint, and test suite in a network-enabled build environment.

## Music provider update

- [x] Add searchable YouTube, SoundCloud, and Jamendo catalog options alongside existing provider embeds and Radio Browser live radio; preserve license/creator attribution for Jamendo tracks.
- [x] Make the portal Play control start direct audio and live radio from the tap, while leaving protected cross-origin embeds under their provider player controls.
