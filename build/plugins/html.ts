import type { Plugin } from 'vite'

export interface HtmlPluginOptions {
  title?: string
}

export function createHtmlPlugin(options: HtmlPluginOptions = {}): Plugin {
  const { title = '' } = options

  return {
    name: 'plugin:html',
    transformIndexHtml(html) {
      if (!title) return html

      return {
        html: html.replace(/<title>(.*?)<\/title>/, `<title>${title}</title>`),
        tags: []
      }
    }
  }
}
