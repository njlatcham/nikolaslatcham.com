import recipes from "./recipes.json" with {type: 'json'}

const recipeMarkup = recipes.map( recipe => 
  `<div id="${recipe.name.replaceAll(' ', '-')}" class="recipe">
    <div class="recipe__banner">
      <h3>${recipe.name}</h3>
      <div class="divider divider--full"></div>
      <div class="recipe__meta">
        <h6>${recipe.tags.map(tag => `<span>${tag}</span>`).join(', ')}</h6>
        <div class="divider divider--vertical"></div>
        <h6>serves ${recipe.serves}</h6>
      </div>
      <div class="recipe__equipment">
        ${recipe.equipment.map(equipment => `<span>${equipment}</span>`).join(', ')}
      </div>

      <div class="recipe__toggle"></div>
    </div>

    <div class="recipe__body">
      <ul class="recipe__ingredients">
        ${recipe.ingredients.map(ingredient => `
          <li class="ingredient">
            <div class="ingredient__row ${ingredient.optional ? 'ingredient__row--optional' : ''}">
              <input class="checkbox" type="checkbox">
              <h6 class="chip chip--ingredient">${ingredient.name}</h6>
              ${ingredient.descriptors?.length ? `<p class="ingredient__desc">${ingredient.descriptors.map(descriptor => `${descriptor.size}`)} ${ingredient.descriptors.map(descriptor => `${descriptor.types.length > 1 ? descriptor.types.map(type => `${type}`).join('/') : `${descriptor.types}`}`)} ${ingredient.descriptors.map(descriptor => `${descriptor.piece}`)} ${ingredient.descriptors.map(descriptor => `${descriptor.other}`)}</p>` : ''}
              <div class="divider divider--short"></div>
              ${ingredient.quantity.map(quantor => `
                <p class="chip chip--${quantor.name}">${quantor.quantity}${quantor.short}</p>
              `).join('<p>&colon;</p>')}

              ${ingredient.optional ? `<div class="ingredient__toggle"></div>` : ''}
            </div>

            ${ingredient.optional ? `
              <div class="sub-recipe">
                <h5>${ingredient.optional_name}</h5>
                <div class="divider divider--full"></div>
                <ul>
                ${ingredient.optional_ingredients.map(optional_ingredient => `
                  <li class="sub-recipe__item">
                    <input class="checkbox" type="checkbox">
                    <h6 class="chip chip--ingredient">${optional_ingredient.name}</h6>
                    <p class="ingredient__desc">${optional_ingredient.descriptors.map(descriptor => `${descriptor.size}`)} ${optional_ingredient.descriptors.map(descriptor => `${descriptor.types.length > 1 ? descriptor.types.map(type => `${type}`).join('/') : `${descriptor.types}`}`)} ${optional_ingredient.descriptors.map(descriptor => `${descriptor.piece}`)} ${optional_ingredient.descriptors.map(descriptor => `${descriptor.other}`)}</p>
                    <div class="divider divider--short"></div>
                    ${optional_ingredient.quantity.map(quantor => `<p class="chip chip--${quantor.name}">${quantor.quantity}${quantor.short}</p>`).join('<p>&colon;</p>')}
                  </li>
                `).join('')}
                </ul>
                <ol class="sub-recipe__steps">
                  ${ingredient.optional_instructions.map(optional_instruction => `<li class="step">
                  <div class="step__header">
                    <h6>${optional_instruction.title}</h6>
                    <div class="divider divider--short"></div>
                    <div>
                      ${optional_instruction.ingredients.map(ingredient => `<span class="step__ingredient">${ingredient}</span>`).join('')}
                    </div>
                  </div>
                  <ul class="step__list">
                      ${optional_instruction.para.map(sentence => `<li class="step__item">${sentence}</li>`).join('')}
                  </ul>
                </li>
              `).join('')}
                </ol>
              </div>
            ` : ''}
          </li>
        `).join('')}
      </ul>

      <ol class="recipe__steps">
        ${recipe.instructions.map(instruction => `
          <li class="step">
            <div class="step__header">
              <h6>${instruction.title}</h6>
              <div class="divider divider--short"></div>
              <div>
                ${instruction.ingredients.map(ingredient => `<span class="step__ingredient">${ingredient}</span>`).join('')}
              </div>
            </div>
            <ul class="step__list">
                ${instruction.para.map(sentence => `<li class="step__item">${sentence}</li>`).join('')}
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
    const panel = recipe.nextElementSibling;
    const toggleIndicator = recipe.querySelector('.ingredient__toggle');

    // Prevent interaction with controls inside the collapsed recipe.
    panel.inert = true;

    recipe.addEventListener('click', e => {
      // Let the ingredient checkbox work without toggling the recipe.
      if (e.target.closest('input')) return;

      const row = e.currentTarget;
      const panel = row.nextElementSibling;
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

