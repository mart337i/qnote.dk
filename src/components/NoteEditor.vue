<template>
  <div class="flex-1 flex flex-col min-h-0">
    <!-- Header -->
    <div class="flex-none p-4 border-b border-base-300 bg-base-100">
      <div class="flex items-center justify-between">
        <div class="flex-1 mr-4">
          <input
            v-model="noteTitle"
            @input="handleTitleChange"
            class="text-2xl font-bold text-base-content bg-transparent border-none outline-none w-full placeholder-base-content/50 focus:ring-0"
            placeholder="Enter note title..."
            type="text"
          />
          <p class="text-sm text-base-content/70 mt-0.5">{{ formattedDate }}</p>
        </div>
        <div class="flex items-center space-x-2">
          <!-- Auto-save indicator -->
          <div class="flex items-center text-xs text-base-content/50">
            <i class="fas fa-save mr-1"></i>
            <span>{{ saveStatus }}</span>
          </div>
          <!-- Storage indicator -->
          <div class="badge badge-outline badge-xs">
            {{ isLoggedIn ? 'Cloud' : 'Local' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quill Editor -->
    <div class="flex-1 min-h-0 p-4 overflow-hidden flex flex-col">
      <div
        ref="editorContainer"
        class="quill-editor-container flex-1 min-h-0"
        role="textbox"
        aria-label="Note editor"
        aria-multiline="true"
        tabindex="0"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, nextTick } from 'vue'
import { formatDate } from '@/utils/dateHelpers'
import Quill from 'quill'
import DOMPurify from 'dompurify'
import 'quill/dist/quill.snow.css'
import CodeMirrorBlot from '@/blots/CodeMirrorBlot.js'

// Register the CodeMirror blot before any Quill instance is created
Quill.register(CodeMirrorBlot)

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  selectedNoteId: {
    type: String,
    default: null,
  },
  saveStatus: {
    type: String,
    required: true,
  },
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'noteChange', 'titleChange'])

const editorContainer = ref(null)
let quillEditor = null
let isInternalUpdate = false
let isUserTyping = false
let typingTimeout = null

const noteTitle = ref('')

watch(
  () => props.title,
  newTitle => {
    noteTitle.value = newTitle || ''
  },
  { immediate: true }
)

const handleTitleChange = () => {
  emit('titleChange', noteTitle.value)
}

const formattedDate = computed(() => {
  return formatDate(props.selectedDate)
})

onMounted(async () => {
  await nextTick()
  initializeQuill()
})

const initializeQuill = () => {
  if (!editorContainer.value) return

  try {
    // Minimal Google Docs-style toolbar
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [1, 2, 3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      [{ color: [] }],
      // Named align buttons via a custom container (replaces the icon-only picker)
      [
        { align: '' },
        { align: 'center' },
        { align: 'right' },
        { align: 'justify' },
      ],
      ['clean'],
    ]

    quillEditor = new Quill(editorContainer.value, {
      theme: 'snow',
      modules: {
        toolbar: {
          container: toolbarOptions,
          handlers: {
            // Override code-block to insert a CodeMirror blot instead of ql-syntax
            'code-block': function () {
              const range = this.quill.getSelection(true)
              const [, offset] = this.quill.getLine(range.index)
              const atLineStart = offset === 0
              const insertAt = range.index

              if (!atLineStart) {
                this.quill.insertText(insertAt, '\n', Quill.sources.USER)
              }

              this.quill.insertEmbed(
                atLineStart ? insertAt : insertAt + 1,
                'code-mirror-block',
                { language: 'javascript', content: '' },
                Quill.sources.USER
              )
              // Move cursor past the blot
              this.quill.setSelection(
                (atLineStart ? insertAt : insertAt + 1) + 1,
                0,
                Quill.sources.SILENT
              )
            },
          },
        },
      },
      placeholder: 'Start writing your thoughts for today...',
      formats: [
        'bold',
        'italic',
        'underline',
        'strike',
        'header',
        'blockquote',
        'list',
        'indent',
        'link',
        'color',
        'align',
        'code-mirror-block',
        // inline formats needed for text inside headings
        'script',
      ],
    })

    // Set initial content
    if (props.modelValue) {
      isInternalUpdate = true
      setEditorContent(props.modelValue)
      isInternalUpdate = false
    }

    quillEditor.on('text-change', (delta, oldDelta, source) => {
      if (isInternalUpdate) return
      try {
        if (source === 'user') {
          isUserTyping = true
          if (typingTimeout) clearTimeout(typingTimeout)
          typingTimeout = setTimeout(() => {
            isUserTyping = false
          }, 500)
        }
        // Serialize CM blots to data-only divs so the live CM DOM is never saved
        emit('update:modelValue', getCleanHTML())
        emit('noteChange')
      } catch (error) {
        console.error('Error handling text change:', error)
      }
    })

    quillEditor.on('selection-change', (range, oldRange, source) => {
      if (source === 'user' && range === null && oldRange !== null) {
        const format = quillEditor.getFormat(oldRange.index, oldRange.length)
        if (format.list) {
          setTimeout(() => {
            if (quillEditor && !quillEditor.hasFocus()) {
              quillEditor.focus()
              quillEditor.setSelection(oldRange)
            }
          }, 10)
        }
      }
    })
  } catch (error) {
    console.error('Error initializing Quill editor:', error)
  }
}

/**
 * Safely swap the editor content:
 * 1. Destroy any live CodeMirror instances so they don't leak
 * 2. Set the sanitised HTML on quillEditor.root
 * 3. Re-mount CodeMirror on any bare blot divs Quill left behind
 */
function setEditorContent(html) {
  if (!quillEditor) return
  // Destroy existing CM instances before wiping the DOM
  CodeMirrorBlot.destroyAll(quillEditor.root)

  const sanitized = html
    ? DOMPurify.sanitize(html, {
        ADD_TAGS: ['div'],
        ADD_ATTR: ['data-language', 'data-content', 'class', 'contenteditable'],
      })
    : ''

  quillEditor.root.innerHTML = sanitized

  // Mount CM on every bare blot node now sitting in quillEditor.root
  CodeMirrorBlot.mountAll(quillEditor.root)
}

/**
 * Produce a clean HTML string for storage:
 * - Clone the editor DOM
 * - Replace every live CM block (with full CM children) with a bare data-only div
 * - Return the clone's innerHTML
 * This prevents the live CodeMirror DOM tree from being persisted to localStorage.
 */
function getCleanHTML() {
  if (!quillEditor) return ''
  const clone = quillEditor.root.cloneNode(true)
  clone.querySelectorAll('.ql-code-mirror-block').forEach(node => {
    const bare = document.createElement('div')
    bare.className = 'ql-code-mirror-block'
    bare.setAttribute(
      'data-language',
      node.getAttribute('data-language') || 'javascript'
    )
    bare.setAttribute('data-content', node.getAttribute('data-content') || '')
    bare.setAttribute('contenteditable', 'false')
    node.replaceWith(bare)
  })
  return clone.innerHTML
}

watch(
  () => props.modelValue,
  newValue => {
    if (quillEditor && !isInternalUpdate && !isUserTyping) {
      try {
        isInternalUpdate = true
        setEditorContent(newValue || '')
      } catch (error) {
        console.error('Error updating editor content:', error)
      } finally {
        isInternalUpdate = false
      }
    }
  }
)

watch([() => props.selectedDate, () => props.selectedNoteId], () => {
  if (quillEditor) {
    try {
      isInternalUpdate = true
      setEditorContent(props.modelValue || '')
    } catch (error) {
      console.error('Error reinitializing editor content:', error)
    } finally {
      isInternalUpdate = false
    }
  }
})
</script>

<!-- Scoped: only the container layout class -->
<style scoped>
.quill-editor-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>

<!-- Global: all Quill overrides — must be unscoped so plain CSS beats Quill Snow -->
<style>
/* ── Toolbar shell ───────────────────────────────────────────────────── */
.ql-toolbar.ql-snow {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.5rem 0.5rem 0 0 !important;
  padding: 6px 8px !important;
  flex-shrink: 0;
}

.ql-snow .ql-formats {
  margin-right: 4px !important;
}
.ql-snow .ql-formats:not(:last-child) {
  border-right: 1px solid hsl(var(--bc) / 0.1) !important;
  padding-right: 4px !important;
  margin-right: 4px !important;
}

/* ── Toolbar buttons ─────────────────────────────────────────────────── */
.ql-snow.ql-toolbar button,
.ql-snow .ql-toolbar button {
  float: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 28px !important;
  height: 28px !important;
  padding: 4px !important;
  margin: 1px !important;
  border-radius: 4px !important;
  background: transparent !important;
  border: none !important;
  color: hsl(var(--bc) / 0.6) !important;
  cursor: pointer !important;
}
.ql-snow.ql-toolbar button:hover,
.ql-snow .ql-toolbar button:hover,
.ql-snow.ql-toolbar button.ql-active,
.ql-snow .ql-toolbar button.ql-active {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}
.ql-snow.ql-toolbar button svg,
.ql-snow .ql-toolbar button svg {
  float: none !important;
  width: 16px !important;
  height: 16px !important;
}

/* SVG icons follow currentColor */
.ql-snow .ql-stroke {
  stroke: currentColor !important;
}
.ql-snow .ql-fill,
.ql-snow .ql-stroke.ql-fill {
  fill: currentColor !important;
}

/* Kill Quill's hardcoded #06c on hover/active */
.ql-snow.ql-toolbar button:hover .ql-stroke,
.ql-snow .ql-toolbar button:hover .ql-stroke,
.ql-snow.ql-toolbar button.ql-active .ql-stroke,
.ql-snow .ql-toolbar button.ql-active .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item:hover .ql-stroke,
.ql-snow.ql-toolbar .ql-picker-item.ql-selected .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected .ql-stroke {
  stroke: currentColor !important;
}

.ql-snow.ql-toolbar button:hover .ql-fill,
.ql-snow .ql-toolbar button:hover .ql-fill,
.ql-snow.ql-toolbar button.ql-active .ql-fill,
.ql-snow .ql-toolbar button.ql-active .ql-fill {
  fill: currentColor !important;
}

/* ── Pickers (header / align / color) ───────────────────────────────── */
.ql-snow .ql-picker {
  color: hsl(var(--bc) / 0.6) !important;
  float: none !important;
  display: inline-block !important;
  vertical-align: middle !important;
}

/* Picker label */
.ql-toolbar.ql-snow .ql-picker-label {
  color: hsl(var(--bc) / 0.6) !important;
  border: 1px solid transparent !important;
  border-radius: 4px !important;
  background: transparent !important;
}
.ql-toolbar.ql-snow .ql-picker-label:hover,
.ql-toolbar.ql-snow .ql-picker.ql-expanded .ql-picker-label {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
  border-color: transparent !important;
}
/* Kill Quill's grey-out when expanded */
.ql-snow .ql-picker.ql-expanded .ql-picker-label {
  color: hsl(var(--bc)) !important;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-stroke {
  stroke: currentColor !important;
}
.ql-snow .ql-picker.ql-expanded .ql-picker-label .ql-fill {
  fill: currentColor !important;
}

/* Heading picker label text — uniform size */
.ql-snow .ql-picker.ql-header .ql-picker-label::before {
  font-size: 0.875rem !important;
  line-height: 22px !important;
}

/* ── Dropdown panel ──────────────────────────────────────────────────── */
.ql-snow .ql-picker-options,
.ql-toolbar.ql-snow .ql-picker-options {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 6px 20px hsl(var(--bc) / 0.15) !important;
  padding: 4px !important;
  z-index: 9999 !important;
}

/* Dropdown items — uniform font size (kills Quill's 2em/1.5em on heading items) */
.ql-snow .ql-picker-options .ql-picker-item {
  color: hsl(var(--bc)) !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  border-radius: 4px !important;
  padding: 5px 10px !important;
  display: block !important;
}
/* Override Quill Snow's heading item font sizes explicitly */
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  font-size: 0.875rem !important;
}
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  font-size: 0.875rem !important;
}

.ql-snow.ql-toolbar .ql-picker-item:hover,
.ql-snow .ql-toolbar .ql-picker-item:hover {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}
.ql-snow.ql-toolbar .ql-picker-item.ql-selected,
.ql-snow .ql-toolbar .ql-picker-item.ql-selected {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}

/* ── Align buttons — show text labels instead of SVG icons ──────────── */
/* Hide the SVG and show a text pseudo-element instead */
.ql-snow .ql-toolbar button.ql-align svg,
.ql-snow.ql-toolbar button.ql-align svg {
  display: none !important;
}
.ql-snow .ql-toolbar button.ql-align,
.ql-snow.ql-toolbar button.ql-align {
  width: auto !important;
  padding: 4px 7px !important;
  font-size: 0.72rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.01em !important;
}
/* Left (value="") */
.ql-snow .ql-toolbar button.ql-align[value='']::after,
.ql-snow.ql-toolbar button.ql-align[value='']::after {
  content: 'Left';
}
/* Center */
.ql-snow .ql-toolbar button.ql-align[value='center']::after,
.ql-snow.ql-toolbar button.ql-align[value='center']::after {
  content: 'Center';
}
/* Right */
.ql-snow .ql-toolbar button.ql-align[value='right']::after,
.ql-snow.ql-toolbar button.ql-align[value='right']::after {
  content: 'Right';
}
/* Justify */
.ql-snow .ql-toolbar button.ql-align[value='justify']::after,
.ql-snow.ql-toolbar button.ql-align[value='justify']::after {
  content: 'Justify';
}

/* Color picker swatches — keep them visible */
.ql-snow .ql-color-picker .ql-picker-item {
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 2px !important;
}
.ql-toolbar.ql-snow .ql-color-picker .ql-picker-item:hover,
.ql-toolbar.ql-snow .ql-color-picker .ql-picker-item.ql-selected {
  border-color: hsl(var(--bc)) !important;
}

/* ── Container & Editor ──────────────────────────────────────────────── */
.ql-container.ql-snow {
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-top: none !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
  font-family: inherit !important;
  background: hsl(var(--b1)) !important;
  /* flex sizing handled by container div */
  height: auto !important;
  overflow-y: auto !important;
}

.ql-editor {
  color: hsl(var(--bc)) !important;
  font-family: inherit !important;
  font-size: 1rem !important;
  line-height: 1.7 !important;
  padding: 1.25rem 1.5rem !important;
  min-height: 200px !important;
}

.ql-editor.ql-blank::before {
  color: hsl(var(--bc) / 0.35) !important;
  font-style: normal !important;
  left: 1.5rem !important;
  right: 1.5rem !important;
}

/* Align */
.ql-editor .ql-align-center {
  text-align: center !important;
}
.ql-editor .ql-align-right {
  text-align: right !important;
}
.ql-editor .ql-align-justify {
  text-align: justify !important;
}

/* ── Headings ────────────────────────────────────────────────────────── */
.ql-editor h1 {
  font-size: 2rem !important;
  font-weight: 700 !important;
  line-height: 1.25 !important;
  margin: 1.5rem 0 0.5rem !important;
  color: hsl(var(--bc)) !important;
  border-bottom: 1px solid hsl(var(--bc) / 0.12) !important;
  padding-bottom: 0.3rem !important;
}
.ql-editor h2 {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
  line-height: 1.3 !important;
  margin: 1.25rem 0 0.4rem !important;
  color: hsl(var(--bc)) !important;
}
.ql-editor h3 {
  font-size: 1.2rem !important;
  font-weight: 600 !important;
  line-height: 1.35 !important;
  margin: 1rem 0 0.35rem !important;
  color: hsl(var(--bc)) !important;
}
.ql-editor h4,
.ql-editor h5,
.ql-editor h6 {
  font-size: 1rem !important;
  font-weight: 600 !important;
  margin: 0.75rem 0 0.25rem !important;
  color: hsl(var(--bc)) !important;
}

/* ── Body content ────────────────────────────────────────────────────── */
.ql-editor p {
  margin: 0 0 0.4rem !important;
}
.ql-editor blockquote {
  border-left: 3px solid hsl(var(--p)) !important;
  margin: 0.75rem 0 !important;
  padding: 0.5rem 0 0.5rem 1rem !important;
  color: hsl(var(--bc) / 0.75) !important;
  font-style: italic !important;
  background: hsl(var(--b2)) !important;
  border-radius: 0 0.375rem 0.375rem 0 !important;
}
.ql-editor ol,
.ql-editor ul {
  padding-left: 1.5rem !important;
  margin: 0.4rem 0 !important;
}
.ql-editor li {
  margin: 0.15rem 0 !important;
}

.ql-editor code {
  background: hsl(var(--b2)) !important;
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.25rem !important;
  padding: 0.1rem 0.35rem !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 0.85em !important;
  color: hsl(var(--bc)) !important;
}
.ql-editor pre.ql-syntax {
  background: hsl(var(--b2)) !important;
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.5rem !important;
  padding: 1rem !important;
  margin: 0.75rem 0 !important;
  overflow-x: auto !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 0.875rem !important;
  line-height: 1.6 !important;
  color: hsl(var(--bc)) !important;
}

/* ── CodeMirror blot ─────────────────────────────────────────────────── */
.ql-code-mirror-block {
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.5rem !important;
  overflow: hidden !important;
  margin: 0.75rem 0 !important;
  display: block !important;
}
.ql-code-mirror-block .cm-block-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 5px 10px !important;
  background: hsl(var(--b3)) !important;
  border-bottom: 1px solid hsl(var(--bc) / 0.12) !important;
}
.ql-code-mirror-block .cm-lang-select {
  background: transparent !important;
  border: none !important;
  color: hsl(var(--bc) / 0.75) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  outline: none !important;
  font-family: inherit !important;
}
.ql-code-mirror-block .cm-copy-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 4px !important;
  background: transparent !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  color: hsl(var(--bc) / 0.6) !important;
  font-size: 0.72rem !important;
  padding: 2px 8px !important;
  border-radius: 3px !important;
  cursor: pointer !important;
  font-family: inherit !important;
}
.ql-code-mirror-block .cm-copy-btn:hover {
  background: hsl(var(--bc) / 0.08) !important;
  color: hsl(var(--bc)) !important;
  border-color: hsl(var(--bc) / 0.3) !important;
}
.ql-code-mirror-block .cm-editor {
  background: hsl(var(--b2)) !important;
}
.ql-code-mirror-block .cm-gutters {
  background: hsl(var(--b3)) !important;
  border-right: 1px solid hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc) / 0.35) !important;
}

/* ── Link tooltip ────────────────────────────────────────────────────── */
.ql-snow .ql-tooltip {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.15) !important;
  border-radius: 0.5rem !important;
  color: hsl(var(--bc)) !important;
  box-shadow: 0 6px 20px hsl(var(--bc) / 0.15) !important;
  padding: 8px 12px !important;
}
.ql-snow .ql-tooltip input[type='text'] {
  background: hsl(var(--b2)) !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-radius: 0.375rem !important;
  color: hsl(var(--bc)) !important;
  padding: 4px 10px !important;
  font-family: inherit !important;
  font-size: 0.875rem !important;
  height: auto !important;
}
.ql-snow .ql-tooltip a.ql-action::after {
  color: hsl(var(--p)) !important;
}
.ql-snow .ql-tooltip a.ql-remove::before {
  color: hsl(var(--er)) !important;
}
</style>
