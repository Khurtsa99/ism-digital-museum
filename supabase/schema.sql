-- ISM Digital Museum: бүх схем, RLS, Storage. Supabase SQL Editor дээр нэг удаа ажиллуулна.

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'creator',   -- 'creator' | 'admin'
  created_at timestamptz default now()
);
create table if not exists exhibition_categories (
  id serial primary key, name text not null, description text
);
create table if not exists exhibits (
  id serial primary key,
  title text not null,
  description text,
  image_url text,
  category_id int references exhibition_categories(id) on delete set null,
  technology_stack text,
  year_created int,
  creator_id uuid references profiles(id) on delete cascade,
  demo_url text,
  github_url text,
  status text default 'published',
  created_at timestamptz default now()
);
create table if not exists teachers (
  id serial primary key, name text not null, position text,
  courses text, bio text, photo_url text
);
create table if not exists events (
  id serial primary key, title text not null, event_date date,
  description text, cover_image_url text
);
create table if not exists event_photos (
  id serial primary key,
  event_id int references events(id) on delete cascade,
  image_url text, caption text
);
create table if not exists timeline_events (
  id serial primary key, year int not null, title text not null,
  description text, kind text default 'history', image_url text
);

-- Админ эсэхийг шалгах функцууд
create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;
create or replace function my_role() returns text
language sql security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

-- Шинэ хэрэглэгч бүртгүүлэхэд profile автоматаар үүсгэх
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- RLS идэвхжүүлэх
alter table profiles enable row level security;
alter table exhibition_categories enable row level security;
alter table exhibits enable row level security;
alter table teachers enable row level security;
alter table events enable row level security;
alter table event_photos enable row level security;
alter table timeline_events enable row level security;

-- profiles: хүн бүр унших, зөвхөн өөрийнхөө профайлыг засах (role-г өөрчилж болохгүй)
drop policy if exists "profiles read" on profiles;
create policy "profiles read" on profiles for select using (true);
drop policy if exists "profiles update own" on profiles;
create policy "profiles update own" on profiles for update
  using (id = auth.uid()) with check (id = auth.uid() and role = my_role());

-- exhibits: нийтлэгдсэн нь бүгдэд харагдана, өөрийнхөө бүтээлийг л өөрчилнө, админ бүгдийг
drop policy if exists "exhibits read" on exhibits;
create policy "exhibits read" on exhibits for select
  using (status = 'published' or creator_id = auth.uid() or is_admin());
drop policy if exists "exhibits insert own" on exhibits;
create policy "exhibits insert own" on exhibits for insert
  with check (creator_id = auth.uid());
drop policy if exists "exhibits update own" on exhibits;
create policy "exhibits update own" on exhibits for update
  using (creator_id = auth.uid() or is_admin())
  with check (creator_id = auth.uid() or is_admin());
drop policy if exists "exhibits delete own" on exhibits;
create policy "exhibits delete own" on exhibits for delete
  using (creator_id = auth.uid() or is_admin());

-- Бусад хүснэгт: бүгд унших, зөвхөн админ бичих
do $$
declare t text;
begin
  foreach t in array array['exhibition_categories','teachers','events','event_photos','timeline_events']
  loop
    execute format('drop policy if exists "%1$s read" on %1$s', t);
    execute format('create policy "%1$s read" on %1$s for select using (true)', t);
    execute format('drop policy if exists "%1$s admin write" on %1$s', t);
    execute format('create policy "%1$s admin write" on %1$s for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Storage: нийтийн "images" bucket
insert into storage.buckets (id, name, public) values ('images', 'images', true)
  on conflict (id) do nothing;
drop policy if exists "images public read" on storage.objects;
create policy "images public read" on storage.objects for select using (bucket_id = 'images');
drop policy if exists "images upload auth" on storage.objects;
create policy "images upload auth" on storage.objects for insert to authenticated
  with check (bucket_id = 'images');
drop policy if exists "images modify own" on storage.objects;
create policy "images modify own" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and (owner = auth.uid() or is_admin()));

-- Жишээ өгөгдөл (дараа нь Админ хуудаснаас засна)
insert into exhibition_categories (name, description) values
  ('Вэб хөгжүүлэлт','Вэб сайт болон аппликейшн'),
  ('Мобайл апп','Гар утасны аппликейшн'),
  ('Өгөгдлийн шинжилгээ','Өгөгдөл, AI, шинжилгээний төсөл'),
  ('Судалгаа','Судалгааны ажил');
insert into timeline_events (year, title, description, kind) values
  (2000,'Тэнхим үүссэн','Жишээ өгөгдөл: өөрийн тэнхимийн бодит мэдээллээр солино.','history'),
  (2010,'Вэб технологи','Статик сайтаас динамик вэб аппликейшн рүү шилжсэн үе.','technology'),
  (2020,'Онлайн сургалт','Сургалт зайны хэлбэрт шилжсэн үе.','technology');
