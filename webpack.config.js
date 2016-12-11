module.exports = {
	entry: {
		'debugger': './src/debugger.js',
		'bg': './src/bg.js',
		'popup': './src/popup.js'
	},
  	output: {
   		filename: '[name].js',
    	path: './crx/js/dist'
  	}
}