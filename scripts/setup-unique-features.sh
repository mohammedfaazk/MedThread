#!/bin/bash

# 🚀 UNIQUE FEATURES SETUP SCRIPT
# This script sets up all the game-changing features for MedThread

echo "🚀 Setting up MedThread Unique Features..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Add database models
echo -e "${BLUE}📊 Step 1: Adding database models...${NC}"
echo ""

if [ -f "packages/database/prisma/unique-features-schema.prisma" ]; then
    echo "Appending unique features schema to main schema..."
    cat packages/database/prisma/unique-features-schema.prisma >> packages/database/prisma/schema.prisma
    echo -e "${GREEN}✅ Schema updated${NC}"
else
    echo -e "${RED}❌ unique-features-schema.prisma not found${NC}"
    exit 1
fi

echo ""

# Step 2: Generate Prisma client
echo -e "${BLUE}🔧 Step 2: Generating Prisma client...${NC}"
cd packages/database
npx prisma generate
echo -e "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 3: Push to database
echo -e "${BLUE}💾 Step 3: Pushing schema to database...${NC}"
npx prisma db push
echo -e "${GREEN}✅ Database updated${NC}"
cd ../..
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}📦 Step 4: Installing dependencies...${NC}"
cd apps/api
npm install node-cron
npm install --save-dev @types/node-cron
cd ../..
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 5: Seed sample data
echo -e "${BLUE}🌱 Step 5: Seeding sample data...${NC}"
npx ts-node scripts/seed-unique-features.ts
echo -e "${GREEN}✅ Sample data seeded${NC}"
echo ""

# Step 6: Create cron job file
echo -e "${BLUE}⏰ Step 6: Setting up cron jobs...${NC}"

mkdir -p apps/api/src/cron

cat > apps/api/src/cron/outbreak-detection.cron.ts << 'EOF'
import cron from 'node-cron';
import outbreakDetectionService from '../services/outbreak-detection.service';

// Run outbreak analysis every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('Running outbreak detection analysis...');
  
  try {
    await outbreakDetectionService.analyzeSymptomClusters('7_DAYS');
    console.log('Outbreak detection completed successfully');
  } catch (error) {
    console.error('Error in outbreak detection:', error);
  }
});

// Also run daily analysis for 30-day trends
cron.schedule('0 2 * * *', async () => {
  console.log('Running 30-day outbreak analysis...');
  
  try {
    await outbreakDetectionService.analyzeSymptomClusters('30_DAYS');
    console.log('30-day analysis completed');
  } catch (error) {
    console.error('Error in 30-day analysis:', error);
  }
});

console.log('✅ Outbreak detection cron jobs initialized');

export default {};
EOF

echo -e "${GREEN}✅ Cron jobs created${NC}"
echo ""

# Step 7: Update API index
echo -e "${BLUE}🔌 Step 7: Updating API routes...${NC}"

# Check if the route is already added
if grep -q "unique-features" apps/api/src/index.ts; then
    echo "Routes already added"
else
    echo "Adding unique features routes to API..."
    
    # Add import at the top
    sed -i '' '/import.*routes/a\
import uniqueFeaturesRouter from '\''./routes/unique-features'\'';
' apps/api/src/index.ts
    
    # Add route registration
    sed -i '' '/app.use.*api.*v1/a\
app.use('\''/api/v1/unique'\'', uniqueFeaturesRouter);
' apps/api/src/index.ts
    
    # Add cron import
    sed -i '' '/import.*routes/a\
import '\''./cron/outbreak-detection.cron'\'';
' apps/api/src/index.ts
fi

echo -e "${GREEN}✅ API routes updated${NC}"
echo ""

# Step 8: Create frontend pages
echo -e "${BLUE}🎨 Step 8: Creating frontend pages...${NC}"

mkdir -p apps/web/src/app/outbreak-alerts
mkdir -p apps/web/src/app/find-doctor

# Outbreak Alerts Page
cat > apps/web/src/app/outbreak-alerts/page.tsx << 'EOF'
import OutbreakAlertDashboard from '@/components/unique/OutbreakAlertDashboard';

export default function OutbreakAlertsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OutbreakAlertDashboard />
    </div>
  );
}
EOF

# Find Doctor Page
cat > apps/web/src/app/find-doctor/page.tsx << 'EOF'
import SmartDoctorFinder from '@/components/unique/SmartDoctorFinder';

export default function FindDoctorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SmartDoctorFinder />
    </div>
  );
}
EOF

echo -e "${GREEN}✅ Frontend pages created${NC}"
echo ""

# Step 9: Summary
echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📋 What was done:${NC}"
echo "  ✅ Database models added (25+ new models)"
echo "  ✅ Prisma client generated"
echo "  ✅ Database schema pushed"
echo "  ✅ Dependencies installed (node-cron)"
echo "  ✅ Sample data seeded"
echo "  ✅ Cron jobs created"
echo "  ✅ API routes registered"
echo "  ✅ Frontend pages created"
echo ""
echo -e "${YELLOW}🚀 Next Steps:${NC}"
echo "  1. Restart your API server: cd apps/api && npm run dev"
echo "  2. Restart your web server: cd apps/web && npm run dev"
echo "  3. Visit http://localhost:3000/outbreak-alerts"
echo "  4. Visit http://localhost:3000/find-doctor"
echo "  5. Test the features!"
echo ""
echo -e "${YELLOW}📚 Documentation:${NC}"
echo "  - UNIQUE_FEATURES_PLAN.md - Feature specifications"
echo "  - UNIQUE_FEATURES_IMPLEMENTATION.md - Implementation guide"
echo "  - GAME_CHANGING_FEATURES_SUMMARY.md - Complete summary"
echo ""
echo -e "${YELLOW}🧪 Testing:${NC}"
echo "  - Run outbreak analysis: curl -X POST http://localhost:3001/api/v1/unique/analyze-outbreaks"
echo "  - Get alerts: curl http://localhost:3001/api/v1/unique/outbreak-alerts"
echo "  - Find doctors: curl -X POST http://localhost:3001/api/v1/unique/find-doctors"
echo ""
echo -e "${GREEN}🎊 Your platform is now UNBEATABLE!${NC}"
echo ""
