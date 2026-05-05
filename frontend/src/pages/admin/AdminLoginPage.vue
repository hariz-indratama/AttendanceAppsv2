<script setup lang="ts">
import AdminBrandPanel from '@/components/admin/AdminBrandPanel.vue'
import AdminLoginForm from '@/components/admin/AdminLoginForm.vue'
</script>

<template>
  <div class="adm-login login-root">
    <AdminBrandPanel />
    <AdminLoginForm />
  </div>
</template>

<style scoped>
/* ── Root layout ─────────────────────────────────── */
.login-root {
  display: grid;
  grid-template-columns: 40% 1fr;
  min-height: 100vh;
  font-family: var(--adm-font-body);
  background: var(--adm-bg);
  color: var(--adm-text);
}

@media (max-width: 768px) {
  .login-root {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
</style>