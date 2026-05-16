import { Router } from 'express';
import { guides } from '../data/store.js';

const router = Router();

router.get('/', (req, res) => {
  const { q, category } = req.query;
  let result = guides;
  if (category) result = result.filter((g) => g.category === category);
  if (q) {
    const term = String(q).toLowerCase();
    result = result.filter(
      (g) =>
        g.title.toLowerCase().includes(term) ||
        g.description.toLowerCase().includes(term)
    );
  }
  res.json({ guides: result.map(stripBody) });
});

router.get('/:slug', (req, res) => {
  const g = guides.find((x) => x.slug === req.params.slug);
  if (!g) return res.status(404).json({ error: 'Guide not found' });
  res.json({ guide: g });
});

function stripBody(g) {
  const { steps, tips, ...rest } = g;
  return { ...rest, stepCount: steps.length, tipCount: tips.length };
}

export default router;
