const passport = require('passport');
const Usuario = require("./usuarios-modelo");

const tokens = require("./tokens");

module.exports = {
	local: (req, res, next) => {
		passport.authenticate(
			"local",
			{ session: false },
			(erro, usuario, info) => {
				if (erro && erro.name === "InvalidArgumentError") {
					return res.status(401).json({ erro: erro.message });
				}

				if (erro) {
					return res.status(500).json({ erro: erro.message });
				}

				if (!usuario) {
					return res.status(401).json();
				}

				req.user = usuario;
				return next();
			}
		)(req, res, next);
	},

	bearer: (req, res, next) => {
		passport.authenticate(
			"bearer",
			{ session: false },
			(erro, usuario, info) => {
				if (erro && erro.name === "JsonWebTokenError") {
					return res.status(401).json({ erro: erro.message });
				}

				if (erro && erro.name === "TokenExpiredError") {
					return res
						.status(401)
						.json({ erro: erro.message, expiradoEm: erro.expiredAt });
				}

				if (erro) {
					return res.status(500).json({ erro: erro.message });
				}

				if (!usuario) {
					return res.status(401).json();
				}

				req.token = info.token;
				req.user = usuario;
				return next();
			}
		)(req, res, next);
	},

	async refresh(req, res, next) {
		try {
			const { refresh_token } = req.body;
			const id = await tokens.refresh.verifica(refresh_token);
			await tokens.refresh.invalida(refresh_token);
			req.user = await Usuario.buscaPorId(id);
			return next();
		} catch (error) {
			if (error.name === "InvalidArgumentError") {
				return res.status(401).json({ error: error.message });
			}

			return res.status(500).json({ error: error.message });
		}
	},
};
