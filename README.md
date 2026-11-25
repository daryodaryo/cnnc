# cnnc — landing page + login with attempt logging

A small Express app: the landing page you provided, a `/login` page, and a
Postgres-backed `login_attempts` table that logs every submitted email and
password (plus success/fail, IP, timestamp). `/admin.html` lists the logged
attempts.

## Admin access

`/admin.html` and `/api/attempts` are protected with HTTP Basic Auth. Set
`ADMIN_USER` and `ADMIN_PASSWORD` as environment variables — on Render,
go to the web service → **Environment** → add both, then save (this
triggers a redeploy). Locally, set them in your `.env` file. If
`ADMIN_PASSWORD` isn't set, those routes refuse all access rather than
staying open by accident.

To view the attempts, visit `/admin.html` and your browser will prompt
for the username and password you set.

## ⚠️ Before you use this for real users

`login_attempts.password_input` still stores the password **exactly as
typed, in plain text** — Basic Auth keeps random visitors out of the
admin view, but anyone with database access (or a leaked backup) still
gets every password anyone has ever typed, including ones reused on
other sites. Before this goes near real accounts: drop that column, or
hash the value before inserting it, and use bcrypt for the actual login
check in `routes/login.js` instead of a plain string comparison.

## Project layout

```
server.js          Express entry point
db/pool.js          Postgres connection pool (uses DATABASE_URL)
db/schema.sql        Creates login_attempts + users tables, seeds a demo user
db/init.js           Runs schema.sql on every startup
routes/login.js      POST /api/login, GET /api/attempts
public/index.html     Your landing page
public/login.html     Login form
public/admin.html     Table of logged attempts
render.yaml          Render Blueprint: web service + Postgres, wired together
```

## Deploy to Render

**Option A — Blueprint (one click, recommended)**
1. Push this folder to a GitHub repo.
2. In Render: **New → Blueprint**, pick the repo. Render reads
   `render.yaml` and creates both the web service and the Postgres
   database, already linked via `DATABASE_URL`.
3. Click **Apply**. First boot runs `db/init.js`, which creates the
   tables and seeds the demo account automatically — no manual SQL step.

**Option B — Manual**
1. **New → PostgreSQL** → create a database, copy its *Internal
   Connection String*.
2. **New → Web Service** → connect the repo.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add an env var `DATABASE_URL` = the connection string from step 1.
3. Deploy. The app creates its own tables on startup.

## Try it

- `/` — landing page
- `/login.html` — log in with `[email protected]` / `demo1234`, or type
  anything to log a failed attempt
- `/admin.html` — see every logged attempt

## Local development

```bash
npm install
cp .env.example .env   # point DATABASE_URL at a local Postgres
npm start
```
