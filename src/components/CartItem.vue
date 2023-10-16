<template>
    <li class="cart__item product">
        <div class="product__pic">
            <img :src="item.product.image" width="120" height="120" :alt="item.product.title">
        </div>
        <h3 class="product__title" v-if="item.product.productOffer.product.mainProp.id !== 7">
            {{ item.product.productOffer.title }}
        </h3>
        <h3 class="product__title" v-if="item.product.productOffer.product.mainProp.id === 7">
            {{ item.product.productOffer.product.title }}
        </h3>
        <div class="product__info product__info-extra" style="display: inline-flex; align-items: center"
            v-if="item.product.productOffer.product.mainProp.id !== 7">
            {{ item.product.productOffer.product.mainProp.title }}:
            &nbsp; {{ item.product.productOffer.propValues[0].value }}
        </div>

        <div class="product__info" style="display: flex; flex-direction: row; align-items: center;">
            Цвет: &nbsp;
            <span class="colors__value" :style="{ 'background-color': item.product.color.color.code }">
            </span>
            &nbsp; {{ item.product.color.color.title }}
        </div>

        <span class="product__code">
            Артикул: {{ item.product.id }}
        </span>

        <div class="product__counter form__counter">
            <button type="button" aria-label="Убрать один товар" @click.prevent="decrementQuantity">
                <svg width="10" height="10" fill="currentColor">
                    <use xlink:href="#icon-minus"></use>
                </svg>
            </button>

            <input type="text" v-model.number="quantity" name="count">

            <button type="button" aria-label="Добавить один товар" @click.prevent="incrementQuantity">
                <svg width="10" height="10" fill="currentColor">
                    <use xlink:href="#icon-plus"></use>
                </svg>
            </button>
        </div>

        <b class="product__price">
            {{ (item.quantity * item.product.price) | numberFormat }} ₽
        </b>

        <button class="product__del button-del" type="button" aria-label="Удалить товар из корзины"
            @click.prevent="deleteProductFromCart(item.basketItemId)">
            <svg width="20" height="20" fill="currentColor">
                <use xlink:href="#icon-close"></use>
            </svg>
        </button>
    </li>
</template>

<script>
import numberFormat from '@/helpers/numberFormat';
import { mapActions } from 'vuex';

export default {
    filters: { numberFormat },
    props: ['item'],
    computed: {
        quantity: {
            get() {
                return this.item.quantity;
            },
            set(value) {
                this.$store.dispatch('updateCartProductAmount', { basketItemId: this.item.basketItemId, quantity: value });
            }
        }
    },
    methods: {
        ...mapActions(['deleteProductFromCart']),
        incrementQuantity() {
            this.$store.commit("updateCartProductAmount", {
                basketItemId: this.item.basketItemId,
                quantity: ++this.quantity
            });
        },
        decrementQuantity() {
            if (this.quantity > 1) {
                this.$store.commit("updateCartProductAmount", {
                    basketItemId: this.item.basketItemId,
                    quantity: --this.quantity
                });
            }
        }
    }
}
</script>