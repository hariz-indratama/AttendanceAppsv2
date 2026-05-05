<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ToastContainer } from '@/components/shared'
</script>

<template>
  <ToastContainer />
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  min-height: 100vh;
}
</style>