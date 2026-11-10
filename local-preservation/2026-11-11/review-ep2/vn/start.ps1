$ErrorActionPreference = 'Stop'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
  $vnBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path -LiteralPath $vnBundledNode) { $node = $vnBundledNode }
  else { Write-Host 'play-offline.html을 브라우저로 열면 별도 설치 없이 실행할 수 있습니다.'; exit 0 }
}
Set-Location -LiteralPath $PSScriptRoot
& $node .\localserver.mjs
