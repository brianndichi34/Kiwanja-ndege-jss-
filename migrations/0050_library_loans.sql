create table if not exists library_loans (
  id text primary key,
  learner_id text not null references learners(id) on delete cascade,
  year_id text not null references academic_years(id) on delete restrict,
  term_id text not null references terms(id) on delete restrict,
  grade_id text not null references grades(id) on delete restrict,
  subject_id text not null references subjects(id) on delete restrict,
  book_title text not null,
  reference_no text not null,
  date_borrowed date not null,
  due_date date,
  date_returned date,
  status text not null default 'borrowed' check (status in ('borrowed','returned','lost','damaged','overdue')),
  notes text not null default '',
  recorded_by text references users(id) on delete set null,
  updated_at timestamptz not null default now()
);
create unique index if not exists library_loans_reference_unique on library_loans(reference_no);
create index if not exists library_loans_learner_idx on library_loans(learner_id, year_id, term_id);
create index if not exists library_loans_scope_idx on library_loans(grade_id, subject_id, year_id, term_id, status);
