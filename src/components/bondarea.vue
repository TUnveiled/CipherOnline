<template>
    <div>
        <div v-if="dataref" id="bonddiv">
        <img v-if="dataref.length > 0" :src="(dataref[0].flipped) ? 'src/assets/cardback.png' : dataref[0].imageref"
             alt="" class="baseBond">
            <!-- TODO: display additional bonds -->
        </div>
    </div>
</template>

<script>
    export default {
        name: "bondarea",
        props: {
            dataref: Array
        }
    }
</script>

<style scoped>
    .baseBond {
        height: 80px;
        position: relative;
        justify-self: left;
    }
    #bonddiv {
        text-align: left;
        vertical-align: top;
        height: 100%;
    }

    div {
        vertical-align: top;
    }

</style>