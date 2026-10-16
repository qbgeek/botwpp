// =========================================================
// TIPOS DE EVENTO
// Todos os eventos têm a mesma estrutura; o tipo só define os
// valores iniciais (título, emoji e premiação base).
// Para criar um tipo novo, basta adicionar uma entrada aqui.
// =========================================================

const LOJA = {
    nome: 'QB GEEK',
    endereco: 'R. da Hora, 345 - Loja 14 - Espinheiro, Recife - PE, 52020-010'
};

const TIPOS = {

    pokemon: {
        nome: 'Pokémon TCG',
        emoji: '⚡',
        titulo: 'LIGA POKÉMON QB',
        premiacaoBase: 'Créditos em loja.',
        apelidos: ['pkm', 'ptcg']
    },

    magic: {
        nome: 'Magic: The Gathering',
        emoji: '🔮',
        titulo: 'LIGA MAGIC QB',
        premiacaoBase: 'Créditos em loja.',
        apelidos: ['mtg']
    },

    yugioh: {
        nome: 'Yu-Gi-Oh!',
        emoji: '🐉',
        titulo: 'LIGA YU-GI-OH! QB',
        premiacaoBase: 'Créditos em loja.',
        apelidos: ['ygo']
    }

};

// Usado quando o ADM cria um evento com um nome livre
const TIPO_PERSONALIZADO = {
    nome: 'Evento personalizado',
    emoji: '🎲',
    premiacaoBase: 'Créditos em loja.'
};


// "Yu-Gi-Oh!" -> "yugioh", "Pokémon" -> "pokemon"
function normalizarChave(texto) {

    return texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

}


function buscarTipo(texto) {

    const chave = normalizarChave(texto || '');

    for (const [id, tipo] of Object.entries(TIPOS)) {

        if (id === chave || tipo.apelidos.includes(chave)) {
            return { id, ...tipo };
        }

    }

    return null;

}


module.exports = {
    LOJA,
    TIPOS,
    TIPO_PERSONALIZADO,
    buscarTipo
};
