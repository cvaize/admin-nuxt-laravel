<template>
  <div :class="{'page-loaded': loaded}" class="layout">
    <main class="position-relative">
      <nuxt/>
    </main>
  </div>
</template>

<script>
export default {
  data: () => ({
    loaded: false
  }),
  mounted () {
    this.loaded = true
  }
}
</script>
