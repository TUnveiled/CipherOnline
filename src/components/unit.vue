    <template>
        <div class="unit" v-on:mouseenter="onHover">
            <div class="title" v-if="oref.MC">MC</div>
            <img class="image" :src="oref.card.imageref" alt="card" :style="
                (oref.tapped) ? 'transform: rotate(90deg);' : ''
                 ">
            <div class="stack" v-if="oref.stack > 0">{{oref.stack}}</div>
            <div class="attack">{{oref.card.attack}}</div>
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
                oref: Object
            },
            methods: {
                onHover() {
                    this.$emit('hover', this.oref.card);
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
            height: 100px;
            z-index: 0;
            position: relative;
            text-align: center;
        }

        .attack {
            z-index: 1;
            text-shadow: 1px 1px black;
            font-size: 30px;
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