'use strict';

// The static-module mounting convention all three apps duplicate: serve each
// front-end vendor library straight from node_modules at /static-modules/<dep>
// (aggressive cache — vendors only change on version bumps, and ETag/304 still
// cover that), and the app's own JS/CSS/img from public/ at /static (shorter
// cache — changes every deploy, not fingerprinted).
//
// `root` is the app's nodejs directory (the one containing node_modules/ and
// public/). `staticMiddleware` is injectable so the helper is unit-testable
// without express.

const path = require('path');

function mountStaticModules(router, {
	root,
	deps,
	publicDir,
	moduleMaxAge = '7d',
	publicMaxAge = '1h',
	staticMiddleware,
} = {}) {
	if (!root) throw new Error('mountStaticModules: root is required (the app nodejs dir)');
	if (!Array.isArray(deps)) throw new Error('mountStaticModules: deps must be an array');
	const staticFn = staticMiddleware || require('express').static;

	for (const dep of deps) {
		router.use(
			`/static-modules/${dep}`,
			staticFn(path.join(root, 'node_modules', dep), { maxAge: moduleMaxAge })
		);
	}
	router.use(
		'/static',
		staticFn(publicDir || path.join(root, 'public'), { maxAge: publicMaxAge })
	);
	return router;
}

module.exports = { mountStaticModules };