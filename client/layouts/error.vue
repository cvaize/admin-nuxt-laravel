<template>
  <div class="nuxt-error">
    <h1>{{error.statusCode}}</h1>
  </div>
</template>
<script>
export default {
  name: 'NuxtError',
  layout: 'default',
  middleware: [],
  props: {
    error: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
