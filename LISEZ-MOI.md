# Mon budget — site multi-clients

Site web avec inscription, connexion, et un dashboard privé pour chaque client.
Gratuit, sans publicité. Stack : React + Supabase (base de données + authentification).

## Étape 1 — Créer le projet Supabase (gratuit)

1. Va sur https://supabase.com et crée un compte gratuit
2. Clique sur "New project", choisis un nom (ex. "mon-budget") et un mot de passe pour la base de données
3. Une fois le projet créé, va dans **SQL Editor** (menu de gauche) → **New query**
4. Colle tout le contenu du fichier `supabase-schema.sql` et clique sur **Run**
   → ça crée la table des transactions et la sécurité (chaque client ne voit que ses propres données)
5. Va dans **Project Settings → API** : copie l'**URL** du projet et la clé **anon public**

## Étape 2 — Configurer le projet

1. Ouvre le fichier `.env.example`, renomme-le en `.env`
2. Remplace les deux valeurs par celles copiées à l'étape 1 :
   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=ta_clé_ici
   ```

## Étape 3 — Tester en local (optionnel)

Si tu as Node.js installé :
```bash
npm install
npm run dev
```
Le site s'ouvre sur http://localhost:5173

## Étape 4 — Mettre le site en ligne (gratuit, via Vercel)

1. Crée un compte sur https://vercel.com (gratuit, connexion avec GitHub possible)
2. Mets ce dossier de projet sur GitHub (crée un nouveau repository et pousse les fichiers)
3. Sur Vercel : "Add New Project" → sélectionne ton repository GitHub
4. Dans les réglages du projet Vercel, ajoute les mêmes variables d'environnement qu'à l'étape 2
   (`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`)
5. Clique sur "Deploy"

Après quelques minutes, Vercel te donne un lien du type `https://mon-budget.vercel.app` —
c'est ce lien que tu partages avec tes clients. Chacun peut s'inscrire avec son propre email
et n'a accès qu'à ses propres données.

## Comment ça fonctionne

- **Inscription/connexion** : gérée par Supabase Auth (email + mot de passe)
- **Chaque client** a son propre compte et ne voit que ses transactions (sécurité "Row Level Security" activée dans le script SQL)
- **Dashboard** : cartes de résumé, camembert des dépenses par catégorie, graphique mensuel — automatiquement filtrés par utilisateur connecté

## Pour aller plus loin

- Nom de domaine personnalisé (ex. tonentreprise.tn) : configurable dans Vercel, quelques euros/an
- Export Excel par client, budgets mensuels, notifications par email : dis-moi si tu veux que je les ajoute
