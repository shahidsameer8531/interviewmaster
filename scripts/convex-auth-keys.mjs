#!/usr/bin/env node
/**
 * Generates the RS256 key pair Convex Auth needs and prints the two
 * `npx convex env set` commands to run. Nothing is written to disk.
 *
 *   node scripts/convex-auth-keys.mjs
 *
 * The private key is printed once; run the commands and then clear your
 * terminal scrollback.
 */
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const jose = require("jose");

const { privateKey, publicKey } = await jose.generateKeyPair("RS256", { extractable: true });
const pkcs8 = (await jose.exportPKCS8(privateKey)).replace(/\n/g, " ");
const jwk = await jose.exportJWK(publicKey);
const jwks = JSON.stringify({ keys: [{ use: "sig", ...jwk }] });

console.log("# Run these two commands from the project root (the -- is required):");
console.log(`npx convex env set -- JWT_PRIVATE_KEY "${pkcs8}"`);
console.log(`npx convex env set -- JWKS '${jwks}'`);
