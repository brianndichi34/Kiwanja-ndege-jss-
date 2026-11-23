alter table parent_contact_settings add column if not exists admins_can_view boolean not null default true;
