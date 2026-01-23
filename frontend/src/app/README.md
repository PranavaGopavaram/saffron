# Saffron Frontend - Application Structure

This document explains the organized file structure of the application.

## Directory Structure

```
src/app/
├── core/                          # Singleton services and app-wide utilities
│   ├── guards/                    # Route guards (auth, role-based access)
│   ├── interceptors/              # HTTP interceptors
│   ├── models/                    # Core data models and interfaces
│   └── services/                  # Singleton services (auth, API, state)
│
├── features/                      # Feature modules (lazy-loadable)
│   └── auth/                      # Authentication feature
│       ├── components/            # Auth-specific components
│       │   └── login/             # Login component
│       │       ├── login.component.ts
│       │       ├── login.component.html
│       │       ├── login.component.css
│       │       └── login.component.spec.ts
│       └── services/              # Auth-specific services
│
├── shared/                        # Shared/reusable components and utilities
│   ├── components/                # Reusable UI components
│   ├── directives/                # Custom directives
│   └── pipes/                     # Custom pipes
│
├── app.component.ts               # Root component
├── app.component.html             # Root template
├── app.component.css              # Root styles
├── app.component.spec.ts          # Root component tests
└── app.routes.ts                  # Application routing configuration
```

## Folder Purposes

### `/core`
Contains singleton services, guards, interceptors, and core models that are used throughout the application. Items here should only be imported once in the app.

**Examples:**
- Authentication service
- API service
- Auth guards
- HTTP interceptors
- Core data models

### `/features`
Contains feature modules organized by business domain. Each feature is self-contained and can be lazy-loaded.

**Current Features:**
- `auth/` - Authentication and user management

**Structure per feature:**
- `components/` - Feature-specific components
- `services/` - Feature-specific services
- `models/` - Feature-specific data models

### `/shared`
Contains reusable components, directives, and pipes that can be shared across multiple features.

**Examples:**
- Button components
- Form controls
- Loading spinners
- Custom pipes (date formatting, etc.)
- Custom directives

## Naming Conventions

- **Components:** `*.component.ts`, `*.component.html`, `*.component.css`
- **Services:** `*.service.ts`
- **Guards:** `*.guard.ts`
- **Interceptors:** `*.interceptor.ts`
- **Models:** `*.model.ts` or `*.interface.ts`
- **Pipes:** `*.pipe.ts`
- **Directives:** `*.directive.ts`

## Adding New Features

When adding a new feature:

1. Create a new directory under `/features`
2. Add `components/`, `services/`, and `models/` subdirectories as needed
3. Keep the feature self-contained
4. Only use `/shared` for truly reusable components
5. Update routing in `app.routes.ts`

## Best Practices

- Keep components small and focused
- Use services for business logic
- Place shared utilities in `/shared`
- Use lazy loading for feature modules
- Follow Angular style guide naming conventions
