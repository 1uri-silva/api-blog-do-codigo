const blacklist = require("./config");

module.exports = () => {
	return {
		async adiciona(chave, valor, dataExpiracao) {
			await blacklist.set(chave, valor);
			await blacklist.expireat(chave, dataExpiracao);
		},
		async buscaValor(chave) {
			const val = await blacklist.get(chave);
			return val;
		},
		async contemChave(chave) {
			const resultado = await blacklist.exists(chave);
			return resultado === 1;
		},
		async deleta(chave) {
			await blacklist.del(chave);
		},
	};
};
