import test from 'node:test';
import assert from 'node:assert/strict';
import { X509Certificate } from 'node:crypto';
import { checkServerIdentity, connect, createServer } from 'node:tls';
import { once } from 'node:events';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postgres from 'postgres';
import { databaseTls } from '../../lib/server/database-tls.ts';
import { validateConfig } from '../../lib/server/core.ts';
import { withServerlessDatabase, SERVERLESS_DATABASE_OPTIONS } from '../../lib/server/serverless-database.ts';
import { withIdentityDatabase } from '../../lib/server/database.ts';

const host = 'aws-0-eu-west-1.pooler.supabase.com';
const env = {
  VERCEL_ENV: 'preview',
  VELARION_SUPABASE_URL: 'https://akhftbbszejafxpoxiem.supabase.co',
  VELARION_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic',
  VELARION_APP_ORIGIN: 'https://staging.example.test',
  VELARION_BFF_DATABASE_URL: `postgres://velarion_bff_runtime.akhftbbszejafxpoxiem:synthetic@${host}:5432/postgres`,
};
const config = validateConfig(env);
const policy = () => databaseTls(config, env);
const fixture = name => new URL(`../fixtures/supabase-staging-tls/${name}`, import.meta.url);

test('Preview pins the authenticated public root and keeps SNI, chain and standard hostname validation', () => {
  const ssl = policy();
  const ca = new X509Certificate(ssl.ca);
  assert.equal(ca.fingerprint256.replaceAll(':', '').toLowerCase(), '807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa');
  assert.equal(ca.ca, true);
  assert.equal(ssl.rejectUnauthorized, true);
  assert.equal(ssl.servername, host);
  assert.equal(ssl.checkServerIdentity, checkServerIdentity);
  // postgres.js must retain the TLS options object, not substitute a permissive ssl mode.
  const sql = postgres(config.databaseUrl, { ...SERVERLESS_DATABASE_OPTIONS, ssl });
  assert.equal(sql.options.ssl, ssl);
  assert.equal(sql.options.max, 1);
  assert.equal(sql.options.max_pipeline, 1);
  assert.equal(sql.options.prepare, false);
});

test('production, development, missing/unknown environment, other project/endpoint keep existing verify-full', () => {
  for (const VERCEL_ENV of ['production', 'development', undefined, 'staging']) {
    assert.equal(databaseTls(config, { ...env, VERCEL_ENV }), 'verify-full');
  }
  assert.equal(databaseTls({ ...config, supabaseUrl: 'https://other.supabase.co' }, env), 'verify-full');
  for (const hostname of ['aws-1-eu-west-1.pooler.supabase.com', 'db.akhftbbszejafxpoxiem.supabase.co', 'untrusted.example.test']) {
    const url = new URL(config.databaseUrl); url.hostname = hostname;
    assert.equal(databaseTls({ ...config, databaseUrl: url.href }, env), 'verify-full');
  }
});

test('database URL TLS overrides remain rejected before either client can be constructed', async () => {
  for (const query of ['sslmode=disable', 'sslmode=require', 'sslmode=allow', 'sslmode=prefer', 'sslmode=verify-full', 'sslrootcert=system', 'ssl=false']) {
    const bad = { ...env, VELARION_BFF_DATABASE_URL: `${config.databaseUrl}?${query}` };
    let calls = 0;
    const connect = () => { calls++; throw Error('must not connect'); };
    for (const wrapper of [withServerlessDatabase, withIdentityDatabase]) {
      await assert.rejects(wrapper(async () => {}, { env: bad, connect }), e => e.code === 'BFF_CONFIG_INVALID');
    }
    assert.equal(calls, 0);
  }
});

test('recorded provider chain is accepted only with bundled root and matching hostname (offline OpenSSL verify-full)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'velarion-provider-ca-'));
  try {
    const ca = join(dir, 'root.pem'); writeFileSync(ca, policy().ca);
    const verify = hostname => spawnSync('openssl', ['verify', '-no-CApath', '-no-CAstore', '-CAfile', ca, '-untrusted', fixture('intermediates.pem').pathname, '-purpose', 'sslserver', '-verify_hostname', hostname, fixture('leaf.pem').pathname], { encoding: 'utf8' });
    const accepted = verify(host);
    assert.equal(accepted.status, 0, accepted.stderr);
    assert.match(accepted.stdout, /OK/);
    const mismatch = verify('wrong.example.test');
    assert.notEqual(mismatch.status, 0);
    assert.match(mismatch.stderr, /hostname mismatch/);
    const untrusted = spawnSync('openssl', ['verify', '-no-CAfile', '-no-CApath', '-no-CAstore', '-untrusted', fixture('intermediates.pem').pathname, '-purpose', 'sslserver', '-verify_hostname', host, fixture('leaf.pem').pathname], { encoding: 'utf8' });
    assert.notEqual(untrusted.status, 0);
    assert.match(untrusted.stderr, /self-signed certificate in certificate chain/);
    const leaf = new X509Certificate(readFileSync(fixture('leaf.pem'))).toLegacyObject();
    assert.equal(policy().checkServerIdentity(host, leaf), undefined);
    assert.equal(policy().checkServerIdentity('wrong.example.test', leaf).code, 'ERR_TLS_CERT_ALTNAME_INVALID');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('both database wrappers pass the same strict policy and close injected clients', async () => {
  for (const wrapper of [withServerlessDatabase, withIdentityDatabase]) {
    let calls = 0, ended = 0;
    const connect = (url, options) => {
      calls++;
      assert.equal(url, config.databaseUrl);
      assert.deepEqual(options.ssl, policy());
      assert.equal(options.max, 1);
      assert.equal(options.prepare, false);
      assert.equal(options.connect_timeout, 5);
      assert.equal(options.idle_timeout, 5);
      assert.equal(options.max_lifetime, 30);
      return {
        async begin(fn) { return fn(async () => []); },
        async end() { ended++; },
      };
    };
    assert.equal(await wrapper(async () => 'ok', { env, connect }), 'ok');
    assert.equal(calls, 1); assert.equal(ended, 1);
    await assert.rejects(wrapper(async () => {}, { env, connect: () => { throw Error('private detail'); } }), e => ['ADMISSION_DATABASE_UNAVAILABLE', 'IDENTITY_DATABASE_UNAVAILABLE'].includes(e.code) && !e.message.includes('private detail'));
  }
});

test('Node TLS handshake accepts trusted chain with SNI and rejects mismatch/untrusted chain', async () => {
  // The real provider private key is neither available nor needed. Generate an ephemeral
  // local CA/leaf; substitute ONLY the test trust anchor, retaining the production TLS policy.
  const dir = mkdtempSync(join(tmpdir(), 'velarion-local-tls-'));
  let server;
  const sockets = new Set();
  try {
    const run = args => execFileSync('openssl', args, { cwd: dir, stdio: 'ignore' });
    run(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '1', '-subj', '/CN=Ephemeral test CA']);
    run(['req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'leaf.key', '-out', 'leaf.csr', '-subj', `/CN=${host}`]);
    writeFileSync(join(dir, 'extensions.cnf'), `subjectAltName=DNS:${host}\nextendedKeyUsage=serverAuth\nbasicConstraints=CA:FALSE\n`);
    run(['x509', '-req', '-in', 'leaf.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial', '-out', 'leaf.pem', '-days', '1', '-extfile', 'extensions.cnf']);
    const seenSni = [];
    server = createServer({ key: readFileSync(join(dir, 'leaf.key')), cert: readFileSync(join(dir, 'leaf.pem')) }, socket => { seenSni.push(socket.servername); socket.end(); });
    server.on('connection', socket => { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); });
    server.on('tlsClientError', () => {});
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const handshake = overrides => new Promise((resolve, reject) => {
      const socket = connect({ ...policy(), ca: readFileSync(join(dir, 'ca.pem')), host: '127.0.0.1', port: server.address().port, ...overrides });
      socket.setTimeout(3000, () => socket.destroy(Error('TLS test timeout')));
      socket.once('secureConnect', () => { assert.equal(socket.authorized, true); socket.end(); resolve(); });
      socket.once('error', reject);
    });
    await handshake({});
    await assert.rejects(handshake({ servername: 'wrong.example.test' }), e => e.code === 'ERR_TLS_CERT_ALTNAME_INVALID');
    await assert.rejects(handshake({ ca: policy().ca }), e => ['UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY'].includes(e.code));
    assert.ok(seenSni.includes(host));
  } finally {
    for (const socket of sockets) socket.destroy();
    if (server) await new Promise(resolve => server.close(resolve));
    rmSync(dir, { recursive: true, force: true });
  }
});
