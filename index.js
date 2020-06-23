const path = require('path')

// Theme API.
module.exports = (options, ctx) => {
  const { sep } = path
  const { styles } = options;
  const { themeConfig, siteConfig, sourceDir } = ctx

  // resolve algolia
  const isAlgoliaSearch = (
    themeConfig.algolia
    || Object
        .keys(siteConfig.locales && themeConfig.locales || {})
        .some(base => themeConfig.locales[base].algolia)
  )

  const enableSmoothScroll = themeConfig.smoothScroll === true
  siteConfig.markdown = siteConfig.markdown || {};
  siteConfig.markdown.anchor = Object.assign({}, siteConfig.markdown.anchor || {}, {
    permalinkBefore: false, // anchor 统一放标题右边
  })
  themeConfig.sidebarDepth = themeConfig.sidebarDepth || 0

  return {
    chainWebpack: (config, isServer) => {
      const baseRule = config.module.rule('less');
      const normal = baseRule.oneOf('normal');
      const modules = baseRule.oneOf('modules');

      let resources = '';
      if (styles) {
        resources = path.resolve(sourceDir, styles);
      }

      normal
        .use('less-loader')
        .loader('less-loader')
        .options({
          javascriptEnabled: true,
        });

      if (resources) {
        normal
          .use('sass-resources-loader')
          .loader('sass-resources-loader')
          .options({ resources });
      }

      modules
        .use('less-loader')
        .loader('less-loader')
        .options({
          javascriptEnabled: true,
        });

      if (resources) {
        modules
          .use('sass-resources-loader')
          .loader('sass-resources-loader')
          .options({ resources });
      }
      
      if (!isServer) {
        config.node.set('process', true)
      }
    },
    alias () {
      return {
        '@AlgoliaSearchBox': isAlgoliaSearch
          ? path.resolve(__dirname, 'components/AlgoliaSearchBox.vue')
          : path.resolve(__dirname, 'noopModule.js'),
        '@docs': `${sourceDir}${sep}.vuepress${sep}styles`,
        '@': path.resolve(sourceDir),
        '@@': path.resolve(sourceDir, '../src'),
      }
    },
    plugins: [
      ['@vuepress/active-header-links', options.activeHeaderLinks],
      '@vuepress/plugin-search',
      '@vuepress/plugin-nprogress',
      [
        'vuepress-plugin-clean-urls', {
          normalSuffix: '/',
          indexSuffix: '/',
          notFoundPath: '/404.html',
        },
      ],
      ['container', {
        type: 'tip',
        defaultTitle: {
          '/': 'TIP'
        }
      }],
      ['container', {
        type: 'warning',
        defaultTitle: {
          '/': 'WARNING'
        }
      }],
      ['container', {
        type: 'danger',
        defaultTitle: {
          '/': 'WARNING'
        }
      }],
      ['container', {
        type: 'details',
        before: info => `<details class="custom-block details">${info ? `<summary>${info}</summary>` : ''}\n`,
        after: () => '</details>\n'
      }],
      ['container', {
        type: 'md-table',
        defaultTitle: '',
      }],
      ['smooth-scroll', enableSmoothScroll]
    ]
  }
}
