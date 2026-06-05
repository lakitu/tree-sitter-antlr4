#!/usr/bin/env pwsh
# test_grammars.ps1
# Run tree-sitter parse on every .g4 file found recursively under
# grammars-v4/antlr/antlr4/examples (default) or all of grammars-v4 (-All).
# Run from the tree-sitter-antlr4 directory.

param(
    [switch]$Errors,    # show failing lines with source context
    [switch]$Verbose,   # show full parse tree for failures (implies -Errors)
    [switch]$All        # test everything in grammars-v4, not just examples
)
if ($Verbose) { $Errors = $true }

$ROOT     = $PSScriptRoot
$GV       = Join-Path $ROOT "grammars-v4"
$EXAMPLES = Join-Path $GV "antlr\antlr4\examples"

# ---------------------------------------------------------------------------
# Grammars that are expected to fail (parser intentionally can't handle them)
# ---------------------------------------------------------------------------
$XFAIL = @(
    "three.g4",           # uses syntax our parser doesn't support
    "LexerElementLabel.g4"  # labelled lexer element — known unsupported construct
)

# ---------------------------------------------------------------------------

$passed  = 0
$failed  = 0
$xfailed = 0   # expected failure — still failing (good)
$xpassed = 0   # expected failure — now passing (investigate)
$failList  = [System.Collections.Generic.List[string]]::new()
$xpassList = [System.Collections.Generic.List[string]]::new()

$w = 50   # column width for file name

Write-Host ""
Write-Host "  tree-sitter antlr4 grammar test" -ForegroundColor Cyan
Write-Host "  $('─' * 56)" -ForegroundColor DarkGray
Write-Host "  $(if ($All) { $GV } else { $EXAMPLES }) (recursive)" -ForegroundColor DarkGray
Write-Host ""

$files = if ($All) {
    Get-ChildItem -Recurse -Path $GV -Filter "*.g4" -File
} else {
    Get-ChildItem -Recurse -Path $EXAMPLES -Filter "*.g4" -File |
        Where-Object { $_.FullName -notlike "$EXAMPLES\grammars-v4\*" }
}

$scanRoot = if ($All) { $GV } else { $EXAMPLES }

foreach ($file in $files) {
    $path    = $file.FullName
    $rel     = $path.Substring($scanRoot.Length + 1)   # relative to scan root
    $isXFail = $XFAIL -contains $file.Name

    $output = & tree-sitter parse $path 2>&1
    $ok = ($LASTEXITCODE -eq 0)

    Write-Host ("  {0,-${w}}  " -f $rel) -NoNewline

    if ($ok -and $isXFail) {
        Write-Host "XPASS" -ForegroundColor Magenta   # unexpected pass
        $xpassed++
        $xpassList.Add($rel)
    } elseif ($ok) {
        Write-Host "PASS" -ForegroundColor Green
        $passed++
    } elseif ($isXFail) {
        Write-Host "XFAIL" -ForegroundColor DarkYellow  # expected failure
        $xfailed++
    } else {
        Write-Host "FAIL" -ForegroundColor Red
        $failed++
        $failList.Add($rel)

        if ($Errors) {
            $errorLines = $output | Where-Object { $_ -match 'ERROR|MISSING' }
            foreach ($line in $errorLines) {
                if ($line -match '\[(\d+),\s*(\d+)\]') {
                    $row = [int]$Matches[1] + 1
                    $col = [int]$Matches[2] + 1
                    $srcLines = Get-Content $path -ErrorAction SilentlyContinue
                    $srcLine  = if ($srcLines -and $row -le $srcLines.Count) { $srcLines[$row - 1].TrimEnd() } else { "" }
                    Write-Host ("      line {0,4}: {1}" -f $row, $srcLine) -ForegroundColor DarkYellow
                    Write-Host ("               {0}^" -f (' ' * ($col - 1))) -ForegroundColor DarkRed
                }
                Write-Host "      $line" -ForegroundColor DarkRed
            }

            if ($Verbose) {
                Write-Host ""
                Write-Host "    Full tree:" -ForegroundColor DarkGray
                $output | ForEach-Object { Write-Host "      $_" -ForegroundColor DarkGray }
            }
            Write-Host ""
        }
    }
}

Write-Host ""
Write-Host "  $('─' * 56)" -ForegroundColor DarkGray
Write-Host ("  {0} passed   {1} failed   {2} xfail   {3} xpass" -f $passed, $failed, $xfailed, $xpassed)
Write-Host ""

if ($xpassList.Count -gt 0) {
    Write-Host "  Unexpected passes (remove from XFAIL?):" -ForegroundColor Magenta
    $xpassList | ForEach-Object { Write-Host "    $_" }
    Write-Host ""
}

if ($failList.Count -gt 0) {
    Write-Host "  Failed grammars:" -ForegroundColor Red
    $failList | ForEach-Object { Write-Host "    $_" }
    Write-Host ""
}

if ($failList.Count -gt 0 -and -not $Errors) {
    Write-Host "  Tip: -Errors to show failing lines   -Verbose for full parse trees" -ForegroundColor DarkGray
    Write-Host ""
}
