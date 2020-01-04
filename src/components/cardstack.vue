<template>
    <div class="cardstack">
        <div v-if="title" class="title">{{title}}</div>
        <img v-if="count > 0" class="image" :src="imageref" alt="">
        <img v-else class="image" src="https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png" alt="">
        <div class="count">{{count}}</div>
    </div>
</template>

<script>
    export default {
        name: "cardstack",
        data() {
            return {

            }
        },
        props: {
            title: String,
            count: Number,
            imageref: String
        }
    }
</script>

<style scoped>
    .cardstack {
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

    .image {
        height: 80px;
        z-index: 0;
        position: relative;
        text-align: center;
        opacity: 0.5;
    }

    .count {
        z-index: 1;
        text-shadow: 1px 1px black;
        font-size: 30px;
        color: white;
        position: absolute;
        top: 60%;
        right: 0;
        left: 0;
        bottom: 0;
    }
</style>