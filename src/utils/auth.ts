import Cookies from 'js-cookie'

export const ACCESS_TOKEN = 'access_token'

export function getAccessToken() {
  return Cookies.get(ACCESS_TOKEN)
}

export function setAccessToken(token: string) {
  Cookies.set(ACCESS_TOKEN, token)
}

export function clearAccessToken() {
  Cookies.remove(ACCESS_TOKEN)
}

export function getAuthorization() {
  return `Bearer ${Cookies.get(ACCESS_TOKEN)}`
}
