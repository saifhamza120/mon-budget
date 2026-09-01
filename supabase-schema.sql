-- À copier-coller dans Supabase : Dashboard > SQL Editor > New query > Run

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null check (type in ('depense', 'revenu')),
  category text not null,
  amount numeric not null check (amount > 0),
  note text,
  date date not null,
  created_at timestamptz default now()
);

-- Active la sécurité au niveau des lignes : chaque client ne peut voir/modifier QUE ses propres données
alter table transactions enable row level security;

create policy "Les utilisateurs voient leurs propres transactions"
  on transactions for select
  using (auth.uid() = user_id);

create policy "Les utilisateurs ajoutent leurs propres transactions"
  on transactions for insert
  with check (auth.uid() = user_id);

create policy "Les utilisateurs modifient leurs propres transactions"
  on transactions for update
  using (auth.uid() = user_id);

create policy "Les utilisateurs suppriment leurs propres transactions"
  on transactions for delete
  using (auth.uid() = user_id);

create index if not exists transactions_user_id_idx on transactions(user_id);
