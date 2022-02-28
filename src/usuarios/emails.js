const nodemailer = require("nodemailer");

const configEmailProduction = {
	host: process.env.EMAIL_HOST,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
	secure: true,
};

const configEmailTeste = (contaTest) => ({
	host: "smtp.ethereal.email",
	auth: contaTest,
});

async function criaConfigEmail() {
	if (process.env.NODE_ENV === "production") {
		return configEmailProduction;
	} else {
		const contaTest = await nodemailer.createTestAccount();
		return configEmailTeste(contaTest);
	}
}

class Email {
	async enviaEmail() {
		const configEmail = await criaConfigEmail();
		const transport = nodemailer.createTransport(configEmail);

		const info = transport.sendMail(this);
		if (process.env.NODE_ENV !== "production") {
			console.log(nodemailer.getTestMessageUrl(info));
		}
	}
}

class EmailVerificacao extends Email {
	constructor(usuario, endereco) {
		super();
		this.from = "'Blog do código' <noreplay@blogdocodico.com.br>";
		this.to = usuario.email;
		this.subject = "Teste e-mail";
		this.text = `Olá, verifique seu e-mail aqui: ${endereco}`;
		this.html = `<h1>Olá</h1> <p>verifique seu e-mail: <a href=${endereco}>aqui</a></p>`;
	}
}

module.exports = { EmailVerificacao };
