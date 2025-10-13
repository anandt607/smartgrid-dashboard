# Contributing to SmartGrid

Thank you for your interest in contributing to SmartGrid! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/smartgrid-dashboard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

See [QUICKSTART.md](./QUICKSTART.md) for setting up your development environment.

## Code Style

### JavaScript

- Use ES6+ features
- Use functional components with hooks
- Keep components small and focused
- Use meaningful variable names
- Add comments for complex logic

### File Naming

- Components: `PascalCase.js` (e.g., `DashboardLayout.js`)
- Utilities: `camelCase.js` (e.g., `helpers.js`)
- Pages: `page.js` (Next.js convention)
- API routes: `route.js` (Next.js convention)

### Component Structure

```javascript
import { useState } from 'react'
import { Button } from 'antd'

/**
 * Component description
 * @param {Object} props - Component props
 * @param {string} props.title - Title text
 */
export default function MyComponent({ title }) {
  const [count, setCount] = useState(0)
  
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={() => setCount(count + 1)}>
        Count: {count}
      </Button>
    </div>
  )
}
```

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add user profile page`
- `fix: Fix authentication redirect issue`
- `docs: Update setup guide`
- `style: Format code with prettier`
- `refactor: Simplify billing logic`
- `test: Add tests for user API`
- `chore: Update dependencies`

## Pull Request Guidelines

1. **Title**: Clear and descriptive
2. **Description**: Explain what and why
3. **Screenshots**: Include for UI changes
4. **Testing**: Describe how you tested
5. **Breaking Changes**: Clearly mark if any

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How was this tested?

## Screenshots (if applicable)

## Checklist
- [ ] Code follows project style
- [ ] Self-reviewed code
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
```

## Project Structure

```
smartgrid-dashboard/
├── app/                    # Next.js pages
├── components/             # React components
├── lib/                    # Business logic
│   ├── api/               # API functions
│   ├── hooks/             # Custom hooks
│   └── utils/             # Utilities
├── styles/                # Global styles
└── public/                # Static assets
```

## Adding Features

### 1. New Page

```bash
# Create page file
touch app/(dashboard)/newpage/page.js

# Add to sidebar navigation
# Edit: components/layouts/DashboardSider.js
```

### 2. New Component

```bash
# Create component
touch components/shared/NewComponent.js

# Use in pages
import NewComponent from '@/components/shared/NewComponent'
```

### 3. New API Endpoint

```bash
# Create API route
mkdir -p app/api/myendpoint
touch app/api/myendpoint/route.js
```

### 4. New Query Hook

```bash
# Create hook
touch lib/hooks/queries/useMyData.js

# Use TanStack Query
import { useQuery } from '@tanstack/react-query'
```

## Testing

Currently, the project doesn't have automated tests. Contributions to add testing are welcome!

### Manual Testing Checklist

- [ ] Test on Chrome, Firefox, Safari
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test authentication flow
- [ ] Test error states
- [ ] Test loading states
- [ ] Check browser console for errors

## Documentation

Update documentation when adding features:

- Update README.md for major features
- Update SETUP_GUIDE.md for setup changes
- Add inline comments for complex code
- Update component prop descriptions

## Common Tasks

### Adding a New Ant Design Component

```javascript
import { NewComponent } from 'antd'

// Use it in your component
<NewComponent />
```

### Creating a New Query

```javascript
// lib/hooks/queries/useMyData.js
import { useQuery } from '@tanstack/react-query'
import { fetchMyData } from '@/lib/api/myapi'

export const useMyData = (id) => {
  return useQuery({
    queryKey: ['mydata', id],
    queryFn: () => fetchMyData(id),
    enabled: !!id,
  })
}
```

### Creating a New Mutation

```javascript
// lib/hooks/mutations/useUpdateData.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateData } from '@/lib/api/myapi'

export const useUpdateData = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateData,
    onSuccess: () => {
      queryClient.invalidateQueries(['mydata'])
    },
  })
}
```

## Questions?

- Open an issue for bugs
- Start a discussion for feature requests
- Check existing issues before creating new ones

## Code of Conduct

Be respectful and professional. We want this to be a welcoming community for everyone.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

Thank you for contributing! 🎉
