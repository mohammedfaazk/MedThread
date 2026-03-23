#!/bin/bash

echo "📧 Email System Setup Script"
echo "============================"
echo ""

echo "This script will help you set up the email system."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  cp .env.example .env
fi

echo "Choose your email provider:"
echo "1. SendGrid"
echo "2. AWS SES"
echo "3. SMTP (Generic)"
echo ""

read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
  1)
    echo ""
    echo "📝 SendGrid Configuration"
    read -p "SendGrid API Key: " SENDGRID_API_KEY
    read -p "From Email: " FROM_EMAIL
    read -p "From Name: " FROM_NAME
    
    echo "" >> .env
    echo "# Email Configuration (SendGrid)" >> .env
    echo "EMAIL_PROVIDER=sendgrid" >> .env
    echo "SENDGRID_API_KEY=$SENDGRID_API_KEY" >> .env
    echo "EMAIL_FROM=$FROM_EMAIL" >> .env
    echo "EMAIL_FROM_NAME=$FROM_NAME" >> .env
    ;;
    
  2)
    echo ""
    echo "📝 AWS SES Configuration"
    read -p "AWS Region: " AWS_REGION
    read -p "AWS Access Key ID: " AWS_ACCESS_KEY_ID
    read -p "AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
    read -p "From Email: " FROM_EMAIL
    read -p "From Name: " FROM_NAME
    
    echo "" >> .env
    echo "# Email Configuration (AWS SES)" >> .env
    echo "EMAIL_PROVIDER=ses" >> .env
    echo "AWS_REGION=$AWS_REGION" >> .env
    echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID" >> .env
    echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY" >> .env
    echo "EMAIL_FROM=$FROM_EMAIL" >> .env
    echo "EMAIL_FROM_NAME=$FROM_NAME" >> .env
    ;;
    
  3)
    echo ""
    echo "📝 SMTP Configuration"
    read -p "SMTP Host: " SMTP_HOST
    read -p "SMTP Port: " SMTP_PORT
    read -p "SMTP User: " SMTP_USER
    read -p "SMTP Password: " SMTP_PASSWORD
    read -p "From Email: " FROM_EMAIL
    read -p "From Name: " FROM_NAME
    
    echo "" >> .env
    echo "# Email Configuration (SMTP)" >> .env
    echo "EMAIL_PROVIDER=smtp" >> .env
    echo "SMTP_HOST=$SMTP_HOST" >> .env
    echo "SMTP_PORT=$SMTP_PORT" >> .env
    echo "SMTP_USER=$SMTP_USER" >> .env
    echo "SMTP_PASSWORD=$SMTP_PASSWORD" >> .env
    echo "EMAIL_FROM=$FROM_EMAIL" >> .env
    echo "EMAIL_FROM_NAME=$FROM_NAME" >> .env
    ;;
    
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

echo ""
echo "✅ Email configuration added to .env file"
echo ""

echo "🧪 Testing email configuration..."
node scripts/test-email-system.js

echo ""
echo "🎉 Email setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify your sender email address with your provider"
echo "2. Test sending emails from your application"
echo "3. Set up email templates in apps/api/src/templates/"
echo ""
