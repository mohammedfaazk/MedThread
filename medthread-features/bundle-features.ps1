# PowerShell script to bundle VitaVoice features for Medthread

Write-Host "🚀 Bundling VitaVoice features for Medthread..." -ForegroundColor Cyan

# Create directory structure
$features = @(
    "1-kendall-ai-assistant",
    "2-emergency-services",
    "3-calorie-diet-planner"
)

$subdirs = @("components", "services", "config", "hooks", "context", "types", "utils")

foreach ($feature in $features) {
    foreach ($subdir in $subdirs) {
        $path = "medthread-features/$feature/$subdir"
        if (!(Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
        }
    }
}

Write-Host "✅ Directory structure created" -ForegroundColor Green

# Feature 1: Kendall AI Assistant
Write-Host "`n📦 Bundling Kendall AI Assistant..." -ForegroundColor Yellow

Copy-Item "src/app/screens/Chat.tsx" "medthread-features/1-kendall-ai-assistant/components/Chat.tsx" -Force
Copy-Item "src/app/components/OfflineBanner.tsx" "medthread-features/1-kendall-ai-assistant/components/OfflineBanner.tsx" -Force

Copy-Item "src/services/aiService.ts" "medthread-features/1-kendall-ai-assistant/services/aiService.ts" -Force
Copy-Item "src/services/speechService.ts" "medthread-features/1-kendall-ai-assistant/services/speechService.ts" -Force
Copy-Item "src/services/languageService.ts" "medthread-features/1-kendall-ai-assistant/services/languageService.ts" -Force
Copy-Item "src/services/emergencyDetector.ts" "medthread-features/1-kendall-ai-assistant/services/emergencyDetector.ts" -Force
Copy-Item "src/services/symptomEngine.ts" "medthread-features/1-kendall-ai-assistant/services/symptomEngine.ts" -Force

Copy-Item "src/config/constants.ts" "medthread-features/1-kendall-ai-assistant/config/constants.ts" -Force

Copy-Item "src/hooks/useTranslation.ts" "medthread-features/1-kendall-ai-assistant/hooks/useTranslation.ts" -Force

Copy-Item "src/app/context/AppContext.tsx" "medthread-features/1-kendall-ai-assistant/context/AppContext.tsx" -Force

Copy-Item "src/types/health.ts" "medthread-features/1-kendall-ai-assistant/types/health.ts" -Force

Copy-Item "src/utils/debugApi.ts" "medthread-features/1-kendall-ai-assistant/utils/debugApi.ts" -Force

Write-Host "✅ Kendall AI Assistant bundled" -ForegroundColor Green

# Feature 2: Emergency Services
Write-Host "`n📦 Bundling Emergency Services..." -ForegroundColor Yellow

Copy-Item "src/app/screens/Emergency.tsx" "medthread-features/2-emergency-services/components/Emergency.tsx" -Force
Copy-Item "src/app/components/map/Map.tsx" "medthread-features/2-emergency-services/components/Map.tsx" -Force
Copy-Item "src/app/components/map/HospitalList.tsx" "medthread-features/2-emergency-services/components/HospitalList.tsx" -Force
Copy-Item "src/app/components/map/HospitalCard.tsx" "medthread-features/2-emergency-services/components/HospitalCard.tsx" -Force

Copy-Item "src/app/services/hospitalService.ts" "medthread-features/2-emergency-services/services/hospitalService.ts" -Force
Copy-Item "src/services/emergencyDetector.ts" "medthread-features/2-emergency-services/services/emergencyDetector.ts" -Force

Copy-Item "src/config/constants.ts" "medthread-features/2-emergency-services/config/constants.ts" -Force

Copy-Item "src/hooks/useTranslation.ts" "medthread-features/2-emergency-services/hooks/useTranslation.ts" -Force

Copy-Item "src/types/health.ts" "medthread-features/2-emergency-services/types/health.ts" -Force

Write-Host "✅ Emergency Services bundled" -ForegroundColor Green

# Feature 3: Calorie Diet Planner
Write-Host "`n📦 Bundling Calorie Diet Planner..." -ForegroundColor Yellow

Copy-Item "src/app/screens/DietNutrition.tsx" "medthread-features/3-calorie-diet-planner/components/DietNutrition.tsx" -Force

Copy-Item "src/services/dietPlanService.ts" "medthread-features/3-calorie-diet-planner/services/dietPlanService.ts" -Force
Copy-Item "src/services/authService.ts" "medthread-features/3-calorie-diet-planner/services/authService.ts" -Force

Copy-Item "src/hooks/useTranslation.ts" "medthread-features/3-calorie-diet-planner/hooks/useTranslation.ts" -Force

Write-Host "✅ Calorie Diet Planner bundled" -ForegroundColor Green

Write-Host "`n🎉 All features bundled successfully!" -ForegroundColor Cyan
Write-Host "📁 Output directory: medthread-features/" -ForegroundColor White
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review the README.md in each feature folder" -ForegroundColor White
Write-Host "2. Install required dependencies" -ForegroundColor White
Write-Host "3. Update import paths in your Medthread project" -ForegroundColor White
Write-Host "4. Configure environment variables if needed" -ForegroundColor White
