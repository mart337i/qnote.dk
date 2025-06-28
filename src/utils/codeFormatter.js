export async function formatCode(code, language = 'javascript') {
  try {
    // Simple formatting for common cases without Prettier dependencies
    const trimmed = code.trim()
    
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
      case 'jsx':
      case 'typescript':
      case 'ts':
      case 'tsx':
        return formatJavaScript(trimmed)
      case 'json':
        return formatJSON(trimmed)
      case 'css':
      case 'scss':
        return formatCSS(trimmed)
      case 'html':
        return formatHTML(trimmed)
      default:
        return addProperIndentation(trimmed)
    }
  } catch (error) {
    console.error('Error formatting code:', error)
    return code
  }
}

function formatJavaScript(code) {
  // Basic JavaScript formatting
  let formatted = code
    .replace(/;/g, ';\n')
    .replace(/\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/,/g, ',\n')
  
  return addProperIndentation(formatted)
}

function formatJSON(code) {
  try {
    const parsed = JSON.parse(code)
    return JSON.stringify(parsed, null, 2)
  } catch (error) {
    return code
  }
}

function formatCSS(code) {
  let formatted = code
    .replace(/\{/g, ' {\n')
    .replace(/\}/g, '\n}\n')
    .replace(/;/g, ';\n')
    .replace(/,/g, ',\n')
  
  return addProperIndentation(formatted)
}

function formatHTML(code) {
  // Basic HTML formatting
  let formatted = code
    .replace(/></g, '>\n<')
    .replace(/^\s+|\s+$/gm, '')
  
  return addProperIndentation(formatted)
}

function addProperIndentation(code) {
  const lines = code.split('\n')
  let indentLevel = 0
  const indentSize = 2
  
  return lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    
    // Decrease indent for closing brackets
    if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
    
    const indented = ' '.repeat(indentLevel * indentSize) + trimmed
    
    // Increase indent for opening brackets
    if (trimmed.endsWith('{') || trimmed.endsWith('[') || 
        (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>'))) {
      indentLevel++
    }
    
    return indented
  }).join('\n')
}

export function detectLanguage(code) {
  const trimmed = code.trim()
  
  // HTML detection
  if (trimmed.startsWith('<') && trimmed.includes('>')) {
    return 'html'
  }
  
  // CSS detection
  if (trimmed.includes('{') && trimmed.includes('}') && trimmed.includes(':')) {
    return 'css'
  }
  
  // JSON detection
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch (e) {
      // Not valid JSON
    }
  }
  
  // TypeScript detection
  if (trimmed.includes('interface ') || trimmed.includes('type ') || 
      trimmed.includes(': string') || trimmed.includes(': number') ||
      trimmed.includes('import type')) {
    return 'typescript'
  }
  
  // JSX detection
  if (trimmed.includes('jsx') || trimmed.includes('<') && trimmed.includes('/>')) {
    return 'jsx'
  }
  
  // Default to JavaScript
  return 'javascript'
}

export const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'JSX' },
  { value: 'tsx', label: 'TSX' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' }
]