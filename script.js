const form = document.querySelector(".form");
const searchInput = document.getElementById("search");
const shuffleBtn = document.querySelector(".shuffle");
const mainElement = document.querySelector(".main");

let searchingValue;
let mealId;
/////////////////////////////////////
// Helper functions
const loadingSpinner = () => {
  mainElement.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="spinner-container">
        <div id="loading"></div>
    </div>
  `
  );
};

const clearMealsFromDOM = () => {
  mainElement.innerHTML = "";
};

const pushSingleMealHistory = (mealId) => {
  window.history.pushState({}, "", `/${mealId}`);
};

const handleLocation = () => {
  const path = window.location.pathname;
  // /:mealId path
  if (
    path.split("/").length === 2 &&
    isFinite(+path.split("/")[1]) &&
    +path.split("/")[1] !== 0
  ) {
    const mealId = path.split("/")[1];
    fetchMealById(mealId);
  }
  // /:mealName path
  if (
    path.split("/").length === 2 &&
    path.split("/")[1] !== "" &&
    !isFinite(+path.split("/")[1])
  ) {
    const mealName = path.split("/")[1];
    searchingValue = mealName;
    fetchMealByName(mealName);
  }
  // /path
  if (path.split("/").length === 2 && path.split("/")[1] === "") {
    mainElement.innerHTML = "";
  }
};
/////////////////////////////////////
// Fetching functions
const fetchMealByName = async (mealName) => {
  clearMealsFromDOM();
  loadingSpinner();
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/search.php?s=${mealName}`
  );
  const data = await res.json();
  const mealsArray = data.meals;
  displayMeals(mealsArray);
};

const fetchMealById = async (mealId) => {
  clearMealsFromDOM();
  loadingSpinner();
  const res = await fetch(
    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
  );
  const data = await res.json();
  if (!data.meals) {
    clearMealsFromDOM();
    return mainElement.insertAdjacentHTML(
      "beforeend",
      `<p class="no-meals">No meal found</p>`
    );
  }
  const meal = data.meals[0];
  displaySingleMeal(meal);
};

const fetchRandmoMeal = async () => {
  clearMealsFromDOM();
  loadingSpinner();
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/random.php`);
  const data = await res.json();
  const meal = data.meals[0];
  displaySingleMeal(meal);
};
/////////////////////////////////////
// Displaying functions
const displayMeals = (mealsArray) => {
  clearMealsFromDOM();
  mainElement.insertAdjacentHTML(
    "beforeend",
    `<p class="searching-text">
      Search results for '<span class="searching-value">${searchingValue}</span>':
    </p>`
  );
  if (!mealsArray) {
    return mainElement.insertAdjacentHTML(
      "beforeend",
      `<p class="no-meals">No meal found</p>`
    );
  }
  mainElement.insertAdjacentHTML("beforeend", `<div class="meals"></div>`);
  const mealsContainer = document.querySelector(".meals");

  mealsContainer.classList.remove("hidden");
  mealsArray.forEach((meal) => {
    mealsContainer.insertAdjacentHTML(
      "beforeend",
      `
    <div class="meal" data-mealid=${meal.idMeal}>
      <div class="spinner-container">
          <div id="loading"></div>
      </div>
      <a href="/${meal.idMeal}" class="meal-name">${meal.strMeal}</a>
      <img
        src=${meal.strMealThumb}
        alt="meal"
        />
    </div>
    `
    );
  });
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("load", () => {
      img
        .closest(".meal")
        .querySelector(".spinner-container")
        .classList.add("hidden");
    });
  });
};

const displaySingleMeal = (meal) => {
  mealId = meal.idMeal;
  const strIngredientArray = [];
  const strMeasureArray = [];

  for (let i = 1; i < 20; i++) {
    const mealData = meal[`strIngredient${i}`];
    const mealMeasure = meal[`strMeasure${i}`];
    if (mealData) {
      strIngredientArray.push(mealData);
      strMeasureArray.push(mealMeasure);
    } else {
      break;
    }
  }
  mainElement.innerHTML = "";
  mainElement.insertAdjacentHTML(
    "beforeend",
    `
    <section class="meal-data">
    <h2 class="secondary-heading">
      ${meal.strMeal}
    </h2>
    <div class="img-container">
      <div class="spinner-container">
        <div id="loading"></div>
      </div>
      <img
        src=${meal.strMealThumb}
        alt="meal"
      />
    </div>
    <div class="category-area-container">
      <p class="meal-category">${meal.strCategory}</p>
      <p class="meal-area">${meal.strArea}</p>
    </div>
    <p class="instructions">${meal.strInstructions}</p>
    <div class="ingredients-container">
      <p class="ingredients-text">Ingredients</p>
      <ul class="ingredients">
        ${strIngredientArray
          .map(
            (mealData, index) =>
              `<li class="ingredient">${mealData} - ${strMeasureArray[index]}</li>`
          )
          .join("")}
      </ul>
    </div>
  </section>
    `
  );
  document.querySelector("img").addEventListener("load", (e) => {
    e.target
      .closest(".img-container")
      .querySelector(".spinner-container")
      .classList.add("hidden");
  });
};
/////////////////////////////////////
// Event Listners
window.addEventListener("popstate", handleLocation);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchingValue = searchInput.value;
  window.history.pushState({}, "", `/${searchingValue}`);
  searchInput.value = "";
  if (!searchingValue) {
    return alert("Please enter a search term");
  }
  fetchMealByName(searchingValue);
});

mainElement.addEventListener("click", (e) => {
  if (!e.target.classList.contains("meal-name")) return;
  e.preventDefault();
  const mealId = +e.target.closest(".meal").dataset.mealid;
  pushSingleMealHistory(mealId);
  fetchMealById(mealId);
});

shuffleBtn.addEventListener("click", async () => {
  await fetchRandmoMeal();
  pushSingleMealHistory(mealId);
});

////////////////////////////////
handleLocation();
