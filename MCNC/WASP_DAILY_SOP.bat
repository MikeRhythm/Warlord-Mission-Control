@echo off
TITLE WARLORD WASP // DAILY MORNING OPERATOR SOP
COLOR 0E

:MENU
cls
echo ============================================================================
echo   WARLORD WASP // DAILY MORNING OPERATOR CHECKLIST (5-10 MINS)
echo   BRAND: @EchoPodMedia   ^|   STEALTH CAP: 6 POSTS/DAY (MAX 3/CAMPAIGN)
echo ============================================================================
echo.
echo   [AUTOMATED ON BASE 1 - NO ACTION UNLESS FLAGGED]
echo    * Cron discovers live Vyro/Whop campaigns & purges dry/expired pools
echo    * Auto_Bounty_Engine downloads 1080p source & renders 9:16 Shorts
echo.
echo   --------------------------------------------------------------------------
echo   [YOUR DAILY HUMAN OPERATOR SEQUENCE]
echo   --------------------------------------------------------------------------
echo    STEP 1 : Check Tab 11 (http://localhost:5173) -> 03 // DISK ARTIFACTS
echo    STEP 2 : Verify Chrome_Session is signed into YouTube & Vyro/Whop
echo    STEP 3 : Copy Title + SEO Desc from Tab 11 -> Upload MP4s to:
echo             - YouTube Shorts (@EchoPodMedia)
echo             - TikTok / Instagram Reels (@EchoPodMedia)
echo    STEP 4 : Paste live published post URLs back into Vyro / Whop
echo             (Required so view floor & CPM payouts track!)
echo   --------------------------------------------------------------------------
echo.
echo   [1] OPEN CLIPS OUTBOX FOLDER (All Staged MP4s)
echo   [2] OPEN MCNC DASHBOARD (http://localhost:5173)
echo   [3] LAUNCH CHROME_SESSION PROFILE (Check YouTube / Vyro Login)
echo   [4] EXIT
echo.
set /p choice="Select an action [1-4]: "

if "%choice%"=="1" (
    start "" explorer "C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Projects\Bounty_Engine\campaigns"
    goto MENU
)
if "%choice%"=="2" (
    start "" "chrome.exe" "http://localhost:5173"
    goto MENU
)
if "%choice%"=="3" (
    start "" "chrome.exe" --user-data-dir="C:\Warlord_Inc\Warlord_WASP\MCNC\Data\Chrome_Session" "https://www.youtube.com" "https://vyro.com"
    goto MENU
)
if "%choice%"=="4" (
    exit /b 0
)
goto MENU
