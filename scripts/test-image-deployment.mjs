import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));
const env = {
    ...process.env,
    APP_SECRET_KEY: 'test-only-not-a-deployment-secret-32bytes',
    FRONTEND_BASE_URL: 'http://localhost:5550',
    POSTGRES_PASSWORD: 'test-only',
    PUBLISHER_INTERNAL_TOKEN: 'test-only',
    ADMIN_INITIAL_PASSWORD: 'test-only',
    IMAGE_PREFIX: 'baotuo-studio',
    IMAGE_TAG: 'sha-0123456789012345678901234567890123456789',
    GHCR_OWNER: 'baotuo88',
};
function config(files, overrides = {}) {
    return JSON.parse(execFileSync('docker', ['compose', '--env-file', '.env.example', ...files.flatMap(file => ['-f', file]), 'config', '--format', 'json'], {
        cwd: root, env: { ...env, ...overrides }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
    }));
}
for (const base of ['docker-compose.yml', 'docker-compose-local.yml']) {
    test(`${base}: local builds use own image and container names`, () => {
        const result = config([base]);
        for (const service of ['web', 'server', 'publisher']) {
            assert.equal(result.services[service].image, `baotuo-studio-${service}:${env.IMAGE_TAG}`);
            assert.ok(result.services[service].build);
            assert.equal(result.services[service].pull_policy, 'build');
        }
        for (const [name, service] of Object.entries(result.services)) assert.equal(service.container_name, `baotuo-studio-${name}`);
    });
    test(`${base}: GHCR deployment only pulls published images`, () => {
        const result = config([base, 'docker-compose.ghcr.yml']);
        assert.deepEqual(Object.keys(result.services).sort(), ['nginx', 'postgres', 'publisher', 'redis', 'server', 'web']);
        for (const service of ['web', 'server', 'publisher']) {
            const entry = result.services[service];
            assert.equal(entry.image, `ghcr.io/baotuo88/baotuo-studio-${service}:${env.IMAGE_TAG}`);
            assert.equal(entry.build, undefined);
            assert.equal(entry.pull_policy, 'always');
        }
    });
}
test('GHCR owner and release tag can be changed without editing compose files', () => {
    const result = config(['docker-compose-local.yml', 'docker-compose.ghcr.yml'], { GHCR_OWNER: 'example-team', IMAGE_TAG: 'v1.2.3' });
    assert.equal(result.services.web.image, 'ghcr.io/example-team/baotuo-studio-web:v1.2.3');
    assert.equal(result.services.server.image, 'ghcr.io/example-team/baotuo-studio-server:v1.2.3');
});
