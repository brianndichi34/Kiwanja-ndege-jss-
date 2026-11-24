alter table welcome_page add column if not exists app_icon_data text not null default '';
alter table welcome_page add column if not exists app_icon_revision integer not null default 1;
