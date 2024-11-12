const apiKey = '728ac0ce03e04c87adc423ba156c5824'; 

const searchInput = document.getElementById('search-input');
const suggestionsContainer = document.getElementById('suggestions');
const recipesGrid = document.getElementById('recipes-grid');
const recipeModal = document.getElementById('recipe-modal');
const recipeDetails = document.getElementById('recipe-details');

searchInput.addEventListener('input', function() {
  const query = this.value.trim();
  if (query.length > 2) {
    fetchSuggestions(query); 
  } else {
    suggestionsContainer.style.display = 'none';
  }
});

async function fetchSuggestions(query) {
  suggestionsContainer.innerHTML = 'Loading suggestions...';
  suggestionsContainer.style.display = 'block';
  const url = `https://api.spoonacular.com/recipes/autocomplete?apiKey=${apiKey}&query=${query}&number=5`;
  try {
    const response = await fetch(url);
    const suggestions = await response.json();

    suggestionsContainer.innerHTML = '';
    if (suggestions.length === 0) {
      suggestionsContainer.innerHTML = 'No suggestions found';
    } else {
      suggestions.forEach(suggestion => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';

        suggestionItem.innerHTML = `
          <img src="https://spoonacular.com/recipeImages/${suggestion.id}-312x231.jpg" alt="${suggestion.title}" class="suggestion-img">
          ${suggestion.title}
        `;
        suggestionItem.onclick = () => {
          searchInput.value = suggestion.title;
          suggestionsContainer.style.display = 'none';
          searchRecipes();
        };
        suggestionsContainer.appendChild(suggestionItem);
      });
    }
  } catch (error) {
    suggestionsContainer.innerHTML = 'Error fetching suggestions';
    console.error('Error fetching suggestions:', error);
  }
}

async function searchRecipes() {
  const query = document.getElementById('search-input').value.trim();
  if (query === '') {
    alert('Please enter a search term');
    return;
  }

  document.getElementById('loading-spinner').style.display = 'block';

  const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}&number=10`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      displayRecipes(data.results);
    } else {
      alert('No recipes found.');
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
    alert('Error fetching recipes. Please try again.');
  } finally {
    document.getElementById('loading-spinner').style.display = 'none';
  }
}

function displayRecipes(recipes) {
  recipesGrid.innerHTML = '';
  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';

    const image = document.createElement('img');
    image.src = `https://spoonacular.com/recipeImages/${recipe.id}-312x231.jpg`;
    image.alt = recipe.title;
    image.loading = 'lazy';

    recipeCard.appendChild(image);
    recipeCard.innerHTML += `
      <h3>${recipe.title}</h3>
      <p>Готовится за ${recipe.readyInMinutes ? recipe.readyInMinutes + ' минут' : 'Неизвестно'}</p>
      <button onclick="addToFavorites(${recipe.id}, '${recipe.title}')">add to favourites</button>
      <button onclick="showRecipeDetails(${recipe.id})">View Details</button>
    `;
    recipesGrid.appendChild(recipeCard);
  });
}

let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
function addToFavorites(recipeId, title) {
  if (!favorites.find(fav => fav.id === recipeId)) { 
    favorites.push({ id: recipeId, title });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    alert(`${title} added`);
    loadFavorites(); 
  } else {
    alert(`${title} already added.`);
  }
}

function loadFavorites() {
  const favoritesGrid = document.getElementById('favorites-grid');
  favoritesGrid.innerHTML = '';

  if (favorites.length === 0) {
    favoritesGrid.innerHTML = '<p>No favorite recipes yet!</p>';
    return;
  }

  favorites.forEach(favorite => {
    const recipeCard = document.createElement('div');
    recipeCard.className = 'recipe-card';
    recipeCard.innerHTML = `
      <img src="https://spoonacular.com/recipeImages/${favorite.id}-312x231.jpg" alt="${favorite.title}" loading="lazy">
      <h3>${favorite.title}</h3>
      <button onclick="removeFromFavorites(${favorite.id})">Remove</button>
    `;
    favoritesGrid.appendChild(recipeCard);
  });
}

function removeFromFavorites(recipeId) {
  favorites = favorites.filter(fav => fav.id !== recipeId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
  loadFavorites();
}

async function showRecipeDetails(recipeId) {
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    recipeDetails.innerHTML = `
      <h2>${data.title}</h2>
      <img src="${data.image}" alt="${data.title}" />
      <h3>Ингредиенты:</h3>
      <ul>${data.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
      <h3>Пошаговые инструкции:</h3>
      <p>${data.instructions || 'Нет инструкций'}</p>
      <h3>Питательная информация:</h3>
      <p>Калории: ${data.nutrition?.nutrients.find(n => n.title === 'Calories')?.amount || 0} ккал</p>
      <p>Белки: ${data.nutrition?.nutrients.find(n => n.title === 'Protein')?.amount || 0} г</p>
      <p>Жиры: ${data.nutrition?.nutrients.find(n => n.title === 'Fat')?.amount || 0} г</p>
      <h3>Оценки и отзывы:</h3>
      <p>Лайков: ${data.aggregateLikes || 0}</p>
      <p>Средний рейтинг: ${data.spoonacularScore ? (data.spoonacularScore / 10).toFixed(1) : 'Нет рейтинга'}</p>
    `;
    recipeModal.style.display = 'flex';
  } catch (error) {
    console.error('Ошибка при получении информации о рецепте:', error);
    alert('Ошибка при загрузке информации о рецепте.');
  }
}

function closeModal() {
  recipeModal.style.display = 'none';
}

window.addEventListener('click', (e) => {
  if (e.target === recipeModal) {
      closeModal();
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
      closeModal();
  }
});

window.onload = loadFavorites;
