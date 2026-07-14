# prmpt — Archive Collection

Full-screen fashion landing page built with React, TypeScript, GSAP, Motion, and Tailwind CSS.

Version: 1.0.0

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## GitHub Pages

Push the project to a public repository with `main` as its default branch. The included GitHub Actions workflow builds the Vite app with the repository-aware base path and deploys `dist` to GitHub Pages.

## Interaction

- Desktop: move the pointer left or right to scrub the paired films; scroll to reveal the archive.
- Touch: the paired films alternate automatically; scroll controls the gallery and outro.
- Reduced motion: video autoplay and continuous card scaling are disabled.
