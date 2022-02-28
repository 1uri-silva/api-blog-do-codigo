const jwt = require("jsonwebtoken");
const moment = require("moment");
const crypto = require("crypto");

const manipulaLista = require("../../redis/manipula-lista");
const { InvalidArgumentError } = require("../erros");
const blacklistAccessToken = require("../../redis/manipula-blacklist");

function criaTokenJWT(id, [tempoQuantidade, tempoUnidade]) {
	const payload = {
		id,
	};

	const token = jwt.sign(payload, process.env.CHAVE_JWT, {
		expiresIn: tempoQuantidade + tempoUnidade,
	});
	return token;
}

async function verificaTokenNaBlacklist(token, nome, blacklistToken) {
	if (!blacklistToken) return;

	const tokenNaBlacklist = await blacklistToken.contemToken(token);
	if (tokenNaBlacklist) {
		throw new jwt.JsonWebTokenError(`${nome} inválido por logout!`);
	}
}

async function invalidaToken(token, blockList) {
	return blockList.adiciona(token);
}

async function verificaTokenJWT(token, nome, blacklistToken) {
	await verificaTokenNaBlacklist(token, nome, blacklistToken);
	const { id } = jwt.verify(token, process.env.CHAVE_JWT);
	return id;
}

async function verificaTokenOpaco(token, allowList, nome) {
	verificaTokenEnviado(token, nome);

	const id = await allowList.buscaValor(token);
	verificaTokenValido(id, nome);

	return id;
}

async function invalidaTokenOpaco(token, allowList) {
	return allowList.deleta(token);
}

function verificaTokenValido(id, nome) {
	if (!id) {
		throw new InvalidArgumentError(`${nome} invalido`);
	}
}

function verificaTokenEnviado(token, nome) {
	if (!token) {
		throw new InvalidArgumentError(`${nome} não enviado`);
	}
}

async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowList) {
	const tokenOpaco = crypto.randomBytes(20).toString("hex");
	const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix();
	await allowList.adiciona(tokenOpaco, id, dataExpiracao);
	return tokenOpaco;
}

module.exports = {
	access: {
		nome: "Access token",
		expiracao: [15, "m"],
		blacklistToken: blacklistAccessToken,
		cria(id) {
			return criaTokenJWT(id, this.expiracao);
		},
		verifica(token) {
			return verificaTokenJWT(token, this.nome, this.blacklistToken);
		},
		invalida(token) {
			return invalidaToken(token, this.blacklistToken);
		},
	},

	refresh: {
		nome: "Refresh token",
		expiracao: [5, "d"],
		allowList: manipulaLista(),
		cria(id) {
			return criaTokenOpaco(id, this.expiracao, this.allowList);
		},
		verifica(token) {
			return verificaTokenOpaco(token, this.allowList, this.nome);
		},
		invalida(token) {
			return invalidaTokenOpaco(token, this.allowList);
		},
	},

	verificacaoEmail: {
		nome: "Verificação e-mail",
		expiracao: [1, "h"],
		cria(id) {
			return criaTokenJWT(id, this.expiracao);
		},
		verifica(token) {
			return verificaTokenJWT(token, this.nome);
		},
	},
};
