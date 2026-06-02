# Copies Firebase service account + client env from priti project root into this app.
$proj = Resolve-Path (Join-Path $PSScriptRoot '..')
$parent = Resolve-Path (Join-Path $PSScriptRoot '..\..\..')

$srcSa = Join-Path $parent 'server\firebase\firebase-service-account.local.json'
$dstDir = Join-Path $proj 'backend\firebase'
New-Item -ItemType Directory -Force -Path $dstDir | Out-Null
Copy-Item -LiteralPath $srcSa -Destination (Join-Path $dstDir 'firebase-service-account.local.json') -Force

$parentEnv = @{}
Get-Content (Join-Path $parent '.env') | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $k, $v = $_ -split '=', 2
  $parentEnv[$k.Trim()] = $v.Trim()
}

@"
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://gymuser:gympass@localhost:5433/gymreviews
GOOGLE_APPLICATION_CREDENTIALS=./firebase/firebase-service-account.local.json
COOKIE_SECURE=false
SESSION_COOKIE_NAME=__session
"@ | Set-Content (Join-Path $proj 'backend\.env') -Encoding utf8

@"
VITE_API_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=$($parentEnv['VITE_FIREBASE_API_KEY'])
VITE_FIREBASE_AUTH_DOMAIN=$($parentEnv['VITE_FIREBASE_AUTH_DOMAIN'])
VITE_FIREBASE_PROJECT_ID=$($parentEnv['VITE_FIREBASE_PROJECT_ID'])
VITE_FIREBASE_STORAGE_BUCKET=$($parentEnv['VITE_FIREBASE_STORAGE_BUCKET'])
VITE_FIREBASE_MESSAGING_SENDER_ID=$($parentEnv['VITE_FIREBASE_MESSAGING_SENDER_ID'])
VITE_FIREBASE_APP_ID=$($parentEnv['VITE_FIREBASE_APP_ID'])
"@ | Set-Content (Join-Path $proj 'frontend\.env') -Encoding utf8

Write-Host 'Credentials synced. Start Postgres, then: npm run db:migrate && npm run dev (backend) and npm run dev (frontend).'
