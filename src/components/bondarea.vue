<template>
    <div>
        <div v-if="dataref" id="bonddiv">
            <div class="title">
                <h6 class="title">Bond Area</h6>
            </div>
            <!--img v-if="dataref.length > 0" :src="(dataref[0].flipped) ? 'src/assets/cardback.png' : dataref[0].imageref"
                 alt="" class="baseBond"-->
            <div :style="'min-width: ' + (57 + 20*(Math.ceil(dataref.length / 2) - 1)) + 'px'">
                <img v-for="i in Math.ceil(dataref.length / 2)" :key="i"
                     :src="(dataref[i-1].flipped) ? 'src/assets/cardback.png' : dataref[i-1].imageref"
                     alt="" :class="((i === 1) ? 'baseBond ' : 'additionalBond')"
                     v-on:mouseover="onHover(dataref[i-1].id)"
                     :style="'left: ' + 20*(i-1) + 'px'">
            </div>
            <div>
                <img v-for="i in Math.floor(dataref.length / 2)" :key="i+Math.ceil(dataref.length / 2)"
                     :src="(dataref[i-1+Math.ceil(dataref.length / 2)].flipped) ?
                           'src/assets/cardback.png' : dataref[i-1+Math.ceil(dataref.length / 2)].imageref"
                     alt="" :class="((i === 1) ? 'baseBond ' : 'additionalBond')"
                     v-on:mouseover="onHover(dataref[i-1+Math.ceil(dataref.length / 2)].id)"
                     :style="'left: ' + 20*(i-1) + 'px'">
            </div>
            <!--img :src="(ref.flipped) ? 'src/assets/cardback.png' : ref.imageref"
                 alt="" class="image" v-if="index <= dataref.length / 2">
            <div v-for="(ref, index) in dataref" :key="index"
                     :class="((index === 0) ? 'baseBond ' : '') +
                         ((index === dataref.length/2) ? 'baseBond ' : '') +
                         ((index > dataref.length / 2) ? 'additionalBonds' : '') +
                         ((index > 0 && index < dataref.length/2) ? '' : '')">
                    <img :src="(ref.flipped) ? 'src/assets/cardback.png' : ref.imageref"
                         alt="" :class="((index === 0) ? 'baseBond ' : '') +
                         ((index === dataref.length/2) ? 'baseBond ' : '') +
                         ((index > dataref.length / 2) ? 'additionalBonds' : '') +
                         ((index > 0 && index < dataref.length/2) ? '' : '')" v-if="index > dataref.length / 2">
                </div-->
            <!-- TODO: display additional bonds -->
        </div>
    </div>
</template>

<script>
    export default {
        name: "bondarea",
        props: {
            dataref: Array
        },
        methods: {
            onHover(id) {
                this.$emit('hover', id);
            }
        },
        mounted() {

        }
    }
</script>

<style>
    .baseBond {
        min-height: 80px;
        height: 80px;
        max-height: 80px;
        position: relative;
        justify-self: left;
    }
    .additionalBond {
        z-index: 1;
        min-height: 80px;
        height: 80px;
        max-height: 80px;
        color: white;
        position: absolute;
        left: 20px;
    }
</style>

<style scoped>

    div.title {
        width: 100%;
        z-index: 2;
        position: absolute;
        top: -35px;
        text-align: center;
    }

    h6.title {
        color: black;
    }

    #bonddiv {
        text-align: left;
        vertical-align: top;
        position: relative;
        height: 100%;
    }

    div {
        vertical-align: top;
    }

</style>