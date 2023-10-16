<template>
    <aside class="filter">
        <h2 class="filter__title">Фильтры</h2>

        <form class="filter__form form" action="#" method="get" @submit.prevent="submit">
            <fieldset class="form__block">
                <legend class="form__legend">Цена</legend>
                <label class="form__label form__label--price">
                    <input class="form__input" type="text" name="min-price" v-model.number="currentPriceFrom">
                    <span class="form__value">От</span>
                </label>
                <label class="form__label form__label--price">
                    <input class="form__input" type="text" name="max-price" v-model.number="currentPriceTo">
                    <span class="form__value">До</span>
                </label>
            </fieldset>

            <fieldset class="form__block">
                <legend class="form__legend">Категория</legend>
                <label class="form__label form__label--select">
                    <select class="form__select" type="text" name="category" v-model="currentCategoryId">
                        <option value="0">Все категории</option>
                        <option :value="category.id" v-for="category in categories" :key="category.id">{{ category.title }}
                        </option>
                    </select>
                </label>
            </fieldset>

            <fieldset class="form__block" v-if="currentCategoryId > 0 && propName != 'color'">
                <legend class="form__legend">Цвет</legend>
                <ul class="colors">
                    <li class="colors__item" v-for="color in colors" :key="color.title + color.id">
                        <label class="colors__label">
                            <input class="colors__radio sr-only" type="checkbox" name="color" :value="color.id"
                                v-model="currentColorId">
                            <span class="colors__value" :style="{ 'background-color': color.code }">
                            </span>
                        </label>
                    </li>
                </ul>
            </fieldset>

            <fieldset class="form__block" v-if="currentCategoryId > 0 && category">
                <legend class="form__legend">{{ category.title }}</legend>
                <ul class="check-list">
                    <li class="check-list__item" v-for="(item, index) in category.availableValues" :key="index">
                        <label class="check-list__label">
                            <input class="check-list__check sr-only" type="checkbox" name="volume" :value="item.value"
                                v-model="currentPropId" :checked="index === 0" />
                            <span class="check-list__desc">
                                {{ item.value }}
                                <span>({{ item.productsCount }})</span>
                            </span>
                        </label>
                    </li>
                </ul>
            </fieldset>

            <button class="filter__submit button button--primery" type="submit">
                Применить
            </button>
            <button class="filter__reset button button--second" type="button" @click.prevent="reset" v-if="currentPriceFrom ||
                currentPriceTo ||
                currentCategoryId ||
                currentColorId.length > 1 ||
                currentPropId.length > 1
                ">
                Сбросить
            </button>
        </form>
    </aside>
</template>

<script>
import axios from 'axios';
import { API_BASE_URL } from '@/config';

export default {
    data() {
        return {
            currentPriceFrom: null,
            currentPriceTo: null,
            currentCategoryId: null,
            currentColorId: [],
            currentPropId: [],
            currentPropName: null,

            categoriesData: null,
            categoryData: null,
            colorsData: [],
            propsData: []
        }
    },
    props: ['priceFrom', 'priceTo', 'categoryId', 'colorId', 'propId', 'propName'],
    computed: {
        categories() {
            return this.categoriesData ? this.categoriesData.items : [];
        },
        category() {
            return this.categoryData ? this.categoryData.productProps[0] : [];
        },
        colors() {
            return this.colorsData ? this.colorsData.items : [];
        }
    },
    watch: {
        priceFrom(value) {
            this.currentPriceFrom = value;
        },
        priceTo(value) {
            this.currentPriceTo = value;
        },
        categoryId(value) {
            this.currentCategoryId = value;
        },
        colorId(value) {
            this.currentColorId = value;
        },
        propId(value) {
            this.currentPropId = value;
        },
        currentCategoryId: function () {
            this.categoryData = null;
            if (this.currentCategoryId > 0) {
                axios
                    .get(API_BASE_URL + "/api/productCategories/" + this.currentCategoryId)
                    .then(response => (this.categoryData = response.data))
                    .then(
                        () =>
                        (this.currentPropName =
                            this.categoryData.productProps.length > 0
                                ? this.categoryData.productProps[0].code
                                : null)
                    )
                    .then(() => (this.currentPropId = []))
                    .then(() => (this.currentColorId = []));
            }
        }
    },
    methods: {
        submit() {
            this.$emit('update:priceFrom', this.currentPriceFrom);
            this.$emit('update:priceTo', this.currentPriceTo);
            this.$emit('update:categoryId', this.currentCategoryId);
            this.$emit('update:colorId', this.currentColorId);
            this.$emit("update:propId", this.currentPropId);
            this.$emit("update:propName", this.currentPropName);
        },
        reset() {
            this.$emit("update:priceFrom", null);
            this.$emit("update:priceTo", null);
            this.$emit("update:categoryId", 0);
            this.$emit("update:propId", []);
            this.$emit("update:colorId", []);
            this.currentCategoryId = 0;
        },
        loadCategories() {
            axios.get(API_BASE_URL + '/api/productCategories')
                .then(response => this.categoriesData = response.data);
        },
        loadColors() {
            axios.get(API_BASE_URL + '/api/colors')
                .then(response => this.colorsData = response.data);
        },
        submitCategory() {
            this.currentCategoryId = this.categoryId;
        }
    },
    created() {
        this.loadCategories();
        this.loadColors();
        this.submitCategory();
    }
}
</script>