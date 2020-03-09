    <template>
        <div class="unit" v-on:mouseenter="onHover" v-on:click="onClick">
            <div v-if="oref" :style="
                (oref.tapped) ? 'min-width: 80px;' : ''
                ">
            <div class="title" v-if="oref.MC">MC</div>
            <img class="image" :src="cardref.imageref" alt="card" :style="
                ((oref.tapped) ? 'transform: rotate(90deg);' : '') +
                ((canselect === true) ? 'border: 3px solid green' : 'border: 1px solid black')">
            <div class="stack" v-if="oref.cards.length > 0">{{oref.cards.length}}</div>
            <div class="attack">{{cardref.attack}}</div>
            </div>
        </div>
    </template>

    <script>
        export default {
            name: "unit",
            mounted() {

            },
            data() {
                return this.oref;
            },
            props: {
                oref: Object,
                canselect: Boolean,
                cardref: Object
            },
            methods: {
                onHover() {
                    this.$emit('hover', this.oref.cards[0]);
                },
                onClick() {
                    this.$emit('click');
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

        .image {
            height: 80px;
            z-index: 0;
            position: relative;
            text-align: center;
            border-radius: 6px;
        }

        .attack {
            z-index: 1;
            text-shadow: 1px 1px black;
            font-size: 25px;
            color: white;
            position: absolute;
            top: 60%;
            right: 40%;
            left: 0;
            bottom: 0;
        }

        .stack {
            z-index: 1;
            text-shadow: 1px 1px black;
            font-size: 10px;
            color: white;
            position: absolute;
            top: 0;
            right: 0;
            left: 70%;
            bottom: 0;
        }
    </style>