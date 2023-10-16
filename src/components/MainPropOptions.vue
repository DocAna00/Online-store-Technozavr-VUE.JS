<template>
    <ul class="sizes sizes--primery" v-if="currentPropId != 7">
        <li class="sizes__item" v-for="item in products" :key="item.id">
            <label class="sizes__label">
                <input class="sizes__radio sr-only" type="radio" :name="item.id" :value="item.price"
                    @click.prevent="updatePrice(item.id, item.price)" />
                <span class="sizes__value">
                    {{ item.propValues[0].value }}
                </span>
            </label>
        </li>
    </ul>
</template>
  
<script>

export default {
    props: ["products", "priceUpdate", "currentProp", "currentPropId", "productPrice"],
    methods: {
        updatePrice(id, price) {
            this.$emit("update:currentProp", id);
            this.$emit("update:priceUpdate", price);
            this.$emit("update:productPrice", price);
        }
    }
};
</script>