param(
  [int]$Port = 5500,
  [switch]$OpenBrowser
)

$ErrorActionPreference = 'Stop'

function Get-ContentType {
  param([string]$Extension)

  switch ($Extension.ToLowerInvariant()) {
    '.html' { return 'text/html; charset=utf-8' }
    '.htm' { return 'text/html; charset=utf-8' }
    '.js' { return 'application/javascript; charset=utf-8' }
    '.css' { return 'text/css; charset=utf-8' }
    '.json' { return 'application/json; charset=utf-8' }
    '.svg' { return 'image/svg+xml' }
    '.png' { return 'image/png' }
    '.jpg' { return 'image/jpeg' }
    '.jpeg' { return 'image/jpeg' }
    '.gif' { return 'image/gif' }
    '.ico' { return 'image/x-icon' }
    '.webp' { return 'image/webp' }
    default { return 'application/octet-stream' }
  }
}

function Write-HttpResponse {
  param(
    [Parameter(Mandatory = $true)]
    [System.Net.Sockets.NetworkStream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [byte[]]$Body = [byte[]]@(),
    [string]$ContentType = 'text/plain; charset=utf-8',
    [bool]$HeadOnly = $false
  )

  $writer = [System.IO.StreamWriter]::new($Stream, [Text.Encoding]::ASCII, 1024, $true)
  $writer.NewLine = "`r`n"
  $writer.WriteLine("HTTP/1.1 $StatusCode $StatusText")
  $writer.WriteLine("Content-Type: $ContentType")
  $writer.WriteLine("Content-Length: $($Body.Length)")
  $writer.WriteLine('Connection: close')
  $writer.WriteLine('')
  $writer.Flush()

  if (-not $HeadOnly -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

$root = if ($PSScriptRoot) { [IO.Path]::GetFullPath($PSScriptRoot) } else { [IO.Path]::GetFullPath((Get-Location).Path) }
$url = "http://localhost:$Port/"

try {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
  $listener.Start()
} catch {
  Write-Error "Failed to start localhost server. Port $Port may already be in use.`n$($_.Exception.Message)"
  exit 1
}

Write-Host "Serving $root at $url"
Write-Host "Press Ctrl + C in this terminal to stop."

if ($OpenBrowser) {
  Start-Process $url | Out-Null
}

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        continue
      }

      while ($true) {
        $headerLine = $reader.ReadLine()
        if ([string]::IsNullOrEmpty($headerLine)) {
          break
        }
      }

      $parts = $requestLine.Split(' ')
      $method = if ($parts.Length -gt 0) { $parts[0].ToUpperInvariant() } else { 'GET' }
      $rawTarget = if ($parts.Length -gt 1) { $parts[1] } else { '/' }

      if ($method -ne 'GET' -and $method -ne 'HEAD') {
        $body = [Text.Encoding]::UTF8.GetBytes('Method Not Allowed')
        Write-HttpResponse -Stream $stream -StatusCode 405 -StatusText 'Method Not Allowed' -Body $body
        continue
      }

      $pathOnly = $rawTarget.Split('?')[0]
      $decodedPath = [System.Uri]::UnescapeDataString($pathOnly.TrimStart('/'))
      if ([string]::IsNullOrWhiteSpace($decodedPath)) {
        $decodedPath = 'index.html'
      }

      $relativePath = $decodedPath -replace '/', '\'
      if ($relativePath.Contains('..')) {
        $body = [Text.Encoding]::UTF8.GetBytes('Forbidden')
        Write-HttpResponse -Stream $stream -StatusCode 403 -StatusText 'Forbidden' -Body $body
        continue
      }

      $fullPath = [IO.Path]::GetFullPath((Join-Path $root $relativePath))
      if (-not $fullPath.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
        $body = [Text.Encoding]::UTF8.GetBytes('Forbidden')
        Write-HttpResponse -Stream $stream -StatusCode 403 -StatusText 'Forbidden' -Body $body
        continue
      }

      if (Test-Path $fullPath -PathType Container) {
        $fullPath = Join-Path $fullPath 'index.html'
      }

      if (-not (Test-Path $fullPath -PathType Leaf)) {
        $body = [Text.Encoding]::UTF8.GetBytes('Not Found')
        Write-HttpResponse -Stream $stream -StatusCode 404 -StatusText 'Not Found' -Body $body
        continue
      }

      $fileBytes = [IO.File]::ReadAllBytes($fullPath)
      $fileContentType = Get-ContentType ([IO.Path]::GetExtension($fullPath))
      $headOnly = $method -eq 'HEAD'
      Write-HttpResponse -Stream $stream -StatusCode 200 -StatusText 'OK' -Body $fileBytes -ContentType $fileContentType -HeadOnly $headOnly
    } catch {
      try {
        $errorBody = [Text.Encoding]::UTF8.GetBytes('Server Error')
        Write-HttpResponse -Stream $stream -StatusCode 500 -StatusText 'Internal Server Error' -Body $errorBody
      } catch {
        # ignored
      }
    } finally {
      if ($stream) {
        $stream.Close()
      }
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
