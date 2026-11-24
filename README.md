# declan-clarke.com

My personal site. Plain HTML/CSS, hosted free on GitHub Pages. Layout: "Primary", palette: Paper & Teal.

## Updating the site

1. Edit the files (e.g. in VS Code).
2. Preview locally: `python3 -m http.server 8418`, then open http://localhost:8418
3. Commit and push:
   ```bash
   git add -A && git commit -m "Describe the change" && git push
   ```
4. GitHub Pages redeploys automatically, usually within a minute.

## Files

| Path | What it is |
|---|---|
| `index.html` | Homepage: headline, intro, project index, experience, skills, contact |
| `more-projects.html` | Earlier projects |
| `projects/*.html` | One page per project: Problem / What I did / Result summary, then the write-up |
| `404.html` | Not-found page |
| `assets/css/style.css` | All styling. Colors are at the top (light and dark palettes) |
| `assets/js/theme.js` | Light/dark toggle |
| `assets/js/lightbox.js` | Click-to-enlarge images on project pages |
| `assets/js/site.js` | Copy-email button |
| `assets/files/` | Resume and internship journal PDFs. Replace `DeclanClarke_Resume.pdf` to update the resume |
| `assets/img/` | Headshot, project images, HRZN renders |
| `CNAME` | Custom domain for GitHub Pages. Don't delete |
| `ARCHIVE/` | Local only (in `.gitignore`): previous site, design lab, Drawing Sheet concept, ChatGPT iteration, original photos |

When you change `style.css`, bump the `?v=` number on the stylesheet link in every page so browsers load the new version.

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
