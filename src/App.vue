<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {

  }
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

  h1, h2, h3, h4, h5, h6 {
    color: white;
  }

  input[type=text] {
    min-height: 20px;
    padding: 12px;
    border-width: 3px;
    display: block;
    width:93%;
    margin: auto;
    border-radius: 6px;
    font-size: 14px;
    box-shadow: none;
  }

input[type=password] {
  min-height: 20px;
  padding: 12px;
  border-width: 3px;
  display: block;
  width: 93%;
  margin: auto;
  border-radius: 6px;
  font-size: 14px;
  box-shadow: none;
}

  button {
    min-width: 150px;
    padding: 9px 20px;
    border: 1px solid transparent;
    border-radius: 15px;
    background-image: none;
    font-size: 14px;
    line-height: 1.28;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }

</style>
