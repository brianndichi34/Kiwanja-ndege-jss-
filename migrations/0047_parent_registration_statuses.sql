-- Parent registration can require review or record a failed email attempt.
-- Keep the lifecycle values aligned with the server action and admin log UI.
alter table parent_registration_requests drop constraint if exists parent_registration_requests_status_check;
alter table parent_registration_requests add constraint parent_registration_requests_status_check check (status in ('pending','needs_review','verified','expired','rejected','email_failed'));
