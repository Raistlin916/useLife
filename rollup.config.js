import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import pkg from './package.json'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default {
  input: 'src/hooks/index.ts',
  external: ['react', 'lodash', 'axios'],
  output: {
    file: pkg.main,
    format: 'es',
    name: 'useLife',
    globals: {
      react: 'React',
      lodash: '_',
    },
    exports: 'named',
  },
  plugins: [
    nodeResolve({ extensions }),
    babel({
      exclude: 'node_modules/**',
      extensions,
    }),
    terser(),
  ],
}
