import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

for (const file of ['docker-compose.yml', 'docker-compose-local.yml']) {
    test(`${file} deploys the app without a gateway`, async () => {
        const source = await readFile(new URL('../' + file, import.meta.url), 'utf8');
        const services = [...source.matchAll(/^  ([a-z][a-z0-9-]*):\s*$/gm)].map(match => match[1]);
        assert.deepEqual(services.sort(), ['nginx', 'postgres', 'publisher', 'redis', 'server', 'web']);
        assert.doesNotMatch(source, /newapi|new-api|NEWAPI/i);
    });
}
test('retired initialization exits without network or credential writes', () => {
    const result = spawnSync(process.execPath, [new URL('./setup-newapi.mjs', import.meta.url).pathname, '--prepare'], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /不再部署或初始化/);
});
test('environment template requires no gateway credentials', async () => {
    const source = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
    assert.doesNotMatch(source, /^NEWAPI_/m);
});
