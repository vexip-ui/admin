type Replace<T, K> = {
  [P in keyof T | keyof K]: P extends keyof K ? K[P] : P extends keyof T ? T[P] : never
}

type PartialDeep<T> = {
  [P in keyof T]?: T[P] extends Record<any, any> ? PartialDeep<T[P]> : T[P]
}

type Expand<T> = T extends unknown ? { [K in keyof T]: T[K] } : never
