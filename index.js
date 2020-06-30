const puppeteer = require('puppeteer');
const fs = require('fs');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static('results'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile((path.resolve(__dirname, 'index.html')));
})

app.post('/get', (req, res) => {
    const URL = req.body.url;
    const regexOnlyNumbers = new RegExp(/[\d]+$/);

    const splitedUrl = URL.split('/');
    const dataDocId = splitedUrl.filter(item => item.match(regexOnlyNumbers));

    if (!URL) throw 'Erro: por favor inserir URL';

    async function transform() {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(URL);

        const element = await page.$(`[data-doc-id="${dataDocId}"]`);
        const text = await page.evaluate(element => element.innerHTML, element);

        const fileName = `${Date.now()}-DOC-${dataDocId}.html`

        fs.writeFileSync(path.resolve(__dirname, 'results', fileName), text)

        await browser.close().then(res.sendFile(path.resolve(__dirname, 'results', fileName)));
    };
    transform();
});

app.listen(3333, () => {
    console.log('APP RUNNING ON PORT 3333');
})