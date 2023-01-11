import { resolve, dirname } from 'node:path'
import fs from 'fs-extra'
import minimist from 'minimist'
import prettier from 'prettier'
import { ESLint } from 'eslint'
import stylelint from 'stylelint'
import prompts from 'prompts'
import { toCamelCase, toCapitalCase, toKebabCase } from '@vexip-ui/utils'
import { rootDir, prettierConfig, logger } from '../build/utils'

const { existsSync, ensureDir, writeFile } = fs

const src = resolve(rootDir, 'src')
const args = minimist(process.argv.slice(2))

const eslint = new ESLint({ fix: true })

let name = args._.join('-')

async function main() {
  if (!name) {
    name = (
      await prompts({
        type: 'text',
        name: 'business',
        message: 'Input a business name:'
      })
    ).business

    if (!name) {
      logger.warningText('(!) Require a valid name for business!')
    }

    name = name.replace(/\s+/g, '-')
  }

  await create(name)
}

async function create(name: string) {
  const kebabCaseName = toKebabCase(name)
  const capitalCaseName = toCapitalCase(name)
  const camelCaseName = toCamelCase(name)
  const underScoreCaseName = toUnderScoreCase(name)

  const generatedFiles: Array<{ filePath: string, source: string }> = [
    {
      filePath: resolve(src, 'service', `${kebabCaseName}.ts`),
      source: `
        import { createCommonRequests } from './common'

        import type { FileOptions } from 'vexip-ui'
        import type { Dateable } from '@vexip-ui/utils'
        import type { BusinessBase } from './common/helper'
        
        interface ${capitalCaseName} extends BusinessBase {
          title: string,
          date: Dateable,
          thumbnail: FileOptions[]
        }
        
        const prefix = '/gis/${underScoreCaseName}'
        
        const {
          getAll: get${capitalCaseName}s,
          getById: get${capitalCaseName}ById,
          create: create${capitalCaseName},
          update: update${capitalCaseName},
          deleteByIds: delete${capitalCaseName}s
        } = createCommonRequests<DB${capitalCaseName}, DB${capitalCaseName}['id'], ${capitalCaseName}>(prefix)
        
        export {
          get${capitalCaseName}s,
          get${capitalCaseName}ById,
          create${capitalCaseName},
          update${capitalCaseName},
          delete${capitalCaseName}s
        }      
      `
    },
    {
      filePath: resolve(src, 'router/routes/async', `${kebabCaseName}.ts`),
      source: `
        import { AsyncViewLayout } from '../helper'
        import { t } from '@/locale'

        import type { RouteRecordRaw } from 'vue-router'

        export const ${capitalCaseName}Route: RouteRecordRaw = {
          path: '/${kebabCaseName}',
          name: '${capitalCaseName}',
          component: AsyncViewLayout,
          redirect: '/${kebabCaseName}/list',
          meta: {
            title: () => t('demos.${camelCaseName}.viewTitle'),
            menu: {
              single: true,
              icon: '${kebabCaseName}'
            }
          },
          children: [
            {
              path: 'list',
              component: () => import('@/views/demos/${kebabCaseName}/list.vue')
            },
            {
              path: 'create',
              component: () => import('@/views/demos/${kebabCaseName}/form.vue'),
              meta: {
                title: () => t('title.create', [t('demos.${camelCaseName}.viewTitle')])
              }
            },
            {
              path: 'edit/:id',
              component: () => import('@/views/demos/${kebabCaseName}/form.vue'),
              props: true,
              meta: {
                title: () => t('title.edit', [t('demos.${camelCaseName}.viewTitle')])
              }
            }
          ]
        }
      `
    },
    {
      filePath: resolve(src, 'views/business', kebabCaseName, 'list.vue'),
      source: `
        <script setup lang="ts">
        import { get${capitalCaseName}s, delete${capitalCaseName}s } from '@/service/${kebabCaseName}'
        
        const { t } = useI18n()
        
        const filterFields = reactive([
          {
            key: 'title',
            name: () => t('business.${camelCaseName}.title')
          }
        ])
        </script>
        
        <template>
          <ListContainer
            :filter-fields="filterFields"
            :query-entities="get${capitalCaseName}s"
            :delete-entities="delete${capitalCaseName}s"
            create-path="./create"
            edit-path="./edit/{id}"
          >
            <template #columns>
              <VTableColumn id-key="title" :name="t('demos.${camelCaseName}.title')"></VTableColumn>
              <VTableColumn id-key="date" :name="t('demos.${camelCaseName}.date')"></VTableColumn>
            </template>
          </ListContainer>
        </template>      
      `
    },
    {
      filePath: resolve(src, 'views/demos', kebabCaseName, 'form.vue'),
      source: `
        <script setup lang="ts">
        import { get${capitalCaseName}ById, create${capitalCaseName}, update${capitalCaseName} } from '@/service/${kebabCaseName}'
        import { buildFormData } from '@/utils/transform'
        
        import type { ${capitalCaseName} } from '@/service/${kebabCaseName}'
        
        const props = defineProps({
          id: {
            type: String,
            default: ''
          }
        })
        
        const { t } = useI18n()
        const router = useRouter()
        
        const model = reactive({}) as ${capitalCaseName}
        const loading = ref(false)
        
        if (props.id) {
          get${capitalCaseName}ById(props.id).then(data => {
            if (data) {
              Object.assign(model, data)
            }
          })
        }
        
        async function handleSubmit() {
          loading.value = true
        
          let result: ${capitalCaseName} | null = null
        
          if (props.id) {
            result = await update${capitalCaseName}(formData)
          } else {
            result = await create${capitalCaseName}(formData)
          }
        
          VMessage.judge(
            !!result,
            t('result.success', [t('action.save')]),
            t('result.fail', [t('action.save')])
          )
        
          loading.value = false
        }
        </script>
        
        <template>
          <FormContainer
            :model="model"
            :title="t('title.demos.${camelCaseName}')"
            :loading="loading"
            @submit="handleSubmit"
          >
            <template #area1>
              <VFormItem
                :label="t('demos.${camelCaseName}.title')"
                prop="title"
                required
                :span="12"
              >
                <VInput></VInput>
              </VFormItem>
              <VFormItem
                :label="t('demos.${camelCaseName}.date')"
                prop="date"
                required
                :span="12"
              >
                <VDatePicker :no-filler="!!id"></VDatePicker>
              </VFormItem>
              <VFormItem :label="t('demos.${camelCaseName}.thumbnail')" prop="thumbnail" required>
                <VUpload image :count-limit="1"></VUpload>
              </VFormItem>
            </template>
          </FormContainer>
        </template>      
      `
    }
  ]

  await Promise.all(
    generatedFiles.map(async ({ filePath, source }) => {
      if (existsSync(filePath)) {
        logger.warningText(`exists ${filePath}, skip`)
        return
      }

      await ensureDir(dirname(filePath))

      if (filePath.match(/\.(s|p)?css$/)) {
        await writeFile(filePath, source)
        await stylelint.lint({
          cwd: rootDir,
          fix: true,
          files: filePath
        })
      } else if (filePath.endsWith('.md')) {
        await writeFile(
          filePath,
          prettier.format(
            source
              .split('\n')
              .map(line => line.trim())
              .join('\n'),
            { ...prettierConfig, parser: 'markdown' }
          )
        )
      } else if (filePath.endsWith('.json')) {
        await writeFile(
          filePath,
          prettier.format(source, {
            ...prettierConfig,
            parser: 'json'
          })
        )
      } else {
        if (filePath.endsWith('.vue')) {
          await writeFile(
            filePath,
            prettier.format(source, {
              ...prettierConfig,
              parser: 'vue'
            })
          )
        } else {
          await writeFile(
            filePath,
            prettier.format(source, {
              ...prettierConfig,
              parser: 'typescript'
            })
          )
        }

        await ESLint.outputFixes(await eslint.lintFiles(filePath))
      }

      logger.infoText(`create ${filePath}`)
    })
  )
}

function toUnderScoreCase(value: string) {
  return toKebabCase(value).replace(/-/g, '_')
}

main().catch(error => {
  logger.error(error)
  process.exit(1)
})
