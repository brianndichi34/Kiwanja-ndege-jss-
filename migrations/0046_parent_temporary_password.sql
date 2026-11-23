alter table parent_registration_requests add column if not exists temporary_password_hash text;
alter table parent_registration_requests add column if not exists temporary_password_expires_at timestamptz;

alter table users add column if not exists password_change_required boolean not null default false;
alter table users add column if not exists password_expires_at timestamptz;
