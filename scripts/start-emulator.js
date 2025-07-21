import { exec } from 'child_process';
import { log } from '../utils/logger.js';

log('🚀 Starting Firebase Emulator Suite...', 'info');

const emulator = exec('firebase emulators:start --import=./emulator-data --export-on-exit', 
  { stdio: 'inherit' });

emulator.stdout.on('data', (data) => {
  console.log(data.toString());
});

emulator.stderr.on('data', (data) => {
  console.error(data.toString());
});

emulator.on('close', (code) => {
  log(`Firebase Emulator exited with code ${code}`, code === 0 ? 'success' : 'error');
});
