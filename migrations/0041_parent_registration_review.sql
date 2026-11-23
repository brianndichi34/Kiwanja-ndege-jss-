-- Ambiguous parent learner matches remain pending for secure manual resolution.
alter table parent_registration_requests alter column verification_code_hash drop not null;
alter table parent_registration_requests drop constraint if exists parent_registration_requests_status_check;
alter table parent_registration_requests add constraint parent_registration_requests_status_check check (status in ('pending','needs_review','verified','expired','rejected'));
alter table parent_registration_requests add column if not exists resolved_by text references users(id) on delete set null;
alter table parent_registration_requests add column if not exists resolved_at timestamptz;
