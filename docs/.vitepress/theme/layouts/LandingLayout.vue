<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, lang } = useData()

const t = (key: string, fallback: string) => {
  return frontmatter.value[key] || fallback
}

const prefix = computed(() => lang.value === 'en' ? '' : `/${lang.value}`)
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
              src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
              alt="Sponsored by Evil Martians"
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
  background-color: var(--vp-c-brand-3);
  color: var(--vp-c-white);
}

.btn-brand:hover {
  background-color: var(--vp-c-brand-1);
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
</style>
