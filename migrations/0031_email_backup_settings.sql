-- Automatic email backup settings (singleton). Does not change in-database snapshots.
create table if not exists email_backup_settings (
  id int primary key default 1 check (id = 1),
  enabled boolean not null default true,
  frequency text not null default 'weekly' check (frequency in ('daily', 'weekly', 'monthly')),
  recipients text not null default 'brianndichi340@gmail.com',
  also_on_manual boolean not null default false,
  last_emailed_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into email_backup_settings (id, enabled, frequency, recipients, also_on_manual)
values (1, true, 'weekly', 'brianndichi340@gmail.com', false)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
