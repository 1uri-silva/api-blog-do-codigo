const Redis = require("ioredis");

const redis = new Redis({
	port: 6379,
	host: "0.0.0.0",
	password: "password123",
	db: 0,
});

module.exports = redis;
