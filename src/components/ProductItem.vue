<template>
  <li class="catalog__item">
    <router-link class="catalog__pic" :to="{ name: 'product', params: { id: product.id } }">
      <img :src="product.image" :alt="product.title" />
    </router-link>

    <h3 class="catalog__title">
      <a href="#">
        {{ product.title }}
      </a>
    </h3>

    <span class="catalog__price"> {{ currentPrice | numberFormat }} &#8381; </span>

    <ul class="colors colors--black">
      <li class="colors__item" v-for="(item, index) in product.colors" :key="item.color.id">
        <label class="colors__label">
          <input class="colors__radio sr-only" :name="item.id" type="radio" v-model="pickedColor" :value="index" />
          <span class="colors__value" :style="{ 'background-color': item.color.code }"> </span>
        </label>
      </li>
    </ul>
    <MainPropOptions :products="product.offers" :price-update.sync="currentPrice"
      :current-prop-id.sync="product.mainProp.id" :product-price.sync="product.price" />
  </li>
</template>

<script>
import gotoPage from '@/helpers/gotoPage';
import numberFormat from '@/helpers/numberFormat';
import MainPropOptions from "@/components/MainPropOptions.vue";

export default {
  data() {
    return {
      currentPrice: null,
      pickedColor: null
    };
  },
  filters: {
    numberFormat
  },
  props: ["product"],
  components: { MainPropOptions },
  methods: {
    gotoPage
  },
  created() {
    this.currentPrice = this.product.offers[0].price;
  },
  mounted() {
    this.pickedColor = 0;
  }
}
</script>

<style>
.colors {
  margin-bottom: 10px;
}
</style>