import test from 'node:test';
import assert from 'node:assert/strict';
import { csrfCookieName, csrfToken, requireCsrf } from '../src/middleware/csrf.js';
import { hasExpectedSignature } from '../src/middleware/upload.js';

test('accepts files whose bytes match the declared type', () => {
  assert.equal(hasExpectedSignature(Buffer.from('%PDF-1.7'), 'application/pdf'), true);
  assert.equal(
    hasExpectedSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), 'image/jpeg'),
    true
  );
  assert.equal(
    hasExpectedSignature(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      'image/png'
    ),
    true
  );
});

test('rejects mismatched upload signatures', () => {
  assert.equal(hasExpectedSignature(Buffer.from('<html>'), 'application/pdf'), false);
  assert.equal(hasExpectedSignature(Buffer.from('GIF89a'), 'image/png'), false);
  assert.equal(hasExpectedSignature(Buffer.from('RIFFxxxxWEBP'), 'image/webp'), true);
});

test('requires a matching CSRF cookie and header', () => {
  const request = { cookies: {} };
  let token;
  const response = {
    cookie(_name, value) {
      token = value;
    }
  };

  csrfToken(request, response, () => {});
  assert.equal(typeof token, 'string');
  assert.equal(request.csrfToken, token);

  let invalidError;
  requireCsrf(
    { method: 'POST', cookies: { [csrfCookieName]: token }, get: () => 'wrong' },
    {},
    (error) => {
      invalidError = error;
    }
  );
  assert.equal(invalidError?.status, 403);

  let validError;
  requireCsrf(
    { method: 'POST', cookies: { [csrfCookieName]: token }, get: () => token },
    {},
    (error) => {
      validError = error;
    }
  );
  assert.equal(validError, undefined);
});
