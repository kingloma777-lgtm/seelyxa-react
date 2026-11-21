<#
.SYNOPSIS
    Kill stale dev-server processes for THIS theme and verify the dev ports are free.

.DESCRIPTION
    `salla theme preview --with-editor` / `vite dev` leave three kinds of orphan
    behind on Windows when a run dies badly:

      * workerd.exe  - the Cloudflare runtime child. It survives its parent, keeps
                       the SSR inspector socket, and the next run dies with
                       "There was an access violation in the runtime".
      * node.exe running `vite.js dev` - keeps 5173/5177 bound, so the next run
                       reports "Port 5177 is already in use".
      * node.exe running `scripts/dev-local.cjs` or
        `@salla.sa/cli ... theme dev|preview` - the wrappers that *respawn* the
                       vite process, which is why killing vite alone is not enough.

    Nothing is matched by name alone. A process is ours when its command line
    contains this repository's path, or when it is an ancestor wrapper of such a
    process (same parent chain). An unrelated node/vite process on the machine is
    never touched.

.PARAMETER Ports
    Ports that must be free afterwards. Defaults to 5173, 5177, 9229 (Vite,
    the Salla editor preview, and the Node inspector).

.PARAMETER KeepVite
    Only kill workerd.exe orphans. Use when you want to keep a running dev
    server and just clear a wedged runtime.

.PARAMETER KeepCli
    Leave `@salla.sa/cli theme dev|preview` parents alone (they only get killed
    when they are an ancestor of a repo dev server anyway).

.PARAMETER DryRun
    Print what would be killed and still probe the ports, without killing
    anything. (`-WhatIf` is avoided on purpose: it leaks into the auto-loaded
    modules and buries the output in "Performing the operation ..." noise.)

.EXAMPLE
    pnpm clean:dev

.EXAMPLE
    powershell -NoProfile -ExecutionPolicy Bypass -File scripts/clean-dev.ps1 -DryRun
#>
param(
    [int[]] $Ports = @(5173, 5177, 9229),
    [switch] $KeepVite,
    [switch] $KeepCli,
    [switch] $DryRun
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
# Win32_Process returns the command line verbatim, so both separators can appear.
$repoNeedle = $repoRoot -replace '/', '\'
$pathNeedle = $repoRoot -replace '\\', '/'

function Test-IsRepoPath {
    param([string] $CommandLine)
    if (-not $CommandLine) { return $false }
    return (
        $CommandLine.IndexOf($repoNeedle, [StringComparison]::OrdinalIgnoreCase) -ge 0 -or
        $CommandLine.IndexOf($pathNeedle, [StringComparison]::OrdinalIgnoreCase) -ge 0
    )
}

function Test-IsWrapper {
    param([string] $CommandLine)
    if (-not $CommandLine) { return $false }
    return (
        $CommandLine -match 'dev-local\.cjs' -or
        (-not $KeepCli -and $CommandLine -match '@salla\.sa[\\/]cli.*theme\s+(dev|preview)')
    )
}

$all = @(Get-CimInstance Win32_Process -Filter "Name='node.exe' OR Name='workerd.exe'")
$byId = @{}
foreach ($p in $all) { $byId[[int] $p.ProcessId] = $p }

# --- 1. seed: processes that are unambiguously this repo's dev server ----------
$seeds = @($all | Where-Object {
    if (-not (Test-IsRepoPath $_.CommandLine)) { return $false }
    if ($_.Name -eq 'workerd.exe') { return $true }
    return ($_.CommandLine -match 'vite\.js')
})

# --- 2. wrappers: ancestors that would respawn the seed -----------------------
# OrderedDictionary's indexer treats an int key as a *position*, so a plain
# hashtable plus an explicit ordering list is the reliable shape here.
$kill = @{}
$killVite = @{}
$killWorkerd = @{}
$seen = @{}

foreach ($seed in $seeds) {
    $id = [int] $seed.ProcessId
    if ($seen.ContainsKey($id)) { continue }
    $seen[$id] = $true

    if ($seed.Name -eq 'workerd.exe') { $killWorkerd[$id] = $seed }
    elseif (-not $KeepVite) { $killVite[$id] = $seed }

    $cursor = $seed
    while ($cursor -and $cursor.ParentProcessId) {
        $parent = $byId[[int] $cursor.ParentProcessId]
        if (-not $parent) { break }
        if ($parent.Name -eq 'node.exe' -and (Test-IsWrapper $parent.CommandLine)) {
            $parentId = [int] $parent.ProcessId
            if (-not $seen.ContainsKey($parentId)) {
                $seen[$parentId] = $true
                $kill[$parentId] = $parent
            }
            $cursor = $parent
        }
        else { break }
    }
}

# Wrappers first (stop the respawn loop), then vite, then the native runtime.
$targets = @($kill.Values) + @($killVite.Values) + @($killWorkerd.Values)

if ($targets.Count -eq 0) {
    Write-Host 'clean-dev: no stale dev processes for this repo.' -ForegroundColor DarkGray
}
else {
    Write-Host "clean-dev: $($targets.Count) stale process(es) for $repoRoot" -ForegroundColor Yellow
    foreach ($p in $targets) {
        $label = '{0} [{1}] {2}' -f $p.Name, $p.ProcessId,
            ($p.CommandLine.Substring(0, [Math]::Min(70, $p.CommandLine.Length)))
        if ($DryRun) {
            Write-Host "  would kill $label" -ForegroundColor DarkGray
            continue
        }
        try {
            Stop-Process -Id $p.ProcessId -Force -ErrorAction Stop
            Write-Host "  killed $label" -ForegroundColor DarkYellow
        }
        catch {
            # Dying with its parent between the snapshot and the kill is the
            # normal case for workerd - that is a success, not a failure.
            if ($_.Exception.Message -match 'Cannot find a process') {
                Write-Host "  gone   $label" -ForegroundColor DarkGray
            }
            else {
                Write-Host "  could not kill $label : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    # workerd releases its listening sockets a moment after the process object
    # disappears; give the OS a beat before probing ports.
    if (-not $DryRun) { Start-Sleep -Milliseconds 400 }
}

function Get-PortOwner {
    param([int] $Port)
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop |
            Select-Object -First 1
        if ($conn) { return [int] $conn.OwningProcess }
    }
    catch { }
    # Fallback for hosts without the NetTCPIP module.
    $line = (netstat -ano -p TCP) | Select-String -Pattern ":$Port\s+\S+\s+LISTENING" |
        Select-Object -First 1
    if ($line -and $line.Line -match '(\d+)\s*$') { return [int] $Matches[1] }
    return 0
}

$blocked = @()
foreach ($port in $Ports) {
    $owner = Get-PortOwner -Port $port
    if ($owner -eq 0) {
        Write-Host ("  port {0,-5} free" -f $port) -ForegroundColor DarkGray
        continue
    }
    $name = try { (Get-Process -Id $owner -ErrorAction Stop).ProcessName } catch { 'unknown' }
    if ($DryRun -and $targets | Where-Object { $_.ProcessId -eq $owner }) {
        Write-Host ("  port {0,-5} held by {1} [{2}] - a target above" -f $port, $name, $owner) -ForegroundColor DarkGray
        continue
    }
    Write-Host ("  port {0,-5} STILL HELD by {1} [{2}]" -f $port, $name, $owner) -ForegroundColor Red
    $blocked += $port
}

if ($blocked.Count -gt 0) {
    Write-Host ''
    Write-Host ("clean-dev: ports still blocked: {0}" -f ($blocked -join ', ')) -ForegroundColor Red
    Write-Host 'Those owners are not dev processes from this repo, so they were left alone.' -ForegroundColor DarkGray
    Write-Host 'Stop them yourself, or start the dev server on another port.' -ForegroundColor DarkGray
    exit 1
}

if ($DryRun) {
    Write-Host 'clean-dev: dry run only - nothing was killed.' -ForegroundColor Yellow
    exit 0
}

Write-Host 'clean-dev: ready.' -ForegroundColor Green
exit 0
