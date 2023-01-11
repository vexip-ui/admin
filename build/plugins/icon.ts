import { relative } from 'node:path'
import { readFileSync } from 'node:fs'
import glob from 'fast-glob'
import { normalizePath } from 'vite'

import type { Plugin } from 'vite'

export interface IconPluginOptions {
  dir?: string,
  domId?: string
}

interface IconFileState {
  id: string,
  code: string,
  mtimeMs?: number
}

const ICON_REGISTER = 'virtual:icon-register'
const XMLNS = 'http://www.w3.org/2000/svg'
const XMLNS_LINK = 'http://www.w3.org/1999/xlink'
const DEFAULT_DOM_ID = '__icon_symbols__'

const svgRE = /\.svg$/
const svgTagRE = /<svg([\s\S]*?)>([\s\S]*?)<\/svg>/
const idAttrRE = /id="[\s\S]*?"/g

export function createIconPlugin(options: IconPluginOptions = {}): Plugin {
  const { dir = '', domId = DEFAULT_DOM_ID } = options

  const cache = new Map<string, IconFileState>()

  let isBuild = false

  async function renderModuleCode() {
    const entries = await glob('**/*.svg', {
      cwd: dir,
      stats: true,
      absolute: true
    })

    let html = ''

    for (const entry of entries) {
      const { path, stats: { mtimeMs } = {} } = entry
      const cachedStat = cache.get(path)

      let id: string
      let code: string

      if (cachedStat && cachedStat.mtimeMs === mtimeMs) {
        id = cachedStat.id
        code = cachedStat.code
      } else {
        const content = readFileSync(path, 'utf-8')
        const svg = content.match(svgTagRE)?.[0]

        id = normalizePath(relative(dir, path).replace(svgRE, ''))
        code = (svg || '<svg></svg>')
          .replace(idAttrRE, '')
          .replace(svgTagRE, `<symbol id="${id}" $1>$2</symbol>`)

        cache.set(path, { id, code, mtimeMs })
      }

      html += code
    }

    html = `
      if (typeof window !== 'undefined') {
        function loadSvg() {
          const body = document.body
          let svgDom = document.getElementById('${domId}')
          if(!svgDom) {
            svgDom = document.createElementNS('${XMLNS}', 'svg')
            svgDom.style.position = 'absolute'
            svgDom.style.width = '0'
            svgDom.style.height = '0'
            svgDom.style.pointerEvents = 'none'
            svgDom.id = '${domId}'
            svgDom.setAttribute('xmlns','${XMLNS}')
            svgDom.setAttribute('xmlns:link','${XMLNS_LINK}')
          }
          svgDom.innerHTML = ${JSON.stringify(html)}
          body.insertBefore(svgDom, body.firstChild)
        }
        if(document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', loadSvg);
        } else {
          loadSvg()
        }
      }
    `

    return html
  }

  return {
    name: 'plugin:icon',
    configResolved(config) {
      isBuild = config.command === 'build'
    },
    resolveId(id) {
      return ICON_REGISTER === id ? id : null
    },
    async load(id, ssr) {
      if (!isBuild || ICON_REGISTER !== id) return null
      if (ssr && !isBuild) return 'export default {}'

      return await renderModuleCode()
    },
    configureServer: ({ middlewares }) => {
      // middlewares.use(cors({ origin: '*' }))
      middlewares.use(async (req, res, next) => {
        const url = normalizePath(req.url!)
        const registerId = `/@id/${ICON_REGISTER}`

        if (url.endsWith(registerId)) {
          res.setHeader('Content-Type', 'application/javascript')
          res.setHeader('Cache-Control', 'no-cache')

          // res.setHeader('Etag', getEtag(content, { weak: true }))
          res.statusCode = 200
          res.end(await renderModuleCode())
        } else {
          next()
        }
      })
    }
  }
}
