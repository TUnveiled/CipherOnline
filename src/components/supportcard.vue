<template>
    <div class="supportcard" v-on:mouseenter="onHover">
        <div v-if="oref">
            <div class="title"> Support</div>
            <img class="image" :src="oref.imageref" alt="card">
            <div class="support">{{oref.support}}</div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "supportcard",
        mounted() {

        },
        data() {
            return this.oref;
        },
        props: {
            oref: Object
        },
        methods: {
            onHover() {
                this.$emit('hover', this.oref);
            }
        }
    }
</script>

<style scoped>
    .supportcard {
        position: relative;
    }

    .title {
        z-index: 1;
        text-shadow: 1px 1px black;
        font-size: 12px;
        color: white;
        position: absolute;
        top: 5%;
        right: 0;
        left: 0;
        bottom: 0;
    }

    .image {
        height: 80px;
        z-index: 0;
        position: relative;
        text-align: center;
        border-radius: 6px;
    }

    .support {
        z-index: 1;
        text-shadow: 1px 1px black;
        font-size: 25px;
        color: white;
        position: absolute;
        top: 60%;
        right: 0;
        left: 40%;
        bottom: 0;
    }

</style>