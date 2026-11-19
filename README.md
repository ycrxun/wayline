# Wayline

**Notes on systems, paths, and traces.**

Wayline is a Hugo theme for a personal technical journal. It pairs a dark-first interface with an editorial archive, a masonry photo feed, and a print-ready resume.

## Features

- Responsive home, article, archive timeline, taxonomy, and 404 layouts
- Dark, light, and warm paper reading modes with saved preferences
- Client-side search with a keyboard-accessible modal
- Configurable photo gallery with a full-screen lightbox
- Article table of contents, code copy, syntax highlighting, and Giscus comments
- SEO metadata, Open Graph, RSS, sitemap, and structured data
- Print-ready resume layout
- Self-hosted open-source fonts

## Requirements

- Hugo Extended 0.146 or newer
- Node.js if you want to rebuild the SCSS

The repository ships with compiled CSS, so Hugo can build the theme without a Sass installation.

## Configuration

Set the theme in the site configuration:

```yaml
theme: wayline
```

The main site-specific options live under `params`:

```yaml
params:
    author: Soi
    description: Notes on engineering and systems.
    hero:
        eyebrow: SOFTWARE ENGINEER
        title: Build clearly.
        intro: Notes on software, systems, and continuous improvement.
        location: HUNAN · ZHUZHOU, CN
        status: BUILDING IN PUBLIC
    gallery:
        enabled: true
        menuTitle: 影像
        title: 影像日志
        source: posts
        limit: 12
```

The gallery reads pages from the configured section and displays pages that have an `image` front matter field. Use `content/moments/` as an independent photo collection and set `gallery.source: moments` when desired.

## Development

Install Sass and rebuild the stylesheet:

```bash
npm install sass
npx sass assets/scss/main.scss assets/css/main.css --style=compressed --no-source-map
```

## Fonts

Wayline bundles Space Grotesk, Noto Sans SC, LXGW WenKai, and JetBrains Mono under the SIL Open Font License 1.1. See [THIRD_PARTY.md](THIRD_PARTY.md) and `static/fonts/licenses/`.

## License

MIT
