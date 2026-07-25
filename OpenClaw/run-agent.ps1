param(
    [string]$Task,
    [string]$AgentId = "main",
    [int]$MaxRetries = 3,
    [int]$TimeoutSec = 300
)

function Test-Gateway {
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    try {
        $ws.ConnectAsync("ws://127.0.0.1:18789", [System.Threading.CancellationToken]::None).Wait(3000)
        $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "", [System.Threading.CancellationToken]::None).Wait(1000)
        return $true
    } catch { return $false }
}

if (-not (Test-Gateway)) {
    Write-Error "Gateway unreachable - restarting..."
    openclaw gateway restart
    Start-Sleep 5
    if (-not (Test-Gateway)) { throw "Gateway failed to recover" }
}

for ($i=1; $i -le $MaxRetries; $i++) {
    try {
        $result = & "C:\Users\MikeT\AppData\Roaming\npm\node_modules\openclaw\openclaw.mjs" agent -m "$Task" --agent "$AgentId" --timeout $TimeoutSec 2>&1
        if ($LASTEXITCODE -eq 0) { return $result }
        Write-Warning "Attempt $i failed (exit $LASTEXITCODE): $result"
    } catch {
        Write-Warning "Attempt $i exception: $_"
    }
    Start-Sleep (5 * $i)
}
throw "All $MaxRetries attempts exhausted"