module.exports = {
	rollup(config, options) {
		options.env = "production";
		options.format = "esm";
		config.output.file = "dist/index.js";
		config.output.sourcemap = false;

		return config;
	},
};