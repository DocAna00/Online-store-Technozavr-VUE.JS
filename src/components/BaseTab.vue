<template>
  <div v-show="isActive">
    <slot></slot>
  </div>
</template>
  
<script>
export default {
  name: "BaseTab",
  props: {
    selected: { default: false },
    label: { required: true }
  },
  data() {
    return {
      isActive: false
    };
  },
  computed: {},
  mounted() {
    this.isActive = this.selected;
  }
};
</script>