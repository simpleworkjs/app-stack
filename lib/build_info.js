'use strict';

// Unified build-info shape for every theta42 app: { buildVersion, buildHash,
// buildYear }. sso + proxy already used this shape; jump-host used
// { commit, version } and is normalized onto it.
//
// Docker builds bake the short commit hash into a file at image build time
// (the final image has no git binary / .git), so the baked file is preferred;
// bare-metal/dev runs fall back to `git rev-parse`. Both are app-specific
// (the baked file's path depends on where the app mounts it), so the app passes
// its paths in — this module just owns the resolution order + the shape.

const fs = require('fs');
const { execSync } = require('child_process');

function createBuildInfo({ version, buildCommitPath, cwd } = {}) {
	let buildHash = 'unknown';

	// 1. baked commit file (docker images)
	if (buildCommitPath) {
		try {
			const baked = fs.readFileSync(buildCommitPath, 'utf8').trim();
			if (baked) buildHash = baked;
		} catch (_) { /* no baked file */ }
	}

	// 2. git (bare metal / dev) — only if no baked hash was found
	if (buildHash === 'unknown' && cwd) {
		try {
			buildHash = execSync('git rev-parse --short HEAD', {
				cwd,
				stdio: ['ignore', 'pipe', 'ignore'],
			}).toString().trim();
		} catch (_) { /* not a git checkout, or git absent */ }
	}

	return {
		buildVersion: version || 'unknown',
		buildHash,
		buildYear: new Date().getFullYear(),
	};
}

module.exports = { createBuildInfo };