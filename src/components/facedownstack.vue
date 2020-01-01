<template>
    <div class="facedownstack">
        <div class="title">{{title}}</div>
        <img class="image" :src="imageref" alt="card back">
        <div class="count">{{count}}</div>
    </div>
</template>

<script>
    export default {
        name: "facedownstack",
        data() {
            return {
                imageref: "https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png"
            }
        },
        props: {
            title: String,
            count: Number
        }
    }
</script>

<style scoped>
    .facedownstack {
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
    }

    .count {
        z-index: 1;
        text-shadow: 1px 1px black;
        font-size: 30px;
        color: white;
        position: absolute;
        top: 70%;
        right: 0;
        left: 0;
        bottom: 0;
    }
</style>