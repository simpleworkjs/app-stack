# @simpleworkjs/app-stack

Shared app-stack helpers for the theta42 apps (sso-manager-node, proxy, jump-host). The verifiable, low-risk extractions from the "feel the same" UI stack.

## What it provides

- `createBuildInfo({ version, buildCommitPath, cwd })` → `{ buildVersion, buildHash, buildYear }`. The unified build-info shape. Prefers a baked commit file (docker images have no git), falls back to `git rev-parse --short HEAD`, then `'unknown'`. sso + proxy already used this shape; jump-host used `{ commit, version }` and is normalized onto it.
- `mountStaticModules(router, { root, deps, publicDir?, moduleMaxAge?, publicMaxAge?, staticMiddleware? })` — the static-mounting convention all three apps duplicate: each vendor dep at `/static-modules/<dep>` (7-day cache) from `<root>/node_modules/<dep>`, and the app's own assets at `/static` (1-hour cache) from `<root>/public` (or an explicit `publicDir`).

## What it deliberately does NOT include

The higher-risk UI surface — `top.ejs`/`bottom.ejs` (nav gating differs per-app), `app-base.js` (sso's Promise form uses `$.isFunction`, removed in jquery 4), `val.js` (host/target rules are proxy-specific), and the jquery 3↔4 / ejs 6↔3 major-version alignment — diverges per app and has no render-test coverage. That's a separate, explicit decision, not an autonomous extraction.

## Install

```sh
npm install @simpleworkjs/app-stack
```

## Usage

```js
const { createBuildInfo, mountStaticModules } = require('@simpleworkjs/app-stack');
const { version } = require('../package.json');
const path = require('path');

// utils/build_info.js
module.exports = createBuildInfo({
  version,
  buildCommitPath: path.join(__dirname, '../.build_commit'),
  cwd: __dirname,
});

// routes/render.js (or routes/index.js)
mountStaticModules(router, {
  root: path.join(__dirname, '..'),
  deps: ['bootstrap', 'mustache', 'jquery', '@fortawesome', 'moment', '@popper', 'jq-repeat'],
});
```

## License

MIT © William Mantly