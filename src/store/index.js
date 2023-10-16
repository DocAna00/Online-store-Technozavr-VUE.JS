import Vue from "vue";
import Vuex from 'vuex';
import axios from 'axios';
import { API_BASE_URL } from '@/config';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        cartProducts: [],
        userAccessKey: null,
        cartProductsData: [],
        orderInfo: null,
        deliveryPrice: 0
    },
    mutations: {
        updateOrderInfo(state, orderInfo) {
            state.orderInfo = orderInfo;
        },
        resetCart(state) {
            state.cartProducts = [];
            state.cartProductsData = [];
        },
        updateCartProductAmount(state, { basketItemId, quantity }) {
            const item = state.cartProducts.find(item => item.basketItemId === basketItemId);

            if (item) {
                item.quantity = quantity;
            }
        },
        deleteCartProduct(state, basketItemId) {
            state.cartProducts = state.cartProducts.filter(item => item.basketItemId !== basketItemId);
        },
        updateUserAccessKey(state, accessKey) {
            state.userAccessKey = accessKey;
        },
        updateCartProductsData(state, items) {
            state.cartProductsData = items;
        },
        syncCartProducts(state) {
            state.cartProducts = state.cartProductsData.map(item => {
                return {
                    basketItemId: item.id,
                    offerTitle: item.productOffer.title,
                    colorId: item.color.color.id,
                    quantity: item.quantity
                }
            });
        },
        updateDeliveryPrice(state, price) {
            state.deliveryPrice = price;
        }
    },
    getters: {
        cartDetailProducts(state) {
            return state.cartProducts.map(item => {
                const product = state.cartProductsData.find(p => p.id === item.basketItemId);
                return {
                    ...item,
                    product: {
                        ...product,
                        image: product.productOffer.product.preview.file.url
                    }
                }
            });
        },
        cartTotalPrice(state, getters) {
            return getters.cartDetailProducts.reduce((acc, item) => (item.product.price * item.quantity) + acc, 0);
        },
        cartTotalPosition(state) {
            return state.cartProducts.length;
        },
        orderInfo(state) {
            return state.orderInfo;
        },
        totalPositionInfo(state) {
            if (state.orderInfo) {
                return state.orderInfo.basket.items.length;
            }
        },
        totalPriceInfo(state) {
            if (state.orderInfo) {
                return state.orderInfo.basket.items.reduce(
                    (acc, item) => item.price * item.quantity + acc,
                    0
                );
            }
        }
    },
    actions: {
        loadOrderInfo(context, orderId) {
            return axios.get(API_BASE_URL + '/api/orders/' + orderId, {
                params: {
                    userAccessKey: context.state.userAccessKey
                }
            })
                .then(response => {
                    context.commit('updateOrderInfo', response.data);
                });
        },
        loadCart(context) {
            return axios.get(API_BASE_URL + '/api/baskets', {
                params: {
                    userAccessKey: context.state.userAccessKey
                }
            })
                .then(response => {
                    if (!context.state.userAccessKey) {
                        localStorage.setItem('userAccessKey', response.data.user.accessKey);
                        context.commit('updateUserAccessKey', response.data.user.accessKey);
                    }
                    context.commit('updateCartProductsData', response.data.items);
                    context.commit('syncCartProducts');
                })
        },
        addProductToCart(context, { productOfferId, colorId, quantity }) {
            return (new Promise(resolve => setTimeout(resolve, 300)))
                .then(() => {
                    return axios.post(API_BASE_URL + '/api/baskets/products', {
                        productOfferId,
                        colorId,
                        quantity
                    }, {
                        params: {
                            userAccessKey: context.state.userAccessKey
                        }
                    })
                        .then(response => {
                            context.commit('updateCartProductsData', response.data.items);
                            context.commit('syncCartProducts');
                        })
                })
        },
        updateCartProductAmount(context, { basketItemId, quantity }) {
            context.commit('updateCartProductAmount', { basketItemId, quantity });

            if (quantity < 1) {
                return;
            }

            return axios.put(API_BASE_URL + '/api/baskets/products', {
                basketItemId,
                quantity
            }, {
                params: {
                    userAccessKey: context.state.userAccessKey
                }
            })
                .then(response => {
                    context.commit('updateCartProductsData', response.data.items);
                })
                .catch(() => {
                    context.commit('syncCartProducts');
                })
        },
        deleteProductFromCart(context, basketItemId) {
            return axios.delete(API_BASE_URL + '/api/baskets/products', {
                data: { basketItemId },
                params: {
                    userAccessKey: context.state.userAccessKey
                }
            })
                .then(response => {
                    context.commit('updateCartProductsData', response.data.items);
                    context.commit('syncCartProducts');
                })
        }
    }
});