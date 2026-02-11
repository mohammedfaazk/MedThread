# Contributing to MedThread

Thank you for your interest in contributing to MedThread! This document provides guidelines and instructions for contributing.

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Prioritize patient safety in all decisions
- Maintain medical accuracy and credibility
- Protect user privacy

## Getting Started

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/medthread.git
cd medthread
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Set Up Development Environment
```bash
npm install
docker-compose up -d
npm run db:generate
npm run db:push
npm run dev
```

## Development Workflow

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates

Examples:
- `feature/add-video-consultation`
- `fix/emergency-detection-false-positive`
- `docs/update-api-documentation`

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat(threads): add emergency detection banner

Implemented real-time emergency detection that displays
a warning banner when dangerous symptoms are detected.

Closes #123
```

## Code Standards

### TypeScript
- Use strict mode
- Define interfaces for all data structures
- Avoid `any` type
- Use meaningful variable names

### React Components
- Functional components with hooks
- Props interface defined
- Use TypeScript
- Keep components small and focused

### API Routes
- RESTful conventions
- Proper HTTP status codes
- Input validation with Zod
- Error handling
- Authentication where required

### Database
- Use Prisma migrations
- Never modify schema directly
- Include rollback strategy
- Test migrations locally first

## Testing Requirements

### Before Submitting PR
- [ ] All tests pass: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] Type checking passes: `npm run type-check`
- [ ] Manual testing completed
- [ ] No console errors

### Test Coverage
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical flows
- Maintain >80% coverage

## Pull Request Process

### 1. Update Your Branch
```bash
git fetch origin
git rebase origin/main
```

### 2. Run Tests
```bash
npm test
npm run lint
npm run type-check
```

### 3. Create Pull Request

**PR Title Format:**
```
[Type] Brief description
```

**PR Description Template:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### 4. Code Review
- Address all review comments
- Keep discussions professional
- Be open to feedback
- Update PR as needed

### 5. Merge
- Squash commits if requested
- Ensure CI passes
- Wait for approval from maintainers

## Medical Content Guidelines

### When Adding Medical Features
- Consult with medical professionals
- Include proper disclaimers
- Cite medical sources
- Consider patient safety implications
- Test emergency scenarios thoroughly

### Medical Accuracy
- Verify information with reliable sources
- Include references for medical claims
- Have medical professionals review
- Update based on latest guidelines

## Security Guidelines

### Sensitive Data
- Never commit secrets or API keys
- Use environment variables
- Encrypt sensitive data
- Follow HIPAA guidelines

### Authentication
- Always validate user permissions
- Use secure password hashing
- Implement rate limiting
- Log security events

## Documentation

### Code Documentation
- JSDoc comments for functions
- README for new packages
- API documentation for endpoints
- Architecture decisions documented

### User Documentation
- Update user guides
- Add screenshots for UI changes
- Keep API docs current
- Document breaking changes

## Performance Considerations

- Optimize database queries
- Implement caching where appropriate
- Minimize bundle size
- Test with realistic data volumes
- Profile performance-critical code

## Accessibility

- Follow WCAG 2.1 Level AA
- Test with screen readers
- Ensure keyboard navigation
- Maintain color contrast ratios
- Add ARIA labels

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Join our Discord community
- Email: dev@medthread.com

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Invited to contributor calls
- Eligible for swag (coming soon!)

Thank you for contributing to MedThread! 🏥
