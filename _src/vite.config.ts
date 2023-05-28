import preact from '@preact/preset-vite';
import {defineConfig} from 'vite';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [preact()],
});
