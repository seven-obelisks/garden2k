# Garden2k

Garden2K is an open source Hugo template that comes with an event management system. It features a calendar view and .ICS exports, and allows for authorized users to edit site content via Sveltia CMS / GitHub OAuth. It is configured to automatically redeploy every 24 hours to update event hierarchy based on date values provided by the user. 

Deployed via CloudFlare Pages' free tier, sites using Garden2k can be run in perpetuity for no cost. It was built to be an open-source alternative to expensive and clunky event publication tools currently available on platforms such as WordPress. It is designed for gaming guilds, student groups, and community leagues that regularly host events to have a flexible marketing platform without the high costs typically associated with these tools.

## Key Features

- Event content stored as Markdown
- Mobile responsive calendar page
- Upcoming/past event handling
- Event detail pages
- Automatic .ICS output for iCalendar
- Sveltia CMS admin interface
- Cloudflare Pages deployment on free tier
- GitHub OAuth auth for CMS access (users must be explicitly granted access)
- Daily automated builds for automatic event updating
- Homepage banners can be added, removed, and edited via CMS


## Requirements for Installation

- **Git**
- **Hugo Extended** — required for Sass processing used by the gallery module. Pin a specific version (see `HUGO_VERSION` below) rather than "latest."
- **Go 1.24.3+** — `go.mod` sets this as a hard floor. An older local Go install will fail to resolve modules.
- A GitHub account with write access to the repo
- A Cloudflare account, for Pages deployment


# Installation

## 1. Clone and run locally

```bash
git clone https://github.com/seven-obelisks/garden2k.git
cd garden2k
hugo server -D
```

Open `http://localhost:1313`.

Production-style build:
```bash
hugo --gc --minify
```
Output goes to `public/` — never edit that directory directly, it's generated.

## 2. Project structure

```
layouts/            all custom templates — no vendored theme layouts
  _partials/         partials (modern _partials convention, used throughout)
  _default/
  event/
  calendar/
  posts/
static/
  css/               6 plain CSS files, linked directly via hugo.toml params.custom_css
  admin/             Sveltia CMS (config.yml + index.html)
  uploads/           CMS-managed media
content/
  events/  calendar/  posts/  examples/
functions/api/       Cloudflare Pages Functions — GitHub OAuth for the CMS (auth.js, callback.js)
_vendor/
  github.com/mfg92/hugo-shortcode-gallery/   vendored — see Modules below
hugo.toml            main config (TOML, not config.yaml) — includes menus, custom_css list, module imports
go.mod               pins Go version + module requirements
```

## 3. Modules (vendored)

```toml
[module]
  [[module.imports]]
    path = "github.com/mfg92/hugo-shortcode-gallery"
```

`_vendor/` holds a local copy so builds don't depend on GitHub or the Go module proxy staying reachable. **If you ever bump a module version in `go.mod`, you must also re-run:**

```bash
hugo mod vendor
```

Hugo always prefers `_vendor/` over `go.mod` when both exist — editing `go.mod` alone silently does nothing until you re-vendor. Commit the resulting `_vendor/` changes together with the `go.mod` bump.

## 4. Site config (`hugo.toml`)

Core values, menus, and the custom CSS file list all live here — there is no separate `config.yaml`:

```toml
baseURL = 'https://garden2k.com/'
title = 'Garden2k'

[params]
  custom_css = ["css/styles.css", "css/mobile.css", "css/overrides.css", "css/calendar.css", "css/slider.css", "css/events.css"]

[[menu.main]]
  name = "Events"
  pageRef = "/events"
  weight = 10
```

Add new nav items as additional `[[menu.main]]` blocks. Add new stylesheets to `params.custom_css` — they're linked directly (`site-style.html` partial), no build/bundling step.

## 5. CMS (`static/admin/config.yml`)

```yaml
backend:
  name: github
  repo: seven-obelisks/garden2k
  branch: main          # CMS writes commit directly to this branch — no sandboxing
  base_url: https://garden2k.com
  auth_endpoint: /api/auth

media_folder: "static/uploads"
public_folder: "/uploads"
```

**`branch: main` means every CMS save is a real commit to production.** There is no safe way to "test the CMS locally" against a throwaway state — the OAuth flow in `functions/api/auth.js` is also hardcoded to `https://garden2k.com` (`allowedRedirectOrigins`), so local login isn't currently possible without editing that file. If you need to test CMS changes safely, temporarily point `branch` at a test branch and revert after.

OAuth requires these set as Cloudflare Pages environment variables (not in the repo):
```
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
ALLOWED_GITHUB_USERS
```

## 6. Deploy — Cloudflare Pages

```
Build command:          hugo --gc --minify
Build output directory: public
```

Set an explicit Hugo version as an environment variable — don't rely on Cloudflare's default:
```
HUGO_VERSION = <your tested version, Extended>
```

## 7. Scheduled rebuild

`.github/workflows/daily-cloudflare-rebuild.yml` hits a Cloudflare deploy hook on a cron schedule (keeps event upcoming/past status current). Requires a `CLOUDFLARE_BUILD_HOOK` repository secret in GitHub Settings → Secrets and variables → Actions. If events stop reclassifying but the site otherwise looks fine, check this first — it fails silently.

## 8. Common problems

**Build fails on Cloudflare but works locally**
Check the build log first. Usually: `HUGO_VERSION` not Extended, or pinned too old for the gallery module's Sass. Also confirm `_vendor/` is actually committed — if it's missing, the build falls back to a live fetch of `hugo-shortcode-gallery`, which fails if GitHub or the Go proxy is unreachable from Cloudflare's build environment.

**CMS loads but can't save**
Check `repo` and `branch` in `config.yml`, and that the GitHub OAuth App's callback URL still matches `https://garden2k.com/api/callback`.

**CSS/JS changes not appearing**
```bash
rm -rf public resources/_gen
hugo server -D --disableFastRender
```
(`resources/_gen` is gitignored and safe to delete anytime — Hugo regenerates it.)

**Event not appearing**
Confirm front matter has `type: event` and required date fields — the templates filter on `type`.

## 9. First-time checklist

```
[ ] hugo version shows "extended"
[ ] hugo server -D runs clean, no template errors
[ ] hugo --gc --minify succeeds
[ ] Home, Events, Calendar, Blog pages all render
[ ] _vendor/ contains hugo-shortcode-gallery (not empty)
[ ] CMS loads at /admin and authenticates
[ ] Cloudflare Pages HUGO_VERSION is set explicitly
[ ] CLOUDFLARE_BUILD_HOOK secret set in GitHub Actions
```
