-- Repair the existing public report policy so valid report links work after deployment.
-- The Super Admin can still explicitly lock public reports later from Settings.
update role_access_policy
set policy_json = jsonb_set(
  jsonb_set(policy_json, '{qr_guest,reports,view}', 'true'::jsonb, true),
  '{qr_guest,reports,download}',
  'false'::jsonb,
  true
),
updated_at = now()
where id = 1;
