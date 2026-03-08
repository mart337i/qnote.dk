# qnote.dk

A clean, fast daily notes app. Write notes with rich text formatting, embedded code blocks with syntax highlighting, and 29 DaisyUI themes.

## Stack

- **Vue 3** (Composition API) + **Vite**
- **Quill.js** — rich text editor
- **CodeMirror 6** — embedded code blocks with live syntax highlighting
- **Tailwind CSS** + **DaisyUI** — styling and theming
- **DOMPurify** — HTML sanitisation

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build    # production build
npm run preview  # preview build locally
npm run test     # run tests
```

## Project structure

```
src/
├── App.vue                   # Root layout
├── main.js                   # Entry point
├── blots/
│   └── CodeMirrorBlot.js     # Quill blot that embeds a CodeMirror editor
├── components/
│   ├── NoteEditor.vue        # Main editor (Quill + toolbar)
│   ├── Sidebar.vue           # Note list and navigation
│   ├── ThemeSelector.vue     # Theme picker
│   ├── LoginModal.vue        # Auth modal
│   └── UserProfile.vue       # User display
├── composables/
│   ├── useNotes.js           # Note state, CRUD, localStorage
│   ├── useAuth.js            # Auth state
│   └── useTheme.js           # Theme persistence
├── utils/
│   ├── dateHelpers.js        # Date formatting
│   ├── helpers.js            # generateId, debounce
│   └── constants.js          # Storage keys, theme list
└── styles/
    └── main.css              # Tailwind imports + scrollbar
```

## Editor features

- **Toolbar:** Bold, Italic, Underline, Strike, H1–H3, Ordered/Bullet list, Blockquote, Code block, Link, Text colour, Align (Left / Center / Right / Justify), Clear formatting
- **Code blocks:** Embedded CodeMirror 6 with syntax highlighting for JS/TS, HTML, CSS, Python, Java, C++, Rust, SQL, JSON, Markdown. Language selector and copy button per block. Theme-aware (light/dark).
- **Headings:** Google Docs-style typography — H1 with bottom border, H2/H3 with scaled weights.
- **Themes:** All 29 DaisyUI themes work, including full dark-mode support in the editor and code blocks.
- **Storage:** Notes saved to `localStorage` as sanitised HTML. Code block content is serialised as `data-` attributes so the live editor DOM is never stored.

## Docker

```bash
docker compose up
```

## License

MIT
