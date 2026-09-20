import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'

// Local fictional preview only. Never read production database credentials.
const root = fileURLToPath(new URL('../', import.meta.url))
const env = {
  ...process.env,
  NODE_ENV: 'development',
  HOST: '127.0.0.1', PORT: '3333', LOG_LEVEL: 'info',
  APP_KEY: randomBytes(32).toString('base64'),
  DB_HOST: '127.0.0.1', DB_PORT: '55432', DB_DATABASE: 'luka_preview',
  DB_USER: 'luka_user', DB_PASSWORD: 'change_me',
  CORS_ORIGIN: 'http://localhost:3000', SESSION_DRIVER: 'cookie',
  ADMIN_EMAIL: '', ADMIN_PASSWORD: '', ADMIN_DISPLAY_NAME: '',
  NEXT_PUBLIC_API_URL: 'http://localhost:3333',
  NEXT_TELEMETRY_DISABLED: '1',
}

function run(command, args, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command}: code ${code}`)))
  })
}

const children = []
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) child.kill('SIGTERM')
  process.exitCode = code
}
process.on('SIGINT', () => stop())
process.on('SIGTERM', () => stop())

try {
  await run('docker', ['compose', '-p', 'luka-preview', 'up', '-d', '--wait'])
  await run(process.execPath, ['ace.js', 'migration:run'], `${root}apps/api`)
  await run(process.execPath, ['ace.js', 'db:seed'], `${root}apps/api`)
  for (const [args, cwd, runtimeEnv] of [
    [['--import=@poppinss/ts-exec', 'bin/server.ts'], `${root}apps/api`, env],
    [['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1'], `${root}apps/web`, { ...env, NODE_ENV: 'production', PORT: '3000' }],
  ]) {
    const child = spawn(process.execPath, args, { cwd, env: runtimeEnv, stdio: 'inherit' })
    children.push(child)
    child.once('error', (error) => { console.error(error.message); stop(1) })
    child.once('exit', (code) => { if (!stopping) stop(code || 1) })
  }
  console.log('Aperçu local : http://localhost:3000 — données fictives uniquement.')
  console.log('Ctrl+C arrête les applications. Base : docker compose -p luka-preview stop')
} catch (error) {
  console.error(error.message)
  stop(1)
}
