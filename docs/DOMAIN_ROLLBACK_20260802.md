# edutogether.kr domain rollback checklist — 2026-08-02

This is an operational rollback checklist. It intentionally records only observed values; no unverified historical DNS values are inferred.

## Pre-change snapshot

- Audit date: 2026-08-02 (Asia/Seoul).
- `edutogether.kr` and `www.edutogether.kr` did not resolve from the local resolver, Cloudflare 1.1.1.1 DoH, or Google Public DNS.
- Cloudflare returned `No Reachable Authority at delegation edutogether.kr`; Google returned `Name servers refused query (lame delegation?)`.
- The four delegated authority IPs reported by public resolvers were `43.201.170.100`, `121.78.117.39`, `20.200.205.248`, and `211.234.124.90`. Each refused A, AAAA, CNAME, NS, and CAA queries.
- Therefore the pre-change A, AAAA, CNAME, TTL, HTTPS certificate, HTTP redirect, and hosting target are **not observable**. Do not replace these unknown values by assumption.
- `https://edutogether.kr/`, `http://edutogether.kr/`, and `https://www.edutogether.kr/` could not be requested because DNS resolution failed.
- `edutogether/platform` has no GitHub Pages site (`GET /repos/edutogether/platform/pages` returned 404); its source and settings were not modified.
- `edutogether/classcade` had no GitHub Pages site at audit time (`GET /repos/edutogether/classcade/pages` returned 404).
- Other organization Pages sites (`muds`, `aiways-incheon`, `googler`) have `cname: null`; no observed organization Pages setting uses `edutogether.kr`.

## Post-attempt status

- Last verified: 2026-08-02 19:24:27 +09:00.
- Creating a CLASSCADE Pages site with `build_type=workflow` returned `422: Your current plan does not support GitHub Pages for this repository`; that direct Pages workflow is replaced by the public source-to-deployment-repository workflow.
- `edutogether/edutogether.github.io` is the dedicated public deployment repository. GitHub organization deploy-key creation must be enabled before its write deploy key can be registered.
- No custom-domain setting, DNS change, HTTPS enforcement, PR merge, or production release occurred as a result of the earlier attempt.

## Planned target after a verified production deployment

- Source: public `edutogether/classcade`; `.github/workflows/publish-edutogether-site.yml` verifies and builds `main` before publishing its `dist` output.
- Host: public `edutogether/edutogether.github.io` GitHub Pages, published from its `main` branch root.
- First public URL: `https://edutogether.github.io/`.
- Custom domain: later configure `edutogether.kr` in the deployment repository's Pages setting. No CNAME file is used before that cutover.
- HTTPS: enable enforcement only after the Pages certificate is approved.
- DNS values to use only after the registrar/DNS administrator repairs authority delegation and preserves an exact current-zone export:

| Host | Type | Value | TTL |
| --- | --- | --- | --- |
| `@` | A | `185.199.108.153` | 300 during cutover |
| `@` | A | `185.199.109.153` | 300 during cutover |
| `@` | A | `185.199.110.153` | 300 during cutover |
| `@` | A | `185.199.111.153` | 300 during cutover |
| `@` | AAAA | `2606:50c0:8000::153` | 300 during cutover |
| `@` | AAAA | `2606:50c0:8001::153` | 300 during cutover |
| `@` | AAAA | `2606:50c0:8002::153` | 300 during cutover |
| `@` | AAAA | `2606:50c0:8003::153` | 300 during cutover |
| `www` | CNAME | `edutogether.github.io.` | 300 during cutover |

Keep the DNS provider's required SOA/NS records. Do not add wildcard records. Before publishing, record any additional apex `A`, `AAAA`, `ALIAS`, `ANAME`, `CNAME`, and `CAA` records; CAA must permit `letsencrypt.org` when CAA is present.

## Cutover order

1. Verify the exact feature build at the temporary Pages URL over HTTPS.
2. Merge only the validated PR, deploy `main`, and verify its Pages URL.
3. Export the live DNS zone and record it below before changing any record.
4. Set `edutogether.kr` as the deployment repository's Pages custom domain. If another Pages site owns it, record that site's setting first and remove it only after the deployment repository's Pages deployment is healthy.
5. Apply the target DNS records above through the authorized DNS provider. Never replace unobserved pre-change records.
6. Wait for Pages domain verification and certificate approval, then enable HTTPS enforcement.
7. Verify with the commands below from two public resolvers and an HTTPS client.

## Actual pre-cutover DNS export (must be filled by the authorized DNS administrator)

| Host | Type | Value | TTL | Keep / remove / replace |
| --- | --- | --- | --- | --- |
| _Not available: current delegation refuses authoritative queries._ |  |  |  |  |

## Roll back to the pre-cutover destination

1. Disable HTTPS enforcement on the deployment repository's Pages site only if the original host requires it during recovery.
2. Remove `edutogether.kr` from the deployment repository's Pages custom-domain setting after the previous target is ready to serve it.
3. Restore the administrator's exact pre-cutover DNS export above, including the original TTLs and every prior `A`, `AAAA`, `ALIAS`, `ANAME`, `CNAME`, and relevant `CAA` record.
4. Restore the recorded former Pages custom-domain setting, if one existed; do not modify `edutogether/platform` code.
5. Confirm the previous HTTPS certificate/redirect behavior and clear social caches only after the original HTML is live again.

## Verification commands

```powershell
Resolve-DnsName edutogether.kr -Type A -Server 1.1.1.1
Resolve-DnsName edutogether.kr -Type A -Server 8.8.8.8
Resolve-DnsName www.edutogether.kr -Type CNAME -Server 1.1.1.1
Resolve-DnsName www.edutogether.kr -Type CNAME -Server 8.8.8.8
curl.exe -I https://edutogether.kr/
curl.exe -I https://www.edutogether.kr/
curl.exe -sS -L -A "KakaoTalk-Scrap/1.0" https://edutogether.kr/
```

For Kakao preview cache inspection after the public domain is healthy, sign in to [Kakao Developers Share Debugger](https://developers.kakao.com/tool/debugger/sharing), enter `https://edutogether.kr/`, confirm the fetched Open Graph values, and run its cache refresh if necessary. The direct tool requires Kakao login.

## Change log

| Time (KST) | Change | Verified by |
| --- | --- | --- |
| 2026-08-02, pre-deployment | DNS/Pages audit recorded; no DNS or custom-domain setting changed | local resolver, Cloudflare DoH, Google Public DNS, GitHub API |
| 2026-08-02 19:24:27 +09:00 | CLASSCADE Pages API enablement declined with HTTP 422; no cutover performed | GitHub REST API |
