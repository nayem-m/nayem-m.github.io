# nayem-m.github.io

Personal site of **Moosa Nayem**: penetration tester, eJPT, CBB GP15 graduate trainee.
Live at <https://nayem-m.github.io>.

Plain Jekyll on GitHub Pages: no build step, no npm, no frameworks.

## Updating content

Everything on the homepage is driven by YAML in `_data/`:

| file | what it controls |
| --- | --- |
| `_data/timeline.yml` | experience + education timeline (newest first; `head: true` marks the current role) |
| `_data/certs.yml` | certification cards (`status: done / progress / queued`, `progress: 0-100`) |
| `_data/projects.yml` | project cards |
| `_data/skills.yml` | the "arsenal" skill groups |

The interactive shell reads the same data, so edit it in one place and both update.

## Writing a blog post

1. Copy `_drafts/example-writeup.md` to `_posts/YYYY-MM-DD-your-slug.md`
2. Edit the front matter (`title`, `tags`, `description`) and write in Markdown
3. Commit and push. GitHub Pages builds it and it appears on `/blog/` and the homepage

## Bits and pieces

- `_includes/portrait.txt`: the ASCII portrait (84×50). It must not contain `< > & { }`.
- `assets/js/bg.js`: reactive dot-grid background
- `assets/js/portrait.js`: ASCII decode + hover glitch
- `assets/js/terminal.js`: the fake shell (add commands to the `C` object)
- Themes: `redteam` (default), `phosphor`, `amber`, `mono`. Switch them in the footer or with `theme <name>` in the shell.
