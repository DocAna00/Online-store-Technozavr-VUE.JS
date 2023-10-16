<template>
    <main class="content container">
        <div class="content__top">
            <ul class="breadcrumbs">
                <li class="breadcrumbs__item">
                    <router-link class="breadcrumbs__link" :to="{ name: 'main' }">
                        Каталог
                    </router-link>
                </li>
                <li class="breadcrumbs__item">
                    <router-link class="breadcrumbs__link" :to="{ name: 'cart' }">
                        Корзина
                    </router-link>
                </li>
                <li class="breadcrumbs__item">
                    <a class="breadcrumbs__link">
                        Оформление заказа
                    </a>
                </li>
            </ul>

            <h1 class="content__title">
                Корзина
            </h1>
            <span class="content__info">
                {{ products.length }} товар(а)
            </span>
        </div>

        <section class="cart">
            <div v-if="productsLoading" style="font-size: 25px; text-align: center; margin-bottom: 50px;"><img
                    src="../1488.gif" style="vertical-align: middle; padding-right: 5px">Идёт отправка формы...</div>
            <form class="cart__form form" action="#" method="POST" @submit.prevent="order">
                <div class="cart__field">
                    <div class="cart__data">
                        <BaseFormText v-model="formData.name" title="ФИО" placeholder="Введите ваше полное имя"
                            :error="formError.name"></BaseFormText>

                        <BaseFormText v-model="formData.address" title="Адрес доставки" placeholder="Введите ваш адрес"
                            :error="formError.address"></BaseFormText>

                        <BaseFormText v-model="formData.phone" title="Телефон" placeholder="Введите ваш телефон"
                            :error="formError.phone" type="tel"></BaseFormText>

                        <BaseFormText v-model="formData.email" title="Email" placeholder="Введи ваш Email"
                            :error="formError.email"></BaseFormText>

                        <BaseFormTextaera title="Комментарий к заказу" v-model="formData.comment" :error="formError.comment"
                            placeholder="Ваши пожелания"></BaseFormTextaera>
                    </div>

                    <div class="cart__options">
                        <h3 class="cart__title">Доставка</h3>
                        <ul class="cart__options options">
                            <li class="options__item" v-for="item in deliveriesData" :key="item.id">
                                <label class="options__label">
                                    <input class="options__radio sr-only" type="radio" name="delivery" :value="item.id"
                                        v-model="formData.deliveryTypeId">
                                    <span class="options__value">
                                        {{ item.title }}
                                        <b>{{ item.price == 0 ? "бесплатно" : item.price }}
                                            <span class="rub" v-if="item.price > 0">₽</span>
                                        </b>
                                    </span>
                                </label>
                            </li>
                        </ul>

                        <h3 class="cart__title">Оплата</h3>
                        <ul class="cart__options options">
                            <li class="options__item" v-for="item in paymentsData" :key="item.id">
                                <label class="options__label">
                                    <input class="options__radio sr-only" type="radio" name="pay" :value="item.id"
                                        v-model="formData.paymentTypeId">
                                    <span class="options__value">
                                        {{ item.title }}
                                    </span>
                                </label>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="cart__block">
                    <ul class="cart__orders">
                        <li class="cart__order" v-for="item in products">
                            <h3 v-if="item.product.productOffer.product.mainProp.id !== 7"> {{
                                item.product.productOffer.title }}</h3>
                            <h3 v-if="item.product.productOffer.product.mainProp.id === 7"> {{
                                products[0].product.productOffer.product.title }}</h3>
                            <b>{{ (item.quantity * item.product.price) | numberFormat }} ₽</b>
                            <span>Количество: {{ item.quantity }}</span>
                            <span>Артикул: {{ item.product.id }}</span>
                        </li>
                    </ul>

                    <div class="cart__total">
                        <p>Доставка: <b>{{ deliveryPrice }} ₽</b></p>
                        <p>Итого: <b>{{ products.length }}</b> товар(а) на сумму <b>{{ (totalPrice + deliveryPrice) |
                            numberFormat }} ₽</b>
                        </p>
                    </div>

                    <button class="cart__button button button--primery" type="submit">
                        Оформить заказ
                    </button>
                </div>
                <div class="cart__error form__error-block" v-if="formErrorMessage">
                    <h4>Заявка не отправлена!</h4>
                    <p>
                        {{ formErrorMessage }}
                    </p>
                </div>
            </form>
        </section>
    </main>
</template>

<script>
import numberFormat from '@/helpers/numberFormat';
import BaseFormText from '@/components/BaseFormText.vue';
import BaseFormTextaera from '@/components/BaseFormTextaera.vue';
import { mapGetters, mapMutations } from 'vuex';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

export default {
    components: { BaseFormText, BaseFormTextaera },
    data() {
        return {
            formData: {
                deliveryTypeId: null,
                paymentTypeId: null
            },
            formError: {},
            formErrorMessage: '',
            productsLoading: false,
            deliveriesData: [],
            paymentsData: []
        }
    },
    filters: {
        numberFormat
    },
    computed: {
        ...mapGetters({ products: 'cartDetailProducts', totalPrice: 'cartTotalPrice' }),
        deliveryPrice() {
            return this.formData.deliveryTypeId
                ? +this.deliveriesData.find(item => item.id === this.formData.deliveryTypeId).price
                : 0;
        }
    },
    methods: {
        ...mapMutations(["updateDeliveryPrice"]),
        order() {
            this.formError = {};
            this.formErrorMessage = '';
            this.productsLoading = true;

            clearTimeout(this.loadProductsTimer);
            this.loadProductsTimer = setTimeout(() => {
                axios.post(API_BASE_URL + '/api/orders', {
                    ...this.formData
                }, {
                    params: {
                        userAccessKey: this.$store.state.userAccessKey
                    }
                })
                    .then(response => {
                        this.$store.commit('resetCart');
                        this.$store.commit('updateOrderInfo', response.data);
                        this.$router.push({ name: 'orderInfo', params: { id: response.data.id } });
                    })
                    .catch(error => {
                        this.formError = error.response.data.error.request || {};
                        this.formErrorMessage = error.response.data.error.message;
                    })
                    .then(() => this.productsLoading = false)
            }, 1000);
        },
        loadDeliveries() {
            axios
                .get(API_BASE_URL + "/api/deliveries")
                .then(response => (this.deliveriesData = response.data))
                .then(() => {
                    this.formData.deliveryTypeId = this.deliveriesData[0].id;
                })
                .then(() => {
                    this.loadPayments(this.formData.deliveryTypeId);
                });
        },
        loadPayments(value) {
            axios
                .get(API_BASE_URL + "/api/payments", {
                    params: {
                        deliveryTypeId: this.formData.deliveryTypeId
                    }
                })
                .then(response => (this.paymentsData = response.data))
                .then(() => {
                    this.formData.paymentTypeId = this.paymentsData[0].id;
                });
        }
    },
    created() {
        this.loadDeliveries();
    },
    watch: {
        "formData.deliveryTypeId": function (val, oldVal) {
            if (oldVal === null) {
                return;
            }
            axios
                .get(API_BASE_URL + "/api/payments", {
                    params: {
                        deliveryTypeId: this.formData.deliveryTypeId
                    }
                })
                .then(response => {
                    this.paymentsData = response.data;
                })
                .then(() => {
                    this.formData.paymentTypeId = this.paymentsData[0].id;
                });
        },
        deliveryPrice() {
            this.$store.commit("updateDeliveryPrice", Number(this.deliveryPrice));
        }
    }
}
</script>