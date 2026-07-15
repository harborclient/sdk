## React components

Every React component lives in its own file. Do not define more than one
component in a single module.

Primary components use a directory named after the component, with the
component in `index.tsx`:

```
src/components/Navbar/index.tsx   # export function Navbar
```

When a primary component needs helpers, put each helper in a sibling file in
the same directory — never in `index.tsx` alongside the primary:

```
src/components/Navbar/index.tsx      # Navbar
src/components/Navbar/NavItem.tsx    # NavItem
src/components/Navbar/NavSearch.tsx  # NavSearch
```

If a file already exports a primary component plus sub-components, split it the
same way: create (or use) the directory named after the primary, move the
primary to `index.tsx`, and give each sub-component its own file.

Related component families that share a directory (for example `SidebarItem/`)
still follow one component per file; each named file in that directory is a
single component (`SidebarRequestItem.tsx`, `SidebarTreeGroup.tsx`, and so on).

## Linting

After making code changes, always run:

```bash
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
```

Fix any reported issues before finishing the task.

## Changelog

`CHANGELOG.md` is kept up to date automatically by the `post-commit` hook in
`.githooks/post-commit` (activated by `pnpm install` via the `prepare` script,
which sets `core.hooksPath` to `.githooks`).

How it works:

- After each commit, the hook prepends `- <commit subject>. (\`<short sha>\`)`to the`## Unreleased` section and amends the change into the same commit.
- The hook stays out of the way when:
  - `CHANGELOG.md` is already part of the commit (you wrote your own entry).
  - The commit is a merge, revert, fixup, squash, or `chore(changelog)` /
    `chore(release)` commit.
  - The commit subject is a bare version number like `0.4.9` or `v1.2.3`.
  - A rebase, cherry-pick, revert, or merge is in progress.
  - The commit's short SHA is already present in `## Unreleased`.

What this means for you:

- Write a clear, single-line commit subject — it becomes the changelog entry.
- If you want a more detailed entry than the subject line, edit `## Unreleased`
  yourself and stage `CHANGELOG.md` as part of the commit. The hook will detect
  it and leave your entry alone.
- Don't add version numbers or dates manually. The release workflow
  (`.github/workflows/release.yml`) bumps `package.json` and renames
  `## Unreleased` to `## <new version> - <YYYY-MM-DD>` when a maintainer
  triggers a release.
- Don't run version-bump commands locally (`pnpm version`, `npm version`,
  etc.); use the release workflow instead so the changelog and tags stay in sync.
- Never create `chore(release):` commits or manually bump `package.json`
  version — push feature commits and let the workflow release.
