# CLASSCADE Pages and domain cutover notes

## Current production structure

- Source, tests, pull requests, Actions, and GitHub Pages deployment are all managed in the public `edutogether/classcade` repository.
- The default GitHub Pages URL is `https://edutogether.github.io/classcade/`.
- `.github/workflows/deploy-pages.yml` builds and deploys from `main` with the official GitHub Pages Actions. It does not clone, write to, or otherwise depend on another repository.
- Production build values are supplied by the workflow:
  - `VITE_SITE_URL=https://edutogether.github.io/classcade`
  - `VITE_BASE_PATH=/classcade/`
- Local development keeps `VITE_BASE_PATH=/` by default.
- The manifest uses relative `start_url` and `scope`, so it works at both the GitHub Pages project path and a future root custom domain.

## Future custom-domain cutover

- The intended future custom domain is `https://edutogether.kr/`.
- When an authorized DNS cutover is approved, use only these production build values:
  - `VITE_SITE_URL=https://edutogether.kr`
  - `VITE_BASE_PATH=/`
- Configure the custom domain in the `edutogether/classcade` GitHub Pages settings only after its direct Pages deployment is healthy.
- No DNS, CNAME, HTTPS-enforcement, Cloudflare, or registrar configuration is changed by this repository migration.

## Retired deployment structure

The following are intentionally retired after direct Pages verification:

- `edutogether/edutogether.github.io`
- cross-repository deployment workflow
- cross-repository deploy key
- `PAGES_DEPLOY_KEY`

There is no CNAME file in this repository before a custom-domain cutover.
