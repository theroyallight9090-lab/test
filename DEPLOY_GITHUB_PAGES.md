# Deploy to GitHub Pages

1. Initialize a git repository (if you haven't):

```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a repository on GitHub and add it as remote, then push to `main`:

```bash
git branch -M main
git remote add origin https://github.com/<theroyallight9090-lab>/<repo>.git
git push -u origin main
```

3. The included GitHub Actions workflow will automatically deploy the repository root to GitHub Pages whenever you push to `main`.

Notes:
- Keep your static site files (e.g., `index.html`, `all-prodcuts.html`, `product-detail.html`, `products.csv`, `image/`) in the repository root.
- If you prefer a different branch or a `docs/` folder, update `.github/workflows/deploy-pages.yml` `path` and branch triggers accordingly.
