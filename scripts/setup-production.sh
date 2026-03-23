#!/bin/bash

# MedThread Production Setup Script
# This script helps set up the production environment

set -e  # Exit on error

echo "🚀 MedThread Production Setup"
echo "=============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    print_error "Please do not run this script as root"
    exit 1
fi

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed"
    exit 1
fi

# Check PostgreSQL
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    print_success "PostgreSQL installed: $PSQL_VERSION"
else
    print_warning "PostgreSQL not found locally. Make sure you have a database URL."
fi

echo ""

# Step 2: Environment setup
echo "Step 2: Setting up environment files..."
echo ""

# Check if .env files exist
if [ ! -f "apps/api/.env" ]; then
    print_info "Creating apps/api/.env from template..."
    cp .env.production.example apps/api/.env
    print_warning "Please edit apps/api/.env with your actual credentials"
else
    print_success "apps/api/.env already exists"
fi

if [ ! -f "apps/web/.env.local" ]; then
    print_info "Creating apps/web/.env.local..."
    cat > apps/web/.env.local << 'EOF'
# API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Add your Firebase, Stripe, and Google Maps credentials here
EOF
    print_warning "Please edit apps/web/.env.local with your actual credentials"
else
    print_success "apps/web/.env.local already exists"
fi

echo ""

# Step 3: Install dependencies
echo "Step 3: Installing dependencies..."
echo ""

print_info "This may take a few minutes..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""

# Step 4: Database setup
echo "Step 4: Setting up database..."
echo ""

read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd packages/database
    
    print_info "Generating Prisma client..."
    if npx prisma generate; then
        print_success "Prisma client generated"
    else
        print_error "Failed to generate Prisma client"
        cd ../..
        exit 1
    fi
    
    print_info "Pushing schema to database..."
    if npx prisma db push; then
        print_success "Database schema pushed"
    else
        print_error "Failed to push database schema"
        print_warning "Make sure your DATABASE_URL is correct in apps/api/.env"
        cd ../..
        exit 1
    fi
    
    print_info "Seeding database..."
    if npx prisma db seed; then
        print_success "Database seeded"
    else
        print_warning "Database seeding failed (this is optional)"
    fi
    
    cd ../..
else
    print_warning "Skipping database setup. Remember to run it manually later."
fi

echo ""

# Step 5: Build application
echo "Step 5: Building application..."
echo ""

read -p "Do you want to build the application now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Building API..."
    cd apps/api
    if npm run build; then
        print_success "API built successfully"
    else
        print_error "Failed to build API"
        cd ../..
        exit 1
    fi
    cd ../..
    
    print_info "Building Web app..."
    cd apps/web
    if npm run build; then
        print_success "Web app built successfully"
    else
        print_error "Failed to build Web app"
        cd ../..
        exit 1
    fi
    cd ../..
else
    print_warning "Skipping build. Remember to build before deploying."
fi

echo ""

# Step 6: Generate secrets
echo "Step 6: Security setup..."
echo ""

read -p "Do you want to generate a new JWT secret? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    print_success "Generated JWT secret: $JWT_SECRET"
    print_warning "Add this to your apps/api/.env file as JWT_SECRET"
fi

echo ""

# Step 7: PM2 setup (optional)
echo "Step 7: Process manager setup..."
echo ""

if command -v pm2 &> /dev/null; then
    print_success "PM2 is already installed"
else
    read -p "Do you want to install PM2 for process management? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if sudo npm install -g pm2; then
            print_success "PM2 installed successfully"
        else
            print_error "Failed to install PM2"
        fi
    fi
fi

echo ""

# Step 8: Nginx setup (optional)
echo "Step 8: Web server setup..."
echo ""

if command -v nginx &> /dev/null; then
    print_success "Nginx is already installed"
else
    read -p "Do you want to install Nginx? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if sudo apt-get update && sudo apt-get install -y nginx; then
            print_success "Nginx installed successfully"
            print_info "Remember to configure Nginx (see DEPLOYMENT_GUIDE.md)"
        else
            print_error "Failed to install Nginx"
        fi
    fi
fi

echo ""

# Step 9: SSL setup (optional)
echo "Step 9: SSL certificate setup..."
echo ""

if command -v certbot &> /dev/null; then
    print_success "Certbot is already installed"
else
    read -p "Do you want to install Certbot for SSL certificates? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if sudo apt-get install -y certbot python3-certbot-nginx; then
            print_success "Certbot installed successfully"
            print_info "Run: sudo certbot --nginx -d yourdomain.com"
        else
            print_error "Failed to install Certbot"
        fi
    fi
fi

echo ""
echo "=============================="
echo "🎉 Setup Complete!"
echo "=============================="
echo ""
print_success "MedThread production environment is ready!"
echo ""
echo "Next steps:"
echo "1. Edit apps/api/.env with your actual credentials"
echo "2. Edit apps/web/.env.local with your actual credentials"
echo "3. Review DEPLOYMENT_GUIDE.md for detailed deployment instructions"
echo "4. Test locally with: npm run dev"
echo "5. Deploy to production"
echo ""
print_warning "Important: Never commit .env files to version control!"
echo ""
