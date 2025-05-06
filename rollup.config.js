import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

/**
 * @description Rollup configuration for building a Vue 3 component library.
 */
export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    }
  ],
  external: ['vue'],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      useTsconfigDeclarationDir: true
    }),
    terser()
  ]
};