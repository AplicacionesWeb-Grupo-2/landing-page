# ColdTrace Landing Page

Base scaffold for the ColdTrace landing page.

## Current Scope

This branch contains only the shared starting point:

- `index.html`
- `assets/styles/reset.css`
- `assets/styles/variables.css`
- `assets/styles/main.css`
- `assets/scripts/i18n.js`
- `assets/scripts/main.js`
- `assets/locales/en-US.json`
- `assets/locales/es-419.json`
- shared `assets/images/` and `assets/icons/`

No section is fully implemented in this base. Section work belongs in the feature branches listed in [docs/branch-plan.md](docs/branch-plan.md).

## Local Preview

```bash
npm run dev
```

Open <http://localhost:5173>.

## Vue App Routing

Landing authentication and registration links use `assets/scripts/app-routing.js`. The default Vue app URL can be overridden before that script loads:

```html
<script>window.COLDTRACE_APP_URL = 'https://app.example.com';</script>
```

The same route builder is used by plan CTAs so the selected `plan` query parameter reaches the Vue sign-up route.

## Branches

- `develop`
- `feature/header-hero`
- `feature/app-features`
- `feature/showcase-why`
- `feature/overview-signup`
- `feature/footer`
