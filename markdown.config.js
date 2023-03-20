/* CLI markdown.config.js file example */
module.exports = {
	matchWord: 'AUTO-GENERATED-CONTENT',
	transforms: {
		CONTRIBUTORS: require('markdown-magic-github-contributors'),
		VERSIONBADGE: require('markdown-magic-version-badge'),
	},
	callback: function () {
		console.log('markdown processing done')
	}
}