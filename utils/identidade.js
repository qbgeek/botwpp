// =========================================================
// IDENTIDADE DOS USUÁRIOS
// O WhatsApp identifica a mesma pessoa de duas formas:
//   5581999999999@c.us  (número de telefone)
//   123456789012345@lid (ID anônimo, usado em muitos grupos)
// Aqui resolvemos as duas para comparar pessoas com segurança.
// =========================================================

const cache = new Map();


function serializar(id) {

    return typeof id === 'string' ? id : id?._serialized;

}


async function resolverIds(client, id) {

    if (!id) {
        return [];
    }

    if (cache.has(id)) {
        return cache.get(id);
    }

    try {

        const [resultado] = await client.getContactLidAndPhone([id]);

        const ids = [...new Set([id, resultado?.lid, resultado?.pn].filter(Boolean))];

        ids.forEach(i => cache.set(i, ids));

        return ids;

    } catch (erro) {

        // Sem cache: tenta de novo na próxima mensagem
        return [id];

    }

}


function idsMencionados(msg) {

    return (msg.mentionedIds || []).map(serializar).filter(Boolean);

}


// Texto "@numero" que o WhatsApp transforma em marcação
function mencionar(id) {

    return `@${id.split('@')[0]}`;

}


async function nomeDoContato(client, id) {

    try {

        const contato = await client.getContactById(id);

        return contato.pushname || contato.name || contato.shortName || '';

    } catch (erro) {

        return '';

    }

}


module.exports = {
    resolverIds,
    idsMencionados,
    mencionar,
    nomeDoContato
};
