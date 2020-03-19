<template>
    <div class="unit" v-on:mouseenter="onHover" v-on:mouseleave="stopHover">
        <div class="title" v-if="verbose">{{cardref.name}}</div>
        <img class="image" :src="cardref.imageref" alt="Loading..." :style="
             ((canadd === true) ? '' : 'opacity: 0.5')">
        <div class="plus" v-if="verbose">
            <button class="plus">+</button>
        </div>
        <div class="count" v-if="verbose">
            {{0}}
        </div>
        <div class="minus" v-if="verbose">
            <button class="minus">-</button>
        </div>
    </div>
</template>

<script>
    export default {
        name: "bindercard",
        mounted() {

        },
        data() {
            return {
                verbose: false
            }
        },
        props: {
            canadd: Boolean,
            cardref: Object,
            count: Number
        },
        methods: {
            onHover() {
                this.$emit('hover', this.cardref);
                this.verbose = true;
            },
            stopHover() {
                this.verbose = false;
            }
        }
    }
</script>

<style scoped>
    .unit {
        position: relative;
    }

    .title {
        z-index: 1;
        text-shadow: 1px 1px black;
        font-size: 14px;
        color: white;
        position: absolute;
        top: 5%;
        right: 0;
        left: 0;
        bottom: 0;
    }

    img {
        max-width: 119px;
        width: 100%;
    }

    .minus {
        z-index: 1;
        max-height: 25px;
        min-height: 25px;
        max-width: 25px;
        min-width: 25px;
        border-radius: 8px;
        padding: 1px 1px 1px 1px;
        text-shadow: 1px 1px black;
        font-size: 30px;
        color: white;
        position: absolute;
        top: 60%;
        left: 5%;
        right: 0;
        bottom: 0;
        line-height: 0;
    }

    button.minus {
        background: green;
    }

    .plus {
        z-index: 1;
        max-height: 25px;
        min-height: 25px;
        max-width: 25px;
        min-width: 25px;
        border-radius: 8px;
        padding: 1px 1px 1px 1px;
        text-shadow: 1px 1px black;
        font-size: 25px;
        color: white;
        position: absolute;
        top: 60%;
        left: 60%;
        right: 0;
        bottom: 0;
        line-height: 1;
    }

    button.plus {
        background: green;
    }

    .count {
        z-index: 1;
        max-height: 25px;
        min-height: 25px;
        max-width: 25px;
        min-width: 25px;
        border-radius: 8px;
        padding: 1px 1px 1px 1px;
        text-shadow: 1px 1px #000;
        background: rgba(0,0,0,0.5);
        opacity: 1;
        font-size: 25px;
        color: white;
        position: absolute;
        top: 70%;
        left: 40%;
        right: 0;
        bottom: 0;
        line-height: 1;
    }



</style>