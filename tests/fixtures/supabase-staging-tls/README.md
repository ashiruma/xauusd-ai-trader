# Public Staging TLS test fixtures

`leaf.pem` and `intermediates.pem` are public certificates recorded during the previously approved strict PostgreSQL TLS handshake to `aws-0-eu-west-1.pooler.supabase.com:5432`. They contain no private keys, credentials or database records. The intermediate bundle includes the peer-supplied root, deliberately passed as **untrusted** chain material in tests; it is not the source of trust.

The only trust anchor is the exact authenticated Supabase Dashboard CA embedded in `lib/server/database-tls.ts`. Its DER SHA-256 is `807025ad50d4ed219d2c9c7d299c004f824eb00cf7f65afef607d07b72e6cafa`. Source: [Staging Database Settings](https://supabase.com/dashboard/project/akhftbbszejafxpoxiem/database/settings), linking to [Supabase's CA publication](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt).

Original local evidence: `/workspace/velarion-staging-tls-resolution-20261021/` (`ca-provenance.json`, `openssl-provider-ca.log`, `peer-chain-0.pem`, `peer-intermediates.pem`). The leaf expires 2030-03-11; the root expires 2031-04-26. Offline tests intentionally use current-time certificate validation and must be refreshed from authenticated provider evidence at rotation/expiry, never by disabling validation.

Run `node --import tsx --test tests/node/database-tls.test.mjs` (Node and OpenSSL 3 required). Tests use these saved certificates and loopback TLS only; no Supabase connection, SQL or deployment is performed. A separate ephemeral local CA/leaf is generated for actual Node TLS handshake tests; no private key is retained.
