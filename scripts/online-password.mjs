import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import {hashPassword} from '../apps/api/src/auth.ts';

async function hidden(prompt) {
  const sink = new Writable({write(_chunk, _encoding, done) {done();}});
  sink.isTTY = true;
  sink.columns = 80;
  const rl = createInterface({input:process.stdin, output:sink, terminal:true});
  const abort = new AbortController();
  rl.on('SIGINT', () => abort.abort());
  process.stdout.write(prompt);
  try { return await rl.question('', {signal:abort.signal}); }
  finally {rl.close(); sink.end(); process.stdout.write('\n');}
}

try {
  if (!process.stdin.isTTY) throw Error('Open an interactive terminal. Password input is hidden.');
  console.log('Choose a new ONLINE password (12-256 characters). No files will be changed.');
  let password = await hidden('New password: ');
  let confirm = await hidden('Confirm password: ');
  if (password !== confirm) throw Error('Passwords do not match. Nothing changed.');
  const hash = hashPassword(password);
  password = ''; confirm = '';
  console.log('\nVercel Production variable: JARVIS_PASSWORD_HASH\nValue (copy only the next line):\n' + hash);
  console.log('\nSave as Secret, then redeploy. Keep JARVIS_CLOUD_KEY and namespace unchanged.');
} catch (error) {
  console.error(error instanceof Error && error.name === 'AbortError' ? 'Cancelled. Nothing changed.' : error.message);
  process.exitCode = 1;
}
