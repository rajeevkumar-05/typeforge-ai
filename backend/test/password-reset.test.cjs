const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const bcrypt = require('bcryptjs');
const helpers = require('../dist/utils/helpers');

function load(file, mocks, globals = {}) {
  const module = { exports: {} };
  const output = [];
  const context = {
    module, exports: module.exports,
    require: id => Object.hasOwn(mocks, id) ? mocks[id] : require(id),
    process: { env: {} }, Buffer, URL, AbortSignal,
    console: { log: (...args) => output.push(args.join(' ')), error: (...args) => output.push(args.join(' ')) },
    ...globals,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist', file), 'utf8'), context, { filename: file });
  return { exports: module.exports, output };
}
function mail(env, transport = {}, fetchImpl) {
  return load('utils/email.js', { nodemailer: { createTransport: transport.create || (() => transport) } },
    { process: { env }, fetch: fetchImpl });
}
function service(User, sendEmail = async () => {}, configCheck = () => {}) {
  return load('services/authService.js', {
    '../models/User': { __esModule: true, default: User },
    '../utils/jwt': { signToken: () => 'test-only-token' },
    '../utils/helpers': helpers,
    '../utils/email': { sendEmail, assertEmailConfigured: configCheck, getPasswordResetEmail: url => url },
  }, { process: { env: { CLIENT_URL: 'https://example.com,http://localhost:5173' } } }).exports;
}

test('missing email configuration rejects instead of logging a fake success or a reset link', async () => {
  const loaded = mail({});
  await assert.rejects(loaded.exports.sendEmail({ to: 'fixture@example.com', subject: 'reset', html: 'SECRET_RESET_LINK' }), { statusCode: 503 });
  assert.equal(loaded.output.length, 0);
});
test('Resend requires both a key and sender', () => {
  assert.throws(() => mail({ EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 'test-key' }).exports.assertEmailConfigured(), { statusCode: 503 });
});
test('HTTPS email delivery waits for provider acceptance', async () => {
  let request;
  const loaded = mail({ EMAIL_PROVIDER: 'resend', RESEND_API_KEY: 'test-key', EMAIL_FROM: 'TypeForge <fixture@example.com>' }, {},
    async (url, options) => { request = { url, options }; return { ok: true, json: async () => ({ id: 'fixture-mail-id' }) }; });
  await loaded.exports.sendEmail({ to: 'recipient@example.com', subject: 'reset', html: 'body', text: 'plain' });
  assert.equal(request.url, 'https://api.resend.com/emails');
  assert.deepEqual(JSON.parse(request.options.body).to, ['recipient@example.com']);
  assert.equal(JSON.parse(request.options.body).text, 'plain');
});
test('provider rejection returns a delivery error without logging reset contents', async () => {
  const loaded = mail({ RESEND_API_KEY: 'test-key', EMAIL_FROM: 'fixture@example.com' }, {},
    async () => ({ ok: false, json: async () => ({ message: 'PRIVATE_PROVIDER_DETAIL' }) }));
  await assert.rejects(loaded.exports.sendEmail({ to: 'PRIVATE_RECIPIENT', subject: 'reset', html: 'PRIVATE_LINK' }), { statusCode: 503 });
  assert.equal(loaded.output.some(line => /PRIVATE_/.test(line)), false);
});
test('SMTP 465 uses TLS, bounded timeouts and closes the transporter', async () => {
  let options; let closed = false;
  const loaded = mail({ EMAIL_PROVIDER: 'smtp', SMTP_USER: 'fixture', SMTP_PASS: 'test-only', SMTP_PORT: '465' },
    { create: value => { options = value; return { sendMail: async () => ({ accepted: ['fixture'], rejected: [] }), close: () => { closed = true; } }; } });
  await loaded.exports.sendEmail({ to: 'fixture@example.com', subject: 'reset', html: 'body' });
  assert.equal(options.secure, true);
  assert.equal(options.connectionTimeout, 10000);
  assert.equal(closed, true);
});
test('SMTP recipient rejection is not treated as success', async () => {
  const loaded = mail({ SMTP_USER: 'fixture', SMTP_PASS: 'test-only' },
    { sendMail: async () => ({ accepted: [], rejected: ['fixture'] }), close: () => {} });
  await assert.rejects(loaded.exports.sendEmail({ to: 'fixture@example.com', subject: 'reset', html: 'body' }), { statusCode: 503 });
});
test('configuration failure happens before looking up any account', async () => {
  let queried = false;
  const api = service({ findOne: async () => { queried = true; } }, undefined,
    () => { throw Object.assign(new Error('unavailable'), { statusCode: 503 }); });
  await assert.rejects(api.forgotPassword('fixture@example.com'), { statusCode: 503 });
  assert.equal(queried, false);
});
test('unknown and Google-only accounts have the same generic service result', async () => {
  let sent = 0;
  const api = service({ findOne: async query => { assert.equal(query.provider, 'local'); return null; } }, async () => { sent++; });
  assert.equal(await api.forgotPassword('unknown@example.com'), undefined);
  assert.equal(await api.forgotPassword('google-only@example.com'), undefined);
  assert.equal(sent, 0);
});
test('reset request stores only the hash and builds a usable link from the first configured origin', async () => {
  let message;
  const user = { _id: 'fixture-id', email: 'fixture@example.com', save: async () => {} };
  const api = service({ findOne: async () => user }, async value => { message = value; });
  await api.forgotPassword('fixture@example.com');
  const rawToken = new URL(message.html).pathname.split('/').pop();
  assert.match(rawToken, /^[a-f0-9]{64}$/);
  assert.equal(user.resetPasswordToken, helpers.hashResetToken(rawToken));
  assert.notEqual(user.resetPasswordToken, rawToken);
  assert.equal(new URL(message.html).origin, 'https://example.com');
  assert.match(message.text, /expires in one hour/);
});
test('delivery failure conditionally removes its undelivered token', async () => {
  let cleanup;
  const user = { _id: 'fixture-id', email: 'fixture@example.com', save: async () => {} };
  const api = service({ findOne: async () => user, updateOne: async (filter, update) => { cleanup = { filter, update }; } },
    async () => { throw Object.assign(new Error('mail unavailable'), { statusCode: 503 }); });
  await assert.rejects(api.forgotPassword('fixture@example.com'), { statusCode: 503 });
  assert.equal(cleanup.filter.resetPasswordToken, user.resetPasswordToken);
  assert.equal(cleanup.update.$unset.resetPasswordToken, 1);
});
test('a recent request is not sent again within the server cooldown', async () => {
  let sent = false;
  const user = { resetPasswordExpires: new Date(Date.now() + 3590000) };
  const api = service({ findOne: async () => user }, async () => { sent = true; });
  await api.forgotPassword('fixture@example.com');
  assert.equal(sent, false);
});
function atomicStore(token, provider = 'local', expiration = Date.now() + 60000) {
  const state = { resetPasswordToken: helpers.hashResetToken(token), resetPasswordExpires: new Date(expiration), provider, passwordHash: 'old-fixture-hash' };
  return {
    state,
    model: { findOneAndUpdate: async (filter, update) => {
      if (state.provider !== filter.provider || state.resetPasswordToken !== filter.resetPasswordToken
        || !state.resetPasswordExpires || state.resetPasswordExpires <= filter.resetPasswordExpires.$gt) return null;
      state.passwordHash = update.$set.passwordHash;
      delete state.resetPasswordToken; delete state.resetPasswordExpires;
      return { _id: 'fixture-id' };
    } },
  };
}
test('successful reset hashes the new password and consumes the link once', async () => {
  const token = 'a'.repeat(64);
  const fixture = atomicStore(token);
  const api = service(fixture.model);
  await api.resetPassword(token, 'fixture-password');
  assert.equal(await bcrypt.compare('fixture-password', fixture.state.passwordHash), true);
  assert.equal(fixture.state.resetPasswordToken, undefined);
  await assert.rejects(api.resetPassword(token, 'another-fixture-password'), { statusCode: 400 });
});
test('two concurrent resets cannot both consume the same token', async () => {
  const token = 'b'.repeat(64);
  const fixture = atomicStore(token);
  const api = service(fixture.model);
  const results = await Promise.allSettled([api.resetPassword(token, 'fixture-password-1'), api.resetPassword(token, 'fixture-password-2')]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter(r => r.status === 'rejected').length, 1);
});
test('expired links and Google-only accounts cannot reset a local password', async () => {
  const token = 'c'.repeat(64);
  await assert.rejects(service(atomicStore(token, 'local', Date.now() - 1000).model).resetPassword(token, 'fixture-password'), { statusCode: 400 });
  await assert.rejects(service(atomicStore(token, 'google').model).resetPassword(token, 'fixture-password'), { statusCode: 400 });
});
test('invalid token and overlong multibyte passwords are rejected before database writes', async () => {
  let wrote = false;
  const api = service({ findOneAndUpdate: async () => { wrote = true; } });
  await assert.rejects(api.resetPassword('invalid', 'fixture-password'), { statusCode: 400 });
  await assert.rejects(api.resetPassword('d'.repeat(64), '😀'.repeat(3)), { statusCode: 400 });
  await assert.rejects(api.resetPassword('d'.repeat(64), '😀'.repeat(30)), { statusCode: 400 });
  assert.equal(wrote, false);
});
