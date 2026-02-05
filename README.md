# MedThread 🏥

A professional community-driven medical discussion platform where patients connect with verified healthcare professionals.

## 🎯 Vision

MedThread combines social discussion usability with clinical workflow precision, creating a trust-driven healthcare ecosystem where patients receive structured, safe, and clinically relevant responses from verified medical professionals.

## 🏗 Architecture

```
medthread/
├── apps/
│   ├── web/              # Next.js 14 web application
│   └── api/              # Express.js REST API
├── packages/
│   ├── ui/               # Shared React components
│   ├── database/         # Prisma schema & client
│   └── types/            # Shared TypeScript types
└── services/
    └── ai/               # AI/ML symptom analysis service
```

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Manual Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example apps/api/.env
# Edit apps/api/.env with your database credentials
```

3. **Start PostgreSQL:**
```bash
docker-compose up postgres -d
```

4. **Generate Prisma client and push schema:**
```bash
npm run db:generate
npm run db:push
```

5. **Start development servers:**
```bash
npm run dev
```

Access the application:
- Web App: http://localhost:3000
- API: http://localhost:3001
- AI Service: http://localhost:3002

## 🎨 Design System

**Color Palette:**
- Medical Orange: `#FF8C42`
- Light Orange Surface: `#FFF3E8`
- Trust Blue: `#2F6FED`
- Success Green: `#2AA876`
- Alert Red: `#E5484D`

**Typography:**
- Large Title: 28px
- Section Heading: 22px
- Body Text: 16px
- Labels: 14px

## ✨ Core Features

### MVP Features (Implemented)
- ✅ Structured patient symptom posting with guided forms
- ✅ Nested thread discussion engine
- ✅ Doctor verification badges
- ✅ Reputation scoring system
- ✅ Case timeline tracking
- ✅ AI-assisted symptom analysis
- ✅ Emergency detection
- ✅ Authentication & authorization
- ✅ Real-time notifications

### User Roles
- **Patient**: Post symptoms, participate in discussions, track case progress
- **Verified Doctor**: Answer queries, flag misinformation, earn reputation
- **Healthcare Contributors**: Nurses, medical students, pharmacists

## 🔐 Security & Compliance

- Patient identity anonymization
- End-to-end encryption for medical uploads
- Role-based access control (RBAC)
- Audit logging for all medical advice
- HIPAA-ready architecture

## 📊 Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **AI/ML**: Custom symptom analysis service
- **Monorepo**: Turborepo
- **Deployment**: Docker, Docker Compose

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run linter
npm run lint
```

## 📈 Scalability

- Microservice architecture
- Separate AI inference service
- CDN-optimized media delivery
- Thread caching layer with Redis
- Horizontal scaling ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Success Metrics

- Average time to first doctor reply
- Patient satisfaction score
- Thread resolution rate
- Misinformation removal rate

## 🔗 Links

- [Documentation](./docs)
- [API Reference](./docs/api.md)
- [Design System](./docs/design-system.md)

---

Built with ❤️ for better healthcare accessibility
