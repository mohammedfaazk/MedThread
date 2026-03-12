#!/bin/bash

echo "🚀 Setting up Analytics Feature Set..."

# Navigate to database package
cd packages/database

echo "📊 Creating database migration..."
npx prisma migrate dev --name add_analytics_models

echo "🔄 Generating Prisma client..."
npx prisma generate

echo "✅ Analytics database setup complete!"

echo ""
echo "Next steps:"
echo "1. Start the API server: cd apps/api && npm run dev"
echo "2. Start the web app: cd apps/web && npm run dev"
echo "3. Access analytics dashboard: http://localhost:3000/analytics"
echo ""
echo "📚 See ANALYTICS_IMPLEMENTATION.md for full documentation"
