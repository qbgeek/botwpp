function gerarBarraMeta(atual, meta) {

    if (meta <= 0) {
        return { barra: '', porcentagem: 0 };
    }

    const porcentagem = Math.min((atual / meta) * 100, 100);

    const blocos = Math.round(porcentagem / 10);

    let barra = "";

    if (porcentagem >= 100) {

        barra = "🟩".repeat(10);

    } else if (porcentagem >= 50) {

        barra =
            "🟨".repeat(blocos) +
            "⬜".repeat(10 - blocos);

    } else {

        barra =
            "🟥".repeat(blocos) +
            "⬜".repeat(10 - blocos);

    }

    return {
        barra,
        porcentagem: Math.round(porcentagem)
    };

}

module.exports = gerarBarraMeta;
