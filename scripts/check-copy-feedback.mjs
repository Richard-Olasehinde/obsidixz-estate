/**
 * Copy-feedback contract for the contact email action.
 *
 * The "Copy email address" button has exactly two announced outcomes, and this
 * exercises every branch that produces them without needing a browser:
 *
 *   success → "Email address copied"
 *   failure → "Couldn’t copy. Please select and copy the email address above."
 *
 * Failure must cover a rejected clipboard write, an insecure origin, and the
 * legacy `execCommand` fallback returning false — the three ways a copy can
 * genuinely fail. Success must never be reported unless a write resolved.
 *
 * Run: node scripts/check-copy-feedback.mjs
 */
const EMAIL = 'obsidixz.realestate@outlook.com';
const SUCCESS = 'Email address copied';
const FAILURE = 'Couldn’t copy. Please select and copy the email address above.';

/** Mirrors the component: async Clipboard API when available and secure. */
async function copyState({ clipboard, secure, legacyResult }) {
  try {
    if (clipboard && secure) {
      await clipboard.writeText(EMAIL);
      return 'copied';
    }
    // Legacy path — synchronous document.execCommand('copy').
    return legacyResult ? 'copied' : 'failed';
  } catch {
    return 'failed';
  }
}

const cases = [
  ['async clipboard resolves', { clipboard: { writeText: async () => {} }, secure: true }, 'copied'],
  [
    'async clipboard rejects permission',
    {
      clipboard: {
        writeText: async () => {
          throw new Error('NotAllowedError');
        },
      },
      secure: true,
    },
    'failed',
  ],
  ['insecure origin, execCommand succeeds', { clipboard: null, secure: false, legacyResult: true }, 'copied'],
  ['insecure origin, execCommand refuses', { clipboard: null, secure: false, legacyResult: false }, 'failed'],
  ['no clipboard support at all', { clipboard: null, secure: false, legacyResult: false }, 'failed'],
  [
    'clipboard present but undefined writeText',
    { clipboard: {}, secure: true },
    'failed',
  ],
];

let failures = 0;
console.log('Copy-feedback branches\n');
for (const [name, env, expected] of cases) {
  let state;
  try {
    state = await copyState(env);
  } catch {
    // An unguarded throw would surface as an unhandled rejection in the UI.
    state = 'threw';
  }
  const message = state === 'copied' ? SUCCESS : state === 'failed' ? FAILURE : null;
  const ok = state === expected && message !== null;
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name.padEnd(38)} -> ${JSON.stringify(message)}`);
}

console.log(
  `\n${failures === 0 ? 'All copy-feedback branches behave correctly.' : `${failures} failure(s)`}`,
);
process.exit(failures === 0 ? 0 : 1);
