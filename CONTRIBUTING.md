# Contributing to Local Vendor Platform

Thank you for your interest in contributing! This document provides guidelines and standards for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/local-vendor-platform/issues)
2. Create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Open an issue with the label "enhancement"
2. Clearly describe the feature and its benefits
3. Provide use cases and examples

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with clear messages: `git commit -m 'Add amazing feature'`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 💻 Development Guidelines

### Code Style

#### JavaScript/TypeScript
- Use ESLint and Prettier configurations
- Follow Airbnb style guide
- Use meaningful variable names
- Add JSDoc comments for functions

```typescript
/**
 * Calculate demand forecast for a product
 * @param productId - Unique product identifier
 * @param days - Number of days to forecast
 * @returns Forecast data array
 */
async function calculateForecast(productId: string, days: number): Promise<Forecast[]> {
  // Implementation
}
```

#### Python
- Follow PEP 8 style guide
- Use type hints
- Add docstrings for functions

```python
def predict_demand(product_id: str, days: int) -> List[Prediction]:
    """
    Predict demand for a product.
    
    Args:
        product_id: Unique product identifier
        days: Number of days to forecast
        
    Returns:
        List of prediction objects
    """
    pass
```

### Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Formatting changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add demand forecasting API endpoint
fix: resolve authentication token expiry issue
docs: update API documentation for inventory routes
```

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical fixes
- `docs/documentation-update` - Documentation
- `refactor/refactor-description` - Code refactoring

### Testing

#### Backend Tests
```bash
cd backend
npm test
```

All new features must include:
- Unit tests
- Integration tests
- Minimum 80% code coverage

#### Frontend Tests
```bash
cd frontend
npm test
```

Required tests:
- Component tests
- Integration tests
- E2E tests for critical flows

#### ML Service Tests
```bash
cd ml-service
pytest
```

Required:
- Unit tests for preprocessing
- Model accuracy tests
- API endpoint tests

### Documentation

Update documentation when:
- Adding new features
- Changing APIs
- Modifying configuration
- Updating dependencies

## 🏗️ Project Structure

```
local-vendor-platform/
├── frontend/          # Next.js frontend
├── backend/           # Express backend
├── ml-service/        # Python ML service
├── database/          # Database schemas
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## 🔄 Development Workflow

1. **Pick an Issue**: Choose from open issues or create new one
2. **Create Branch**: `git checkout -b feature/your-feature`
3. **Develop**: Write code following guidelines
4. **Test**: Ensure all tests pass
5. **Document**: Update relevant documentation
6. **Commit**: Use conventional commit messages
7. **Push**: Push to your fork
8. **PR**: Open pull request with clear description

## ✅ Pull Request Checklist

Before submitting PR, ensure:

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.log or debugging code
- [ ] No merge conflicts
- [ ] Descriptive PR title and description
- [ ] Referenced related issues

## 🔒 Security

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configuration
- Report security vulnerabilities privately
- Follow OWASP security best practices

## 📝 Code Review Process

1. PRs require at least 1 approval
2. Address all review comments
3. Keep PRs focused and small
4. Be respectful and constructive

## 🎯 Areas Needing Help

We especially welcome contributions in:

- 🐛 Bug fixes
- 📖 Documentation improvements
- 🧪 Test coverage
- 🌐 Internationalization (i18n)
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements
- 🚀 Performance optimization

## 📞 Getting Help

- Join our [Discord/Slack]
- Ask questions in GitHub Discussions
- Email: dev@vendorplatform.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Awarded contributor badge

Thank you for making this platform better! 🎉

---

**Last Updated**: January 25, 2026
