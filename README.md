# MedThread 🏥

A comprehensive healthcare platform that combines social networking, medical consultations, and AI-powered health insights to create a trusted ecosystem for patients and healthcare professionals.

## 🎯 Vision

MedThread revolutionizes healthcare accessibility by providing a secure, community-driven platform where patients can connect with verified healthcare professionals, access AI-powered health insights, and participate in meaningful medical discussions while maintaining privacy and clinical accuracy.

## 🏗 Project Structure

```
medthread/
├── apps/
│   ├── web/                    # Next.js 14 Frontend Application
│   │   ├── src/
│   │   │   ├── app/           # App Router pages
│   │   │   │   ├── admin/     # Admin dashboard
│   │   │   │   ├── chat/      # Real-time messaging
│   │   │   │   ├── appointments/ # Appointment booking
│   │   │   │   ├── analytics/ # Health analytics
│   │   │   │   └── ...        # Other feature pages
│   │   │   ├── components/    # Reusable UI components
│   │   │   ├── context/       # React contexts (Auth, etc.)
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── lib/           # Utility functions & API clients
│   │   │   └── styles/        # Global styles
│   │   └── public/            # Static assets
│   │
│   └── api/                   # Express.js Backend API
│       ├── src/
│       │   ├── routes/        # API endpoints
│       │   ├── middleware/    # Auth, validation, security
│       │   ├── services/      # Business logic
│       │   ├── handlers/      # Socket.io handlers
│       │   └── scripts/       # Database utilities
│       └── uploads/           # File storage
│
├── packages/
│   ├── ui/                    # Shared React component library
│   ├── database/              # Prisma schema & migrations
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── migrations/    # Database migrations
│   │   └── src/               # Database utilities
│   └── types/                 # Shared TypeScript definitions
│
├── services/
│   └── ai/                    # AI/ML Services
│       ├── src/
│       │   ├── services/      # AI processing logic
│       │   └── models/        # ML model definitions
│       └── data/              # Training data & models
│
└── docs/                      # Documentation
    ├── api/                   # API documentation
    ├── deployment/            # Deployment guides
    └── features/              # Feature specifications
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Docker & Docker Compose (recommended)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd medthread

# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f web api ai
```

### Manual Development Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Copy environment templates
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Edit the .env files with your configuration
```

3. **Database setup:**
```bash
# Start PostgreSQL (if using Docker)
docker-compose up postgres -d

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# (Optional) Seed with test data
cd apps/api && npx tsx create-standard-users.ts
```

4. **Start development servers:**
```bash
# Start all services in development mode
npm run dev
```

### Access Points
- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:3001
- **AI Service**: http://localhost:3002
- **Database**: localhost:5432 (PostgreSQL)

### Test Accounts
After running the setup, you can use these test accounts:

- **Admin**: admin@medthread.com / Admin@123456
- **Doctor**: rifa@gmail.com / Doctor@123456
- **Patient**: navin@gmail.com / Patient@123456

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--medical-teal: #5CB8B2;      /* Primary brand color */
--medical-blue: #2F6FED;      /* Trust and reliability */
--medical-orange: #FF8C42;    /* Attention and warmth */

/* Surface Colors */
--surface-light: #FFF3E8;     /* Light backgrounds */
--surface-white: #FFFFFF;     /* Pure white surfaces */
--surface-gray: #F8FAFC;      /* Subtle backgrounds */

/* Status Colors */
--success-green: #2AA876;     /* Success states */
--warning-yellow: #F59E0B;    /* Warning states */
--error-red: #E5484D;         /* Error states */
--info-blue: #3B82F6;         /* Information states */

/* Text Colors */
--text-primary: #1F2937;      /* Primary text */
--text-secondary: #6B7280;    /* Secondary text */
--text-muted: #9CA3AF;        /* Muted text */
```

### Typography Scale
- **Display**: 48px - Hero headings
- **H1**: 36px - Page titles
- **H2**: 28px - Section headings
- **H3**: 22px - Subsection headings
- **H4**: 18px - Component headings
- **Body Large**: 16px - Primary body text
- **Body**: 14px - Secondary body text
- **Caption**: 12px - Labels and captions
- **Small**: 10px - Fine print

### Component Library
- **Buttons**: Primary, secondary, ghost, and icon variants
- **Forms**: Input fields, textareas, selects with validation states
- **Cards**: Content containers with shadows and borders
- **Modals**: Overlay dialogs for actions and information
- **Navigation**: Header, sidebar, and breadcrumb components
- **Feedback**: Alerts, toasts, and loading states

## ✨ Core Features

### 🏥 Healthcare Platform
- **Patient Portal**: Comprehensive health profile management, symptom tracking, and medical history
- **Doctor Verification**: Multi-step verification process for healthcare professionals
- **Appointment Booking**: Integrated scheduling system with calendar management
- **Medical Records**: Secure storage and sharing of medical documents and reports
- **Prescription Management**: Digital prescription tracking and medication reminders

### 💬 Social & Communication
- **Community Forums**: Disease-specific communities and general health discussions
- **Real-time Chat**: Secure messaging between patients and healthcare providers
- **Thread Discussions**: Nested comment system for detailed medical conversations
- **Post Creation**: Rich text editor with medical form templates
- **Content Moderation**: AI-powered content filtering and professional review

### 🤖 AI-Powered Features
- **Symptom Analysis**: AI-driven symptom checker and health risk assessment
- **Diet Planning**: Personalized nutrition recommendations based on health conditions
- **Health Insights**: Predictive analytics for health trends and risk factors
- **Emergency Detection**: Automatic identification of urgent medical situations
- **Medical Q&A**: AI assistant for basic medical queries (Kendall AI)

### 📊 Analytics & Reporting
- **Health Analytics**: Personal health dashboards with trend analysis
- **Doctor Analytics**: Performance metrics and patient interaction insights
- **Platform Analytics**: System-wide usage statistics and health trends
- **Regional Health Data**: Geographic health pattern analysis
- **Appointment Analytics**: Booking patterns and healthcare utilization

### 🔐 Security & Compliance
- **HIPAA Compliance**: Healthcare data protection and privacy standards
- **Role-Based Access**: Granular permissions for different user types
- **Audit Logging**: Complete activity tracking for compliance
- **Data Encryption**: End-to-end encryption for sensitive medical data
- **Secure File Upload**: Protected medical document sharing

### 🎯 User Management
- **Multi-Role System**: Patients, Doctors, Admins with specific capabilities
- **Profile Management**: Comprehensive user profiles with medical specialties
- **Badge System**: Achievement and verification badges
- **Reputation Scoring**: Community-driven trust and expertise ratings
- **Follow System**: Connect with trusted healthcare providers

### 📱 Mobile & Accessibility
- **Progressive Web App (PWA)**: Mobile-optimized experience with offline capabilities
- **Responsive Design**: Seamless experience across all devices
- **Accessibility Features**: WCAG compliant design for inclusive healthcare
- **Push Notifications**: Real-time alerts for appointments and messages
- **Offline Support**: Critical features available without internet connection

### 🔧 Administrative Tools
- **Admin Dashboard**: Comprehensive platform management interface
- **User Management**: User verification, role assignment, and account management
- **Content Management**: Post moderation, community management
- **Analytics Dashboard**: Real-time platform metrics and health insights
- **System Monitoring**: Performance tracking and error management

## 🔐 Security & Compliance

### Data Protection
- **HIPAA Compliance**: Healthcare data protection standards
- **End-to-End Encryption**: Sensitive medical data encryption
- **Secure File Upload**: Protected document sharing with virus scanning
- **Data Anonymization**: Patient identity protection in public discussions
- **Audit Logging**: Complete activity tracking for compliance requirements

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control (RBAC)**: Granular permissions system
- **Password Security**: bcrypt hashing with salt rounds
- **Session Management**: Secure session handling with expiration
- **Multi-Factor Authentication**: Optional 2FA for enhanced security

### API Security
- **Rate Limiting**: Request throttling to prevent abuse
- **Input Validation**: Comprehensive data validation and sanitization
- **CORS Configuration**: Controlled cross-origin resource sharing
- **Security Headers**: Helmet.js for security header management
- **SQL Injection Prevention**: Parameterized queries with Prisma ORM

### Infrastructure Security
- **Environment Variables**: Secure configuration management
- **Docker Security**: Container security best practices
- **Database Security**: Encrypted connections and access controls
- **File Storage Security**: Cloudinary secure upload and delivery
- **Network Security**: Firewall rules and secure communication protocols

## 📊 Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: TailwindCSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **State Management**: Zustand for global state
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with custom interceptors
- **Real-time**: Socket.io client for live features

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Storage**: Cloudinary for media management
- **Real-time**: Socket.io for live messaging
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Email**: Nodemailer for transactional emails
- **Cron Jobs**: Node-cron for scheduled tasks

### AI & Machine Learning
- **AI Provider**: Groq API for fast inference
- **Models**: Custom health analysis models
- **Services**: Dedicated AI microservice
- **Features**: Symptom analysis, diet planning, health insights

### Infrastructure
- **Monorepo**: Turborepo for efficient builds
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with connection pooling
- **Caching**: In-memory caching with Redis-like patterns
- **Monitoring**: Custom logging and error tracking
- **Deployment**: Production-ready Docker setup

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Husky**: Git hooks for quality gates
- **Testing**: Jest and React Testing Library (configured)

### External Services
- **Database**: Supabase PostgreSQL
- **File Storage**: Cloudinary
- **AI Processing**: Groq API
- **Email**: SMTP configuration
- **Maps**: Leaflet for location services

## 🧪 Development & Testing

### Available Scripts
```bash
# Development
npm run dev              # Start all services in development mode
npm run build           # Build all applications for production
npm run start           # Start production builds

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes to database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with test data

# Code Quality
npm run lint            # Run ESLint across all packages
npm run type-check      # Run TypeScript type checking
npm run format          # Format code with Prettier

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate test coverage report
```

### Environment Configuration

#### API Environment Variables (.env)
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/medthread"
DIRECT_URL="postgresql://user:password@localhost:5432/medthread"

# Authentication
JWT_SECRET="your-secure-jwt-secret"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"

# External Services
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
GROQ_API_KEY="your-groq-api-key"

# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

#### Web Environment Variables (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# External Services
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"
```

### Database Management

#### Schema Updates
```bash
# After modifying prisma/schema.prisma
npm run db:generate     # Regenerate Prisma client
npm run db:push         # Push changes to development database

# For production migrations
npx prisma migrate dev --name your-migration-name
```

#### User Management Scripts
```bash
# Create standard test users
cd apps/api && npx tsx create-standard-users.ts

# List all users in database
cd apps/api && npx tsx list-all-users.ts

# Reset admin password
cd apps/api && npx tsx reset-admin.js
```

## 🚀 Deployment

### Production Deployment with Docker

1. **Build production images:**
```bash
docker-compose -f docker-compose.prod.yml build
```

2. **Deploy with environment variables:**
```bash
# Set production environment variables
export DATABASE_URL="your-production-db-url"
export JWT_SECRET="your-production-jwt-secret"
export CLOUDINARY_CLOUD_NAME="your-cloud-name"

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

3. **Run database migrations:**
```bash
docker-compose exec api npx prisma migrate deploy
```

### Manual Production Setup

1. **Build applications:**
```bash
npm run build
```

2. **Set up production database:**
```bash
# Run migrations
cd packages/database && npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

3. **Start services:**
```bash
# Start API server
cd apps/api && npm start

# Start web application
cd apps/web && npm start

# Start AI service
cd services/ai && npm start
```

### Environment-Specific Configurations

#### Development
- Hot reloading enabled
- Detailed error messages
- Development database
- Console logging for emails

#### Production
- Optimized builds
- Error tracking
- Production database with SSL
- SMTP email delivery
- Security headers enabled
- Rate limiting active

## 🤝 Contributing

We welcome contributions to MedThread! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
```bash
git clone https://github.com/your-username/medthread.git
cd medthread
```

2. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Set up development environment**
```bash
npm install
npm run db:generate
npm run dev
```

4. **Make your changes**
   - Follow the existing code style
   - Add tests for new features
   - Update documentation as needed

5. **Test your changes**
```bash
npm run lint
npm run type-check
npm run test
```

6. **Commit and push**
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Include screenshots for UI changes
   - Reference any related issues

### Code Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow the configured linting rules
- **Prettier**: Use consistent code formatting
- **Conventional Commits**: Use semantic commit messages
- **Testing**: Write tests for new functionality

### Areas for Contribution

- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🧪 Test coverage expansion
- 🎨 UI/UX enhancements
- 🔒 Security improvements
- ♿ Accessibility features

## 📄 License

MIT License - see LICENSE file for details

## 📈 Performance & Scalability

### Architecture Highlights
- **Microservice Design**: Separate services for web, API, and AI processing
- **Database Optimization**: Connection pooling and query optimization
- **Caching Strategy**: In-memory caching for frequently accessed data
- **CDN Integration**: Cloudinary for optimized media delivery
- **Real-time Features**: Efficient Socket.io implementation

### Performance Metrics
- **Page Load Time**: < 2 seconds for initial load
- **API Response Time**: < 200ms for most endpoints
- **Database Queries**: Optimized with proper indexing
- **Bundle Size**: Optimized with code splitting and tree shaking
- **Mobile Performance**: PWA with offline capabilities

### Monitoring & Analytics
- **Health Checks**: Automated system health monitoring
- **Error Tracking**: Comprehensive error logging and reporting
- **Usage Analytics**: User behavior and system performance tracking
- **Database Monitoring**: Query performance and connection tracking
- **Real-time Metrics**: Live system performance dashboards

## 🎯 Success Metrics & KPIs

### User Engagement
- Average session duration
- Daily/Monthly active users
- User retention rates
- Feature adoption rates

### Healthcare Outcomes
- Average time to first doctor response
- Patient satisfaction scores
- Thread resolution rates
- Medical accuracy ratings

### Platform Health
- System uptime and reliability
- Response time performance
- Error rates and resolution time
- Security incident tracking

## 🔗 Additional Resources

### Documentation
- [API Documentation](./docs/api/README.md)
- [Database Schema](./packages/database/README.md)
- [Deployment Guide](./docs/deployment/README.md)
- [Security Guidelines](./docs/security/README.md)

### Development Resources
- [Component Library](./packages/ui/README.md)
- [Development Setup](./docs/development/setup.md)
- [Testing Guidelines](./docs/development/testing.md)
- [Code Style Guide](./docs/development/style-guide.md)

### External Links
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Socket.io Documentation](https://socket.io/docs)

---

Built with ❤️ for better healthcare accessibility
