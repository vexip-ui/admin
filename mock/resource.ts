import { Random } from 'mockjs'
import { http } from 'msw'
import { createResult } from './common'

export const handlers = [
  http.post('/resource/file', async ({ request }) => {
    const data = await request.formData()
    const file = data.get('file')

    if (!file) {
      return createResult(null, false, 'Missing file', 400)
    }

    if (!(file instanceof File)) {
      return createResult(null, false, 'Uploaded stuff is not a File', 400)
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)

    let base64: string | null = null

    await new Promise<void>(resolve => {
      reader.onload = () => {
        base64 = reader.result?.toString() ?? null
        resolve()
      }
    })

    if (base64) {
      const id = Random.guid()
      const units = file.name.split('.')
      const name = units.slice(-1).join('.')
      const ext = units.at(-1)

      return createResult({
        id,
        name,
        ext,
        size: file.size,
        med: '',
        url: base64
      })
    }

    return createResult(null, false)
  })
]
