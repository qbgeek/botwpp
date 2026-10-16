const fs = require('fs');
const path = require('path');


// Lê um JSON. Se o arquivo estiver corrompido, guarda uma cópia
// antes de seguir com o padrão — assim nada é sobrescrito sem backup.
function lerJson(caminho, padrao) {

    if (!fs.existsSync(caminho)) {
        return padrao;
    }

    try {

        return JSON.parse(fs.readFileSync(caminho, 'utf8'));

    } catch (erro) {

        const copia = `${caminho}.corrompido-${Date.now()}`;

        fs.copyFileSync(caminho, copia);

        console.log(`⚠️ Não foi possível ler ${path.basename(caminho)}. Cópia salva em ${copia}`);

        return padrao;

    }

}


// Grava em um arquivo temporário e depois renomeia, para que uma queda
// no meio da gravação nunca deixe o JSON pela metade.
function salvarJson(caminho, conteudo) {

    fs.mkdirSync(path.dirname(caminho), { recursive: true });

    const temporario = `${caminho}.tmp`;

    fs.writeFileSync(temporario, JSON.stringify(conteudo, null, 2));

    fs.renameSync(temporario, caminho);

}


module.exports = {
    lerJson,
    salvarJson
};
