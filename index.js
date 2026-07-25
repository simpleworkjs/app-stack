'use strict';

// Shared app-stack helpers for the theta42 apps. Phase 4's safe, verifiable
// extractions: a unified build_info shape ({buildVersion, buildHash, buildYear})
// and the static-module mounting convention every app duplicates.
//
// The higher-risk UI surface (parameterized top.ejs/bottom.ejs, app-base.js,
// val.js, jquery/ejs major-version alignment) is deliberately NOT here — it
// diverges per-app and has no render-test coverage, so it's a separate
// decision rather than an autonomous extraction.

const { createBuildInfo } = require('./lib/build_info');
const { mountStaticModules } = require('./lib/static_modules');

module.exports = {
	createBuildInfo,
	mountStaticModules,
};