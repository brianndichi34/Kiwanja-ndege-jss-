-- Additive settings parity for Kiwanja Ndege.
alter table welcome_page
  add column if not exists display_controls_json text not null default '{}';

create table if not exists scheduled_backup_settings (
  id integer primary key default 1 check (id = 1),
  enabled boolean not null default false,
  recipient_email text not null default '',
  cadence text not null default 'daily' check (cadence in ('daily','weekly','monthly')),
  updated_at timestamptz not null default now()
);
insert into scheduled_backup_settings (id) values (1) on conflict (id) do nothing;

create table if not exists admission_number_settings (
  id smallint primary key check (id = 1),
  prefix text not null default 'KNJ',
  include_year boolean not null default true,
  number_digits smallint not null default 5 check (number_digits between 4 and 8),
  updated_by text,
  updated_at timestamptz not null default now()
);
insert into admission_number_settings (id, prefix, include_year, number_digits)
values (1, 'KNJ', true, 5)
on conflict (id) do nothing;
