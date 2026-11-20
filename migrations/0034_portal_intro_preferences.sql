-- Centrally managed KNJ loading-introduction preferences.
alter table welcome_page add column if not exists intro_enabled boolean not null default true;
alter table welcome_page add column if not exists intro_variation text not null default 'random';
alter table welcome_page add column if not exists intro_duration_ms int not null default 5200;
alter table welcome_page add column if not exists intro_repeat_mode text not null default 'once';
alter table welcome_page add column if not exists intro_skip_enabled boolean not null default true;
alter table welcome_page add column if not exists intro_revision int not null default 1;
