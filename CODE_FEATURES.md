# Code Formatting and Syntax Highlighting Features

This document describes the new code formatting and syntax highlighting capabilities added to the note editor.

## Features Added

### 1. Code Formatting
- **Format Code Button**: Automatically formats selected code with proper indentation
- **Language Detection**: Automatically detects JavaScript, TypeScript, JSON, CSS, and HTML
- **Smart Indentation**: Adds proper indentation based on code structure
- **Multiple Language Support**: JavaScript, TypeScript, JSX, TSX, CSS, SCSS, HTML, JSON

### 2. Syntax Highlighting
- **Language Selector**: Choose from 14+ programming languages
- **Real-time Highlighting**: Apply syntax highlighting to selected code
- **Prism.js Integration**: Uses Prism.js for professional syntax highlighting
- **Theme Integration**: Matches your app's theme colors

### 3. Code Block Tools
- **Insert Code Block**: Quickly insert formatted code blocks with language specification
- **Inline Code**: Toggle inline code formatting for short code snippets
- **Enhanced Styling**: Beautiful code blocks with proper spacing and borders

## Supported Languages

### Formatting
- JavaScript/JSX
- TypeScript/TSX
- CSS/SCSS
- HTML
- JSON

### Syntax Highlighting
- JavaScript
- TypeScript
- JSX/TSX
- HTML/XML
- CSS/SCSS
- JSON
- Markdown
- Python
- Java
- PHP
- Bash/Shell
- SQL

## How to Use

### Code Formatting
1. Select the code you want to format
2. Click the "Format Code" button (code icon)
3. The code will be automatically formatted with proper indentation

### Syntax Highlighting
1. Select the code you want to highlight
2. Click the language selector dropdown (palette icon)
3. Choose your programming language
4. The code will be highlighted with syntax colors

### Code Blocks
1. Click the "Insert Code Block" button (terminal icon)
2. A code block template will be inserted
3. Replace the placeholder with your code
4. The language can be specified in the code block header

### Inline Code
1. Select text you want to format as inline code
2. Click the "Inline Code" button
3. The text will be formatted with a code background

## Technical Implementation

- **Code Formatter**: Custom JavaScript formatter with basic language support
- **Syntax Highlighter**: Prism.js with 14+ language components
- **UI Integration**: Vue 3 component integrated into Quill.js toolbar
- **Theme Compatibility**: Styled to match DaisyUI theme system
- **Performance**: Lightweight implementation with on-demand formatting

## Files Added/Modified

- `src/utils/codeFormatter.js` - Code formatting utilities
- `src/utils/syntaxHighlighter.js` - Syntax highlighting utilities  
- `src/components/CodeToolbox.vue` - Code toolbox UI component
- `src/components/NoteEditor.vue` - Enhanced with code toolbox integration
- Enhanced CSS styling for code blocks and inline code

The code formatting and syntax highlighting features are now fully integrated into your note editor toolbox!