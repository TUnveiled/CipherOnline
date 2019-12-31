    <template>
        <div class="unit">
            <div class="title">{{title}}</div>
            <img class="image" :src="imageref" alt="card back">
            <div class="count">{{count}}</div>
        </div>
    </template>

    <script>
        export default {
            name: "unit",
            data() {
                return {
                    imageref: "https://serenesforest.net/wiki/images/a/a7/PlaceHolder.png"
                }
            },
            props: {

            },
            methods: {

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