<template>
    <main class="content container" v-if="productLoading">Загрузка товара...</main>
    <main class="content container" v-else-if="!productData">Не удалось загрузить товар</main>
    <main class="content container" v-else="productData">
        <div class="content__top">
            <ul class="breadcrumbs">
                <li class="breadcrumbs__item">
                    <router-link class="breadcrumbs__link" :to="{ name: 'main' }">
                        Каталог
                    </router-link>
                </li>
                <li class="breadcrumbs__item">
                    <router-link class="breadcrumbs__link" :to="{ name: 'main', query: { category: category.id } }">
                        {{ category.title }}
                    </router-link>
                </li>
                <li class="breadcrumbs__item">
                    <a class="breadcrumbs__link">
                        {{ product.title }}
                    </a>
                </li>
            </ul>
        </div>

        <section class="item">
            <div class="item__pics pics">
                <div class="pics__wrapper">
                    <img width="570" height="570" :src="product.preview.file.url" :alt="product.title">
                </div>
                <ul class="pics__list">
                    <li class="pics__item">
                        <a href="#" class="pics__link pics__link--current">
                            <img width="98" height="98" :src="product.preview.file.url" :alt="product.title">
                        </a>
                    </li>
                    <li class="pics__item">
                        <a href="#" class="pics__link">
                            <img width="98" height="98" :src="product.preview.file.url" :alt="product.title">
                        </a>
                    </li>
                    <li class="pics__item">
                        <a href="#" class="pics__link">
                            <img width="98" height="98" :src="product.preview.file.url" :alt="product.title">
                        </a>
                    </li>
                    <li class="pics__item">
                        <a class="pics__link" href="#">
                            <img width="98" height="98" :src="product.preview.file.url" :alt="product.title">
                        </a>
                    </li>
                </ul>
            </div>

            <div class="item__info">
                <span class="item__code">Артикул: {{ product.id }}</span>
                <h2 class="item__title">
                    {{ product.title }}
                </h2>
                <div class="item__form">
                    <form class="form" action="#" method="POST" @submit.prevent="addToCart">
                        <b class="item__price">
                            {{ product.price | numberFormat }} ₽
                        </b>

                        <fieldset class="form__block">
                            <legend class="form__legend">Цвет:</legend>
                            <ul class="colors">
                                <li class="colors__item" v-for="item in product.colors" :key="item.id">
                                    <label class="colors__label">
                                        <input class="colors__radio sr-only" type="radio" name="color-item"
                                            :value="item.color.id" v-model="colorId" />
                                        <span class="colors__value" :style="{ 'background-color': item.color.code }">
                                        </span>
                                    </label>
                                </li>
                            </ul>
                        </fieldset>

                        <fieldset class="form__block" v-if="productData.category.id != 4">
                            <legend class="form__legend">{{ product.mainProp.title }}:</legend>
                            <MainPropOptions :products="product.offers" :price-update.sync="product.price"
                                :current-prop.sync="productOfferId" :current-prop-id.sync="product.mainProp.id" />
                        </fieldset>

                        <div class="item__row">
                            <div class="form__counter">
                                <button type="button" aria-label="Убрать один товар" @click="decrementAmount">
                                    <svg width="12" height="12" fill="currentColor">
                                        <use xlink:href="#icon-minus"></use>
                                    </svg>
                                </button>

                                <input type="text" v-model.number="productAmount" />

                                <button type="button" aria-label="Добавить один товар" @click="incrementAmount">
                                    <svg width="12" height="12" fill="currentColor">
                                        <use xlink:href="#icon-plus"></use>
                                    </svg>
                                </button>
                            </div>

                            <button class="button button--primery" type="submit" :disabled="productAddSending">
                                В корзину
                            </button>
                        </div>
                        <div v-show="productAdded">Товар добавлен в корзину</div>
                        <div v-show="productAddSending">Добавляем товар в корзину...</div>
                    </form>
                </div>
            </div>

            <div class="item__desc">
                <BaseTabs>
                    <BaseTab label="Описание" :selected="true">
                        <div v-if="product.content">{{ product.content }}</div>
                        <div class="item__content" v-else>
                            <p>
                                Навигация GPS, ГЛОНАСС, BEIDOU Galileo и QZSS<br />
                                Синхронизация со смартфоном<br />
                                Связь по Bluetooth Smart, ANT+ и Wi-Fi<br />
                                Поддержка сторонних приложений<br />
                            </p>
                        </div>
                    </BaseTab>
                    <BaseTab label="Характеристики">
                        <div v-for="specification in product.specifications">
                            <h3>{{ specification.title }}</h3>
                            <p>{{ specification.value }}</p>
                        </div>
                    </BaseTab>
                    <BaseTab label="Гарантия">
                        <p>
                            Любой возврат должен быть осуществлен в течение Возвраты в магазине БЕСПЛАТНО.<br />
                            Вы можете вернуть товары в любой магазин. Магазин должен быть расположен в стране, в
                            которой Вы осуществили покупку. БЕСПЛАТНЫЙ возврат в Пункт выдачи заказов.<br />
                            Для того чтобы вернуть товар в одном из наших Пунктов выдачи заказов, позвоните по
                            телефону 8 800 600 90 09<br />
                        </p>
                    </BaseTab>
                    <BaseTab label="Оплата и доставка">
                        <p>
                            1.Курьерская доставка по Москве и Московской области – 1200 ₽<br />
                            2.Самовывоз из магазина. Список и адреса магазинов Вы можете посмотреть здесь<br />
                        </p>
                    </BaseTab>
                </BaseTabs>
            </div>
        </section>
    </main>
</template>

<script>
import gotoPage from '@/helpers/gotoPage';
import numberFormat from '@/helpers/numberFormat';
import axios from 'axios';
import { API_BASE_URL } from '@/config';
import { mapActions } from 'vuex';
import BaseTabs from "@/components/BaseTabs.vue";
import BaseTab from "@/components/BaseTab.vue";
import MainPropOptions from "@/components/MainPropOptions.vue";

export default {
    data() {
        return {
            productAmount: 1,
            productData: null,
            productLoading: false,
            productLoadingFailed: false,
            productAdded: false,
            productAddSending: false,
            colorId: null,
            productOfferId: null
        }
    },
    components: { BaseTabs, BaseTab, MainPropOptions },
    filters: {
        numberFormat
    },
    computed: {
        product() {
            return this.productData
                ? { ...this.productData, image: this.productData.preview.file.url }
                : {};
        },
        category() {
            return this.productData.category;
        }
    },
    methods: {
        ...mapActions(['addProductToCart']),
        gotoPage,
        addToCart() {
            this.productAdded = false;
            this.productAddSending = true;

            this.addProductToCart({ productOfferId: this.productOfferId, quantity: this.productAmount, colorId: this.colorId })
                .then(() => {
                    this.productAdded = true;
                    this.productAddSending = false;
                });
        },
        incrementAmount() {
            return ++this.productAmount;
        },
        decrementAmount() {
            if (this.productAmount > 1) {
                return --this.productAmount;
            }
        },
        loadProduct() {
            this.productLoading = true;
            this.productLoadingFailed = false;

            axios.get(API_BASE_URL + '/api/products/' + this.$route.params.id)
                .then((response) => {
                    this.productData = response.data;
                    this.colorId = this.product.colors[0].color.id;
                    this.productOfferId = this.product.offers[0].id;
                })
                .catch(() => this.productLoadingFailed = true)
                .then(() => this.productLoading = false);
        }
    },
    watch: {
        '$route.params.id': {
            handler() {
                this.loadProduct();
            },
            immediate: true
        }
    }
}
</script>