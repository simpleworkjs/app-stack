'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { mountStaticModules } = require('..');

function fakeRouter() {
	const mounts = [];
	return {
		use(p, h) { mounts.push({ path: p, handler: h }); },
		mounts,
	};
}

test('mountStaticModules mounts each dep at /static-modules/<dep> + /static', () => {
	const router = fakeRouter();
	const staticArgs = [];
	const staticFn = (dir, opts) => { staticArgs.push({ dir, opts }); return `handler:${dir}`; };
	mountStaticModules(router, {
		root: '/app/nodejs',
		deps: ['bootstrap', 'jquery', '@fortawesome'],
		staticMiddleware: staticFn,
	});
	assert.equal(router.mounts[0].path, '/static-modules/bootstrap');
	assert.equal(router.mounts[1].path, '/static-modules/jquery');
	assert.equal(router.mounts[2].path, '/static-modules/@fortawesome');
	assert.equal(router.mounts[3].path, '/static');
	// each dep handler is the staticFn result
	assert.equal(router.mounts[0].handler, 'handler:/app/nodejs/node_modules/bootstrap');
	assert.equal(router.mounts[3].handler, 'handler:/app/nodejs/public');
});

test('mountStaticModules points each dep at <root>/node_modules/<dep> with the 7d cache', () => {
	const router = fakeRouter();
	const staticArgs = [];
	const staticFn = (dir, opts) => { staticArgs.push({ dir, opts }); return dir; };
	mountStaticModules(router, { root: '/r', deps: ['jquery'], staticMiddleware: staticFn });
	assert.equal(staticArgs[0].dir, path.join('/r', 'node_modules', 'jquery'));
	assert.equal(staticArgs[0].opts.maxAge, '7d');
});

test('mountStaticModules points /static at <root>/public by default with the 1h cache', () => {
	const router = fakeRouter();
	const staticArgs = [];
	const staticFn = (dir, opts) => { staticArgs.push({ dir, opts }); return dir; };
	mountStaticModules(router, { root: '/r', deps: [], staticMiddleware: staticFn });
	assert.equal(staticArgs[0].dir, path.join('/r', 'public'));
	assert.equal(staticArgs[0].opts.maxAge, '1h');
});

test('mountStaticModules honors an explicit publicDir + custom maxAge', () => {
	const router = fakeRouter();
	const staticArgs = [];
	const staticFn = (dir, opts) => { staticArgs.push({ dir, opts }); return dir; };
	mountStaticModules(router, {
		root: '/r', deps: [], publicDir: '/custom/public',
		moduleMaxAge: '30d', publicMaxAge: '5m', staticMiddleware: staticFn,
	});
	assert.equal(staticArgs[0].dir, '/custom/public');
	assert.equal(staticArgs[0].opts.maxAge, '5m');
});

test('mountStaticModules requires root + deps', () => {
	assert.throws(() => mountStaticModules(fakeRouter(), { deps: [] }), /root is required/);
	assert.throws(() => mountStaticModules(fakeRouter(), { root: '/r' }), /deps must be an array/);
});

test('mountStaticModules returns the router', () => {
	const router = fakeRouter();
	const out = mountStaticModules(router, { root: '/r', deps: [], staticMiddleware: () => 'h' });
	assert.equal(out, router);
});