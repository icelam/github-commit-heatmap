<template>
  <div class="error-message">
    <i class="fas fa-exclamation-circle error-message__icon"></i>
    <div class="error-message__text" v-html="message"></div>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang='scss' scoped>
  @import './errorMessage';
</style>
