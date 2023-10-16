<template>
  <main class="content container">
    <div class="content__top content__top--catalog">
      <h1 class="content__title">
        Каталог
      </h1>
      <span class="content__info">
        {{ countProducts + " " + countProductsOnPage(countProducts) }}
      </span>
    </div>
    <div class="content__catalog">
      <ProductFilter :price-from.sync="filterPriceFrom" :price-to.sync="filterPriceTo"
        :category-id.sync="filterCategoryId" :color-id.sync="filterColorId" :prop-id.sync="filterPropId"
        :prop-name.sync="filterPropName"></ProductFilter>
      <section class="catalog">
        <div v-if="productsLoading" style="font-size: 25px; text-align: center"><img src="../1488.gif"
            style="vertical-align: middle; padding-right: 5px">Загрузка товаров...</div>
        <div v-if="productsLoadingFailed">Произошла ошибка при загрузке товаров
          <button @click.prevent="loadProducts">Перезагрузить страницу</button>
        </div>
        <ProductList :products="products"></ProductList>
        <BasePaginatioan v-model="page" :count="countProducts" :per-page="productsPerPage"></BasePaginatioan>
      </section>

    </div>
  </main>
</template>

<script>
import ProductList from '@/components/ProductList.vue';
import BasePaginatioan from '@/components/BasePaginatioan.vue';
import ProductFilter from '@/components/ProductFilter.vue';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import countProductsOnPage from '@/helpers/countProductsOnPage';

export default {
  components: { ProductList, BasePaginatioan, ProductFilter },
  data() {
    return {
      filterPriceFrom: null,
      filterPriceTo: null,
      filterCategoryId: 0,
      filterColorId: [],
      filterPropId: [],
      filterPropName: null,
      page: 1,
      productsPerPage: 12,
      productsData: null,
      productsLoading: false,
      productsLoadingFailed: false
    }
  },
  computed: {
    products() {
      function filterColors(a, b) {
        let result = a.reduce((acc, item) => {
          acc.push(b.includes(item.color.id));
          return acc;
        }, []);
        return result.includes(true);
      }
      let data = this.productsData
        ? this.productsData.items.map(product => {
          return {
            ...product,
            image: product.preview.file.url
          };
        })
        : [];
      return this.filterColorId.length > 0
        ? data.filter(item => filterColors(item.colors, this.filterColorId))
        : data;
    },
    countProducts() {
      return this.productsData ? this.productsData.pagination.total : 0;
    },
    filterName() {
      return this.filterPropName ? `props[${this.filterPropName}]` : null;
    }
  },
  methods: {
    countProductsOnPage,
    categorySelect() {
      if (this.$route.query.category) {
        this.filterCategoryId = Number(this.$route.query.category);
      }
    },
    loadProducts() {
      this.productsLoading = true;
      this.productsLoadingFailed = false;

      clearTimeout(this.loadProductsTimer);
      this.loadProductsTimer = setTimeout(() => {
        axios.get(API_BASE_URL + `/api/products`, {
          params: {
            categoryId: this.filterCategoryId,
            page: this.page,
            limit: this.productsPerPage,
            minPrice: this.filterPriceFrom,
            maxPrice: this.filterPriceTo,
            [this.filterName]: this.filterPropId
          }
        })
          .then(response => this.productsData = response.data)
          .catch(() => this.productsLoadingFailed = true)
          .then(() => this.productsLoading = false);
      }, 0);
    }
  },
  watch: {
    page() {
      this.loadProducts();
    },
    filterPriceFrom() {
      this.loadProducts();
    },
    filterPriceTo() {
      this.loadProducts();
    },
    filterCategoryId() {
      this.loadProducts();
    },
    filterColorId() {
      this.loadProducts();
    },
    filterPropId() {
      this.loadProducts();
    }
  },
  created() {
    this.loadProducts();
    this.categorySelect();
  }
}
</script>