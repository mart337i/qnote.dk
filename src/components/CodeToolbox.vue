<template>
  <div class="code-toolbox">
    <!-- Code Format Button -->
    <button
      @click="formatSelectedCode"
      class="btn btn-sm btn-ghost tooltip tooltip-bottom"
      data-tip="Format Code"
      :disabled="!hasSelection"
    >
      <i class="fas fa-code"></i>
    </button>

    <!-- Language Selector -->
    <div class="dropdown dropdown-end">
      <label tabindex="0" class="btn btn-sm btn-ghost tooltip tooltip-bottom" data-tip="Syntax Highlighting">
        <i class="fas fa-palette"></i>
        <span class="text-xs ml-1">{{ selectedLanguage.label }}</span>
      </label>
      <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 max-h-60 overflow-y-auto">
        <li v-for="lang in HIGHLIGHT_LANGUAGES" :key="lang.value">
          <a @click="applyHighlighting(lang.value)" :class="{ 'active': selectedLanguage.value === lang.value }">
            {{ lang.label }}
          </a>
        </li>
      </ul>
    </div>

    <!-- Code Block Button -->
    <button
      @click="insertCodeBlock"
      class="btn btn-sm btn-ghost tooltip tooltip-bottom"
      data-tip="Insert Code Block"
    >
      <i class="fas fa-terminal"></i>
    </button>

    <!-- Inline Code Button -->
    <button
      @click="toggleInlineCode"
      class="btn btn-sm btn-ghost tooltip tooltip-bottom"
      data-tip="Inline Code"
      :class="{ 'btn-active': isInlineCodeActive }"
    >
      <i class="fas fa-code"></i>
      <span class="text-xs">inline</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { formatCode, detectLanguage, SUPPORTED_LANGUAGES } from '@/utils/codeFormatter'
import { highlightCode, createHighlightedCodeBlock, HIGHLIGHT_LANGUAGES } from '@/utils/syntaxHighlighter'

const props = defineProps({
  quillEditor: {
    type: Object,
    required: true
  }
})

const selectedLanguage = ref(HIGHLIGHT_LANGUAGES[0])
const hasSelection = ref(false)
const isInlineCodeActive = ref(false)

const checkSelection = () => {
  if (!props.quillEditor) return
  
  const selection = props.quillEditor.getSelection()
  hasSelection.value = selection && selection.length > 0
  
  if (selection) {
    const format = props.quillEditor.getFormat(selection.index, selection.length)
    isInlineCodeActive.value = !!format.code
  }
}

const formatSelectedCode = async () => {
  if (!props.quillEditor || !hasSelection.value) return
  
  const selection = props.quillEditor.getSelection()
  if (!selection) return
  
  const text = props.quillEditor.getText(selection.index, selection.length)
  const detectedLang = detectLanguage(text)
  
  try {
    const formatted = await formatCode(text, detectedLang)
    props.quillEditor.deleteText(selection.index, selection.length)
    props.quillEditor.insertText(selection.index, formatted)
    props.quillEditor.setSelection(selection.index, formatted.length)
  } catch (error) {
    console.error('Error formatting code:', error)
  }
}

const applyHighlighting = (language) => {
  selectedLanguage.value = HIGHLIGHT_LANGUAGES.find(lang => lang.value === language) || HIGHLIGHT_LANGUAGES[0]
  
  if (!props.quillEditor || !hasSelection.value) return
  
  const selection = props.quillEditor.getSelection()
  if (!selection) return
  
  const text = props.quillEditor.getText(selection.index, selection.length)
  const highlightedBlock = createHighlightedCodeBlock(text, language)
  
  props.quillEditor.deleteText(selection.index, selection.length)
  props.quillEditor.clipboard.dangerouslyPasteHTML(selection.index, highlightedBlock)
}

const insertCodeBlock = () => {
  if (!props.quillEditor) return
  
  const selection = props.quillEditor.getSelection() || { index: 0, length: 0 }
  const codeBlock = `\n\`\`\`${selectedLanguage.value}\n// Your code here\n\`\`\`\n`
  
  props.quillEditor.insertText(selection.index, codeBlock)
  props.quillEditor.setSelection(selection.index + codeBlock.indexOf('// Your code here'), '// Your code here'.length)
}

const toggleInlineCode = () => {
  if (!props.quillEditor) return
  
  const selection = props.quillEditor.getSelection()
  if (!selection) return
  
  const format = props.quillEditor.getFormat(selection.index, selection.length)
  props.quillEditor.format('code', !format.code)
  isInlineCodeActive.value = !format.code
}

onMounted(() => {
  if (props.quillEditor) {
    props.quillEditor.on('selection-change', checkSelection)
    checkSelection()
  }
})

onUnmounted(() => {
  if (props.quillEditor) {
    props.quillEditor.off('selection-change', checkSelection)
  }
})
</script>

<style scoped>
.code-toolbox {
  @apply flex items-center space-x-1 border-l border-base-300 pl-2 ml-2;
}

.btn-active {
  @apply bg-primary text-primary-content;
}
</style>