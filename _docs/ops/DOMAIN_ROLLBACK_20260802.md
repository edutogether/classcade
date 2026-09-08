# CLASSCADE edutogether.kr cutover record

## Source and publishing structure

- Source, tests, pull requests, Actions, and GitHub Pages deployment are managed only in public `edutogether/classcade`.
- Pages publishing uses `.github/workflows/deploy-pages.yml` with the official GitHub Pages Actions workflow.
- The pre-cutover Pages URL is `https://edutogether.github.io/classcade/`.
- There is no cross-repository deployment, deploy key, `PAGES_DEPLOY_KEY`, or repository `public/CNAME` file.

## Observed DNS state before the cutover

- Audit date: 2026-08-02 (Asia/Seoul).
- The domain registrar is reported as Gabia, but authoritative DNS could not be confirmed from the resolver responses below.
- The system resolver, Google Public DNS (`8.8.8.8`), and Cloudflare DNS (`1.1.1.1`) each returned `DNS server failure` for every query:
  - `edutogether.kr` NS, SOA, A, and AAAA
  - `www.edutogether.kr` CNAME and A
- Consequently, no pre-change authoritative NS, SOA, A, AAAA, CNAME, or TTL value is observable. Do not infer or overwrite unknown existing records.
- No DNS, registrar, CAA, DNSSEC, HTTPS-enforcement, or custom-domain value was changed during this audit.

## Approved production build after DNS readiness

- `VITE_SITE_URL=https://edutogether.kr`
- `VITE_BASE_PATH=/`
- The Vite configuration reads these values from the workflow environment; local development remains rooted at `/` by default.
- The manifest uses relative `start_url` and `scope`, which resolves correctly at the root custom domain.
- The expected public metadata URLs are rooted at `https://edutogether.kr/`, including `https://edutogether.kr/og/classcade-share-v1.png`.

## Manual DNS instructions after GitHub Pages custom-domain registration

At Gabia: **My가비아 → DNS 관리툴 → edutogether.kr → DNS 설정 → 레코드 수정**.

| Type | Host | Value | TTL |
| --- | --- | --- | --- |
| A | `@` (or blank) | `185.199.108.153` | Keep Gabia default or current default |
| A | `@` (or blank) | `185.199.109.153` | Keep Gabia default or current default |
| A | `@` (or blank) | `185.199.110.153` | Keep Gabia default or current default |
| A | `@` (or blank) | `185.199.111.153` | Keep Gabia default or current default |
| CNAME | `www` | `edutogether.github.io` | Keep Gabia default or current default |

- Before replacing a conflicting `@` A record or `www` A/CNAME record, record its existing value in this document.
- Do not delete MX, TXT, email-related records, DNSSEC settings, or unobserved AAAA/CAA records.
- If the nameservers are not managed at Gabia, resolve that authority issue before changing DNS records.

## Completion and rollback checks

- Merge the root-base workflow only after the DNS records above resolve correctly and GitHub Pages reports the `edutogether.kr` custom domain as ready.
- Enable HTTPS only after GitHub Pages reports eligibility.
- Verify `https://edutogether.kr/`, `https://www.edutogether.kr/`, and the original Pages URL before declaring completion.
- On rollback, restore the exact DNS values recorded immediately before manual changes; unknown values must not be guessed.
