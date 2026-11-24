alter table welcome_page add column if not exists install_prompt_enabled boolean not null default true;
alter table welcome_page add column if not exists install_prompt_for_super_admin boolean not null default true;
