import { defineConfig } from 'vite';
import { dinerBudget } from '../../scripts/check-bundle.mjs';

export default defineConfig({ plugins: [dinerBudget()], build: { manifest: true } });
