import recipes from "./recipes.json" with {type: 'json'}

// Descriptor text like "large dark green tops", followed by any prep notes
// (the ingredient's "instructions", like "minced") in their own style.
// Nothing at all when both are empty (so no empty <p> with a margin).
const descriptorMarkup = (descriptors = [], prep = []) => {
  const text = descriptors
    .flatMap(({ size, types, piece, other }) => [size.join(', '), types.join('/'), piece.join(', '), other.join(', ')])
    .filter(Boolean)
    .join(' ');
  const prepText = prep.join(', ');

  if (!text && !prepText) return '';

  return `<p class="ingredient__desc">${text}${prepText ? `<span class="ingredient__prep">${text ? ', ' : ''}${prepText}</span>` : ''}</p>`;
};

// Checkbox, name chip, descriptors and quantity chips for one ingredient.
// Used for main ingredients, alternatives and sub-recipe ingredients.
// afterName goes right after the name chip (the sub-recipe chevron).
const ingredientMarkup = (ingredient, nameChip = 'chip--ingredient', afterName = '') => `
  <input class="checkbox" type="checkbox">
  <h6 class="chip ${nameChip}">${ingredient.name}</h6>
  ${afterName}
  ${descriptorMarkup(ingredient.descriptors, ingredient.instructions)}
  <div class="divider divider--short"></div>
  ${ingredient.quantity.map(quantor => `<p class="chip chip--${quantor.name}">${quantor.quantity}${quantor.short}</p>`).join('<p>&colon;</p>')}
`;

// Indented "or" rows for an ingredient's alternatives, if it has any.
const alternativesMarkup = (alternatives = []) => alternatives.map(alternative => `
  <div class="ingredient__row ingredient__row--alt">
    <span class="ingredient__or">or</span>
    ${ingredientMarkup(alternative, 'chip--alt')}
  </div>
`).join('');

// Wraps the step's ingredients (the ones listed beside its title) in a span
// wherever they appear in a sentence, so they stand out in green. Longest
// names first, so "olive oil" wins over "oil"; an optional s/es catches plurals.
const highlightIngredients = (sentence, ingredients = []) => {
  if (!ingredients.length) return sentence;

  const names = [...ingredients]
    .sort((a, b) => b.length - a.length)
    .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(?<!\\p{L})(?:${names.join('|')})(?:e?s)?(?!\\p{L})`, 'giu');

  return sentence.replace(pattern, match => `<span class="step__mention">${match}</span>`);
};

// One ingredient in the list, with its alternatives and sub-recipe if it has them.
const ingredientItemMarkup = ingredient => `
  <li class="ingredient">
    <div class="ingredient__row ${ingredient.optional ? 'ingredient__row--optional' : ''}">
      ${ingredientMarkup(ingredient, 'chip--ingredient', ingredient.optional ? `<div class="ingredient__toggle"></div>` : '')}
    </div>

    ${alternativesMarkup(ingredient.alternatives)}

    ${ingredient.optional ? `
      <div class="sub-recipe">
        <h5>${ingredient.optional_name}</h5>
        <div class="divider divider--full"></div>
        <ul>
        ${ingredient.optional_ingredients.map(optional_ingredient => `
          <li class="sub-recipe__item">
            ${ingredientMarkup(optional_ingredient)}
          </li>
        `).join('')}
        </ul>
        <ol class="sub-recipe__steps">
          ${ingredient.optional_instructions.map(optional_instruction => `<li class="step">
          <div class="step__header sub-step__header">
            <h6>${optional_instruction.title}</h6>
            <div class="step__ingredients">
              ${optional_instruction.ingredients.map(ingredient => `<span class="step__ingredient">${ingredient}</span>`).join('')}
            </div>
          </div>
          <ul class="step__list">
              ${optional_instruction.para.map(sentence => `<li class="step__item">${highlightIngredients(sentence, optional_instruction.ingredients)}</li>`).join('')}
          </ul>
        </li>
      `).join('')}
        </ol>
      </div>
    ` : ''}
  </li>
`;

// A named group of ingredients, like "buttermilk marinade", with a heading.
const ingredientGroupMarkup = group => `
  <li class="ingredient-group">
    <h5 class="ingredient-group__title">${group.group}</h5>
    <ul>
      ${group.ingredients.map(ingredientItemMarkup).join('')}
    </ul>
  </li>
`;

const recipeMarkup = recipes.map( recipe => 
  `<div id="${recipe.name.replaceAll(' ', '-')}" class="recipe">
    <div class="recipe__banner">
      <h3 class="recipe__title">${recipe.name}</h3>
      <div class="divider divider--full"></div>
      <div class="recipe__meta">
        <h6>${recipe.tags.map(tag => `<span>${tag}</span>`).join(', ')}</h6>
        <div class="divider divider--vertical"></div>
        <h6>serves ${recipe.serves}</h6>
      </div>
      <div class="recipe__equipment">
        ${recipe.equipment.map(equipment => `<span>${equipment}</span>`).join('&middot;')}
      </div>

      <div class="recipe__toggle"></div>
      <div class="recipe__expand"></div>
      <div class="recipe__edit"></div>
    </div>

    <div class="recipe__body">
      <ul class="recipe__ingredients">
        ${recipe.ingredients.map(item => item.group ? ingredientGroupMarkup(item) : ingredientItemMarkup(item)).join('')}
      </ul>

      <ol class="recipe__steps">
        ${recipe.instructions.map(instruction => `
          <li class="step">
            <div class="step__header">
              <h6>${instruction.title}</h6>
              <div class="divider divider--short"></div>
              <div class="step__ingredients">
                ${instruction.ingredients.map(ingredient => `<span class="step__ingredient">${ingredient}</span>`).join('')}
              </div>
            </div>
            <ul class="step__list">
                ${instruction.para.map(sentence => `<li class="step__item">${highlightIngredients(sentence, instruction.ingredients)}</li>`).join('')}
            </ul>
          </li>
        `).join('')}
      </ol>
    </div>
  </div>
`).join('');

window.onload = () => {
  document.getElementById('recipes').innerHTML = recipeMarkup

  const recipes = document.querySelectorAll('.recipe');
  const optional_recipes = document.querySelectorAll('.ingredient__row--optional');

  recipes.forEach(recipe => {
    const panel = recipe.querySelector('.recipe__body');
    const toggleIndicator = recipe.querySelector('.recipe__toggle');

    // Start collapsed, matching your CSS.
    panel.inert = true;

    toggleIndicator.addEventListener('click', () => {
      const isOpen = panel.classList.contains('recipe__body--open');

      // Capture the current height, including mid-animation.
      panel.style.height = `${panel.getBoundingClientRect().height}px`;

      // Commit the starting height before setting the next one.
      void panel.offsetHeight;

      panel.classList.toggle('recipe__body--open', !isOpen);
      toggleIndicator.classList.toggle('recipe__toggle--open', !isOpen);
      panel.inert = isOpen;

      panel.style.height = isOpen
        ? '0px'
        : `${panel.scrollHeight}px`;
    });

    panel.addEventListener('transitionend', e => {
      if (e.target !== panel || e.propertyName !== 'height') return;

      // Let the open recipe resize when optional recipes expand.
      if (panel.classList.contains('recipe__body--open')) {
        panel.style.height = 'auto';
      }
    });
});

  optional_recipes.forEach(recipe => {
    // Found by class, not position, since alternative rows can sit in between.
    const panel = recipe.parentElement.querySelector('.sub-recipe');
    const toggleIndicator = recipe.querySelector('.ingredient__toggle');

    // Prevent interaction with controls inside the collapsed recipe.
    panel.inert = true;

    recipe.addEventListener('click', e => {
      // Let the ingredient checkbox work without toggling the recipe.
      if (e.target.closest('input')) return;

      const isOpen = panel.classList.contains('sub-recipe--open');

      // Capture the current height, including during an unfinished animation.
      panel.style.height = `${panel.getBoundingClientRect().height}px`;

      // Commit that height before setting the next transition target.
      void panel.offsetHeight;

      panel.classList.toggle('sub-recipe--open', !isOpen);
      toggleIndicator.classList.toggle('ingredient__toggle--open', !isOpen);
      panel.inert = isOpen;

      panel.style.height = isOpen
        ? '0px'
        : `${panel.scrollHeight}px`;
    });

    panel.addEventListener('transitionend', e => {
      if (e.target !== panel || e.propertyName !== 'height') return;

      // Once expanded, allow the content to resize naturally.
      if (panel.classList.contains('sub-recipe--open')) {
        panel.style.height = 'auto';
      }
    });
  });

  // An ingredient and its alternatives are either/or: ticking one fades the others.
  document.querySelectorAll('.ingredient').forEach(ingredient => {
    const rows = [...ingredient.querySelectorAll(':scope > .ingredient__row')];
    if (rows.length < 2) return;

    rows.forEach(row => row.querySelector('.checkbox').addEventListener('change', () => {
      const anyChecked = rows.some(r => r.querySelector('.checkbox').checked);
      rows.forEach(r => r.classList.toggle('ingredient__row--faded', anyChecked && !r.querySelector('.checkbox').checked));
    }));
  });

  // A descriptor that wraps onto two lines keeps the full width it was given,
  // leaving a gap before the divider. CSS can't shrink it to fit, so narrow
  // each wrapped descriptor to its longest line.
  const tightenDescriptors = () => {
    document.querySelectorAll('.ingredient__desc').forEach(desc => {
      desc.style.width = '';

      const range = document.createRange();
      range.selectNodeContents(desc);
      const lines = [...range.getClientRects()];
      const lineCount = new Set(lines.map(line => Math.round(line.top))).size;
      if (lineCount < 2) return;

      desc.style.width = `${Math.ceil(Math.max(...lines.map(line => line.width)))}px`;
    });
  };

  tightenDescriptors();
  document.fonts.ready.then(tightenDescriptors);

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(tightenDescriptors);
  });








  const teaspoonMillilitre = document.getElementById('teaspoon-millilitre');
  const millilitreTeaspoon = document.getElementById('millilitre-teaspoon');

  const tablespoonMillilitre = document.getElementById('tablespoon-millilitre');
  const millilitreTablespoon = document.getElementById('millilitre-tablespoon');

  const cupMillilitre = document.getElementById('cup-millilitre');
  const millilitreCup = document.getElementById('millilitre-cup');

  const ounceGram = document.getElementById('ounce-gram');
  const gramOunce = document.getElementById('gram-ounce');

  const poundGram = document.getElementById('pound-gram');
  const gramPound = document.getElementById('gram-pound');


  teaspoonMillilitre.addEventListener('input', e => {
    let millilitre = e.target.value * 5;
    millilitreTeaspoon.value = millilitre;
  })

  millilitreTeaspoon.addEventListener('input', e => {
    let teaspoon = e.target.value / 5;
    teaspoonMillilitre.value = teaspoon;
  })

  tablespoonMillilitre.addEventListener('input', e => {
    let millilitre = e.target.value * 15;
    millilitreTablespoon.value = millilitre;
  })

  millilitreTablespoon.addEventListener('input', e => {
    let tablespoon = e.target.value / 15;
    tablespoonMillilitre.value = tablespoon;
  })

  cupMillilitre.addEventListener('input', e => {
    let millilitre = e.target.value * 240;
    millilitreCup.value = millilitre;
  })

  millilitreCup.addEventListener('input', e => {
    let cup = e.target.value / 240;
    cupMillilitre.value = cup;
  })



  ounceGram.addEventListener('input', e => {
    let gram = e.target.value * 28;
    gramOunce.value = gram;
  })

  gramOunce.addEventListener('input', e => {
    let ounce = e.target.value / 28;
    ounceGram.value = ounce;
  })

  poundGram.addEventListener('input', e => {
    let gram = e.target.value * 454;
    gramPound.value = gram;
  })

  gramPound.addEventListener('input', e => {
    let pound = e.target.value / 454;
    poundGram.value = pound;
  })
}

