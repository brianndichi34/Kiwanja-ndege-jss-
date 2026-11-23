alter table welcome_page add column if not exists background_mode text not null default 'specific';
alter table welcome_page add column if not exists background_enabled boolean not null default true;
alter table welcome_page drop constraint if exists welcome_page_background_mode_check;
alter table welcome_page add constraint welcome_page_background_mode_check check (background_mode in ('specific','random','automatic'));
