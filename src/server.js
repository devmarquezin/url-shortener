const express = require("express");

const app = express();

app.use(express.json());

const PORT = 3000;

const urls = [];


//  funcao para gerarmos os shortCodes
function generateShortCode() {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let code = "";

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(
            Math.random() * characters.length
        );

        code += characters[randomIndex];
    }

    return code;
}


//  funcao para verificar que dois links nunca recebam o mesmo shortCode
//  gera "abcd1234" -->> existe? -->> sim -->> gera dnv -->> 
//  "X92pQa" -->> existe? -->> nao -->> retorna "X92pQa".
function generateUniqueShortCode() {
    let shortCode;

    do {
        shortCode = generateShortCode();
    } while (
        urls.some((item) => item.shortCode === shortCode)
    );

    return shortCode;
}

app.get("/", (req, res) => {
    res.json({
        message: "URL Shortener API"
    });
});

app.post("/shorten", (req, res) => {

    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            error: "A URL é obrigatória."
        });
    }

    try {
        new URL(url);
    }catch (error){
        return res.status(400).json({
            error: "URL inválida."
        });
    }

    const shortCode = generateUniqueShortCode();

    const newUrl = {
        id: urls.length + 1,
        originalUrl: url,
        shortCode: shortCode,
        clicks: 0,
    }


    urls.push(newUrl);

    res.status(201).json({
        message: "URL encurtada com sucesso",
        originalUrl: url,
        shortCode: shortCode,
        shortUrl: `http://localhost:${PORT}/${shortCode}`
    });
});

app.get("/urls", (req, res) => {
    res.json(urls);
});

app.get("/:shortCode", (req, res) => {

    const { shortCode } = req.params;

    const urlData = urls.find(
        (item) => item.shortCode === shortCode
    );

    if (!urlData) {
        return res.status(404).json({
            error: "URL não encontrada."
        });
    }

    urlData.clicks++;

    return res.redirect(urlData.originalUrl);
});


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

