<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{ checkoutUrl?: (plan: 'starter' | 'team' | 'business') => string }>()

const WORKING_DAYS_PER_YEAR = 21 * 12
const WEEKS_PER_YEAR = 52
const SPEEDUP = 1.5
const WAITING_SHARE = 1 / 3
const PRS_PER_DAY = 2
const RUNS_PER_PR = 2
const RUNNER_PRICE = 0.012
const RUNNERS = 4
const STARTER_MAX_DEVELOPERS = 5
const STARTER_PER_YEAR = 395
const TEAM_MAX_DEVELOPERS = 20
const TEAM_PER_YEAR = 995
const BUSINESS_PER_YEAR = 4900

const developers = ref(20)
const minutesPerRun = ref(20)

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const count = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const plural = (n: number, word: string) => `${count.format(n)} ${word}${n === 1 ? '' : 's'}`

const chipGroups = [
  {
    name: 'calc-team',
    legend: 'Team size',
    options: [
      { value: 1, label: 'Just me' },
      { value: 5, label: 'Small' },
      { value: 20, label: 'Medium' },
      { value: 50, label: 'Big' },
    ],
    model: developers,
  },
  {
    name: 'calc-run',
    legend: 'CI run time',
    options: [10, 20, 40].map((v) => ({ value: v, label: `${v} min` })),
    model: minutesPerRun,
  },
]

const savedShare = 1 - 1 / SPEEDUP
const runsPerYear = computed(() => developers.value * PRS_PER_DAY * RUNS_PER_PR * WORKING_DAYS_PER_YEAR)
const ciSaved = computed(() => runsPerYear.value * minutesPerRun.value * RUNNERS * RUNNER_PRICE * savedShare)
const waitingHours = computed(() => (runsPerYear.value * minutesPerRun.value * savedShare * WAITING_SHARE) / 60)
const plan = computed(() => {
  if (developers.value <= STARTER_MAX_DEVELOPERS) return { key: 'starter' as const, name: 'Starter', price: STARTER_PER_YEAR }
  if (developers.value <= TEAM_MAX_DEVELOPERS) return { key: 'team' as const, name: 'Team', price: TEAM_PER_YEAR }
  return { key: 'business' as const, name: 'Business', price: BUSINESS_PER_YEAR }
})
const paybackWeeks = computed(() =>
  ciSaved.value >= plan.value.price ? Math.ceil((WEEKS_PER_YEAR * plan.value.price) / ciSaved.value) : null,
)
</script>

<template>
  <div class="calc">
    <div class="calc-inputs">
      <fieldset v-for="group in chipGroups" :key="group.name" class="calc-group">
        <legend>{{ group.legend }}</legend>
        <div class="calc-chips">
          <label v-for="option in group.options" :key="String(option.value)" class="calc-chip">
            <input
              v-model="group.model.value"
              class="visually-hidden"
              type="radio"
              :name="group.name"
              :value="option.value"
            />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </fieldset>
    </div>

    <div class="calc-results" aria-live="polite" aria-atomic="true">
      <p v-if="paybackWeeks !== null" class="calc-headline">
        TestPro pays for itself in about <strong>{{ plural(paybackWeeks, 'week') }}</strong>
      </p>
      <p v-else class="calc-headline">
        TestPro saves you <strong>{{ plural(waitingHours, 'hour') }}</strong> of waiting a year
      </p>

      <dl class="calc-numbers">
        <div>
          <dt>CI minutes saved</dt>
          <dd>{{ dollars.format(ciSaved) }} a year</dd>
        </div>
        <div>
          <dt>Developer time saved</dt>
          <dd>{{ plural(waitingHours, 'hour') }} a year</dd>
        </div>
      </dl>

      <details class="calc-details">
        <summary>Assumptions</summary>
        <p class="calc-assumptions">
        Assumes {{ plural(developers, 'developer') }} shipping {{ PRS_PER_DAY }} PRs a day with {{ RUNS_PER_PR }} CI runs each, a {{ SPEEDUP }}x faster CI run
        on {{ RUNNERS }} GitHub runners at ${{ RUNNER_PRICE }} a minute, developers waiting for a third of each run,
        and TestPro {{ plan.name }} at {{ dollars.format(plan.price) }} a year.
        </p>
      </details>

      <a v-if="props.checkoutUrl" class="calc-buy" :href="props.checkoutUrl(plan.key)">Buy {{ plan.name }}</a>
    </div>
  </div>
</template>

<style scoped>
.calc {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 24px;
}

.calc-inputs,
.calc-results {
  min-width: 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background-color: var(--vp-c-bg);
}

.calc-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
}

.calc-group + .calc-group {
  margin-top: 18px;
}

.calc-group legend {
  padding: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.calc-chips {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  width: max-content;
  gap: 4px;
  margin-top: 8px;
}

.calc-chip span {
  display: block;
  text-align: center;
  padding: 6px 8px 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s, color 0.2s;
}

.calc-chip:hover span {
  border-color: var(--vp-c-brand-3);
}

.calc-chip input:checked + span {
  border-color: var(--vp-c-brand-3);
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-3);
  text-shadow: 0 0 0.6px currentColor;
}

.calc-chip input:focus-visible + span {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.calc-headline {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.3;
  text-wrap: balance;
}

.calc-headline strong {
  color: var(--vp-c-brand-3);
}

.calc-numbers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0 0;
  padding-top: 24px;
  border-top: 1px solid var(--vp-c-divider);
}

.calc-numbers dt {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.calc-numbers dd {
  margin: 4px 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-1);
}

.calc-assumptions {
  margin: 24px 0 0;
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .calc {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .calc-numbers {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 400px) {
  .calc-inputs,
  .calc-results {
    padding: 16px;
  }

  .calc-chips {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .calc * {
    transition: none !important;
  }
}

.calc-buy {
  display: inline-block;
  margin-top: 20px;
  padding: 11.5px 24px 8.5px;
  border-radius: 8px;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;
}

.calc-buy:hover {
  background-color: var(--vp-button-brand-hover-bg);
}


.calc {
  align-items: start;
}

.calc-details {
  margin-top: 20px;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.calc-details summary {
  cursor: pointer;
}

.calc-details .calc-assumptions {
  margin-top: 8px;
}

</style>
