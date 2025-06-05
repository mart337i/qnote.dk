# Daily Notes App

A modern, clean daily journaling application built with Vue 3, Vite, and Tailwind CSS.

## Features

- ✨ Clean, modern interface with DaisyUI components
- 📝 Auto-saving notes with visual feedback
- 🎨 Multiple theme support (28+ DaisyUI themes)
- 💾 Local storage with cloud sync capability
- 🔐 User authentication (mock implementation)
- 📱 Responsive design
- ⚡ Fast development with Vite

## Quick Start

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd daily-notes
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Build for production:**
```bash
npm run build
```

## Project Structure

```
src/
├── main.js              # App entry point
├── App.vue              # Root component
├── components/          # Reusable Vue components
│   ├── Sidebar.vue      # Navigation and recent notes
│   ├── NoteEditor.vue   # Main note editing interface
│   ├── ThemeSelector.vue # Theme switching component
│   ├── LoginModal.vue   # Authentication modal
│   └── UserProfile.vue  # User info and logout
├── composables/         # Reusable composition functions
│   ├── useNotes.js      # Note management logic
│   ├── useAuth.js       # Authentication logic
│   ├── useTheme.js      # Theme management
│   └── useAutoSave.js   # Auto-save functionality
├── utils/               # Utility functions
│   ├── dateHelpers.js   # Date formatting and manipulation
│   ├── storage.js       # LocalStorage operations
│   └── constants.js     # App constants
└── styles/              # CSS and styling
    ├── main.css         # Main stylesheet
    └── themes.css       # Theme-specific styles
```

## Key Improvements from Original

### 🔧 **Better Architecture**
- **Separation of Concerns:** Each component has a single responsibility
- **Reusable Logic:** Composables extract business logic for reuse
- **Modular Components:** Easy to test, maintain, and extend

### 🚀 **Modern Development Setup**
- **Vite:** Lightning-fast development with HMR
- **ES Modules:** Native module support
- **Build Optimization:** Automatic code splitting and optimization

### 🧪 **Testing Ready**
- **Component Isolation:** Each component can be tested independently
- **Pure Functions:** Utilities are easy to unit test
- **Mock-friendly:** Composables can be easily mocked

### 📦 **Scalability**
- **Clear Structure:** Easy for new developers to understand
- **Extensible:** Add new features without touching existing code
- **Type-safe Ready:** Easy to migrate to TypeScript

## Development Guidelines

### Adding New Features

1. **Create a composable** for business logic:
```javascript
// src/composables/useNewFeature.js
export function useNewFeature() {
  // Your logic here
  return { /* exported functions and refs */ }
}
```

2. **Create components** for UI:
```vue
<!-- src/components/NewComponent.vue -->
<template>
  <!-- Your template -->
</template>
<script setup>
// Your component logic
</script>
```

3. **Add utilities** for helpers:
```javascript
// src/utils/newHelpers.js
export function newHelper() {
  // Pure helper function
}
```

### Component Guidelines

- Use **composition API** with `<script setup>`
- **Props** for data in, **emits** for events out
- Keep components **focused** on single responsibility
- Use **TypeScript** for better developer experience (recommended)

### State Management

For complex state, consider adding **Pinia**:
```bash
npm install pinia
```

### Testing

Add **Vitest** and **Vue Test Utils**:
```bash
npm install -D vitest @vue/test-utils
```

## Next Steps

1. **Add TypeScript** for better type safety
2. **Implement real backend** for cloud sync
3. **Add PWA features** for offline support
4. **Add Vue Router** for multiple views
5. **Add Storybook** for component documentation
6. **Add E2E testing** with Cypress or Playwright

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details