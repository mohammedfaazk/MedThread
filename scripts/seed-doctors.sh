#!/bin/bash

echo "🌱 Starting Doctor Profiles Seeding..."
echo "This script will add realistic doctor profiles to the database (non-destructive)"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if the seed file exists
if [ ! -f "packages/database/prisma/seed-doctors.ts" ]; then
    echo "❌ Error: Seed file not found at packages/database/prisma/seed-doctors.ts"
    exit 1
fi

# Install dependencies if needed
echo "📦 Checking dependencies..."
cd packages/database
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npx tsc seed-doctors.ts --target es2020 --module commonjs --moduleResolution node --esModuleInterop --allowSyntheticDefaultImports

# Run the seeding script
echo "🚀 Running doctor seeding..."
node seed-doctors.js

# Clean up compiled file
rm -f seed-doctors.js

echo ""
echo "✅ Doctor seeding completed!"
echo ""
echo "📍 What was created:"
echo "   • 5 realistic doctor profiles with verified status"
echo "   • Specialty communities (cardiology, pediatrics, dermatology, neurology, orthopedics)"
echo "   • Sample posts and comments in each specialty"
echo "   • Patient interactions and conversations"
echo "   • Appointment records with various statuses"
echo "   • Patient feedback with cure/outcome tracking"
echo "   • Comment-to-message conversion events"
echo "   • Doctor performance analytics data"
echo "   • Community activity metrics"
echo ""
echo "🔍 All seeded records are marked with [Seeded] prefix for easy identification"
echo "🎯 You can now test the enhanced analytics features with realistic data!"
echo ""
echo "📊 Access the analytics at:"
echo "   • Admin Dashboard: http://localhost:3000/admin/analytics"
echo "   • Doctor Profiles: http://localhost:3000/u/[doctor_username]"
echo "   • Community Pages: http://localhost:3000/m/[specialty]"