<template>
  <header class="header">
    <div class="container header__inner">
      <RouterLink to="/" class="header__logo">N-bank <span>Tasks</span></RouterLink>
      <RouterLink to="/tasks/new" class="btn btn--primary">+ Новая задача</RouterLink>
    </div>
  </header>
  <main class="container main">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
.header {
  background: $color-surface;
  border-bottom: 1px solid $color-border;

  &__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
  }

  &__logo {
    font-size: 18px;
    font-weight: 800;
    color: $color-text;
    text-decoration: none;

    span {
      color: $color-primary;
    }
  }
}

.main {
  padding-top: 24px;
  padding-bottom: 48px;
}
</style>
