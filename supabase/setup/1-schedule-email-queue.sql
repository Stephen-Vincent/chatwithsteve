-- Run ONCE in the Supabase SQL editor, after the migrations and after deploying the functions.
-- Step A: store your service role key in Vault (paste it only in the SQL editor, never in git).
--   select vault.create_secret('PASTE_SERVICE_ROLE_KEY_HERE', 'service_role_key');
--
-- Step B: schedule the email dispatcher to run every minute.
select cron.schedule(
  'process-email-queue',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://euibgmuegrgnievkgrhj.supabase.co/functions/v1/process-email-queue',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'service_role_key' limit 1)
    ),
    body := '{}'::jsonb
  );
  $$
);
