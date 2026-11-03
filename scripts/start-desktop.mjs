import { fork, spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { appUrl, assertFreePort, requireNode } from './local-runtime.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
let runtime;
let desktop;
let interrupted = false;

function interrupt() {
  interrupted = true;
  desktop?.kill();
}
process.on('SIGINT', interrupt);
process.on('SIGTERM', interrupt);

try {
  requireNode();
  await assertFreePort(5173);
  runtime = fork(fileURLToPath(new URL('./serve-built.mjs', import.meta.url)), ['--no-browser'], {
    cwd: root,
    stdio: ['ignore', 'pipe', 'inherit', 'ipc'],
  });
  const stopped = once(runtime, 'exit');
  let output = '';
  const ready = new Promise(resolve => {
    runtime.stdout.on('data', chunk => {
      process.stdout.write(chunk);
      output = (output + chunk).slice(-4096);
      if (output.includes(`JARVIS_BUILT_READY ${appUrl}`)) resolve(true);
    });
  });
  if (!await Promise.race([ready, stopped.then(() => false)])) {
    throw new Error('The local service could not start. Run step 01 to check setup.');
  }
  if (!interrupted) {
    desktop = spawn(fileURLToPath(new URL('../JARVIS-OS-Desktop.exe', import.meta.url)), [], { cwd: root });
    const [code] = await Promise.race([
      once(desktop, 'exit'),
      stopped.then(() => {
        desktop.kill();
        throw new Error('The local service stopped while the desktop was open.');
      }),
    ]);
    if (code !== 0 && !interrupted) throw new Error(`Desktop window exited with code ${code}.`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  if (runtime?.connected) {
    const stopped = once(runtime, 'exit');
    runtime.send('stop');
    await stopped;
  }
}
