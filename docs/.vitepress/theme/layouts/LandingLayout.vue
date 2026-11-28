<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()

const t = (key: string, fallback: string) => {
  return frontmatter.value[key] || fallback
}

const prefix = computed(() => lang.value === 'en' ? '' : `/${lang.value}`)

// Same cyber week deadline as the TestPro page: end of 11 Dec 2026, Pacific time.
const PROMO_ENDS_AT = Date.parse('2026-12-12T08:00:00Z')
const promoActive = ref(Date.now() < PROMO_ENDS_AT)
onMounted(() => {
  promoActive.value = Date.now() < PROMO_ENDS_AT
})
</script>

<template>
  <div class="landing">
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-heading">
          <img
            class="hero-logo"
            src="/assets/images/logo.svg"
            alt="TestProf"
          />
          <div class="hero-text">
            <h1 class="hero-title">{{ t('heroTitle', 'Ruby tests profiling and optimization toolbox') }}</h1>
            <p class="hero-tagline">{{ t('heroTagline', 'Identify bottlenecks. Write faster tests. Ship with confidence.') }}</p>
          </div>
        </div>
        <div class="hero-actions">
          <a class="btn btn-brand" :href="`${prefix}/guide/getting_started`">{{ t('getStarted', 'Get Started') }}</a>
          <a v-if="lang === 'en'" class="btn btn-alt" href="/guide/playbook">Playbook</a>
          <a
            class="btn btn-alt"
            href="https://github.com/test-prof/test-prof"
            target="_blank"
            rel="noopener"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- TestPro preview -->
    <section v-if="lang === 'en'" class="pro-preview">
      <div class="pro-card">
        <div class="pro-text">
          <p class="pro-eyebrow">New: TestPro</p>
          <h2>Make your Rails tests twice as fast with the agent you already use</h2>
          <p>
            Your coding agents run your tests 3 to 10 times per task. TestPro gives Claude Code, Codex or Cursor our catalog of slow-test causes and measures every fix, so the suite gets faster and stays green.
          </p>
          <div class="pro-actions">
            <a class="btn btn-alt" href="/pro">See TestPro</a>
            <a class="btn btn-alt" href="/pro#pricing">Pricing</a>
          </div>
          <p v-if="promoActive" class="pro-promo"><strong>Launch price:</strong> half off your first year if you buy by December 11.</p>
        </div>
        <dl class="pro-stats">
          <div>
            <dt>Median speed-up</dt>
            <dd>2.4x <span>vs 1.8x with TestProf alone</span></dd>
          </div>
          <div>
            <dt>Rails apps where TestPro wins</dt>
            <dd>11 of 12</dd>
          </div>
          <div>
            <dt>Starts at</dt>
            <dd>$395 <span>a year</span></dd>
          </div>
        </dl>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="features-inner">
        <div class="feature-card">
          <h3>Ruby Profilers</h3>
          <p>{{ t('featureProfilers', 'Plug\'n\'Play integration with ruby-prof, Stackprof and Vernier. Profile your test suite with a single environment variable.') }}</p>
        </div>
        <div class="feature-card">
          <h3>Factory Profiling</h3>
          <p>{{ t('featureFactory', 'Analyze factory usage and identify factory cascades.') }}</p>
        </div>
        <div class="feature-card">
          <h3>Event Profiler</h3>
          <p>{{ t('featureEvent', 'Profile built-in ActiveSupport notifications and custom events to identify slow operations across your test suite.') }}</p>
        </div>
        <div class="feature-card">
          <h3>before_all &amp; let_it_be</h3>
          <p>{{ t('featureBeforeAll', 'Run expensive setup once and share across examples. Dramatically reduce test suite time with minimal changes.') }}</p>
        </div>
        <div class="feature-card">
          <h3>AnyFixture</h3>
          <p>{{ t('featureAnyFixture', 'Create persistent fixtures from factory-generated data. Combine the flexibility of factories with fixture performance.') }}</p>
        </div>
        <div class="feature-card">
          <h3>FactoryDefault</h3>
          <p>{{ t('featureFactoryDefault', 'Eliminate factory cascades by reusing associated records.') }}</p>
        </div>
      </div>
    </section>

    <!-- Map -->
    <section class="map-section">
      <div class="map-inner">
        <p class="map-lead">{{ t('mapLead', '...and more! Explore the full TestProf toolkit:') }}</p>
        <a href="http://bit.ly/test-prof-map-v1" target="_blank" rel="noopener">
          <img src="/assets/images/coggle.png" alt="TestProf map" class="map-image" />
        </a>
      </div>
    </section>

    <!-- Who uses TestProf -->
    <section class="users-section">
      <div class="users-inner">
        <h2>{{ t('usersTitle', 'Who uses TestProf') }}</h2>
        <div class="users-tags">
          <a class="user-tag" href="https://github.com/discourse/discourse" target="_blank" rel="noopener">
            <span class="user-tag-name">Discourse</span>
            <span class="user-tag-stat">-27% suite time</span>
          </a>
          <a class="user-tag" href="https://gitlab.com/gitlab-org/gitlab-ce" target="_blank" rel="noopener">
            <span class="user-tag-name">GitLab</span>
            <span class="user-tag-stat">-39% API tests time</span>
          </a>
          <a class="user-tag" href="https://evilmartians.com/chronicles/the-whop-chop-how-we-cut-a-rails-test-suite-and-ci-time-in-half" target="_blank" rel="noopener">
            <span class="user-tag-name">Whop</span>
            <span class="user-tag-stat">-50% CI time</span>
          </a>
          <a class="user-tag" href="https://github.com/mastodon/mastodon" target="_blank" rel="noopener">
            <span class="user-tag-name">Mastodon</span>
          </a>
          <a class="user-tag" href="https://github.com/opf/openproject" target="_blank" rel="noopener">
            <span class="user-tag-name">Open Project</span>
          </a>
        </div>
        <p class="users-more">
          <a href="https://github.com/test-prof/test-prof/discussions/73" target="_blank" rel="noopener">{{ t('usersMore', '...and many others') }}</a>
        </p>
      </div>
    </section>

    <!-- Resources -->
    <section class="resources-section">
      <div class="resources-inner">
        <h2>{{ t('resourcesTitle', 'Resources') }}</h2>
        <div class="resources-grid">
          <a class="resource-card" href="https://evilmartians.com/events/from-slow-to-go-rails-test-profiling-hands-on-railsconf-2024" target="_blank" rel="noopener">
            <span class="resource-type">Workshop</span>
            <span class="resource-title">From slow to go: Rails test profiling hands-on</span>
          </a>
          <a class="resource-card" href="https://evilmartians.com/events/profiling-ruby-tests-with-swiss-precision-helvetic-ruby" target="_blank" rel="noopener">
            <span class="resource-type">Talk</span>
            <span class="resource-title">Profiling Ruby tests with Swiss precision</span>
          </a>
          <a class="resource-card" href="https://evilmartians.com/chronicles/railing-against-time-tools-and-techniques-that-got-us-5x-faster-results" target="_blank" rel="noopener">
            <span class="resource-type">Article</span>
            <span class="resource-title">Railing against time: tools and techniques that got us 5x faster results</span>
          </a>
          <a class="resource-card" href="https://evilmartians.com/chronicles/testprof-a-good-doctor-for-slow-ruby-tests" target="_blank" rel="noopener">
            <span class="resource-type">Article</span>
            <span class="resource-title">TestProf: a good doctor for slow Ruby tests</span>
          </a>
          <a class="resource-card" href="https://evilmartians.com/chronicles/testprof-2-factory-therapy-for-your-ruby-tests-rspec-minitest" target="_blank" rel="noopener">
            <span class="resource-type">Article</span>
            <span class="resource-title">TestProf II: factory therapy for your Ruby tests</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <p>
          <a href="https://github.com/test-prof/test-prof" target="_blank" rel="noopener">GitHub</a>
          <span class="sep">&middot;</span>
          <a :href="`${prefix}/guide/getting_started`">{{ t('footerDocs', 'Documentation') }}</a>
          <span class="sep">&middot;</span>
          <a href="https://evilmartians.com/?utm_source=test-prof" target="_blank" rel="noopener">Evil Martians</a>
        </p>
        <p class="footer-badge">
          <a href="https://evilmartians.com/?utm_source=test-prof" target="_blank" rel="noopener">
            <img
              class="badge-light"
              src="https://evilmartians.com/badges/sponsored-by-evil-martians_v2.0.svg"
              alt="Built by Evil Martians"
              width="236"
              height="54"
            />
            <img
              class="badge-dark"
              src="https://evilmartians.com/badges/sponsored-by-evil-martians_v2.0_for-dark-bg.svg"
              alt="Built by Evil Martians"
              width="236"
              height="54"
            />
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.landing {
  font-family: var(--vp-font-family-base);
  color: var(--vp-c-text-1);
}

/* Hero */
.hero {
  text-align: center;
  padding: 80px 24px 64px;
}

.hero-inner {
  max-width: 720px;
  margin: 0 auto;
}

.hero-heading {
  display: flex;
  align-items: center;
  gap: 32px;
  justify-content: center;
  margin-bottom: 8px;
}

.hero-text {
  text-align: left;
}

.hero-logo {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

.hero-title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--vp-c-brand-3);
  margin: 0 0 8px;
}

.hero-tagline {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  margin: 0;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
}

.btn {
  display: inline-block;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
}

.btn-brand {
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
}

.btn-brand:hover {
  background-color: var(--vp-button-brand-hover-bg);
}

.btn-alt {
  background-color: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.btn-alt:hover {
  background-color: var(--vp-c-default-3);
}

/* Features */
.features {
  padding: 48px 24px 64px;
  background-color: var(--vp-c-bg-soft);
}

.features-inner {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.feature-card {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s;
}

.feature-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.feature-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--vp-c-brand-3);
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
  margin: 0;
  line-height: 1.5;
}

/* Who uses TestProf */
.users-section {
  padding: 48px 24px;
  text-align: center;
}

.users-inner {
  max-width: 720px;
  margin: 0 auto;
}

.users-inner h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px;
}

.users-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.user-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.user-tag:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(144, 114, 160, 0.12);
}

.user-tag-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.user-tag-stat {
  font-size: 0.8rem;
  color: var(--vp-c-brand-3);
  font-weight: 600;
}

.users-more {
  margin-top: 20px;
  font-size: 0.9rem;
}

.users-more a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}

.users-more a:hover {
  color: var(--vp-c-brand-3);
}

/* Resources */
.resources-section {
  padding: 48px 24px 64px;
  background-color: var(--vp-c-bg-soft);
}

.resources-inner {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.resources-inner h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px;
}

.resources-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  text-align: left;
}

.resource-card {
  display: block;
  padding: 16px 20px;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.resource-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(144, 114, 160, 0.1);
}

.resource-type {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--vp-c-brand-3);
  margin-bottom: 4px;
}

.resource-title {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

/* Map */
.map-section {
  padding: 32px 24px 64px;
  text-align: center;
}

.map-inner {
  max-width: 860px;
  margin: 0 auto;
}

.map-lead {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin: 0 0 20px;
}

.map-image {
  max-width: 100%;
  height: auto;
}

/* Footer */
.landing-footer {
  padding: 32px 24px;
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

.footer-inner p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2);
}

.footer-badge {
  margin-top: 16px !important;
  text-align: center;
}

.footer-badge a {
  display: inline-block;
}

.footer-inner a {
  color: var(--vp-c-brand-3);
  text-decoration: none;
}

.footer-inner a:hover {
  text-decoration: underline;
}

.sep {
  margin: 0 8px;
  color: var(--vp-c-text-3);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    padding: 48px 20px 40px;
  }

  .hero-heading {
    flex-direction: column;
    gap: 16px;
  }

  .hero-text {
    text-align: center;
  }

  .hero-logo {
    width: 100px;
    height: 100px;
  }

  .hero-title {
    font-size: 1.6rem;
  }

  .features-inner {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .resources-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 960px) {
  .features-inner {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* TestPro preview */
.pro-preview {
  padding: 0 24px 56px;
}

.pro-card {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 32px;
  align-items: center;
  padding: 32px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 16px;
  background-color: var(--vp-c-bg);
}

.pro-eyebrow {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-brand-3);
}

.pro-text h2 {
  margin: 6px 0 10px;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.25;
}

.pro-text p {
  margin: 0;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}

.pro-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 20px;
}

.pro-text .pro-promo {
  margin-top: 16px;
  font-size: 0.9rem;
  color: var(--vp-c-brand-3);
}

.pro-stats {
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0 0 0 32px;
  border-left: 1px solid var(--vp-c-divider);
}

.pro-stats dt {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}

.pro-stats dd {
  margin: 2px 0 0;
  font-size: 1.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pro-stats dd span {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

@media (max-width: 768px) {
  .pro-card {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .pro-stats {
    padding: 24px 0 0;
    border-left: 0;
    border-top: 1px solid var(--vp-c-divider);
  }
}

.badge-dark,
.dark .badge-light {
  display: none;
}

.dark .badge-dark {
  display: inline;
}


</style>
