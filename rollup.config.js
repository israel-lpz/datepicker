import { terser } from 'rollup-plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import ts from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import styles from 'rollup-plugin-styles';
import autoprefixer from 'autoprefixer';
import cssbundle from 'rollup-plugin-css-bundle';
import postcss from 'postcss';

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
		// copy({
		// 	targets: [
		// 		{
		// 			src: 'lib/simplepicker.css',
		// 			dest: 'dist/',
		// 		},
		// 	],
		// }),
		cssbundle({
			transform: (code) => postcss([autoprefixer]).process(code, {}),
		}),
	],
};
if (prodMode) {
	config.plugins.push(terser());
}

export default config;
