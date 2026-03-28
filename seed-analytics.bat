@echo off
echo.
echo ========================================
echo   ANALYTICS DUMMY DATA SEEDER
echo ========================================
echo.
echo This will populate ALL analytics graphs with realistic dummy data.
echo.
echo What will be created:
echo   - Doctor profile analytics (treatment outcomes, posts, comments, conversions)
echo   - Community analytics (support groups, Q&A, challenges, stories)
echo   - Admin analytics (all dashboard graphs)
echo.
echo Estimated time: 2-5 minutes
echo.
pause

echo.
echo Starting seed process...
echo.

npx tsx apps/api/seed-all-analytics-simple.ts

echo.
echo ========================================
echo   SEEDING COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Start your dev servers (npm run dev)
echo   2. Visit doctor profiles to see analytics
echo   3. Login as admin and check /admin/analytics
echo   4. Verify all graphs show data
echo.
pause
