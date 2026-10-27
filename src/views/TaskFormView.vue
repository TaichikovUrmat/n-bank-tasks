<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { helpers, maxLength, minLength, required } from '@vuelidate/validators'
import * as api from '@/api/tasksApi'
import { ASSIGNEES } from '@/api/tasksApi'
import { STATUS_OPTIONS, type TaskStatus } from '@/types/task'

const props = defineProps<{ id?: number }>()
const router = useRouter()

const isEdit = computed(() => props.id !== undefined)
const today = new Date().toISOString().slice(0, 10)

const form = reactive({
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  deadline: '',
  assigneeId: null as number | null,
})

const rules = computed(() => ({
  title: {
    required: helpers.withMessage('Введите название', required),
    minLength: helpers.withMessage('Минимум 3 символа', minLength(3)),
    maxLength: helpers.withMessage('Максимум 120 символов', maxLength(120)),
  },
  description: {
    maxLength: helpers.withMessage('Максимум 1000 символов', maxLength(1000)),
  },
  status: { required: helpers.withMessage('Выберите статус', required) },
  deadline: {
    required: helpers.withMessage('Укажите дедлайн', required),
    // у новой задачи дедлайн в прошлом не имеет смысла; у существующей — допустим (она может быть просрочена)
    notPast: helpers.withMessage(
      'Дедлайн не может быть в прошлом',
      (v: string) => isEdit.value || !v || v >= today,
    ),
  },
  assigneeId: { required: helpers.withMessage('Выберите исполнителя', required) },
}))

const v$ = useVuelidate(rules, form)

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const { id: _id, ...task } = await api.fetchTask(props.id!)
    Object.assign(form, task)
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось загрузить задачу'
  } finally {
    loading.value = false
  }
})

async function submit() {
  if (!(await v$.value.$validate())) return
  saving.value = true
  error.value = null
  try {
    const payload = { ...form, assigneeId: form.assigneeId as number }
    if (isEdit.value) await api.updateTask(props.id!, payload)
    else await api.createTask(payload)
    router.push({ name: 'tasks' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Не удалось сохранить задачу'
  } finally {
    saving.value = false
  }
}

const errors = (field: keyof typeof form) => v$.value[field].$errors.map((e) => String(e.$message))
</script>

<template>
  <section class="card">
    <h1>{{ isEdit ? 'Редактирование задачи' : 'Новая задача' }}</h1>

    <p v-if="loading" class="muted">Загрузка…</p>

    <form v-else class="form" novalidate @submit.prevent="submit">
      <label class="field">
        <span class="field__label">Название *</span>
        <input
          v-model.trim="form.title"
          class="control"
          :class="{ 'control--invalid': v$.title.$error }"
          @blur="v$.title.$touch()"
        />
        <span v-for="m in errors('title')" :key="m" class="field__error">{{ m }}</span>
      </label>

      <label class="field">
        <span class="field__label">Описание</span>
        <textarea
          v-model="form.description"
          class="control"
          :class="{ 'control--invalid': v$.description.$error }"
          @blur="v$.description.$touch()"
        />
        <span v-for="m in errors('description')" :key="m" class="field__error">{{ m }}</span>
      </label>

      <div class="form__row">
        <label class="field">
          <span class="field__label">Статус *</span>
          <select
            v-model="form.status"
            class="control"
            :class="{ 'control--invalid': v$.status.$error }"
            @blur="v$.status.$touch()"
          >
            <option v-for="s in STATUS_OPTIONS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <span v-for="m in errors('status')" :key="m" class="field__error">{{ m }}</span>
        </label>

        <label class="field">
          <span class="field__label">Дедлайн *</span>
          <input
            v-model="form.deadline"
            type="date"
            class="control"
            :class="{ 'control--invalid': v$.deadline.$error }"
            @blur="v$.deadline.$touch()"
          />
          <span v-for="m in errors('deadline')" :key="m" class="field__error">{{ m }}</span>
        </label>

        <label class="field">
          <span class="field__label">Исполнитель *</span>
          <select
            v-model="form.assigneeId"
            class="control"
            :class="{ 'control--invalid': v$.assigneeId.$error }"
            @blur="v$.assigneeId.$touch()"
          >
            <option :value="null" disabled>Выберите…</option>
            <option v-for="a in ASSIGNEES" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
          <span v-for="m in errors('assigneeId')" :key="m" class="field__error">{{ m }}</span>
        </label>
      </div>

      <p v-if="error" class="field__error">{{ error }}</p>

      <div class="form__actions">
        <RouterLink :to="{ name: 'tasks' }" class="btn">Отмена</RouterLink>
        <button type="submit" class="btn btn--primary" :disabled="saving">
          {{ saving ? 'Сохранение…' : 'Сохранить' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
.card {
  max-width: 720px;
  padding: 24px;
  margin: 0 auto;
  background: $color-surface;
  border-radius: $radius;
  box-shadow: $shadow;
}

.muted {
  color: $color-muted;
}

.form {
  display: grid;
  gap: 16px;
  margin-top: 20px;

  &__row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;

    @include respond-down($breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>
