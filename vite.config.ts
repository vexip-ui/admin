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

const rootDir = dirname(fileURLToPath(import.meta.url))

const vxpStylePresetRE = /vexip-ui\/style(?:\/dark)?\/preset/

const basePath = '@/style/variables/base.scss'
const darkPath = '@/style/variables/dark.scss'

export default defineConfig(async ({ command, mode }) => {
  const isBuild = command === 'build'
  const env = loadEnv(mode, rootDir)
  const {
    VITE_APP_TITLE,
    VITE_SUPPORT_DARK_MODE,
    VITE_BASE_PATH,
    VITE_DROP_CONSOLE
    // VITE_BASE_SERVER,
    // VITE_RESOURCE_SERVER
  } = env

  const vexipResolver = VexipUIResolver({
    prefix: 'V',
    iconPrefix: '',
    importDarkTheme: VITE_SUPPORT_DARK_MODE === 'true',
    importStyle: 'sass',
    fullStyle: !isBuild
  })

  return {
    base: VITE_BASE_PATH,
    define: {},
    resolve: {
      alias: [{ find: /^@\/(.+)/, replacement: resolve(rootDir, 'src/$1') }],
      dedupe: ['vue', 'vexip-ui']
    },
    esbuild: {
      pure: VITE_DROP_CONSOLE === 'true' ? ['console.log', 'debugger'] : undefined
    },
    server: {
      port: 6200,
      host: '0.0.0.0'
      // proxy: {
      //   '/api': {
      //     target: VITE_BASE_SERVER,
      //     rewrite: path => path.replace(/^\/api/, '')
      //   },
      //   '/resource': {
      //     target: VITE_RESOURCE_SERVER,
      //     rewrite: path => path.replace(/^\/resource/, '')
      //   }
      // }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: (code: string, path: string) => {
            // 篡改组件库基础样式中的变量文件的引用
            if (vxpStylePresetRE.test(path)) {
              if (path.includes('dark')) {
                return code.replace("@use './variables.scss' as *;", `@use '${darkPath}' as *;`)
              }

              return code.replace(
                "@use './design/variables.scss' as *;",
                `@use '${basePath}' as *;`
              )
            }

            return code
          }
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 10 * 1024,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue']
          }
        }
      }
    },
    optimizeDeps: {
      include: isBuild ? undefined : ['vexip-ui', '@vexip-ui/icons', '@wangeditor/editor']
    },
    plugins: [
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
        title: VITE_APP_TITLE
      }),
      createIconPlugin({
        dir: resolve(rootDir, 'src/icons')
      })
    ]
  }
})
