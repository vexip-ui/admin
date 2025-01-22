<script setup lang="ts">
import { useUserStore } from '@/store'
import { RoutePath } from '@/router'

import type { PropsOptions } from 'vexip-ui'

interface Model {
  username: string,
  password: string
}

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()

const model = reactive({
  username: 'root',
  password: '123456'
} as Model)
const loading = ref(false)

const providedProps: PropsOptions = {
  button: {
    size: 'large'
  },
  input: {
    size: 'large',
    clearable: true
  }
}

async function handleLogin() {
  loading.value = true

  const result = await userStore.login(model)

  if (result) {
    VNotice.success({
      title: t('login.loginSuccess'),
      content: t('login.welcomeBack', [result.user.alias]),
      closable: true
    })

    router.push({ path: RoutePath.ROOT })
  } else {
    VMessage.error(t('login.loginFail'))
  }

  loading.value = false
}
</script>

<template>
  <div class="login-container">
    <VCard class="login">
      <VRow class="login__sign" justify="center" align="middle">
        <VLinker to="https://www.vexipui.com/">
          <img src="/vexip-ui.svg" class="login__logo" alt="Vexip UI Logo" />
        </VLinker>
        <VH1 style="margin: 0">
          Vexip Admin
        </VH1>
      </VRow>
      <VConfigProvider :props="providedProps">
        <VForm class="login__form" :model="model" hide-label>
          <VFormItem prop="username" :label="t('login.username')" required>
            <VInput
              :placeholder="t('login.pleaseInput', [t('login.username')])"
              :prefix="IUser"
            ></VInput>
          </VFormItem>
          <VFormItem prop="password" :label="t('login.password')" required>
            <VInput
              :placeholder="t('login.pleaseInput', [t('login.password')])"
              type="password"
              :prefix="ILock"
            ></VInput>
          </VFormItem>
          <VFormItem class="mb-2">
            <div class="flex justify-between items-center w-full">
              <VLinker type="primary" href="https://www.vexipui.com/" target="_blank">
                Vexip UI官网
              </VLinker>
              <VSpace :size="15">
                <VFormSubmit
                  class="w-25"
                  type="success"
                  :loading="loading"
                  @submit="handleLogin"
                >
                  {{ t('login.signIn') }}
                </VFormSubmit>
                <VButton class="w-25" type="warning">
                  {{ t('login.signUp') }}
                </VButton>
              </VSpace>
            </div>
          </VFormItem>
        </VForm>
      </VConfigProvider>
      <div class="login__tip m--3">
        <VDivider>
          {{ t('login.forgetPassword') }}
          <VLinker type="primary">
            {{ t('login.resetPassword') }}
          </VLinker>
        </VDivider>
      </div>
    </VCard>
  </div>
</template>

<style lang="scss">
.login-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background-color: #f2f9ff;
  background-image: url('@/assets/images/login-bg.svg');
  background-size: cover;
}

.login-background {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
}

.login {
  position: relative;
  z-index: 1;
  max-width: 480px;
  padding: 10px;
  background: rgba(255, 255, 255, 90%);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 10%);

  &__sign {
    user-select: none;
  }

  &__logo {
    height: 6em;
    padding: 1em;
    will-change: filter;
  }

  &__form {
    padding: 20px;
  }

  &__tip {
    padding: 0 20px;
  }
}
</style>
