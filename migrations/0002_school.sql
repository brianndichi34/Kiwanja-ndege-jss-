-- Kiwanja Ndege JSS exam portal
create table if not exists school_profile (
  id int primary key default 1 check (id = 1),
  name text not null,
  po_box text not null,
  mission text not null,
  vision text not null,
  motto text not null,
  head_teacher text not null,
  dos text not null default '',
  location text not null,
  contact text not null default '',
  email text not null default '',
  academic_year text not null,
  term_name text not null,
  report_title text not null,
  closing_date text not null,
  resumption_date text not null,
  cat_note text not null
);

create table if not exists users (
  id text primary key,
  email text not null unique,
  password_hash text not null,
  full_name text not null,
  role text not null,
  active boolean not null default true,
  learner_id text,
  session_version int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists parent_links (
  parent_user_id text not null references users(id) on delete cascade,
  learner_id text not null,
  primary key (parent_user_id, learner_id)
);

create table if not exists grades (
  id text primary key,
  name text not null,
  level int not null,
  report_title text not null
);

create table if not exists streams (
  id text primary key,
  grade_id text not null references grades(id) on delete cascade,
  name text not null,
  class_teacher_label text not null default '',
  sort int not null default 1
);

create table if not exists subjects (
  id text primary key,
  name text not null,
  short_name text not null,
  sort int not null
);

create table if not exists exams (
  id text primary key,
  name text not null,
  code text not null,
  sort int not null
);

create table if not exists grading_bands (
  min_score int primary key,
  code text not null,
  points int not null,
  subject_remark text not null,
  head_remark text not null,
  class_remark text not null
);

create table if not exists learners (
  id text primary key,
  roll int not null,
  full_name text not null,
  gender text not null,
  grade_id text not null references grades(id),
  stream_id text not null references streams(id),
  status text not null default 'active'
);

create table if not exists assignments (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  kind text not null,
  grade_id text,
  stream_id text,
  subject_id text
);

create table if not exists marks (
  learner_id text not null references learners(id) on delete cascade,
  subject_id text not null references subjects(id),
  exam_id text not null references exams(id),
  score int not null,
  updated_by text,
  updated_at timestamptz not null default now(),
  primary key (learner_id, subject_id, exam_id)
);

create table if not exists mail_outbox (
  id text primary key,
  to_email text not null,
  subject text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists learners_grade_idx on learners (grade_id, roll);
create index if not exists marks_exam_idx on marks (exam_id);
create index if not exists assignments_user_idx on assignments (user_id);

insert into school_profile (id, name, po_box, mission, vision, motto, head_teacher, dos, location, contact, email, academic_year, term_name, report_title, closing_date, resumption_date, cat_note)
values (
  1,
  'KIWANJA NDEGE JUNIOR SECONDARY SCHOOL',
  '32 - 50108 LUGARI',
  'TO BE A MODEL IN PROVISION OF QUALITY EDUCATION THROUGH COMMUNITY PARTICIPATION.',
  'LEARNER TO DEVELOP POSITIVE ATTITUDES TOWARDS LEARNING AND AIM AT HIGHER LEVEL OF EDUCATION.',
  'ARISE AND SHINE THE SKY IS THE LIMIT',
  'MR. TUTI SYLVESTER',
  '',
  '',
  '',
  '',
  '2026',
  'TERM 2',
  'TERM 2 YEAR 2026 REPORT CARDS',
  '',
  '',
  ''
) on conflict (id) do nothing;

insert into grades (id, name, level, report_title) values
('g7','Grade 7',7,'TERM 3 YEAR 2026 REPORT CARD SHEET'),
('g8','Grade 8',8,'TERM 3 YEAR 2026 REPORT CARDS'),
('g9','Grade 9',9,'TERM 3 YEAR 2026 REPORT CARDS')
on conflict (id) do nothing;

insert into streams (id, grade_id, name, class_teacher_label, sort) values
('g7n','g7','NORTH','TR. IAN / TR. RINOS',1),
('g7s','g7','SOUTH','TR. IAN / TR. RINOS',2),
('g8n','g8','NORTH','MR. ZAYAKE / MD. ESTHER',1),
('g8s','g8','SOUTH','MR. ZAYAKE / MD. ESTHER',2),
('g9n','g9','NORTH','',1),
('g9s','g9','SOUTH','',2)
on conflict (id) do nothing;

insert into subjects (id, name, short_name, sort) values
('math','MATHEMATICS','MATH',1),
('eng','ENGLISH','ENG',2),
('kis','KISWAHILI','KIS',3),
('sst','SOCIAL STUDIES','SST',4),
('cre','CHRISTIAN RELIGIOUS EDUCATION','CRE',5),
('scie','INTEGRATED SCIENCE','SCI',6),
('agri','AGRICULTURE AND NUTRITION','AGR',7),
('ca','CREATIVE ARTS & SPORTS','C/A',8),
('pre','PRETECHNICAL STUDIES','PRE',9)
on conflict (id) do nothing;

insert into exams (id, name, code, sort) values
('cat1','CAT 1','cat1',1),
('cat2','CAT 2','cat2',2)
on conflict (id) do nothing;

insert into grading_bands (min_score, code, points, subject_remark, head_remark, class_remark) values
(90,'EE1',8,'Exceptional; Exceeds expectations','Excellent-you are on track','Excellent'),
(75,'EE2',7,'Very strong performance','Very good-keep up the momentum','Good performance-keep improving'),
(58,'ME1',6,'Solid understanding','Good performance-keep improving','Keep aiming higher'),
(41,'ME2',5,'Partial achievement','Fair performance-good effort','You are capable of doing better'),
(31,'AE1',4,'Limited achievement','Below your limits- put in more efforts','Work harder'),
(21,'AE2',3,'Very limited','Below average-focus on understanding concepts','Aim higher'),
(11,'BE1',2,'Poor performance','Minimal achievements-work on basics','Aim higher'),
(1,'BE2',1,'Extremely weak','Below average-focus on understanding concepts','Focus on the basics')
on conflict (min_score) do nothing;

-- Sample learners/marks removed for Kiwanja Ndege JSS; real data is loaded by later 0028+ migrations.

