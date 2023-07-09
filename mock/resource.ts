import { Random, mock } from 'mockjs'

mock('/resource/file', async ({ body }) => {
  if (body instanceof FormData) {
    const file = body.get('file') as File
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

      return {
        status: 1,
        message: 'ok',
        data: {
          id,
          name,
          ext,
          size: file.size,
          med: '',
          url: base64
        }
      }
    }
  }

  return {
    status: 0,
    message: 'fail',
    data: null
  }
})
