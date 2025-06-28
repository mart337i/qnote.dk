import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// Import language components
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-scss'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-sql'

const LANGUAGE_MAP = {
  js: 'javascript',
  ts: 'typescript',
  html: 'markup',
  xml: 'markup',
  md: 'markdown',
  py: 'python',
  sh: 'bash',
  shell: 'bash'
}

export function highlightCode(code, language = 'javascript') {
  try {
    const normalizedLang = LANGUAGE_MAP[language] || language
    
    if (Prism.languages[normalizedLang]) {
      return Prism.highlight(code, Prism.languages[normalizedLang], normalizedLang)
    } else {
      console.warn(`Language '${language}' not supported by Prism`)
      return code
    }
  } catch (error) {
    console.error('Error highlighting code:', error)
    return code
  }
}

export function createHighlightedCodeBlock(code, language = 'javascript') {
  const highlighted = highlightCode(code, language)
  return `<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>`
}

export const HIGHLIGHT_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'markup', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'php', label: 'PHP' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' }
]