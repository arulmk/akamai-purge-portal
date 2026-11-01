# Akamai Purge Portal

A small web portal for purging the Akamai cache by **URL** or by **CP code**, on **Production** or **Staging**, using **Delete** or **Invalidate**.

The portal never holds Akamai credentials. The browser talks to a Netlify function, the function triggers a GitHub Actions workflow, and only that workflow has the Akamai API credentials.

## How it works

```
Browser form (React + Vite)
   │  POST /api/purge   (header: X-Portal-Key)
   ▼
Netlify function  netlify/functions/triggerPurge.cjs
   │  checks the access key, validates the payload
   │  POST https://api.github.com/repos/<owner>/<repo>/dispatches   (event: akamai_purge)
   ▼
GitHub Actions  .github/workflows/purge.yml
   │  writes AKAMAI_EDGERC to ~/.edgerc, runs scripts/purge.cjs
   ▼
Akamai Fast Purge v3   POST /ccu/v3/{delete|invalidate}/{url|cpcode}/{production|staging}
```

| Path | Purpose |
| --- | --- |
| `src/components/PurgeForm.jsx` | The form UI. Shows the real result or error from the function. |
| `netlify/functions/triggerPurge.cjs` | Checks the access key, validates input, dispatches the workflow. |
| `scripts/validate.cjs` | Input validation, shared by the function and the workflow script. |
| `scripts/purge.cjs` | Calls the Akamai Fast Purge API using EdgeGrid auth. |
| `.github/workflows/purge.yml` | Runs on `repository_dispatch` (`akamai_purge`). |
| `netlify.toml` | Build settings and the `/api/purge` → function redirect. |

## Requirements

- Node.js 20 or later (see `.node-version`)
- A GitHub repository that holds the workflow (this repo)
- A Netlify site connected to this repo
- An Akamai API client with access to the **CCU (Fast Purge)** API

## Setup

### 1. Akamai API client

Create an API client in Akamai Control Center (Identity & Access) with **CCU APIv3** access at READ-WRITE level. Keep the client limited to purge only. Copy its credentials in `.edgerc` format:

```ini
[default]
client_secret = ...
host = akab-xxxx.luna.akamaiapis.net
access_token = akab-...
client_token = akab-...
```

### 2. GitHub secret

In the repo go to **Settings → Secrets and variables → Actions → New repository secret**:

| Name | Value |
| --- | --- |
| `AKAMAI_EDGERC` | The full `.edgerc` text above, including the `[default]` line |

### 3. GitHub token for Netlify

Create a **fine-grained personal access token**:

- Repository access: only this repo
- Permission: **Contents → Read and write** (this is what `repository_dispatch` requires)
- Set an expiry date and rotate it before then

### 4. Netlify environment variables

In **Site configuration → Environment variables**:

| Name | Value |
| --- | --- |
| `GITHUB_PAT` | The token from step 3 (mark as secret) |
| `GITHUB_OWNER` | `arulmk` |
| `GITHUB_REPO` | `akamai-purge-portal` |
| `PORTAL_ACCESS_KEY` | A long random string. Users type this into the form. |

If any of these is missing, the function refuses every request (it fails closed).

### 5. Deploy

Connect the repo to Netlify. The build settings come from `netlify.toml` (`npm run build`, publish `dist`, functions in `netlify/functions`).

## Using the portal

1. Open the site and pick **Purge by Hostname** (URLs) or **Purge by CP Code**.
2. Enter one target per line.
   - URLs: `www.example.com/assets/app.js` (`https://` is added if you leave it out)
   - CP codes: digits only, for example `1826618`
3. Choose **Network** (Production or Staging) and **Purge Method**.
4. Enter the **Access Key** and click **Authorize & Dispatch Purge**.
5. A green message means GitHub accepted the dispatch, not that Akamai has finished. Open the repo's **Actions** tab to see the run and Akamai's response.

**Delete vs Invalidate:** *Invalidate* marks content stale so the edge revalidates with the origin on the next request (the safer default). *Delete* removes it from the cache outright, so the next request is a full origin fetch.

**Limits:** up to 100 objects per request. Akamai's own rate limits also apply.

## Local development

```bash
npm install
npm run dev        # the form only; /api/purge will 404 locally
```

To run the form and function together, use the Netlify CLI:

```bash
npm install -g netlify-cli
netlify dev        # reads env vars from the linked site or a local .env (not committed)
```

Use **Staging** for any test purge.

## Security notes

- The access key is a shared secret sent as a header over HTTPS. It protects against casual use, but it is not per-user authentication. For several users, put the site behind Netlify's password protection, an SSO proxy, or Netlify Identity.
- The workflow reads the payload from an environment variable and `scripts/purge.cjs` re-validates every field, so a forged dispatch can't inject shell commands.
- Anyone with write access to this repo, or with the `GITHUB_PAT`, can trigger the workflow directly. Keep both tightly held.
- The Akamai credentials exist only as a GitHub secret. They are never sent to Netlify or the browser.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Server is not configured" | One of the four Netlify env vars is missing. Redeploy after adding it. |
| "Invalid access key" | The key doesn't match `PORTAL_ACCESS_KEY`. |
| "GitHub rejected the dispatch (HTTP 404)" | Wrong `GITHUB_OWNER`/`GITHUB_REPO`, or the token has no access to the repo. |
| "GitHub rejected the dispatch (HTTP 403)" | Token lacks Contents read/write, or it has expired. |
| Dispatch succeeds but no workflow run appears | The workflow file must be at `.github/workflows/purge.yml` on the default branch. |
| Workflow fails with HTTP 401 from Akamai | `AKAMAI_EDGERC` is wrong or incomplete (check the `[default]` header and every field). |
| Workflow fails with HTTP 403 from Akamai | The API client doesn't have CCU access, or the CP code/URL isn't on your account. |
