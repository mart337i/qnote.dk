<template>
  <div class="p-4 border-t border-base-300">
    <div class="dropdown dropdown-top dropdown-end w-full">
      <div tabindex="0" class="btn btn-ghost btn-sm w-full justify-start gap-2">
        <svg
          width="16"
          height="16"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <span class="flex-1 text-left">{{ currentTheme }}</span>
        <svg
          width="12px"
          height="12px"
          class="fill-current opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"/>
        </svg>
      </div>
      <div class="dropdown-content bg-base-200 text-base-content rounded-box max-h-96 w-52 overflow-y-auto shadow-2xl mb-2">
        <div class="grid grid-cols-1 gap-3 p-3">
          <div
            v-for="theme in availableThemes"
            :key="theme"
            @click="changeTheme(theme)"
            class="outline-base-content overflow-hidden rounded-lg outline-2 outline-offset-2 cursor-pointer"
            :class="{ 'outline': currentTheme === theme }"
            :data-theme="theme"
          >
            <div :data-theme="theme" class="bg-base-100 text-base-content w-full font-sans">
              <div class="grid grid-cols-5 grid-rows-3">
                <div class="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4">
                  <div class="flex-grow text-sm font-bold">{{ theme }}</div>
                  <div class="flex flex-shrink-0 flex-wrap gap-1">
                    <div class="bg-primary w-2 rounded"></div>
                    <div class="bg-secondary w-2 rounded"></div>
                    <div class="bg-accent w-2 rounded"></div>
                    <div class="bg-neutral w-2 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

const { currentTheme, availableThemes, changeTheme } = useTheme()
</script>