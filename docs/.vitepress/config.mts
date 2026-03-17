import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import { availableSinceMarkdownPlugin } from './availableSinceMarkdownPlugin'

const guideSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'Getting Started', link: '/guide/getting_started' },
      { text: 'Playbook', link: '/guide/playbook' },
    ]
  },
  {
    text: 'Profilers',
    items: [
      { text: 'Ruby Profilers', link: '/guide/profilers/ruby_profilers' },
      { text: 'Event Profiler', link: '/guide/profilers/event_prof' },
      { text: 'Tag Profiler', link: '/guide/profilers/tag_prof' },
      { text: 'Factory Doctor', link: '/guide/profilers/factory_doctor' },
      { text: 'Factory Profiler', link: '/guide/profilers/factory_prof' },
      { text: 'RSpecDissect Profiler', link: '/guide/profilers/rspec_dissect' },
      { text: 'Memory Profiler', link: '/guide/profilers/memory_prof' },
      { text: 'TPS Profiler', link: '/guide/profilers/tps_prof' },
    ]
  },
  {
    text: 'Recipes',
    items: [
      { text: 'before_all Hook', link: '/guide/recipes/before_all' },
      { text: 'let_it_be Helper', link: '/guide/recipes/let_it_be' },
      { text: 'AnyFixture', link: '/guide/recipes/any_fixture' },
      { text: 'FactoryDefault', link: '/guide/recipes/factory_default' },
      { text: 'FactoryAllStub', link: '/guide/recipes/factory_all_stub' },
      { text: 'RSpec Stamp', link: '/guide/recipes/rspec_stamp' },
      { text: 'Tests Sampling', link: '/guide/recipes/tests_sampling' },
      { text: 'Rails Logging', link: '/guide/recipes/logging' },
    ]
  },
  {
    text: 'Misc',
    items: [
      { text: 'RuboCop cops', link: '/guide/misc/rubocop' },
    ]
  },
]

const ruGuideSidebar = [
  {
    text: 'Начало работы',
    items: [
      { text: 'Начало работы', link: '/ru/guide/getting_started' },
    ]
  },
  {
    text: 'Профайлеры',
    items: [
      { text: 'Ruby-профайлеры', link: '/ru/guide/profilers/ruby_prof' },
      { text: 'Event Profiler', link: '/ru/guide/profilers/event_prof' },
      { text: 'Tag Profiler', link: '/ru/guide/profilers/tag_prof' },
      { text: 'Factory Doctor', link: '/ru/guide/profilers/factory_doctor' },
      { text: 'Factory Profiler', link: '/ru/guide/profilers/factory_prof' },
      { text: 'RSpecDissect Profiler', link: '/ru/guide/profilers/rspec_dissect' },
    ]
  },
  {
    text: 'Рецепты',
    items: [
      { text: 'before_all', link: '/ru/guide/recipes/before_all' },
      { text: 'let_it_be', link: '/ru/guide/recipes/let_it_be' },
      { text: 'AnyFixture', link: '/ru/guide/recipes/any_fixture' },
      { text: 'FactoryDefault', link: '/ru/guide/recipes/factory_default' },
      { text: 'FactoryAllStub', link: '/ru/guide/recipes/factory_all_stub' },
      { text: 'RSpec Stamp', link: '/ru/guide/recipes/rspec_stamp' },
      { text: 'Сэмплирование тестов', link: '/ru/guide/recipes/tests_sampling' },
      { text: 'Логирование Rails', link: '/ru/guide/recipes/logging' },
    ]
  },
  {
    text: 'Разное',
    items: [
      { text: 'RuboCop копы', link: '/ru/guide/misc/rubocop' },
    ]
  },
]

const jaGuideSidebar = [
  {
    text: 'はじめに',
    items: [
      { text: 'はじめに', link: '/ja/guide/getting_started' },
      { text: 'プレイブック', link: '/ja/guide/playbook' },
    ]
  },
  {
    text: 'プロファイラー',
    items: [
      { text: 'Ruby プロファイラー', link: '/ja/guide/profilers/ruby_profilers' },
      { text: 'Event Profiler', link: '/ja/guide/profilers/event_prof' },
      { text: 'Tag Profiler', link: '/ja/guide/profilers/tag_prof' },
      { text: 'Factory Doctor', link: '/ja/guide/profilers/factory_doctor' },
      { text: 'Factory Profiler', link: '/ja/guide/profilers/factory_prof' },
      { text: 'RSpecDissect Profiler', link: '/ja/guide/profilers/rspec_dissect' },
      { text: 'Memory Profiler', link: '/ja/guide/profilers/memory_prof' },
    ]
  },
  {
    text: 'レシピ',
    items: [
      { text: 'before_all フック', link: '/ja/guide/recipes/before_all' },
      { text: 'let_it_be ヘルパー', link: '/ja/guide/recipes/let_it_be' },
      { text: 'AnyFixture', link: '/ja/guide/recipes/any_fixture' },
      { text: 'FactoryDefault', link: '/ja/guide/recipes/factory_default' },
      { text: 'FactoryAllStub', link: '/ja/guide/recipes/factory_all_stub' },
      { text: 'RSpec Stamp', link: '/ja/guide/recipes/rspec_stamp' },
      { text: 'テストサンプリング', link: '/ja/guide/recipes/tests_sampling' },
      { text: 'Rails ログ', link: '/ja/guide/recipes/logging' },
    ]
  },
  {
    text: 'その他',
    items: [
      { text: 'RuboCop cops', link: '/ja/guide/misc/rubocop' },
    ]
  },
]

const zhCnGuideSidebar = [
  {
    text: '快速开始',
    items: [
      { text: '快速开始', link: '/zh-cn/guide/getting_started' },
      { text: 'Playbook', link: '/zh-cn/guide/playbook' },
    ]
  },
  {
    text: '分析器',
    items: [
      { text: 'Ruby 分析器', link: '/zh-cn/guide/profilers/ruby_profilers' },
      { text: 'Event Profiler', link: '/zh-cn/guide/profilers/event_prof' },
      { text: 'Tag Profiler', link: '/zh-cn/guide/profilers/tag_prof' },
      { text: 'Factory Doctor', link: '/zh-cn/guide/profilers/factory_doctor' },
      { text: 'Factory Profiler', link: '/zh-cn/guide/profilers/factory_prof' },
      { text: 'RSpecDissect Profiler', link: '/zh-cn/guide/profilers/rspec_dissect' },
      { text: 'Memory Profiler', link: '/zh-cn/guide/profilers/memory_prof' },
    ]
  },
  {
    text: '秘诀',
    items: [
      { text: 'before_all 钩子', link: '/zh-cn/guide/recipes/before_all' },
      { text: 'let_it_be 助手', link: '/zh-cn/guide/recipes/let_it_be' },
      { text: 'AnyFixture', link: '/zh-cn/guide/recipes/any_fixture' },
      { text: 'FactoryDefault', link: '/zh-cn/guide/recipes/factory_default' },
      { text: 'FactoryAllStub', link: '/zh-cn/guide/recipes/factory_all_stub' },
      { text: 'RSpec Stamp', link: '/zh-cn/guide/recipes/rspec_stamp' },
      { text: '测试采样', link: '/zh-cn/guide/recipes/tests_sampling' },
      { text: 'Rails 日志', link: '/zh-cn/guide/recipes/logging' },
    ]
  },
  {
    text: '其他',
    items: [
      { text: 'RuboCop cops', link: '/zh-cn/guide/misc/rubocop' },
    ]
  },
]

export default defineConfig({
  title: "TestProf",
  description: "Ruby tests profiling and optimization toolbox",

  cleanUrls: true,
  ignoreDeadLinks: true,

  vite: {
    plugins: [
      llmstxt(),
    ],
  },

  markdown: {
    config(md) {
      md.use(availableSinceMarkdownPlugin)
    },
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#a088ad' }],
    ['meta', { property: 'og:title', content: 'TestProf' }],
    ['meta', { property: 'og:description', content: 'Ruby tests profiling and optimization toolbox' }],
    ['meta', { property: 'og:image', content: 'https://test-prof.evilmartians.io/assets/images/banner.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@palkan_tula' }],
    ['meta', { name: 'twitter:creator', content: '@palkan_tula' }],
    ['meta', { name: 'keywords', content: 'ruby, rails, testing, profiling' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/getting_started', activeMatch: '/guide/' },
          { text: 'LLMs', link: '/llms-full.txt' },
        ],
        sidebar: {
          '/guide/': guideSidebar,
        },
      },
    },
    ru: {
      label: 'Русский',
      lang: 'ru',
      description: 'Инструменты для профилирования и оптимизации тестов на Ruby',
      themeConfig: {
        nav: [
          { text: 'Руководство', link: '/ru/guide/getting_started', activeMatch: '/ru/guide/' },
        ],
        sidebar: {
          '/ru/guide/': ruGuideSidebar,
        },
        editLink: {
          pattern: 'https://github.com/test-prof/docs/edit/master/docs/:path',
          text: 'Редактировать на GitHub',
        },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja',
      description: 'Rubyテストのプロファイリングと最適化ツールボックス',
      themeConfig: {
        nav: [
          { text: 'ガイド', link: '/ja/guide/getting_started', activeMatch: '/ja/guide/' },
        ],
        sidebar: {
          '/ja/guide/': jaGuideSidebar,
        },
        editLink: {
          pattern: 'https://github.com/test-prof/docs/edit/master/docs/:path',
          text: 'GitHubで編集',
        },
      },
    },
    'zh-cn': {
      label: '中文',
      lang: 'zh-CN',
      description: 'Ruby测试分析和优化工具箱',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh-cn/guide/getting_started', activeMatch: '/zh-cn/guide/' },
        ],
        sidebar: {
          '/zh-cn/guide/': zhCnGuideSidebar,
        },
        editLink: {
          pattern: 'https://github.com/test-prof/docs/edit/master/docs/:path',
          text: '在GitHub上编辑',
        },
      },
    },
  },

  themeConfig: {
    logo: '/assets/images/logo.svg',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/test-prof/test-prof' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/test-prof/docs/edit/master/docs/:path'
    },
  }
})
