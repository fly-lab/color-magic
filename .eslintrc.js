require("@rushstack/eslint-config/patch/modern-module-resolution");

module.exports = {
	extends: ["@rushstack/eslint-config/profile/node-trusted-tool", "@rushstack/eslint-config/mixins/friendly-locals"],
	parserOptions: { tsconfigRootDir: __dirname },
	rules: {
		"@typescript-eslint/naming-convention": [
			"error",
			{
				selector: "variable",
				types: ["boolean"],
				format: ["PascalCase"],
				prefix: ["is", "should", "has", "can", "did", "will"],
			},
			{
				selector: "function",
				format: ["PascalCase"],
			},
			{
				selector: "typeLike",
				format: ["PascalCase"],
			},
		],
	},
};
