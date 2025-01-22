type Theme = 'dark' | ''

export function useTheme() {
  const current: Ref<Theme> = ref('')

  // 更新 HTML 的 class
  const updateThemeClass = (theme: Theme) => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }

  // 切换主题
  const toggle = () => {
    current.value = current.value === '' ? 'dark' : ''
    updateThemeClass(current.value)
    localStorage.setItem('theme', current.value)
  }

  // 初始化主题
  const initialize = () => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    current.value = savedTheme ?? (prefersDark ? 'dark' : '')
    updateThemeClass(current.value)
  }

  // 监听系统主题变化
  const watchSystemTheme = () => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        current.value = e.matches ? 'dark' : ''
        updateThemeClass(current.value)
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    // 在组件卸载时移除监听器
    onMounted(() => {
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    })
  }

  // 在组合式函数创建时初始化
  initialize()
  watchSystemTheme()

  return {
    current,
    toggle
  }
}
