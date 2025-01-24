import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import autoImport from 'unplugin-auto-import/vite'
import components from 'unplugin-vue-components/vite'
import { VexipUIResolver } from '@vexip-ui/plugins'
import i18n from '@intlify/unplugin-vue-i18n/vite'
import { createHtmlPlugin } from './build/plugins/html'
import { createIconPlugin } from './build/plugins/icon'
import UnoCSS from 'unocss/vite'

const rootDir = dirname(fileURLToPath(import.meta.url))

const vxpStylePresetRE = /vexip-ui\/style(?:\/dark)?\/preset/

const basePath = '@/style/variables/base.scss'
const darkPath = '@/style/variables/dark.scss'

export default defineConfig(async ({ command, mode }) => {
  const isBuild = command === 'build'

  const env = loadEnv(mode, rootDir, 'PUBLIC_')
  const { BASE_PATH, DROP_CONSOLE, PUBLIC_APP_TITLE, PUBLIC_SUPPORT_DARK_MODE, PUBLIC_USE_MOCK } =
    Object.entries(env).reduce((prev, [key, value]) => {
      try {
        prev[key] = JSON.parse(value)
      } catch (e) {
        prev[key] = value
      }

      return prev
    }, {} as ImportMetaEnv)

  const vexipResolver = VexipUIResolver({
    prefix: 'V',
    iconPrefix: '',
    importDarkTheme: PUBLIC_SUPPORT_DARK_MODE,
    importStyle: 'sass',
    fullStyle: !isBuild
  })

  return {
    base: BASE_PATH,
    define: {},
    envPrefix: 'PUBLIC_',
    resolve: {
      alias: [{ find: /^@\/(.+)/, replacement: resolve(rootDir, 'src/$1') }],
      dedupe: ['vue', 'vexip-ui']
    },
    esbuild: {
      pure: DROP_CONSOLE ? ['console.log'] : undefined,
      drop: DROP_CONSOLE ? ['debugger'] : undefined
    },
    server: {
      port: 6200,
      host: '0.0.0.0'
    },
    css: {
      // preprocessorOptions: {
      //   scss: {
      //     additionalData: (code: string, path: string) => {
      //       // 篡改组件库基础样式中的变量文件的引用
      //       if (vxpStylePresetRE.test(path)) {
      //         if (path.includes('dark')) {
      //           console.log(path)
      //           return code.replace("@use './variables.scss' as *;", `@use '${darkPath}' as *;`)
      //         }
      //         return code.replace(
      //           "@use './design/variables.scss' as *;",
      //           `@use '${basePath}' as *;`
      //         )
      //       }
      //       return code
      //     }
      //   }
      // }
    },
    build: {
      chunkSizeWarningLimit: 10 * 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue']
          }
        },
        external: (source: string) => {
          if (!PUBLIC_USE_MOCK) {
            return source.includes(resolve(rootDir, 'mock/'))
          }
        }
      }
    },
    optimizeDeps: {
      include: isBuild ? undefined : ['vexip-ui', '@vexip-ui/icons', '@wangeditor/editor']
    },
    plugins: [
      UnoCSS(),
      vue(),
      vueJsx(),
      autoImport({
        vueTemplate: true,
        dts: resolve(rootDir, 'types/auto-imports.d.ts'),
        resolvers: [vexipResolver],
        imports: [
          'vue',
          {
            'vue-router': ['useRoute', 'useRouter'],
            'vue-i18n': ['useI18n'],
            pinia: ['storeToRefs'],
            '@vexip-ui/icons': Object.keys(await import('@vexip-ui/icons')).map(name =>
              name.match(/^I[0-9]/) ? name : [name, `I${name}`]
            )
          }
        ]
      }),
      components({
        dirs: ['src/components', 'src/layouts'],
        dts: resolve(rootDir, 'types/components.d.ts'),
        resolvers: [vexipResolver]
      }),
      i18n({
        compositionOnly: false,
        include: resolve(rootDir, 'src/locale/languages')
      }),
      createHtmlPlugin({
        title: PUBLIC_APP_TITLE || 'Vexip UI App'
      }),
      createIconPlugin({
        dir: resolve(rootDir, 'src/icons')
      })
    ]
  }
})
