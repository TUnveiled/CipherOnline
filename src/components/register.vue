<template>
    <div id="register">
        <div class="registerform">
            <h1> Create your Account </h1>
            <form @submit.prevent>
                <input class="register" v-model="username" id="username" type="text" placeholder="Username">
                <input class="register" v-model="email" id="email" type="text" placeholder="Email Address">
                <button id="availabilitybtn" v-on:click="checkNameAvailability">Check Availability</button>
                <p id="availmsg">{{avail}}</p>
                <input class="register" v-model="password" id="password" type="password" placeholder="Password">
                <p> Your password must contain at least 8 characters</p>
                <input class="register" v-model="cpassword" id="confirmpassword" type="password" placeholder="Confirm Password">
                <button id="registerbutton" v-on:click="signup">Sign Up</button>
            </form>
            <h1>{{response}}</h1>
        </div>
    </div>
</template>

<script>
    const fb = require('../firebaseConfig.js');
    export default {
        name: "register",
        data() {
            return {
                username: '',
                email: '',
                password: '',
                cpassword: '',
                response: '',
                avail: ''
            }
        },
        methods: {
            checkNameAvailability() {

                /*
                var formdata = {
                    args: {
                        email: this.email,
                        username: this.username
                    }
                };
                axios.post('/php/checkavail.php', formdata).then(response => {
                    // response means something went wrong
                    if (response) {
                        this.avail = response;
                    } else {
                        this.avail = "That username and email address are available";
                    }
                });
                */
            },
            signup() {

                let valid = true;
                let password = this.password;
                let username = this.username;
                this.response = '';
                // password should be between 8 and 64 characters
                if (password.length < 8 || password.length > 64) {
                    this.response += 'Passwords must be between 8 and 64 characters \n';
                    valid = false;
                }
                // username should be between 3 and 15 characters
                if (username.length < 3 || username.length > 15) {
                    this.response += 'Passwords must be between 3 and 15 characters\n';
                    valid = false;
                }

                // password and confirm password should match
                if (password.localeCompare(this.cpassword) === 0) {
                    this.response += 'Passwords don\'t match\n';
                    valid = false;
                }

                if (valid)
                    // use firebase authentication since it's more secure than what we're capable of
                    fb.auth.createUserWithEmailAndPassword(this.email, this.password).then(ret => {
                        this.$store.commit('setCurrentUser', ret.user);

                        // create user obj in database
                        // ret.user.uid is the primary key
                        // email and username are the other elements
                        fb.usersCollection.doc(ret.user.uid).set({
                            email: this.email,
                            username: this.username
                        }).then(() => {
                            this.$store.dispatch('fetchUserProfile');
                            this.$router.push('/dashboard');
                        }).catch(err => {
                            this.response += err;
                        })
                    }).catch(err => {
                        this.response = +err;
                    });

            }
        }
    }
</script>

<style scoped>
    #register {
        color: darkslategrey;
        position: relative;
        border: 3px solid black;
        background-color: darkslategrey;
        width: 50%;
        min-width: 512px;
        margin: 0 auto;
        text-align: center;
        padding: 32px;
        overflow: hidden;
    }

    input.register {
        max-width: 512px;
    }

    .registerform {
        width: 100%;
        max-width: 512px;
        margin: auto;
    }

    p {
        padding: 5px;
        color: white;
    }
</style>