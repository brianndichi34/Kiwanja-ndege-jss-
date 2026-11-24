create table if not exists library_settings (
  id integer primary key default 1 check (id = 1),
  teachers_can_delete boolean not null default false,
  updated_by text references users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into library_settings(id, teachers_can_delete)
values (1, false)
on conflict (id) do nothing;
