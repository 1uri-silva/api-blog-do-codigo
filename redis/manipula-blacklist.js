const manipula = require("./manipula-lista");

const jwt = require("jsonwebtoken");
const { createHash } = require("crypto");

function geraTokenHash(token) {
	return createHash("sha256").update(token).digest("hex");
}

module.exports = {
	adiciona: async (token) => {
		const dataExpiracao = jwt.decode(token).exp;
		const tokenHash = geraTokenHash(token);
		await manipula().adiciona(tokenHash, "", dataExpiracao);
	},
	contemToken: async (token) => {
		const tokenHash = geraTokenHash(token);
		return manipula().contemChave(tokenHash);
	},
};
