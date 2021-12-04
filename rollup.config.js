import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import autoprefixer from 'autoprefixer';
import cssbundle from 'rollup-plugin-css-bundle';
import postcss from 'postcss';
import cssnano from 'cssnano';

const empty = require('rollup-plugin-empty');
const prodMode = process.env.NODE_ENV === 'production';

/**
 *
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: 'lib/index.ts',
	output: {
		file: 'dist/datepicker.js',
		format: 'umd',
		name: 'datepicker',
		sourcemap: true,
		globals: {
			jquery: '$',
		},
		exports: 'named',
	},
	cache: false,
	external: ['jquery'],
	plugins: [
		nodeResolve(),
		commonjs(),
		ts(),
		empty({
			silent: false,
			dir: 'dist',
		}),
		cssbundle({
			transform: (code) => {
				const plugins = [autoprefixer];
				if (prodMode) plugins.push(cssnano);
				return postcss(plugins).process(code, {
					from: undefined,
					map: true,
				});
			},
		}),
	],
};
if (prodMode) {
	config.plugins.push(terser());
}

export default config;
