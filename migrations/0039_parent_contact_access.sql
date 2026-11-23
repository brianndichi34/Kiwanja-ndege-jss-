-- Parent contact collection is additive and does not alter learner, mark, or report data.
create table if not exists parent_contact_settings (
  id integer primary key default 1 check (id = 1),
  teachers_can_view boolean not null default false,
  updated_by text references users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into parent_contact_settings (id, teachers_can_view)
values (1, false)
on conflict (id) do nothing;
