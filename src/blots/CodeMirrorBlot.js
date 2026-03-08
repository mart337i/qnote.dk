/**
 * CodeMirrorBlot — a Quill BlockEmbed blot that hosts a live CodeMirror 6 editor.
 *
 * Serialisation format (stored in Quill's HTML content):
 *   <div class="ql-code-mirror-block" data-language="javascript" data-content="...base64..."></div>
 *
 * The content is base64-encoded so that arbitrary code strings don't break HTML attribute parsing.
 */

import Quill from 'quill'
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLine,
} from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  foldGutter,
} from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { python } from '@codemirror/lang-python'
import { java } from '@codemirror/lang-java'
import { cpp } from '@codemirror/lang-cpp'
import { rust } from '@codemirror/lang-rust'
import { sql } from '@codemirror/lang-sql'
import { json } from '@codemirror/lang-json'
import { markdown } from '@codemirror/lang-markdown'
import { oneDark } from '@codemirror/theme-one-dark'

const BlockEmbed = Quill.import('blots/block/embed')

export const LANGUAGES = [
  {
    value: 'javascript',
    label: 'JavaScript',
    extension: () => javascript({ jsx: true }),
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    extension: () => javascript({ typescript: true, jsx: true }),
  },
  { value: 'html', label: 'HTML', extension: () => html() },
  { value: 'css', label: 'CSS', extension: () => css() },
  { value: 'python', label: 'Python', extension: () => python() },
  { value: 'java', label: 'Java', extension: () => java() },
  { value: 'cpp', label: 'C++', extension: () => cpp() },
  { value: 'rust', label: 'Rust', extension: () => rust() },
  { value: 'sql', label: 'SQL', extension: () => sql() },
  { value: 'json', label: 'JSON', extension: () => json() },
  { value: 'markdown', label: 'Markdown', extension: () => markdown() },
  { value: 'plaintext', label: 'Plain Text', extension: () => [] },
]

function encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

function decode(str) {
  try {
    return decodeURIComponent(escape(atob(str)))
  } catch {
    return str
  }
}

function isDarkTheme() {
  const theme = document.documentElement.getAttribute('data-theme') || ''
  const darkThemes = [
    'dark',
    'night',
    'halloween',
    'forest',
    'black',
    'luxury',
    'dracula',
    'business',
    'coffee',
    'dim',
    'sunset',
    'synthwave',
    'cyberpunk',
  ]
  return darkThemes.includes(theme)
}

function buildExtensions(language, onChange, isDark) {
  const langDef = LANGUAGES.find(l => l.value === language) || LANGUAGES[0]
  const langExt = langDef.extension()
  return [
    history(),
    lineNumbers(),
    foldGutter(),
    bracketMatching(),
    highlightActiveLine(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    Array.isArray(langExt) ? langExt : [langExt],
    isDark ? oneDark : [],
    EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString())
      }
    }),
    EditorView.theme({
      '&': { height: 'auto', minHeight: '80px' },
      '.cm-scroller': {
        overflow: 'auto',
        fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace",
        fontSize: '0.875rem',
        lineHeight: '1.6',
      },
      '.cm-content': { padding: '12px 0' },
      '.cm-line': { padding: '0 16px' },
      '.cm-gutters': { paddingLeft: '4px', paddingRight: '4px' },
    }),
  ]
}

class CodeMirrorBlot extends BlockEmbed {
  static blotName = 'code-mirror-block'
  static tagName = 'div'
  static className = 'ql-code-mirror-block'

  static create(value) {
    const node = super.create(value)
    node.setAttribute('data-language', value.language || 'javascript')
    node.setAttribute('data-content', encode(value.content || ''))
    node.setAttribute('contenteditable', 'false')
    CodeMirrorBlot.mount(
      node,
      value.language || 'javascript',
      value.content || ''
    )
    return node
  }

  static value(node) {
    return {
      language: node.getAttribute('data-language') || 'javascript',
      content: decode(node.getAttribute('data-content') || ''),
    }
  }

  static mount(node, language, content) {
    // Header bar (language selector + copy button)
    const header = document.createElement('div')
    header.className = 'cm-block-header'

    const select = document.createElement('select')
    select.className = 'cm-lang-select'
    LANGUAGES.forEach(lang => {
      const opt = document.createElement('option')
      opt.value = lang.value
      opt.textContent = lang.label
      if (lang.value === language) opt.selected = true
      select.appendChild(opt)
    })

    const copyBtn = document.createElement('button')
    copyBtn.className = 'cm-copy-btn'
    copyBtn.type = 'button'
    copyBtn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy'

    header.appendChild(select)
    header.appendChild(copyBtn)

    // CodeMirror container
    const cmContainer = document.createElement('div')
    cmContainer.className = 'cm-editor-container'

    node.innerHTML = ''
    node.appendChild(header)
    node.appendChild(cmContainer)

    let currentContent = content
    const dark = isDarkTheme()

    const view = new EditorView({
      state: EditorState.create({
        doc: content,
        extensions: buildExtensions(
          language,
          newContent => {
            currentContent = newContent
            node.setAttribute('data-content', encode(newContent))
          },
          dark
        ),
      }),
      parent: cmContainer,
    })

    // Language change
    select.addEventListener('change', e => {
      const newLang = e.target.value
      node.setAttribute('data-language', newLang)
      const newState = EditorState.create({
        doc: currentContent,
        extensions: buildExtensions(
          newLang,
          c => {
            currentContent = c
            node.setAttribute('data-content', encode(c))
          },
          isDarkTheme()
        ),
      })
      view.setState(newState)
    })

    // Copy button
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(currentContent).then(() => {
        copyBtn.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 18 4 13"></polyline></svg> Copied!'
        setTimeout(() => {
          copyBtn.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy'
        }, 2000)
      })
    })

    // Watch for theme changes and update CM theme
    const observer = new MutationObserver(() => {
      const nowDark = isDarkTheme()
      const newState = EditorState.create({
        doc: currentContent,
        extensions: buildExtensions(
          node.getAttribute('data-language') || 'javascript',
          c => {
            currentContent = c
            node.setAttribute('data-content', encode(c))
          },
          nowDark
        ),
      })
      view.setState(newState)
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    // Prevent Quill from intercepting keyboard events inside CodeMirror
    cmContainer.addEventListener('keydown', e => e.stopPropagation())
    cmContainer.addEventListener('keyup', e => e.stopPropagation())

    // Store view reference for cleanup
    node._cmView = view
    node._cmObserver = observer
  }

  // Called by Quill when the blot is removed from the DOM — clean up
  static detach(node) {
    CodeMirrorBlot.destroyNode(node)
    super.detach(node)
  }

  // Destroy a single mounted CM node (safe to call even if not mounted)
  static destroyNode(node) {
    if (node._cmView) {
      node._cmView.destroy()
      node._cmView = null
    }
    if (node._cmObserver) {
      node._cmObserver.disconnect()
      node._cmObserver = null
    }
  }

  // Destroy all mounted CM instances inside a root element (call before innerHTML swap)
  static destroyAll(root) {
    root.querySelectorAll('.ql-code-mirror-block').forEach(node => {
      CodeMirrorBlot.destroyNode(node)
    })
  }

  // Mount all bare (data-only) CM block divs inside a root element
  static mountAll(root) {
    root.querySelectorAll('.ql-code-mirror-block').forEach(node => {
      if (!node.querySelector('.cm-block-header')) {
        const language = node.getAttribute('data-language') || 'javascript'
        const encoded = node.getAttribute('data-content') || ''
        CodeMirrorBlot.mount(node, language, decode(encoded))
      }
    })
  }

  // Override html() so Quill serialises only the data attributes, not the live CM DOM
  html() {
    const node = this.domNode
    return `<div class="ql-code-mirror-block" data-language="${node.getAttribute('data-language')}" data-content="${node.getAttribute('data-content')}"></div>`
  }
}

export default CodeMirrorBlot
