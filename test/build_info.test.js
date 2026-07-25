'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createBuildInfo } = require('..');

function tmpDir() {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'build-info-'));
}

test('createBuildInfo returns the unified shape', () => {
	const info = createBuildInfo({ version: '1.2.3', buildCommitPath: '/no/such/file', cwd: '/no/such/dir' });
	assert.deepEqual(Object.keys(info).sort(), ['buildHash', 'buildVersion', 'buildYear']);
	assert.equal(info.buildVersion, '1.2.3');
	assert.equal(typeof info.buildYear, 'number');
	assert.equal(info.buildYear, new Date().getFullYear());
});

test('createBuildInfo prefers the baked commit file over git', () => {
	const dir = tmpDir();
	const baked = path.join(dir, '.build_commit');
	fs.writeFileSync(baked, 'abc1234\n');
	const info = createBuildInfo({ version: '1.0.0', buildCommitPath: baked, cwd: dir });
	assert.equal(info.buildHash, 'abc1234');
	fs.rmSync(dir, { recursive: true, force: true });
});

test('createBuildInfo falls back to "unknown" when there is no baked file and git fails', () => {
	const dir = tmpDir(); // not a git checkout → git rev-parse throws
	const info = createBuildInfo({ version: '1.0.0', buildCommitPath: path.join(dir, '.build_commit'), cwd: dir });
	assert.equal(info.buildHash, 'unknown');
	fs.rmSync(dir, { recursive: true, force: true });
});

test('createBuildInfo treats an empty baked file as absent', () => {
	const dir = tmpDir();
	const baked = path.join(dir, '.build_commit');
	fs.writeFileSync(baked, '   \n');
	const info = createBuildInfo({ version: '1.0.0', buildCommitPath: baked, cwd: dir });
	assert.equal(info.buildHash, 'unknown', 'whitespace-only baked file must not count as a hash');
	fs.rmSync(dir, { recursive: true, force: true });
});

test('createBuildInfo defaults version to "unknown" when not passed', () => {
	const info = createBuildInfo({ buildCommitPath: '/no/such', cwd: '/no/such' });
	assert.equal(info.buildVersion, 'unknown');
});