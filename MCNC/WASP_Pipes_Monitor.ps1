Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

# ============================================================================
# AUDIT CONDUITS
# ============================================================================
function Test-PortStatus {
    param ([int]$Port)
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(300, $false)
        if ($wait -and $client.Connected) {
            $client.EndConnect($iar)
            $client.Close()
            return $true
        }
        $client.Close()
        return $false
    } catch {
        return $false
    }
}

# Audit 5 Critical Conduits
$openClawOpen = Test-PortStatus -Port 8081
$backendOpen  = Test-PortStatus -Port 8082
$frontendOpen = Test-PortStatus -Port 5173
$paperclipOpen = Test-Path "C:\Warlord_Inc\Warlord_WASP\MCNC\vault\Docs\_raw_intake"
$hermesOpen   = Test-PortStatus -Port 11434

# ============================================================================
# WPF WINDOW ARCHITECTURE
# ============================================================================
$window = New-Object System.Windows.Window
$window.Title = "WASP HEARTBEAT"
$window.Width = 540
$window.Height = 620
$window.WindowStartupLocation = [System.Windows.WindowStartupLocation]::CenterScreen
$window.WindowStyle = [System.Windows.WindowStyle]::None
$window.AllowsTransparency = $true
$window.Background = [System.Windows.Media.Brushes]::Transparent
$window.Topmost = $true

# Drag to move
$window.Add_MouseLeftButtonDown({
    param($sender, $e)
    $window.DragMove()
})

# Close on ESC
$window.Add_KeyDown({
    param($sender, $e)
    if ($e.Key -eq [System.Windows.Input.Key]::Escape) {
        $window.Close()
    }
})

# Outer Border (Obsidian High-Finance Glass Frame)
$outerBorder = New-Object System.Windows.Controls.Border
$outerBorder.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#0B0E14")
$outerBorder.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#2B3545")
$outerBorder.BorderThickness = New-Object System.Windows.Thickness(1)
$outerBorder.CornerRadius = New-Object System.Windows.CornerRadius(12)
$outerBorder.Padding = New-Object System.Windows.Thickness(24)

# Grid Layout
$mainGrid = New-Object System.Windows.Controls.Grid
$r0 = New-Object System.Windows.Controls.RowDefinition; $r0.Height = [System.Windows.GridLength]::Auto
$r1 = New-Object System.Windows.Controls.RowDefinition; $r1.Height = New-Object System.Windows.GridLength(1, [System.Windows.GridUnitType]::Star)
$r2 = New-Object System.Windows.Controls.RowDefinition; $r2.Height = [System.Windows.GridLength]::Auto
[void]$mainGrid.RowDefinitions.Add($r0)
[void]$mainGrid.RowDefinitions.Add($r1)
[void]$mainGrid.RowDefinitions.Add($r2)

# --- HEADER ---
$headerStack = New-Object System.Windows.Controls.StackPanel
[System.Windows.Controls.Grid]::SetRow($headerStack, 0)

$titleText = New-Object System.Windows.Controls.TextBlock
$titleText.Text = "WARLORD WASP // HEARTBEAT"
$titleText.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
$titleText.FontSize = 14
$titleText.FontWeight = [System.Windows.FontWeights]::Bold
$titleText.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#DAA520")

$subText = New-Object System.Windows.Controls.TextBlock
$subText.Text = "BASE 1 INFRASTRUCTURE & CONDUIT PULSE"
$subText.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
$subText.FontSize = 10
$subText.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#6B7280")
$subText.Margin = New-Object System.Windows.Thickness(0, 3, 0, 14)

$divider = New-Object System.Windows.Controls.Separator
$divider.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#1F2937")
$divider.Margin = New-Object System.Windows.Thickness(0, 0, 0, 16)

[void]$headerStack.Children.Add($titleText)
[void]$headerStack.Children.Add($subText)
[void]$headerStack.Children.Add($divider)
[void]$mainGrid.Children.Add($headerStack)

# --- CONDUITS LIST ---
$pipesStack = New-Object System.Windows.Controls.StackPanel
[System.Windows.Controls.Grid]::SetRow($pipesStack, 1)

function Add-PipelineRow {
    param (
        [string]$Name,
        [string]$Port,
        [string]$Role,
        [bool]$IsOpen
    )

    $rowBorder = New-Object System.Windows.Controls.Border
    $rowBorder.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#0E131B")
    $rowBorder.BorderBrush = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#1E2634")
    $rowBorder.BorderThickness = New-Object System.Windows.Thickness(1)
    $rowBorder.CornerRadius = New-Object System.Windows.CornerRadius(8)
    $rowBorder.Padding = New-Object System.Windows.Thickness(12, 10, 12, 10)
    $rowBorder.Margin = New-Object System.Windows.Thickness(0, 0, 0, 10)

    $rowGrid = New-Object System.Windows.Controls.Grid
    $col0 = New-Object System.Windows.Controls.ColumnDefinition; $col0.Width = [System.Windows.GridLength]::Auto
    $col1 = New-Object System.Windows.Controls.ColumnDefinition; $col1.Width = New-Object System.Windows.GridLength(1, [System.Windows.GridUnitType]::Star)
    $col2 = New-Object System.Windows.Controls.ColumnDefinition; $col2.Width = [System.Windows.GridLength]::Auto
    [void]$rowGrid.ColumnDefinitions.Add($col0)
    [void]$rowGrid.ColumnDefinitions.Add($col1)
    [void]$rowGrid.ColumnDefinitions.Add($col2)

    # Dot indicator
    $dot = New-Object System.Windows.Shapes.Ellipse
    $dot.Width = 10
    $dot.Height = 10
    $dot.VerticalAlignment = [System.Windows.VerticalAlignment]::Center
    $dot.Margin = New-Object System.Windows.Thickness(0, 0, 12, 0)
    [System.Windows.Controls.Grid]::SetColumn($dot, 0)

    if ($IsOpen) {
        $dot.Fill = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#10B981")
    } else {
        $dot.Fill = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#EF4444")
    }

    # Labels
    $infoStack = New-Object System.Windows.Controls.StackPanel
    $infoStack.VerticalAlignment = [System.Windows.VerticalAlignment]::Center
    [System.Windows.Controls.Grid]::SetColumn($infoStack, 1)

    $line1 = New-Object System.Windows.Controls.StackPanel
    $line1.Orientation = [System.Windows.Controls.Orientation]::Horizontal

    $txtName = New-Object System.Windows.Controls.TextBlock
    $txtName.Text = $Name
    $txtName.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
    $txtName.FontSize = 11
    $txtName.FontWeight = [System.Windows.FontWeights]::Bold
    $txtName.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#E5E7EB")

    $txtPort = New-Object System.Windows.Controls.TextBlock
    $txtPort.Text = "  // $Port"
    $txtPort.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
    $txtPort.FontSize = 10
    $txtPort.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#F59E0B")

    [void]$line1.Children.Add($txtName)
    [void]$line1.Children.Add($txtPort)

    $txtRole = New-Object System.Windows.Controls.TextBlock
    $txtRole.Text = $Role
    $txtRole.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
    $txtRole.FontSize = 9.5
    $txtRole.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#6B7280")
    $txtRole.Margin = New-Object System.Windows.Thickness(0, 2, 0, 0)

    [void]$infoStack.Children.Add($line1)
    [void]$infoStack.Children.Add($txtRole)

    # Status Tag
    $txtStatus = New-Object System.Windows.Controls.TextBlock
    $txtStatus.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
    $txtStatus.FontSize = 11
    $txtStatus.FontWeight = [System.Windows.FontWeights]::Bold
    $txtStatus.VerticalAlignment = [System.Windows.VerticalAlignment]::Center
    [System.Windows.Controls.Grid]::SetColumn($txtStatus, 2)

    if ($IsOpen) {
        $txtStatus.Text = "[OPEN]"
        $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#10B981")
    } else {
        $txtStatus.Text = "[BLOCKED]"
        $txtStatus.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#EF4444")
    }

    [void]$rowGrid.Children.Add($dot)
    [void]$rowGrid.Children.Add($infoStack)
    [void]$rowGrid.Children.Add($txtStatus)

    $rowBorder.Child = $rowGrid
    [void]$pipesStack.Children.Add($rowBorder)
}

Add-PipelineRow -Name "OPENCLAW DAEMON BRIDGE" -Port "PORT 8081" -Role "WebSocket Inter-Agent Conduit" -IsOpen $openClawOpen
Add-PipelineRow -Name "BACKEND PIPELINE SERVER" -Port "PORT 8082" -Role "Express Pipeline & JSON Ledgers" -IsOpen $backendOpen
Add-PipelineRow -Name "VITE COCKPIT FRONTEND" -Port "PORT 5173" -Role "React HMR Live Presentation" -IsOpen $frontendOpen
Add-PipelineRow -Name "PAPERCLIP INGESTION PIPE" -Port "LOCAL BUFFER" -Role "Raw Intake & Decompile Staging" -IsOpen $paperclipOpen
Add-PipelineRow -Name "HERMES 3 / OLLAMA RUNTIME" -Port "PORT 11434" -Role "Local Neural Sovereign Engine" -IsOpen $hermesOpen

[void]$mainGrid.Children.Add($pipesStack)

# --- FOOTER BUTTON ---
$btnAcknowledge = New-Object System.Windows.Controls.Button
$btnAcknowledge.Content = "ACKNOWLEDGE"
$btnAcknowledge.Height = 36
$btnAcknowledge.FontFamily = New-Object System.Windows.Media.FontFamily("Consolas, Courier New")
$btnAcknowledge.FontWeight = [System.Windows.FontWeights]::Bold
$btnAcknowledge.FontSize = 11
$btnAcknowledge.LetterSpacing = 1.5
$btnAcknowledge.Background = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#DAA520")
$btnAcknowledge.Foreground = [System.Windows.Media.BrushConverter]::new().ConvertFromString("#000000")
$btnAcknowledge.BorderThickness = New-Object System.Windows.Thickness(0)
$btnAcknowledge.Cursor = [System.Windows.Input.Cursors]::Hand
$btnAcknowledge.Margin = New-Object System.Windows.Thickness(0, 10, 0, 0)
[System.Windows.Controls.Grid]::SetRow($btnAcknowledge, 2)

$btnAcknowledge.Add_Click({
    $window.Close()
})

[void]$mainGrid.Children.Add($btnAcknowledge)

$outerBorder.Child = $mainGrid
$window.Content = $outerBorder

# Render Dialog
[void]$window.ShowDialog()