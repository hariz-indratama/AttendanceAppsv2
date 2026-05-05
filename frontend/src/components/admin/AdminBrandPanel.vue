<script setup lang="ts">
// AdminBrandPanel - Left branded panel with logo, tagline, features, stats
</script>

<template>
  <div class="brand-panel">
    <div class="brand-inner">
      <!-- Logo mark -->
      <div class="logo-mark">
        <svg viewBox="0 0 40 40" fill="none">
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="8"
            fill="#6366f1"
            fill-opacity="0.15"
          />
          <rect
            x="2"
            y="2"
            width="36"
            height="36"
            rx="8"
            stroke="#6366f1"
            stroke-width="1.5"
          />
          <path
            d="M12 20h16M20 12v16"
            stroke="#6366f1"
            stroke-width="2"
            stroke-linecap="round"
          />
          <circle cx="20" cy="20" r="4" fill="#22d3ee" />
        </svg>
      </div>

      <div class="brand-text">
        <h1 class="brand-name">Attendance</h1>
        <p class="brand-role">Admin Portal</p>
      </div>

      <!-- Decorative grid lines -->
      <div class="grid-lines" aria-hidden="true">
        <span v-for="n in 6" :key="n" class="grid-line" />
      </div>

      <!-- Bottom tagline -->
      <div class="brand-footer">
        <p class="brand-tagline">
          Manage your workforce<br />from a single command center.
        </p>
        <div class="accent-line" aria-hidden="true" />
      </div>
    </div>

    <!-- Scanning animation line -->
    <div class="scan-line" aria-hidden="true" />
  </div>
</template>

<style scoped>
/* ── Left brand panel ───────────────────────────── */
.brand-panel {
  position: relative;
  background: var(--adm-bg);
  background-image:
    radial-gradient(
      circle at 50% 0%,
      rgba(99, 102, 241, 0.12) 0%,
      transparent 55%
    ),
    radial-gradient(
      circle at 1px 1px,
      rgba(255, 255, 255, 0.045) 1px,
      transparent 0
    );
  background-size:
    100% 100%,
    20px 20px;
  overflow: hidden;
  animation: panelReveal 500ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes panelReveal {
  from {
    opacity: 0;
    transform: translateX(-24px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.brand-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 2.5rem;
}

/* Logo */
.logo-mark {
  width: 56px;
  height: 56px;
  margin-bottom: 1.5rem;
}

.logo-mark svg {
  width: 100%;
  height: 100%;
}

.brand-text {
  margin-bottom: 3rem;
}

.brand-name {
  font-family: var(--adm-font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--adm-text);
  line-height: 1;
  text-transform: uppercase;
}

.brand-role {
  font-family: var(--adm-font-body);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--adm-accent);
  margin-top: 0.5rem;
}

/* Grid lines decoration */
.grid-lines {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 80px;
  padding: 3rem 0;
}

.grid-line {
  display: block;
  width: 1px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--adm-border) 30%,
    var(--adm-border) 70%,
    transparent
  );
}

/* Corner marks */
.brand-inner::before,
.brand-inner::after {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  border-color: var(--adm-accent);
  border-style: solid;
  opacity: 0.4;
}
.brand-inner::before {
  top: 2rem;
  right: 2rem;
  border-width: 2px 2px 0 0;
}
.brand-inner::after {
  bottom: 2rem;
  left: 2rem;
  border-width: 0 0 2px 2px;
}

/* Brand footer */
.brand-footer {
  margin-top: auto;
}

.brand-tagline {
  font-size: 0.875rem;
  color: var(--adm-muted);
  line-height: 1.6;
  max-width: 260px;
}

.accent-line {
  margin-top: 1.5rem;
  width: 40px;
  height: 3px;
  background: var(--adm-accent);
  border-radius: 2px;
  box-shadow: 0 0 12px var(--adm-accent-glow);
}

/* Scanning line animation */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--adm-highlight),
    transparent
  );
  box-shadow: 0 0 8px var(--adm-highlight-glow);
  animation: scan 4s ease-in-out infinite;
}

@keyframes scan {
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

/* ── Mobile adjustments ─────────────────────────── */
@media (max-width: 768px) {
  .brand-panel {
    padding: 2.5rem 2rem;
    min-height: 180px;
  }

  .brand-tagline {
    display: none;
  }
  .accent-line {
    margin-top: 0.75rem;
  }
  .grid-lines {
    display: none;
  }
}
</style>