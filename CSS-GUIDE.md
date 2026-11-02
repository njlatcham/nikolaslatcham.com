# CSS guide

How the styles on this site are named and organized. Read this before adding a new section or project.

## BEM in one minute

Every class is one of three things:

| Kind | Pattern | Example | Meaning |
|---|---|---|---|
| Block | `.block` | `.recipe` | A standalone component that makes sense on its own |
| Element | `.block__element` | `.recipe__toggle` | A part of a block. Only used inside that block |
| Modifier | `.block--modifier` or `.block__element--modifier` | `.recipe__toggle--open` | A variation or a state |

```html
<div class="recipe">
  <div class="recipe__banner">
    <div class="recipe__toggle recipe__toggle--open"></div>
  </div>
</div>
```

A modifier is always used **alongside** the base class, never on its own:
`class="divider divider--short"`, not `class="divider--short"`.

## The rules

1. **Lowercase words joined by hyphens.** `sub-recipe`, `contact-bar__email`. No camelCase, no single underscores.
2. **Elements don't nest in the name.** A list item inside `recipe__steps` is `step__item` or `recipe__step`, never `recipe__steps__item`. If something has its own inner parts, make it a new block (that's why `.step`, `.ingredient` and `.chip` are blocks and not `recipe__…`).
3. **One class per selector.** Write `.recipe__toggle`, not `.recipe .toggle` or `div.recipe__toggle`. Specificity stays flat, so later rules win predictably.
   - The one exception: a block modifier that changes its elements, e.g. `.skills__group--right .skills__title`. If you override that in a media query, repeat the same selector (see the skills section).
4. **State is a modifier.** JS toggles `recipe__body--open`; it doesn't add generic classes like `active` or `rotate`.
5. **Only add a class if CSS or JS uses it.** No empty `class=""`, no "just in case" classes.
6. **No inline `style=""`.** If you need it once, it still gets a class.
7. **No raw colours outside `:root`.** Add a token (`--color-…`) and use `var(--color-…)`.
8. **Media queries live right under the block they change**, not in a big list at the end of the file.

## Where things go in `style.css`

1. **Tokens**: colours, fonts and spacing variables in `:root`
2. **Base**: reset and plain element styles (`h1`, `p`, `input`)
3. **Layout**: the page container
4. **Shared blocks**: used on every page (`divider`, `contact-bar`, `hero`, `social`)
5. **Home page blocks**: `about`, `projects`, `skills`, `contact`
6. **Recipes page blocks**: `recipe`, `chip`, `checkbox`, `ingredient`, `sub-recipe`, `step`, `converter`

When a new project gets its own folder, its blocks go in its own CSS file. Sections 1–4 can then move into a shared `base.css`.

## Recipes for common changes

**Add a new project to the homepage**

```html
<p class="projects__text">
  <a href="…" target="_blank" class="projects__link projects__link--birdlog">Bird Log</a> is …
</p>
<div class="projects__figure">
  <img class="projects__media" src="…" alt="…">
</div>
<div class="projects__figure projects__figure--right">
  <img class="projects__media" src="…" alt="…">
</div>
```

```css
.projects__link--birdlog { --accent: #4a7c59; }
```

**Add a new quantity type to recipes** (for example `"name": "cups"` in `recipes.json`)

```css
:root { --color-cups: #3b6e8f; }
.chip--cups { background-color: var(--color-cups); }
```

**Make a brand-new component**

1. Name the block after what it *is* (`.gallery`), not what it looks like (`.grey-box`).
2. Name its parts `.gallery__item`, `.gallery__caption`.
3. Give it a comment header and put it in the right section.
4. Put its media queries directly under it.

## Breakpoints

| Name | Query |
|---|---|
| medium | `@media (max-width: 750px)` |
| small | `@media (max-width: 450px)` |
