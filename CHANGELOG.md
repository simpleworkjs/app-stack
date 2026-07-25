# Changelog

Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-25

Initial release. The safe, verifiable extractions from the theta42 shared UI stack.

### Added
- `createBuildInfo({ version, buildCommitPath, cwd })` → `{ buildVersion, buildHash, buildYear }`. Unifies the build-info shape across the three apps (jump-host normalized from `{ commit, version }`). Baked-commit-file-first, git fallback, `'unknown'` last resort.
- `mountStaticModules(router, { root, deps, publicDir?, moduleMaxAge?, publicMaxAge?, staticMiddleware? })` — the `/static-modules/<dep>` + `/static` mounting convention duplicated in all three apps, with the vendor 7-day / app-asset 1-hour cache split.
- `node --test` suite: build_info (baked-file preference, empty-file handling, git-fail fallback, shape) + static_modules (path/cache wiring, explicit-override, arg validation) using a fake router + injectable static middleware.