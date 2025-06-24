<template>
  <div class="flex-1 flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b border-base-300 bg-base-100">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-base-content">{{ noteTitle }}</h2>
          <p class="text-sm text-base-content/70">{{ formattedDate }}</p>
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
    <div class="flex-1 p-4 overflow-hidden">
      <div 
        ref="editorContainer"
        class="quill-editor-container"
        style="height: calc(100vh - 200px);"
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
import { formatDate, formatNoteTitle } from '@/utils/dateHelpers'
import Quill from 'quill'
import DOMPurify from 'dompurify'
import 'quill/dist/quill.snow.css'

const props = defineProps({
  modelValue: {
    type: String,
    required: true
  },
  selectedDate: {
    type: String,
    required: true
  },
  selectedNoteId: {
    type: String,
    default: null
  },
  saveStatus: {
    type: String,
    required: true
  },
  isLoggedIn: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'noteChange'])

const editorContainer = ref(null)
let quillEditor = null
let isInternalUpdate = false

const noteTitle = computed(() => {
  const dayTitle = formatNoteTitle(props.selectedDate)
  if (props.selectedNoteId) {
    // You can enhance this to show the actual note title from your data
    return dayTitle
  }
  return dayTitle
})

const formattedDate = computed(() => {
  return formatDate(props.selectedDate)
})

onMounted(async () => {
  await nextTick()
  initializeQuill()
})

const initializeQuill = () => {
  if (!editorContainer.value) {
    console.error('Editor container not found')
    return
  }

  try {
    // Quill configuration
    const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['link']
  ]

  quillEditor = new Quill(editorContainer.value, {
    theme: 'snow',
    modules: {
      toolbar: toolbarOptions
    },
    placeholder: 'Start writing your thoughts for today...',
    formats: [
      'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
      'header', 'list', 'script', 'indent', 'direction', 'size', 'color',
      'background', 'font', 'align', 'link'
    ]
  })

  // Set initial content with sanitization
  if (props.modelValue) {
    isInternalUpdate = true
    const sanitizedContent = DOMPurify.sanitize(props.modelValue)
    quillEditor.root.innerHTML = sanitizedContent
    isInternalUpdate = false
  }

    // Listen for text changes
    quillEditor.on('text-change', () => {
      if (isInternalUpdate) return
      
      try {
        const html = quillEditor.root.innerHTML
        emit('update:modelValue', html)
        emit('noteChange')
      } catch (error) {
        console.error('Error handling text change:', error)
      }
    })
  } catch (error) {
    console.error('Error initializing Quill editor:', error)
  }
}

// Watch for prop changes to update editor content
watch(() => props.modelValue, (newValue) => {
  if (quillEditor && !isInternalUpdate) {
    try {
      isInternalUpdate = true
      const currentContent = quillEditor.root.innerHTML
      const sanitizedNewValue = newValue ? DOMPurify.sanitize(newValue) : ''
      if (currentContent !== sanitizedNewValue) {
        quillEditor.root.innerHTML = sanitizedNewValue
      }
    } catch (error) {
      console.error('Error updating editor content:', error)
    } finally {
      isInternalUpdate = false
    }
  }
})

// Watch for date changes to reinitialize if needed
watch([() => props.selectedDate, () => props.selectedNoteId], () => {
  if (quillEditor) {
    try {
      isInternalUpdate = true
      const sanitizedContent = props.modelValue ? DOMPurify.sanitize(props.modelValue) : ''
      quillEditor.root.innerHTML = sanitizedContent
    } catch (error) {
      console.error('Error reinitializing editor content:', error)
    } finally {
      isInternalUpdate = false
    }
  }
})
</script>

<style scoped>
.quill-editor-container {
  @apply w-full h-full overflow-y-auto;
}

/* Reset and override DaisyUI conflicts for Quill */
:deep(.ql-toolbar) {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-bottom: 1px solid hsl(var(--bc) / 0.2) !important;
  border-radius: 0.5rem 0.5rem 0 0 !important;
  padding: 8px !important;
}

:deep(.ql-container) {
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-top: none !important;
  border-radius: 0 0 0.5rem 0.5rem !important;
  font-family: inherit !important;
  background: hsl(var(--b1)) !important;
  height: calc(100% - 42px) !important;
  overflow-y: auto !important;
}

:deep(.ql-editor) {
  color: hsl(var(--bc)) !important;
  font-family: inherit !important;
  font-size: 1rem !important;
  line-height: 1.625 !important;
  padding: 1rem !important;
  border: none !important;
  outline: none !important;
  min-height: 100% !important;
}

:deep(.ql-editor.ql-blank::before) {
  color: hsl(var(--bc) / 0.5) !important;
  font-style: normal !important;
}

/* Fix DaisyUI button conflicts */
:deep(.ql-toolbar button) {
  background: transparent !important;
  border: none !important;
  color: hsl(var(--bc) / 0.7) !important;
  padding: 5px !important;
  margin: 1px !important;
  border-radius: 3px !important;
  width: 28px !important;
  height: 28px !important;
  cursor: pointer !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.15s ease !important;
}

:deep(.ql-toolbar button:hover) {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}

:deep(.ql-toolbar button.ql-active) {
  background: hsl(var(--p)) !important;
  color: hsl(var(--pc)) !important;
}

:deep(.ql-toolbar button svg) {
  width: 18px !important;
  height: 18px !important;
}

/* Fix picker dropdowns */
:deep(.ql-toolbar .ql-picker) {
  color: hsl(var(--bc) / 0.7) !important;
}

:deep(.ql-toolbar .ql-picker-label) {
  background: transparent !important;
  border: none !important;
  color: hsl(var(--bc) / 0.7) !important;
  cursor: pointer !important;
  padding: 5px 8px !important;
  border-radius: 3px !important;
  transition: all 0.15s ease !important;
}

:deep(.ql-toolbar .ql-picker-label:hover) {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}

:deep(.ql-toolbar .ql-picker.ql-expanded .ql-picker-label) {
  background: hsl(var(--bc) / 0.1) !important;
  color: hsl(var(--bc)) !important;
}

:deep(.ql-picker-options) {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  margin-top: 4px !important;
  padding: 4px !important;
  z-index: 1000 !important;
}

:deep(.ql-picker-item) {
  color: hsl(var(--bc)) !important;
  padding: 6px 12px !important;
  cursor: pointer !important;
  border-radius: 3px !important;
  transition: all 0.15s ease !important;
}

:deep(.ql-picker-item:hover) {
  background: hsl(var(--bc) / 0.1) !important;
}

:deep(.ql-picker-item.ql-selected) {
  background: hsl(var(--p)) !important;
  color: hsl(var(--pc)) !important;
}

/* Fix tooltip styles */
:deep(.ql-tooltip) {
  background: hsl(var(--b1)) !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-radius: 0.5rem !important;
  color: hsl(var(--bc)) !important;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  padding: 8px 12px !important;
}

:deep(.ql-tooltip input) {
  background: hsl(var(--b2)) !important;
  border: 1px solid hsl(var(--bc) / 0.2) !important;
  border-radius: 0.375rem !important;
  color: hsl(var(--bc)) !important;
  padding: 6px 12px !important;
  outline: none !important;
  font-family: inherit !important;
  font-size: 0.875rem !important;
}

:deep(.ql-tooltip input:focus) {
  border-color: hsl(var(--p)) !important;
  box-shadow: 0 0 0 3px hsl(var(--p) / 0.1) !important;
}

:deep(.ql-tooltip .ql-action) {
  background: hsl(var(--p)) !important;
  color: hsl(var(--pc)) !important;
  border: none !important;
  border-radius: 0.375rem !important;
  padding: 6px 12px !important;
  margin-left: 8px !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  transition: all 0.15s ease !important;
}

:deep(.ql-tooltip .ql-action:hover) {
  background: hsl(var(--pf)) !important;
}

:deep(.ql-tooltip .ql-remove) {
  background: hsl(var(--er)) !important;
  color: hsl(var(--erc)) !important;
  border: none !important;
  border-radius: 0.375rem !important;
  padding: 6px 12px !important;
  margin-left: 4px !important;
  cursor: pointer !important;
  font-size: 0.875rem !important;
  transition: all 0.15s ease !important;
}

:deep(.ql-tooltip .ql-remove:hover) {
  background: hsl(var(--er) / 0.8) !important;
}

/* Fix stroke and fill colors for icons */
:deep(.ql-snow .ql-stroke) {
  stroke: currentColor !important;
}

:deep(.ql-snow .ql-fill) {
  fill: currentColor !important;
}

/* Fix separator styling */
:deep(.ql-toolbar .ql-formats) {
  margin-right: 8px !important;
}

:deep(.ql-toolbar .ql-formats:not(:last-child)) {
  border-right: 1px solid hsl(var(--bc) / 0.1) !important;
  padding-right: 8px !important;
}
</style>