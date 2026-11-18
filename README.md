# declan-clarke.com

My personal site. Plain HTML/CSS, hosted free on GitHub Pages.

## Updating the site

1. Edit the files (e.g. in VS Code).
2. Commit and push:
   ```bash
   git add -A && git commit -m "Describe the change" && git push
   ```
3. GitHub Pages redeploys automatically, usually within a minute.

Preview locally first with `python3 -m http.server 8418`, then open http://localhost:8418.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage |
| `projects/*.html` | One page per project |
| `assets/css/style.css` | All styling. Colors are at the top (`--accent` = Reynolds Red) |
| `assets/js/theme.js` | Light/dark toggle |
| `assets/files/DeclanClarke_Resume.pdf` | Resume linked from the site. Replace this file to update it |
| `assets/img/projects/` | Project photos. Pages pick these up automatically by name (see the `Photo slot` comments) |
| `CNAME` | Custom domain for GitHub Pages. Don't delete |

## Domain setup (Squarespace DNS)

declan-clarke.com: Squarespace → Domains → declan-clarke.com → DNS → DNS Settings. Remove the Squarespace Defaults records and add:

| Host | Type | Data |
|---|---|---|
| `@` | A | `185.199.108.153` |
| `@` | A | `185.199.109.153` |
| `@` | A | `185.199.110.153` |
| `@` | A | `185.199.111.153` |
| `www` | CNAME | `declanjwc.github.io` |

Then in the GitHub repo → Settings → Pages, tick **Enforce HTTPS** once it's available.

djwc.pro (old domain): use Squarespace Domain Forwarding to `https://declan-clarke.com` so old links keep working.

## Intro animation

On a visitor's first page load per session, the HRZN aircraft flies in, tilts cruise → 45° → hover, and lands in the featured project card.

- All settings live in `assets/js/intro-config.js`: images, timing, flight path, size, and where it lands. No other code needs to change.
- **To use better renders:** export cruise, 45° and hover from SolidWorks from the same camera angle with a transparent background, then save them over `assets/img/intro/cruise.webp`, `transition.webp` and `hover.webp`. You can also point the `src` paths in the config at new files, such as `.png`. If the new images have a different shape, update `aspect`.
- Add `?intro=1` to the URL to replay it, for example `http://localhost:8418/?intro=1`.
- It's skipped for visitors whose system is set to reduce motion, and anyone can skip it with the button or the Escape key.
