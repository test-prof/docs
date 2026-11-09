<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const STEP = { flash: 1, fall: 2, stamp: 3, hop: 4 }
const TIMELINE: Array<[number, number]> = [
  [STEP.flash, 1000],
  [STEP.fall, 2300],
  [STEP.stamp, 3050],
  [STEP.hop, 4050],
]

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

const step = ref(0)
let timers: number[] = []

const clearTimers = () => {
  timers.forEach((id) => window.clearTimeout(id))
  timers = []
}

const play = () => {
  clearTimers()
  step.value = 0
  if (prefersReducedMotion()) {
    step.value = STEP.hop
    return
  }
  TIMELINE.forEach(([value, at]) => {
    timers.push(window.setTimeout(() => { step.value = value }, at))
  })
}

const navStamp = () => document.querySelector('.VPNavBar .nav-soon')

watch(step, (value) => navStamp()?.classList.toggle('hop', value >= STEP.hop))

onMounted(play)

const active = ref<string | null>(null)
let activeTimer: number | undefined

const highlight = (id: string) => {
  active.value = id
  window.clearTimeout(activeTimer)
  activeTimer = window.setTimeout(() => { active.value = null }, 2400)
}

onBeforeUnmount(() => {
  clearTimers()
  navStamp()?.classList.remove('hop')
  window.clearTimeout(activeTimer)
})

const parts = [
  { id: 'instructions', kind: 'direction', title: 'Instructions', text: 'Profiles a test sample, checks fixes in batches, stops on guardrails. Runs cheap and unattended in CI.' },
  { id: 'index', kind: 'direction', title: 'Index', text: 'The usual reasons Rails tests are slow and how to spot each one, so the agent gets to the fixes faster.' },
  { id: 'docs', kind: 'context', title: 'Docs', text: 'The TestProf docs, written with agents in mind. Which profiler to run, and how to read its report.' },
  { id: 'playbooks', kind: 'context', title: 'Playbooks', text: 'How to land the big wins, like <code>let_it_be</code> and FactoryDefault, without breaking a single spec.' },
  { id: 'examples', kind: 'context', title: 'Examples', text: 'Best practices from real Rails apps. Tests that got faster and stayed beautiful.' },
  { id: 'testprof', kind: 'verification', title: 'TestProf', text: 'The battle-tested profilers. They show where the time goes and prove the speedup is real.' },
]

const rows = [
  { name: 'Direction', kind: 'direction' },
  { name: 'Context', kind: 'context' },
  { name: 'Verification', kind: 'verification' },
]

const score = [
  { model: 'Sol 6.1 (xhigh)', plain: '0.28', docs: '0.56', pro: '0.83', win: true },
  { model: 'Luna 6 (max)', plain: '0.25', docs: '0.00', pro: '0.43', win: true },
  { model: 'DeepSeek v4.1 Flash (max)', plain: '0.00', docs: '0.00', pro: '0.57', win: true },
  { model: 'GLM 5.3 Flash (max)', plain: '0.30', docs: '–', pro: '0.92', win: true },
  { model: 'Opus 5.5 (medium)', plain: '0.91', docs: '0.91', pro: '0.94', win: true },
]

const speedup = [
  { model: 'Sol 6.1 (xhigh)', plain: '2.48x / 2.48x', docs: '2.51x / 2.51x', pro: '2.45x / 2.45x', win: false },
  { model: 'Luna 6 (max)', plain: '2.26x / 2.26x', docs: '–', pro: '2.20x / 2.20x', win: false },
  { model: 'DeepSeek v4.1 Flash (max)', plain: '–', docs: '–', pro: '3.22x / 3.23x', win: true },
  { model: 'GLM 5.3 Flash (max)', plain: '3.06x / 3.06x', docs: '–', pro: '3.27x / 3.43x', win: true },
  { model: 'Opus 5.5 (medium)', plain: '2.84x / 3.02x', docs: '2.92x / 3.05x', pro: '3.23x / 3.30x', win: true },
]

const tables = [
  { title: 'Score', note: 'Known issues fixed, plus best practices.', rows: score },
  { title: 'Speedup (avg / max)', note: 'How much faster model and request specs run.', rows: speedup },
]

const COLUMNS = ['plain', 'docs', 'pro'] as const
</script>

<template>
  <div class="pro">
    <!-- Hero -->
    <section class="hero">
      <h1 class="visually-hidden">TestPro is coming soon</h1>

      <div class="stage">
        <span class="title" aria-hidden="true">
          TestPro<span class="f" :class="{ fall: step >= STEP.fall, collapsed: step >= STEP.fall }">f</span>
          <span class="soon" :class="{ stamped: step >= STEP.stamp, hopping: step >= STEP.hop }">
            <span v-for="(letter, i) in 'SOON'" :key="i">{{ letter }}</span>
          </span>
        </span>

        <div class="blocks">
          <div class="flash" :class="{ on: step >= STEP.flash }" aria-hidden="true">
            <span class="band"></span>
            <span class="rays"></span>
            <span v-for="n in 6" :key="n" class="sparkle">✦</span>
          </div>

          <div v-for="row in rows" :key="row.name" class="row">
            <template v-if="row.kind !== 'verification'">
              <span class="chip group pending" :class="{ dissolve: step >= STEP.flash }" aria-hidden="true">{{ row.name }}</span>
              <span class="items">
                <a
                  v-for="part in parts.filter((p) => p.kind === row.kind)"
                  :key="part.id"
                  class="chip item"
                  :class="[`chip-${row.kind}`, { show: step >= STEP.flash }]"
                  :href="`#${part.id}`"
                  @click="highlight(part.id)"
                >{{ part.title }}</a>
              </span>
            </template>
            <a
              v-else
              class="chip group chip-verification swap"
              :class="{ swapped: step >= STEP.flash }"
              href="#testprof"
              @click="highlight('testprof')"
            >
              <span class="swap-from" aria-hidden="true">{{ row.name }}</span>
              <span class="swap-to">TestProf</span>
            </a>
          </div>
        </div>
      </div>

      <button class="replay" type="button" @click="play"><span class="replay-icon" aria-hidden="true">&#x21bb;</span>Replay</button>

      <p class="tagline">
        <span>TestProf plus the secret sauce for AI agents.</span>
        <span>Your agent knows where to look and what to fix.</span>
        <span>Battle-tested profilers prove the speedup is real.</span>
      </p>

      <div class="actions">
        <a class="btn btn-brand" href="https://evilmartians.com/?utm_source=test-prof-pro#contact-us" target="_blank" rel="noopener">Talk to us</a>
      </div>
    </section>

    <!-- Secret sauce -->
    <section class="parts">
      <div class="parts-inner">
        <h2>The secret sauce</h2>
        <div class="parts-grid">
          <div
            v-for="part in parts"
            :key="part.id"
            class="part"
            :class="{ active: active === part.id }"
          >
            <span :id="part.id" class="part-anchor"></span>
            <div class="part-head">
              <span class="part-kind" :class="`kind-${part.kind}`">{{ part.kind }}</span>
              <h3>{{ part.title }}</h3>
            </div>
            <p v-html="part.text"></p>
          </div>
        </div>
      </div>
    </section>

    <!-- Results -->
    <section class="results">
      <div class="results-inner">
        <p class="eyebrow">Sneak peek</p>
        <h2>Measured, not promised</h2>
        <p class="results-lead">
          Mastodon: 7.5k specs, ~10min test run.
          Make model and request specs at least 2x faster (in three steps).
          Work in progress.
        </p>

        <div class="tables">
          <div v-for="table in tables" :key="table.title" class="table-card">
            <h3>{{ table.title }}</h3>
            <p class="table-note">{{ table.note }}</p>
            <table>
              <thead>
                <tr><th>Model</th><th>No docs</th><th>Only docs</th><th>TestPro</th></tr>
              </thead>
              <tbody>
                <tr v-for="row in table.rows" :key="row.model">
                  <td>{{ row.model }}</td>
                  <td
                    v-for="column in COLUMNS"
                    :key="column"
                    :class="{ missing: row[column] === '–', win: column === 'pro' && row.win }"
                  >{{ row[column] }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <p>
        <a href="https://github.com/test-prof/test-prof" target="_blank" rel="noopener">GitHub</a>
        <span class="sep">&middot;</span>
        <a href="/guide/getting_started">Documentation</a>
        <span class="sep">&middot;</span>
        <a href="https://evilmartians.com/?utm_source=test-prof" target="_blank" rel="noopener">Evil Martians</a>
      </p>
      <p class="footer-badge">
        <a href="https://evilmartians.com/?utm_source=test-prof" target="_blank" rel="noopener">
          <img
            src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
            alt="Sponsored by Evil Martians"
            width="236"
            height="54"
          />
        </a>
      </p>
    </footer>
  </div>
</template>

<style scoped>
.pro {
  font-family: var(--vp-font-family-base);
  color: var(--vp-c-text-1);
}

/* Hero */
.hero {
  text-align: center;
  padding: 72px 24px 64px;
  overflow-x: clip;
}

.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  min-height: 260px;
}

/* Title */
.title {
  position: relative;
  display: inline-flex;
  align-items: baseline;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
}

.f {
  display: inline-block;
  pointer-events: none;
  max-width: 1ch;
  transform-origin: 20% 90%;
}

.f.fall {
  animation: fall 0.7s cubic-bezier(0.5, 0, 0.9, 0.6) forwards;
}

.f.collapsed {
  max-width: 0;
  transition: max-width 0.4s ease-in-out 0.35s;
}

@keyframes fall {
  25% { transform: rotate(35deg); }
  100% { opacity: 0; transform: translate(16px, 110px) rotate(120deg); }
}

/* SOON stamp */
.soon {
  position: absolute;
  left: calc(100% + 14px);
  top: 22%;
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 6px;
  background-color: var(--vp-c-danger-2);
  color: var(--vp-c-white);
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  opacity: 0;
  transform: translateY(-50%) rotate(-7deg);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.18);
}

.soon.stamped {
  animation: stamp 0.55s cubic-bezier(0.2, 1.4, 0.4, 1) forwards;
}

.soon span {
  display: inline-block;
}

.soon span:nth-child(2) { --i: 1; }
.soon span:nth-child(3) { --i: 2; }
.soon span:nth-child(4) { --i: 3; }

.soon.hopping span {
  animation: hop 0.4s ease-out calc(var(--i, 0) * 60ms);
}

@keyframes stamp {
  0% { opacity: 0; transform: translateY(-50%) scale(2.4) rotate(-22deg); }
  60% { opacity: 1; transform: translateY(-50%) scale(0.92) rotate(-4deg); }
  100% { opacity: 1; transform: translateY(-50%) scale(1) rotate(-7deg); }
}

@keyframes hop {
  40% { transform: translateY(-5px) rotate(-8deg); animation-timing-function: ease-in; }
  100% { transform: none; }
}

/* Blocks */
.blocks {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.row {
  display: grid;
  place-items: center;
  min-height: 40px;
}

.row > * {
  grid-area: 1 / 1;
}

.items {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.chip {
  display: inline-block;
  min-width: 120px;
  padding: 8.5px 16px 5.5px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-decoration: none;
  text-transform: uppercase;
}

a.chip:hover {
  box-shadow: 0 2px 8px rgba(144, 114, 160, 0.25);
}

.chip-direction {
  background-color: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

.chip-context {
  background-color: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-3);
}

.chip-verification {
  background-color: var(--vp-c-bg);
  border-color: var(--vp-c-brand-3);
  color: var(--vp-c-brand-3);
}

.group.pending {
  background-color: transparent;
  border: 1px dashed var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

.group {
  --at: 290ms;
}

.item[href="#docs"] { --at: 190ms; }
.item[href="#instructions"] { --at: 240ms; }
.item[href="#playbooks"] { --at: 290ms; }
.item[href="#index"] { --at: 350ms; }
.item[href="#examples"] { --at: 390ms; }

.group.dissolve {
  animation: dissolve 0.5s ease-in var(--at) forwards;
  pointer-events: none;
}

@keyframes dissolve {
  100% { opacity: 0; filter: blur(6px); transform: scale(1.15); letter-spacing: 0.3em; }
}

.item:not(.show),
.swap:not(.swapped) {
  pointer-events: none;
}

.item,
.swap-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateY(6px) scale(0.9);
}

.item.show,
.swap.swapped .swap-to {
  opacity: 1;
  filter: none;
  transform: none;
  transition: opacity 0.4s ease-out, filter 0.4s ease-out, transform 0.4s ease-out;
  transition-delay: var(--at);
}

.swap {
  display: inline-grid;
}

.swap > span {
  grid-area: 1 / 1;
}

.swap.swapped .swap-from {
  opacity: 0;
  filter: blur(6px);
  transition: opacity 0.2s ease-in, filter 0.2s ease-in;
  transition-delay: var(--at);
}

.swap.swapped .swap-to {
  transition-delay: calc(var(--at) + 80ms);
}

/* Flash */
.flash {
  position: absolute;
  inset: -16px -60px;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
  mask: radial-gradient(ellipse closest-side, #000 60%, transparent 100%);
}

.band {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 35%;
  background: linear-gradient(105deg, transparent 0%, color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent) 30%, color-mix(in srgb, var(--vp-c-brand-1) 75%, white) 50%, color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent) 70%, transparent 100%);
  filter: blur(6px);
  transform: translateX(-120%);
  opacity: 0;
}

.flash.on .band {
  animation: sweep 1s ease-in-out forwards;
}

@keyframes sweep {
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateX(320%); }
}

.rays {
  position: absolute;
  inset: -40px;
  background: repeating-conic-gradient(from 0deg, var(--vp-c-brand-1) 0deg 3deg, transparent 3deg 22deg);
  mask: radial-gradient(closest-side, #000 20%, transparent 100%);
  opacity: 0;
}

.flash.on .rays {
  animation: rays 0.9s ease-out 0.15s forwards;
}

@keyframes rays {
  30% { opacity: 0.45; transform: scale(1) rotate(8deg); }
  100% { opacity: 0; transform: scale(1.3) rotate(20deg); }
}

.sparkle {
  position: absolute;
  left: 50%;
  top: 50%;
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
  opacity: 0;
}

.sparkle:nth-child(1 of .sparkle) { --x: -150px; --y: -40px; --d: 0ms; }
.sparkle:nth-child(2 of .sparkle) { --x: 140px; --y: -50px; --d: 60ms; }
.sparkle:nth-child(3 of .sparkle) { --x: -190px; --y: 30px; --d: 120ms; }
.sparkle:nth-child(4 of .sparkle) { --x: 180px; --y: 20px; --d: 40ms; }
.sparkle:nth-child(5 of .sparkle) { --x: -60px; --y: -70px; --d: 160ms; }
.sparkle:nth-child(6 of .sparkle) { --x: 70px; --y: 70px; --d: 100ms; }

.flash.on .sparkle {
  animation: sparkle 0.9s ease-out calc(150ms + var(--d)) forwards;
}

@keyframes sparkle {
  30% { opacity: 1; transform: translate(var(--x), var(--y)) scale(1.3); }
  100% { opacity: 0; transform: translate(calc(var(--x) * 1.3), calc(var(--y) * 1.3)) scale(0.4); }
}

.replay {
  margin-top: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.replay:hover {
  color: var(--vp-c-brand-3);
}

.replay-icon {
  display: inline-block;
  margin-right: 5px;
}

.tagline {
  max-width: 800px;
  text-wrap: balance;
  margin: 24px auto 0;
  font-size: 1.2rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.tagline span {
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.btn {
  display: inline-block;
  padding: 11.5px 24px 8.5px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}

.btn-brand {
  background-color: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

.btn-brand:hover {
  background-color: var(--vp-c-brand-1);
}

/* Parts */
.parts {
  position: relative;
  padding: 48px 24px 64px;
  background-color: var(--vp-c-bg-soft);
}

.part-anchor {
  position: absolute;
  top: 0;
}

.parts-inner,
.results-inner {
  max-width: 960px;
  margin: 0 auto;
}

.parts h2,
.results h2 {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 24px;
}

.parts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.part {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.part.active {
  border-color: var(--vp-c-brand-1);
  animation: pulse 1s ease-out 0.4s 2;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 var(--vp-c-brand-soft); }
  50% { box-shadow: 0 0 0 10px var(--vp-c-brand-soft); }
  100% { box-shadow: 0 0 0 0 transparent; }
}

.part-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.part h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-brand-3);
}

.part p {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
}

.part-kind {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 2px 8px;
  border: 1px solid transparent;
  border-radius: 999px;
}

.kind-direction {
  background-color: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

.kind-context {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-3);
}

.kind-verification {
  border-color: var(--vp-c-brand-3);
  color: var(--vp-c-brand-3);
}

/* Results */
.results {
  padding: 48px 24px 64px;
}

.results-lead {
  max-width: 720px;
  margin: 0 auto 28px;
  text-align: center;
  color: var(--vp-c-text-2);
}

.tables {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 720px;
  margin: 0 auto;
}

.table-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 20px;
  overflow-x: auto;
}

.table-card h3 {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-brand-3);
  margin: 0 0 6px;
}

.table-note {
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  margin: 0 0 12px;
}

.eyebrow {
  width: fit-content;
  margin: 0 auto 12px;
  padding: 3.5px 10px 0.5px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-3);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

th,
td {
  padding: 6px 8px;
  text-align: right;
  border-bottom: 1px solid var(--vp-c-divider);
  white-space: nowrap;
}

th:first-child,
td:first-child {
  text-align: left;
}

th {
  font-weight: 600;
  color: var(--vp-c-text-2);
}

td {
  font-family: var(--vp-font-family-mono);
}

td:first-child {
  font-family: var(--vp-font-family-base);
}

td.missing {
  font-family: var(--vp-font-family-base);
  color: var(--vp-c-text-3);
}

td.win {
  font-weight: 500;
  color: var(--vp-c-brand-3);
}

/* Footer */
.footer {
  padding: 32px 24px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.footer a {
  color: var(--vp-c-brand-3);
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}

.footer-badge {
  margin-top: 16px !important;
  text-align: center;
}

.footer-badge a {
  display: inline-block;
}

.sep {
  margin: 0 8px;
  color: var(--vp-c-text-3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 48px 16px 40px;
  }

  .title {
    font-size: 2.8rem;
  }

  .soon {
    font-size: 0.8rem;
  }

  .chip {
    min-width: 0;
  }

  .results {
    padding: 40px 16px 48px;
  }

  th,
  td {
    padding: 6px 4px;
    white-space: normal;
  }

  .parts-grid {
    grid-template-columns: 1fr;
  }

  .part {
    position: relative;
  }
}

@media (min-width: 769px) and (max-width: 960px) {
  .parts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .title *,
  .blocks *,
  .part {
    animation: none !important;
    transition: none !important;
  }

  .flash,
  .group.dissolve,
  .f.fall {
    opacity: 0;
  }

  .soon.stamped {
    opacity: 1;
  }
}
</style>
