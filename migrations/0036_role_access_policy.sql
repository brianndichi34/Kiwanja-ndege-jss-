create table if not exists role_access_policy (
  id smallint primary key check (id = 1),
  policy_json jsonb not null,
  updated_by text,
  updated_at timestamptz not null default now()
);

insert into role_access_policy (id, policy_json)
values (1, '{"admin":{"reports":{"view":true,"download":true},"analysis":{"view":true,"download":true},"marklists":{"view":true,"download":true},"familyResults":{"view":true,"download":true}},"teacher":{"reports":{"view":true,"download":true},"analysis":{"view":true,"download":true},"marklists":{"view":true,"download":true},"familyResults":{"view":false,"download":false}},"parent":{"reports":{"view":false,"download":false},"analysis":{"view":false,"download":false},"marklists":{"view":false,"download":false},"familyResults":{"view":true,"download":true}},"student":{"reports":{"view":false,"download":false},"analysis":{"view":false,"download":false},"marklists":{"view":false,"download":false},"familyResults":{"view":true,"download":true}},"qr_guest":{"reports":{"view":true,"download":false},"analysis":{"view":false,"download":false},"marklists":{"view":false,"download":false},"familyResults":{"view":false,"download":false}}}'::jsonb)
on conflict (id) do nothing;
