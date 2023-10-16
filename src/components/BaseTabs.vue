<template>
  <div>
    <ul class="tabs">
      <li v-for="tab in tabs" :key="tab.label" class="tabs__item">
        <a class="tabs__link " :class="{ 'tabs__link--current': tab.isActive }" href="#"
          @click.prevent="selectTab(tab)">{{ tab.label }}</a>
      </li>
    </ul>
    <div class="item__content">
      <slot></slot>
    </div>
  </div>
</template>
  
<script>
export default {
  name: "BaseTabs",
  data() {
    return {
      tabs: []
    };
  },
  created() {
    this.tabs = this.$children;
  },
  methods: {
    selectTab(selectedTab) {
      this.tabs.forEach(tab => {
        const tab1 = tab;
        tab1.isActive = tab1 === selectedTab;
      });
    }
  }
};
</script>