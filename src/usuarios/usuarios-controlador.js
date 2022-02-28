const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require("../erros");
const tokens = require("./tokens");
const { EmailVerificacao } = require("./emails");

function geraEndereco(rota, id) {
	// const baseURL = "localhost:3000";
	return `${process.env.BASE_URL}${rota}${id}`;
}

module.exports = {
	adiciona: async (req, res) => {
		const { nome, email, senha } = req.body;

		try {
			const usuario = new Usuario({
				nome,
				email,
				emailVerifcado: false,
			});

			await usuario.adicionaSenha(senha);

			await usuario.adiciona();

			const token = tokens.verificacaoEmail.cria(usuario.id);
			const endereco = geraEndereco("/usuario/verifica_email/", token);

			const emailVerificacao = new EmailVerificacao(usuario, endereco);
			emailVerificacao.enviaEmail().catch((e) => console.log("Erro: ", e));
			res.status(201).json();
		} catch (erro) {
			if (erro instanceof InvalidArgumentError) {
				res.status(422).json({ erro: erro.message });
			} else if (erro instanceof InternalServerError) {
				res.status(500).json({ erro: erro.message });
			} else {
				res.status(500).json({ erro: erro.message });
			}
		}
	},

	login: async (req, res) => {
		try {
			const accessToken = tokens.access.cria(req.user.id);
			const refreshToken = await tokens.refresh.cria(req.user.id);
			res.set("Authorization", accessToken);
			res.status(200).json({ refresh_token: refreshToken });
		} catch (error) {
			res.status(500).json({ error: error.message });
		}
	},

	logout: async (req, res) => {
		try {
			const token = req.token;
			await tokens.access.invalida(token);
			res.status(204).send();
		} catch (erro) {
			res.status(500).json({ erro: erro.message });
		}
	},

	lista: async (req, res) => {
		const usuarios = await Usuario.lista();
		res.json(usuarios);
	},

	deleta: async (req, res) => {
		try {
			const usuario = await Usuario.buscaPorId(req.params.id);
			await usuario.deleta();
			res.status(200).send();
		} catch (erro) {
			res.status(500).json({ erro: erro });
		}
	},

	verificaEmail: async (req, res) => {
		const usuario = req.user;
		await usuario.verificaEmail();
		res.status(200).send();
	},
};
