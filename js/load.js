import { loadPortfolioData } from './main.js';

loadPortfolioData().catch((error) => {
  console.error('Portfolio data could not be loaded.', error);
  document.body.dataset.loadError = 'true';
});
