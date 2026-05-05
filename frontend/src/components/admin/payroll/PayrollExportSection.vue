<script setup lang="ts">
// ─── Props & Emits ─────────────────────────────────────────────────────────────

interface Props {
  monthLabel: string
  selectedYear: number
  selectedMonth: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'download-export': [format: 'xlsx' | 'pdf']
}>()

// ─── Event Handlers ─────────────────────────────────────────────────────────────

function onExportXlsx(): void {
  emit('download-export', 'xlsx')
}

function onExportPdf(): void {
  emit('download-export', 'pdf')
}
</script>

<template>
  <div class="payroll-export-section">
    <div class="flex flex-wrap gap-3">
      <!-- Export Excel -->
      <button
        @click="onExportXlsx"
        class="export-btn"
      >
        <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        </svg>
        Export Excel
      </button>

      <!-- Export PDF -->
      <button
        @click="onExportPdf"
        class="export-btn"
      >
        <svg class="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Export PDF
      </button>
    </div>

    <p class="text-xs text-muted mt-3">
      Exports payroll for
      {{ monthLabel }} {{ selectedYear }}.
      Make sure to calculate the preview first.
    </p>
  </div>
</template>

<style scoped>
.payroll-export-section {
  --admin-bg: #0a0f1a;
  --admin-card: #111827;
  --admin-border: #1e2d45;
  --admin-text: #f1f5f9;
  --admin-text-secondary: #8b9bb4;
  --admin-text-muted: #4a5568;
  --admin-accent: #10b981;
  --admin-danger: #f87171;

  color: var(--admin-text);
}

/* ─── Color & style classes ──────────────────────────────────── */
.text-muted     { color: var(--admin-text-muted); }
.text-accent    { color: var(--admin-accent); }
.text-danger    { color: var(--admin-danger); }

/* ─── Export buttons ────────────────────────────────────────── */
.export-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: var(--admin-card);
  border: 1px solid var(--admin-border);
  color: var(--admin-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.75rem;
  transition: background 0.15s, color 0.15s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
.export-btn:hover {
  background: var(--admin-bg);
  color: var(--admin-text);
}
</style>
