-- Parent self-registration requests are separate from existing users and parent links.
-- The verification code is stored only as a hash and expires quickly.
alter table users add column if not exists contact_phone text not null default '';
create table if not exists parent_registration_requests (
  id text primary key,
  email text not null,
  full_name text not null,
  contact_phone text not null,
  submitted_learner_name text not null,
  matched_learner_id text references learners(id) on delete set null,
  verification_code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  status text not null default 'pending' check (status in ('pending','verified','expired','rejected')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists parent_registration_email_idx on parent_registration_requests (email, created_at desc);
create index if not exists parent_registration_status_idx on parent_registration_requests (status, created_at desc);
