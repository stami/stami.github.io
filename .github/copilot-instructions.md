# GitHub Copilot Instructions

## Project

- Oaken is the static personal website at `https://oaken.fi/`.
- The site uses Eleventy 2, Nunjucks, Markdown, Tailwind CSS 3, and PostCSS.
- Keep changes small and preserve the existing visual and editorial style unless the task explicitly requests a redesign or rewrite.

## Toolchain

- Use Node.js 20 to match `.github/workflows/static.yml`; `.tool-versions` selects the local LTS release.
- Use Yarn and the committed `yarn.lock`. Do not use npm or update the ignored `package-lock.json`.
- Install dependencies with `yarn install --frozen-lockfile`.
- Use CommonJS (`require` and `module.exports`) in JavaScript configuration files.
- Follow `.editorconfig`: UTF-8, LF endings, final newline, and 2-space indentation in new files. Preserve local indentation in existing files.

## Commands

- Start Eleventy and the Tailwind watcher with `yarn start`.
- Build the production site with `yarn build`.
- Validate changes in isolated temporary output with `yarn validate`.
- Rebuild only CSS with `yarn build:css`.
- Rebuild only Eleventy output with `yarn build:11ty` after CSS already exists.
- There are no separate lint or automated test commands. Run `yarn validate` after changes; treat a successful validation as the required check.
- Never run `yarn build`, `yarn build:css`, `yarn build:11ty`, or `yarn clean` while `yarn start` is running because they share its output paths.

## Source Boundaries

- Edit site content and page templates in `content/`.
- Edit shared layouts and partials in `_includes/`, and global data in `_data/`.
- Edit source CSS in `public/css/_tailwind.css` and `public/css/index.css`.
- Treat `_site/` and `public/css/generated.css` as generated output. Never hand-edit them.
- Files under `public/` are copied through to the built site. Avoid changing bundled app assets under `public/lasku-fraktuura/` and `public/misc/` unless the task specifically targets those embedded apps.

## Eleventy Conventions

- Keep the Eleventy input/output mapping in `eleventy.config.js`: `content/` is the input and `_site/` is the output.
- Use Nunjucks for Markdown and HTML template processing.
- Blog posts inherit the `posts` collection and `layouts/post.njk` from `content/blog/blog.11tydata.js`. Post front matter should provide `title`, `date`, and topic `tags`.
- Use `eleventyNavigation` front matter for pages that belong in the main navigation.
- Keep content-local images beside their Markdown or Nunjucks file and reference them with relative paths. Eleventy passes supported content images through unchanged.
- Draft content uses `draft: true`. Drafts appear during serve/watch and are excluded from production builds unless `BUILD_DRAFTS` is set.
- Prefer existing filters, shortcodes, layouts, and includes before adding new ones. Register shared Eleventy behavior in the relevant `eleventy.config*.js` module.

## Styling

- Prefer Tailwind utility classes in Nunjucks and Markdown HTML.
- Put site-wide element defaults in `public/css/_tailwind.css` and non-Tailwind shared styles in `public/css/index.css`.
- When adding utility classes, ensure their source files remain covered by the `content` globs in `tailwind.config.js`.
- Preserve responsive behavior, dark-mode styles, semantic HTML, alt text, and visible keyboard focus.

## Validation And Deployment

- Run `yarn validate` before considering a change complete. It writes only to ignored `.validation/` paths and does not disturb a running development server.
- Use `yarn build` only when production output is explicitly required and `yarn start` is not running.
- Inspect generated pages in `_site/` only as build artifacts; apply fixes to their source files.
- GitHub Actions builds and deploys `_site/` to GitHub Pages on pushes to `master`. Never trigger or modify deployment behavior unless explicitly requested.
