import { spawn } from 'node:child_process';
import { platform } from 'node:os';

const cmd = [
  ...(platform() === 'win32' ? ['cmd', '/c', 'npm']: ['npm']),
  'ci',
  '--no-audit',
  '--no-fund',
];

const proc = spawn(cmd[0], cmd.slice(1), {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env,
})
proc.on('close', (code) => {
  process.exit(code);
});
