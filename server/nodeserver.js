const express = require('express');

// creating an express instance
const app = express();
// const history = require('connect-history-api-fallback');

const publicRoot = 'C:/Users/const/PhpstormProjects/vuetest0/dist';

app.get('/', (req, res, next) => {
    res.sendFile("index.html", {root: publicRoot});
    next;
});

app.get('/css/:target', (req, res, next) => {
    res.sendFile("css/app.636b5935.css", {root: publicRoot});
    next;
});

app.get('/js/:target', (req, res, next) => {
    res.sendFile("js/" + req.params["target"], {root: publicRoot});
    next;
});

// reroutes to vue router for unexpected "no"
app.get('/:no', (req, res, next) => {
    res.sendFile("index.html", {root: publicRoot});
    next;
});

//app.use(history({verbose: true}));

app.listen(3000, () => {
    // eslint-disable-next-line no-console
    console.log("Example app listening on port 3000")
});

