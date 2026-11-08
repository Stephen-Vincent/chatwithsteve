-- Run ONCE after you have signed up on the live site. Replace the email.
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'YOUR_EMAIL_HERE'
on conflict do nothing;
