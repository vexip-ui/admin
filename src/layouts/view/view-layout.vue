<script setup lang="ts">
import { useAccessStore, useNavTabStore, useUserStore } from '@/store'

import { callIfFunc } from '@vexip-ui/utils'

import FullScreen from './header-right/full-screen.vue'
import RightMessage from './header-right/right-message.vue'
import RightSearch from './header-right/right-search.vue'
import ThemeSwitch from './header-right/theme-switch.vue'

import type { LayoutExposed, LayoutHeaderAction } from 'vexip-ui'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()

const accessStore = useAccessStore()
const userStore = useUserStore()
const navTabStore = useNavTabStore()

const layoutRef = useTemplateRef<LayoutExposed>('layout')

const activeTab = ref('')
const activeMenu = ref('')

const user = computed(() => {
  const { currentUser } = userStore

  if (currentUser) {
    return {
      name: currentUser.alias,
      email: currentUser.email
    }
  }
})
const breadcrumbs = computed(() => {
  return route.matched.filter(({ meta }) => meta?.title).map(({ meta }) => callIfFunc(meta.title!))
})
const userActions = computed<LayoutHeaderAction[]>(() => [
  {
    label: 'signOut',
    name: t('userAction.signOut'),
    icon: IArrowRightFromBracket
  }
])

watch(
  () => route.fullPath,
  () => {
    const { path, fullPath, matched } = route

    if (!navTabStore.hasTab(path)) {
      navTabStore.addTab(route)
    }

    activeTab.value = fullPath || path

    if (matched.length > 1) {
      const parentRoute = matched.at(-2)!
      const menu = parentRoute.meta?.menu

      if (menu && menu.single) {
        activeMenu.value = parentRoute.path
      } else {
        activeMenu.value = fullPath || path
      }
    } else {
      activeMenu.value = fullPath || path
    }
  },
  { immediate: true }
)
watch(activeMenu, value => {
  layoutRef.value?.expandMenuByLabel(value)
})

function handleMenuSelect(label: string) {
  router.push(label)
}

function handleUserAction(label: string) {
  switch (label) {
    case 'signOut':
      handleSignOut()
      break
  }
}

function handleTabSelect(label: string | number) {
  router.push(label as string)
}

function toClosetTab(label: string) {
  const closestTab = navTabStore.findClosestTab(label)

  if (closestTab) {
    router.push(closestTab.fullPath || closestTab.path)
  }
}

function handleTabClose(label: string) {
  if (activeTab.value === label) {
    toClosetTab(label)
  }

  navTabStore.removeTab(label)
}

async function handleTabContextmenu(label: string, event: MouseEvent) {
  const { asyncTabs } = navTabStore
  const index = asyncTabs.findIndex(tab => (tab.fullPath || tab.path) === label)
  const length = asyncTabs.length

  const selected = await VContextmenu.open({
    clientX: event.clientX,
    clientY: event.clientY,
    appear: true,
    configs: [
      {
        key: 'refresh',
        label: t('tab.refresh'),
        icon: IRotateRight,
        disabled: label !== route.fullPath
      },
      {
        key: 'closeToLeft',
        label: t('tab.closeToLeft'),
        icon: IArrowLeft,
        disabled: !(length > 1 && index > 0)
      },
      {
        key: 'closeToRight',
        label: t('tab.closeToRight'),
        icon: IArrowRight,
        disabled: !(length > 1 && index < length - 1)
      },
      {
        key: 'closeOthers',
        label: t('tab.closeOthers'),
        icon: IArrowsLeftRight,
        disabled: length <= 1
      },
      {
        key: 'closeAll',
        label: t('tab.closeAll'),
        icon: IMinus,
        disabled: length <= 0
      }
    ]
  })

  if (selected?.length) {
    switch (selected[0]) {
      case 'refresh':
        // TODO: refresh current route
        break
      case 'closeToLeft':
        navTabStore.clearLeftTabs(label)
        break
      case 'closeToRight':
        navTabStore.clearRightTabs(label)
        break
      case 'closeOthers':
        navTabStore.clearOtherTabs(label)
        break
      case 'closeAll':
        navTabStore.clearAllTabs()
        toClosetTab(label)
        break
    }
  }
}

async function handleSignOut() {
  const confirm = await VConfirm.open(t('userAction.confrimToSignOut'), 'primary')

  if (confirm) {
    await userStore.logout()
  }
}
</script>

<template>
  <VLayout
    ref="layout"
    class="vp-layout"
    logo="https://www.vexipui.com/vexip-ui.svg"
    sign-name="Vexip Admin"
    :menus="accessStore.menus"
    :menu-props="{
      active: activeMenu
    }"
    :user="user"
    :config="[]"
    :actions="userActions"
    fixed-main
    header-fixed
    style="height: 100%"
    @menu-select="handleMenuSelect"
    @user-action="handleUserAction"
  >
    <template #main>
      <section class="nav-tabs">
        <VTabNav :active="activeTab" @change="handleTabSelect">
          <VTabNavItem
            v-for="tab in navTabStore.allTabs"
            :key="tab.fullPath || tab.path"
            :label="tab.fullPath || tab.path"
            @contextmenu.prevent="handleTabContextmenu(tab.fullPath || tab.path, $event)"
          >
            <template v-if="tab.icon">
              <VIcon v-if="typeof tab.icon === 'string'" v-bind="tab.iconProps">
                <Svg :name="tab.icon"></Svg>
              </VIcon>
              <VIcon v-else :icon="tab.icon" v-bind="tab.iconProps"></VIcon>
            </template>
            <template v-if="!tab.icon || !tab.iconOnly">
              {{ tab.title ? callIfFunc(tab.title) : tab.name }}
            </template>
            <button
              v-if="!tab.static"
              class="empty-btn tab-close-btn"
              @click.stop="handleTabClose(tab.fullPath || tab.path)"
            >
              <VIcon>
                <IXmark></IXmark>
              </VIcon>
            </button>
          </VTabNavItem>
        </VTabNav>
      </section>
      <div class="main-view">
        <router-view v-slot="{ Component, route: currentRoute }">
          <transition name="fade-move" appear mode="out-in">
            <div :key="currentRoute.fullPath" style="width: 100%; height: 100%">
              <component :is="Component"></component>
            </div>
          </transition>
        </router-view>
      </div>
    </template>
    <template #header-left>
      <VBreadcrumb :options="breadcrumbs"></VBreadcrumb>
      <slot name="header-left"></slot>
    </template>
    <template #header-main>
      <slot name="header-main"></slot>
    </template>
    <template #header-right>
      <VSpace class="mr-5" align="center" :size="20">
        <RightSearch></RightSearch>
        <ThemeSwitch></ThemeSwitch>
        <FullScreen></FullScreen>
        <RightMessage></RightMessage>
      </VSpace>
    </template>
  </VLayout>
</template>

<style lang="scss">
:root {
  --nav-tabs-height: 36px;
}

.nav-tabs {
  position: relative;
  z-index: 1;
  height: var(--nav-tabs-height);
  border-bottom: var(--vxp-border-light-2);
  box-shadow: 0 2px 6px var(--vxp-shadow-color-light-2);

  .vxp-tab-nav {
    padding: 4px 8px;

    &,
    &__list,
    &__item,
    &__content {
      height: 100%;
    }

    &__extra {
      border-bottom: 0;
    }

    &__list {
      margin: 0;
    }

    &__item {
      margin-left: 6px;
    }

    &__content {
      align-items: center;
      padding-top: 0;
      padding-bottom: 0;
      color: var(--vxp-content-color-base);
      border: var(--vxp-border-light-1);
      border-radius: var(--vxp-radius-small);
      transition: var(--vxp-transition-color), var(--vxp-transition-background),
        var(--vxp-transition-border);

      &:hover,
      &:focus {
        background-color: var(--vxp-fill-color-background);
      }

      &--active {
        &,
        &:hover,
        &:focus {
          color: #fff;
          background-color: var(--vxp-color-primary-base);
          border-color: var(--vxp-color-primary-base);
        }

        .tab-close-btn {
          color: #eaeaea;
        }
      }
    }

    &__track {
      display: none;
    }
  }

  .tab-close-btn {
    position: relative;
    left: 6px;
    color: var(--vxp-content-color-secondary);
    opacity: 40%;
    transition: var(--vxp-transition-color), var(--vxp-transition-opacity);

    &:hover,
    &:focus {
      opacity: 100%;
    }
  }
}

.main-view {
  height: calc(100% - var(--nav-tabs-height));
  background-color: var(--vxp-fill-color-background);
}

.fade-move {
  &-leave-active,
  &-enter-active {
    transition:
      opacity 250ms,
      transform 250ms;
  }

  &-enter-from {
    opacity: 0%;
    transform: translateX(-30px);
  }

  &-leave-to {
    opacity: 0%;
    transform: translateX(30px);
  }
}
</style>
