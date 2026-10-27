const API_URL = "https://www.themealdb.com/api/json/v1/1";

const ENDPOINTS = {
    ingredients: `${API_URL}/list.php?i=list`,
    categoryList: `${API_URL}/list.php?c=list`,
    search: `${API_URL}/search.php?s=`,
    firstLetter: `${API_URL}/search.php?f=`,
    ingredientFilter: `${API_URL}/filter.php?i=`,
    categoryFilter: `${API_URL}/filter.php?c=`,
    details: `${API_URL}/lookup.php?i=`
};

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const recipeContainer = document.getElementById("recipeContainer");
const recipeCount = document.getElementById("recipeCount");
const resultTitle = document.getElementById("resultTitle");
const emptyMessage = document.getElementById("emptyMessage");
const categoryFilter = document.getElementById("categoryFilter");
const loadMoreButton = document.getElementById("loadMoreButton");
const recipeModal = document.getElementById("recipeModal");
const modalContent = document.getElementById("modalContent");
const recentContainer = document.getElementById("recentContainer");
const toast = document.getElementById("toast");

let allRecipes = [];
let currentRecipes = [];
let currentFilter = "all";
let currentCategory = "all";
let visibleCount = 12;
let availableIngredients = [];
let availableCategories = [];
let toastTimer;
let searchVersion = 0;
let activeRequestVersion = 0;
let isLoadingAll = false;

const recipeCache = new Map();

function loadStorage(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

let favorites = loadStorage("foodieFavorites").map(String);
let recentlyViewed = loadStorage("foodieRecentlyViewed");

function saveStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        showToast("Browser storage is unavailable.");
    }
}

async function getJSON(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json();
}

async function fetchMeals(url) {
    try {
        const data = await getJSON(url);

        if (data.meals == null) return [];

        if (!Array.isArray(data.meals)) {
            throw new Error("Unexpected recipe data received.");
        }

        return data.meals;
    } catch (error) {
        console.error("Recipe API error:", error);
        return null;
    }
}

function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function normalizeText(value = "") {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[\_-]+/g, " ")
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getRecipeId(meal) {
    return String(meal?.idMeal || "");
}

function hasFullDetails(meal) {
    return Boolean(
        meal?.idMeal &&
        meal?.strMeal &&
        meal?.strInstructions
    );
}

function removeDuplicateRecipes(recipes) {
    const unique = new Map();

    recipes.forEach(meal => {
        if (!meal?.idMeal) return;

        const id = getRecipeId(meal);
        const existing = unique.get(id);

        if (!existing || hasFullDetails(meal)) {
            unique.set(id, meal);
        }
    });

    return [...unique.values()];
}

function cacheRecipes(recipes) {
    recipes.forEach(meal => {
        if (!meal?.idMeal) return;

        const id = getRecipeId(meal);
        const previous = recipeCache.get(id);

        if (!previous || hasFullDetails(meal)) {
            recipeCache.set(id, meal);
        }
    });
}

function setLoading(message = "Finding delicious recipes...") {
    if (recipeContainer) {
        recipeContainer.innerHTML =
            `<p class="loading">${escapeHTML(message)}</p>`;
    }

    if (recipeCount) {
        recipeCount.textContent = "Loading recipes...";
    }

    if (emptyMessage) {
        emptyMessage.classList.add("hidden");
    }

    if (loadMoreButton) {
        loadMoreButton.classList.add("hidden");
    }
}

function populateSelect(selectElement, values, defaultLabel) {
    if (!selectElement) return;

    const previousValue = selectElement.value || "all";

    selectElement.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "all";
    defaultOption.textContent = defaultLabel;

    selectElement.appendChild(defaultOption);

    [...new Set(values.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b))
        .forEach(value => {
            const option = document.createElement("option");

            option.value = value;
            option.textContent = value;

            selectElement.appendChild(option);
        });

    selectElement.value = [...selectElement.options]
        .some(option => option.value === previousValue)
        ? previousValue
        : "all";
}

async function loadIngredients() {
    const data = await fetchMeals(ENDPOINTS.ingredients);

    if (data === null) return;

    availableIngredients = data
        .map(item => item.strIngredient)
        .filter(Boolean);

    let datalist = document.getElementById("ingredientSuggestions");

    if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "ingredientSuggestions";
        document.body.appendChild(datalist);
    }

    datalist.innerHTML = availableIngredients
        .map(item => `<option value="${escapeHTML(item)}"></option>`)
        .join("");

    if (searchInput) {
        searchInput.setAttribute("list", "ingredientSuggestions");
    }
}

async function loadCategories() {
    const data = await fetchMeals(ENDPOINTS.categoryList);

    if (data === null) return;

    availableCategories = data
        .map(item => item.strCategory)
        .filter(Boolean);

    populateSelect(
        categoryFilter,
        availableCategories,
        "All categories"
    );
}

function getIngredients(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal?.[`strIngredient${i}`];
        const measure = meal?.[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            ingredients.push({
                name: ingredient.trim(),
                measure: measure ? measure.trim() : ""
            });
        }
    }

    return ingredients;
}

function getSearchableText(meal) {
    return normalizeText([
        meal.strMeal,
        meal.strCategory,
        ...getIngredients(meal).map(item => item.name)
    ].join(" "));
}

function matchesSearch(meal, query) {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) return true;

    const searchable = getSearchableText(meal);

    return searchable.includes(normalizedQuery) ||
        normalizedQuery.split(" ").every(
            term => searchable.includes(term)
        );
}

function getFilteredRecipes() {
    let recipes = [...currentRecipes];

    if (currentFilter === "favorites") {
        recipes = recipes.filter(meal =>
            favorites.includes(getRecipeId(meal))
        );
    }

    if (currentCategory !== "all") {
        recipes = recipes.filter(meal =>
            normalizeText(meal.strCategory) ===
            normalizeText(currentCategory)
        );
    }

    return removeDuplicateRecipes(recipes);
}

function updateFilterButtons() {
    document.querySelectorAll(".filter").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === currentFilter
        );
    });
}

function displayRecipes() {
    if (!recipeContainer) return;

    const recipes = getFilteredRecipes();
    const total = recipes.length;
    const displayed = recipes.slice(0, visibleCount);

    recipeContainer.innerHTML = "";

    if (recipeCount) {
        recipeCount.textContent =
            `${total} ${total === 1 ? "recipe found" : "recipes found"}`;
    }

    if (emptyMessage) {
        emptyMessage.classList.toggle("hidden", total > 0);
    }

    if (total === 0) {
        recipeContainer.innerHTML = `
            <p class="loading">
                No recipes found. Try another search or change your filters.
            </p>
        `;
    } else {
        displayed.forEach((meal, index) => {
            recipeContainer.appendChild(
                createRecipeCard(meal, index)
            );
        });
    }

    if (loadMoreButton) {
        loadMoreButton.classList.toggle(
            "hidden",
            visibleCount >= total || total === 0
        );

        loadMoreButton.textContent = "Show more recipes";
    }
}

function createRecipeCard(meal, index) {
    const card = document.createElement("article");
    const id = getRecipeId(meal);
    const favorite = favorites.includes(id);

    card.className = "recipe-card";
    card.style.animationDelay =
        `${Math.min(index * 35, 280)}ms`;

    card.innerHTML = `
        <div class="card-image-wrap">
            <img
                class="card-image"
                src="${escapeHTML(meal.strMealThumb || "")}"
                alt="${escapeHTML(meal.strMeal || "Recipe")}"
                loading="lazy"
            >

            <button
                class="heart ${favorite ? "active" : ""}"
                data-action="favorite"
                aria-label="${favorite ? "Remove from favorites" : "Add to favorites"}"
                aria-pressed="${favorite}"
                type="button"
            >${favorite ? "♥" : "♡"}</button>
        </div>

        <div class="card-body">
            <p class="category">
                ${escapeHTML(meal.strCategory || "Recipe")}
            </p>

            <h3 class="card-title">
                ${escapeHTML(meal.strMeal || "Untitled recipe")}
            </h3>

            <p class="meta">Open to see ingredients and instructions</p>

            <div class="actions">
                <button
                    class="details"
                    data-action="details"
                    type="button"
                >
                    View recipe ↗
                </button>
            </div>
        </div>
    `;

    const image = card.querySelector(".card-image");

    image.addEventListener("error", () => {
        image.style.visibility = "hidden";
    }, { once: true });

    card.querySelector('[data-action="favorite"]')
        .addEventListener("click", () => toggleFavorite(meal));

    card.querySelector('[data-action="details"]')
        .addEventListener("click", () => showRecipeDetails(id));

    return card;
}

function toggleFavorite(meal) {
    const id = getRecipeId(meal);

    if (!id) return;

    if (favorites.includes(id)) {
        favorites = favorites.filter(item => item !== id);
        showToast("Removed from Favorites.");
    } else {
        favorites.push(id);
        showToast("Added to Favorites!");
    }

    saveStorage("foodieFavorites", favorites);
    updateFilterButtons();
    displayRecipes();

    const modalFavorite = document.getElementById("modalFavorite");

    if (modalFavorite && modalFavorite.dataset.mealId === id) {
        modalFavorite.textContent = favorites.includes(id)
            ? "♥ Remove from Favorites"
            : "♡ Add to Favorites";

        modalFavorite.setAttribute(
            "aria-pressed",
            String(favorites.includes(id))
        );
    }
}

async function getRecipeById(id) {
    const cached = recipeCache.get(String(id));

    if (cached && hasFullDetails(cached)) {
        return cached;
    }

    const meals = await fetchMeals(
        `${ENDPOINTS.details}${encodeURIComponent(id)}`
    );

    if (meals === null) return null;

    const meal = meals.find(
        item => getRecipeId(item) === String(id)
    );

    if (meal) cacheRecipes([meal]);

    return meal || cached || null;
}

function getInstructionSteps(instructions) {
    const rawSteps = String(instructions || "")
        .replace(/\r/g, "\n")
        .split(/\n+/)
        .map(step => step.trim())
        .filter(Boolean);

    const cleanedSteps = [];

    for (let i = 0; i < rawSteps.length; i++) {
        let step = rawSteps[i];

        if (/^step\s\*\d+$/i.test(step)) {
            continue;
        }

        step = step
            .replace(/^(?:step\s\*\d+[\s.-]\*|\d+[\s.-])+/i, "")
            .trim();

        if (step) {
            cleanedSteps.push(step);
        }
    }

    return cleanedSteps;
}

function isSafeExternalURL(value) {
    if (!value) return false;

    try {
        const url = new URL(value);

        return (
            (url.protocol === "https:" || url.protocol === "http:") &&
            (
                url.hostname === "youtube.com" ||
                url.hostname.endsWith(".youtube.com") ||
                url.hostname === "youtu.be"
            )
        );
    } catch {
        return false;
    }
}

function createVideoHTML(videoURL) {
    if (isSafeExternalURL(videoURL)) {
        return `
            <div class="video-action-area">
                <a
                    class="button watch-video"
                    href="${escapeHTML(videoURL)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch the recipe video on YouTube"
                >
                    <span class="play-circle" aria-hidden="true">▶</span>
                    <span>Watch Recipe Video</span>
                    <span class="video-external-icon" aria-hidden="true">↗</span>
                </a>

                <span class="video-note">
                    <span class="note-dot"></span>
                    Opens the cooking video on YouTube
                </span>
            </div>
        `;
    }

    return `
        <p class="no-video">
            <span class="no-video-icon" aria-hidden="true">▷</span>
            <span>
                <strong>No video available</strong><br>
                There is no cooking video linked to this recipe yet.
                You can still follow the written instructions above.
            </span>
        </p>
    `;
}

async function showRecipeDetails(mealId) {
    if (!recipeModal || !modalContent) return;

    const id = String(mealId);
    const requestVersion = ++activeRequestVersion;

    recipeModal.classList.remove("hidden");
    document.body.classList.add("modal-open");

    modalContent.innerHTML = `
        <div class="modal-body-layout">
            <p class="loading">Loading recipe details...</p>
        </div>
    `;

    const meal = await getRecipeById(id);

    if (requestVersion !== activeRequestVersion) return;

    if (!meal) {
        modalContent.innerHTML = `
            <div class="modal-body-layout">
                <p class="loading">
                    Recipe details could not be loaded.
                    Check your connection and try again.
                </p>
            </div>
        `;
        return;
    }

    recentlyViewed = recentlyViewed.filter(
        item => getRecipeId(item) !== id
    );

    recentlyViewed.unshift({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb
    });

    recentlyViewed = recentlyViewed.slice(0, 6);

    saveStorage("foodieRecentlyViewed", recentlyViewed);
    displayRecentRecipes();

    const ingredients = getIngredients(meal);

    const ingredientsHTML = ingredients.length
        ? ingredients.map(item => `
            <div class="ingredient-card">
                <span class="ingredient-name">
                    ${escapeHTML(item.name)}
                </span>

                <span class="ingredient-measure">
                    ${escapeHTML(item.measure || "As needed")}
                </span>
            </div>
        `).join("")
        : "<p>No ingredients listed.</p>";

    const instructions = getInstructionSteps(
        meal.strInstructions
    );

    const instructionsHTML = instructions.length
        ? `<ol class="modal-steps-list">${instructions.map(step =>
            `<li>${escapeHTML(step)}</li>`
        ).join("")}</ol>`
        : "<p>Instructions are not available.</p>";

    const videoHTML = createVideoHTML(meal.strYoutube);
    const favorite = favorites.includes(id);

    modalContent.innerHTML = `
        <div class="modal-banner">
            <img
                class="banner-image"
                src="${escapeHTML(meal.strMealThumb || "")}"
                alt="${escapeHTML(meal.strMeal || "Recipe")}"
            >

            <div class="banner-overlay">
                <div class="banner-tags">
                    ${meal.strCategory
                        ? `<span class="badge">${escapeHTML(meal.strCategory)}</span>`
                        : ""}
                    ${meal.strArea
                        ? `<span class="badge">${escapeHTML(meal.strArea)}</span>`
                        : ""}
                </div>

                <h2>${escapeHTML(meal.strMeal || "Recipe details")}</h2>
            </div>
        </div>

        <div class="modal-body-layout">
            <div class="modal-header-actions">
                <button
                    class="button primary"
                    id="modalFavorite"
                    data-meal-id="${escapeHTML(id)}"
                    type="button"
                    aria-pressed="${favorite}"
                >
                    ${favorite
                        ? "♥ Remove from Favorites"
                        : "♡ Add to Favorites"}
                </button>
            </div>

            <section class="modal-section">
                <h3>Ingredients & Measurements</h3>
                <div class="ingredients-grid">
                    ${ingredientsHTML}
                </div>
            </section>

            <section class="modal-section">
                <h3>Cooking Instructions</h3>
                ${instructionsHTML}
            </section>

            <section class="modal-section">
                <div class="video-section">
                    <div class="video-heading">
                        <div class="video-icon" aria-hidden="true">▷</div>

                        <div>
                            <h3>Watch & Cook</h3>
                            <p>
                                Follow along with a video tutorial
                                for this recipe.
                            </p>
                        </div>
                    </div>

                    ${videoHTML}
                </div>
            </section>
        </div>
    `;

    document.getElementById("modalFavorite")
        ?.addEventListener("click", () => toggleFavorite(meal));

    modalContent.querySelector(".banner-image")
        ?.addEventListener("error", event => {
            event.currentTarget.style.visibility = "hidden";
        }, { once: true });
}

function displayRecentRecipes() {
    if (!recentContainer) return;

    recentContainer.innerHTML = "";

    if (!recentlyViewed.length) {
        recentContainer.innerHTML =
            "<p>Your recently viewed recipes will appear here.</p>";
        return;
    }

    recentlyViewed.forEach(meal => {
        const button = document.createElement("button");

        button.className = "recent-card";
        button.type = "button";

        button.innerHTML = `
            <img
                src="${escapeHTML(meal.strMealThumb || "")}"
                alt="${escapeHTML(meal.strMeal || "Recipe")}"
                loading="lazy"
            >

            <span>${escapeHTML(meal.strMeal || "Recipe")}</span>
        `;

        button.addEventListener("click", () =>
            showRecipeDetails(meal.idMeal)
        );

        button.querySelector("img").addEventListener("error", event => {
            event.currentTarget.style.visibility = "hidden";
        }, { once: true });

        recentContainer.appendChild(button);
    });
}

async function searchRecipes(query) {
    const cleaned = query.trim();

    if (!cleaned) {
        showToast("Enter a dish or ingredient first.");
        return;
    }

    const version = ++searchVersion;

    currentFilter = "all";
    currentCategory = "all";
    visibleCount = 12;

    if (categoryFilter) {
        categoryFilter.value = "all";
    }

    updateFilterButtons();

    if (resultTitle) {
        resultTitle.textContent = `Results for "${cleaned}"`;
    }

    setLoading(`Searching for ${cleaned}...`);

    const localMatches = allRecipes.filter(
        meal => matchesSearch(meal, cleaned)
    );

    const exactIngredient = availableIngredients.find(item =>
        normalizeText(item) === normalizeText(cleaned)
    );

    const exactCategory = availableCategories.find(item =>
        normalizeText(item) === normalizeText(cleaned)
    );

    const requests = [
        fetchMeals(
            `${ENDPOINTS.search}${encodeURIComponent(cleaned)}`
        )
    ];

    if (exactIngredient) {
        requests.push(fetchMeals(
            `${ENDPOINTS.ingredientFilter}${encodeURIComponent(
                exactIngredient.trim().replace(/\s+/g, "_")
            )}`
        ));
    }

    if (exactCategory) {
        requests.push(fetchMeals(
            `${ENDPOINTS.categoryFilter}${encodeURIComponent(exactCategory)}`
        ));
    }

    const responses = await Promise.all(requests);

    if (version !== searchVersion) return;

    const apiFailed = responses.every(result => result === null);
    const apiResults = responses.filter(Array.isArray).flat();

    cacheRecipes(apiResults);

    const fullRecipes = await Promise.all(
        apiResults.map(async meal =>
            hasFullDetails(meal)
                ? meal
                : getRecipeById(meal.idMeal)
        )
    );

    if (version !== searchVersion) return;

    let results = removeDuplicateRecipes([
        ...localMatches,
        ...fullRecipes.filter(Boolean)
    ]);

    results = results.filter(
        meal => matchesSearch(meal, cleaned)
    );

    if (apiFailed && results.length === 0) {
        currentRecipes = [];
        displayRecipes();

        if (resultTitle) {
            resultTitle.textContent = "Search unavailable";
        }

        showToast(
            "Could not contact TheMealDB. Please try again."
        );

        return;
    }

    currentRecipes = results;
    cacheRecipes(results);
    displayRecipes();

    if (resultTitle) {
        resultTitle.textContent = results.length
            ? `Results for "${cleaned}"`
            : "No recipes found";
    }
}

function applyLocalFilters(title) {
    currentFilter = "all";
    visibleCount = 12;

    updateFilterButtons();

    if (resultTitle) {
        resultTitle.textContent = title;
    }

    displayRecipes();
}

function filterByCategory(category) {
    currentCategory = category;

    applyLocalFilters(
        category === "all"
            ? "All recipes"
            : `${category} recipes`
    );
}

async function loadAllRecipes() {
    if (isLoadingAll) return;

    isLoadingAll = true;

    setLoading("Loading recipes from around the world...");

    const letters = "abcdefghijklmnopqrstuvwxyz".split("");
    const failedLetters = [];
    let collected = [];

    for (let i = 0; i < letters.length; i += 4) {
        const batch = letters.slice(i, i + 4);

        const results = await Promise.all(
            batch.map(async letter => ({
                letter,
                meals: await fetchMeals(
                    `${ENDPOINTS.firstLetter}${letter}`
                )
            }))
        );

        results.forEach(result => {
            if (result.meals === null) {
                failedLetters.push(result.letter);
                return;
            }

            collected = removeDuplicateRecipes([
                ...collected,
                ...result.meals
            ]);
        });

        cacheRecipes(collected);

        if (recipeCount) {
            recipeCount.textContent =
                `${collected.length} recipes loaded...`;
        }

        if (recipeContainer) {
            recipeContainer.innerHTML = `
                <p class="loading">
                    Loading recipes...
                    ${collected.length} unique recipes found so far.
                </p>
            `;
        }
    }

    allRecipes = removeDuplicateRecipes(collected);
    currentRecipes = [...allRecipes];

    currentFilter = "all";
    currentCategory = "all";
    visibleCount = 12;

    populateSelect(
        categoryFilter,
        [...new Set([
            ...allRecipes.map(meal => meal.strCategory),
            ...availableCategories
        ].filter(Boolean))],
        "All categories"
    );

    if (categoryFilter) {
        categoryFilter.value = "all";
    }

    if (resultTitle) {
        resultTitle.textContent = "All recipes";
    }

    updateFilterButtons();
    displayRecipes();

    if (failedLetters.length) {
        showToast(
            `Some searches failed (${failedLetters.join(", ").toUpperCase()}). Counts include successful searches only.`
        );
    } else {
        showToast(`${allRecipes.length} unique recipes loaded.`);
    }

    isLoadingAll = false;
}

async function loadFavoriteRecipes() {
    const ids = [...favorites];

    const existing = new Map(
        allRecipes.map(meal => [getRecipeId(meal), meal])
    );

    const missingIds = ids.filter(id => !existing.has(id));

    const fetched = await Promise.all(
        missingIds.map(id => getRecipeById(id))
    );

    currentRecipes = removeDuplicateRecipes([
        ...allRecipes,
        ...fetched.filter(Boolean)
    ]);

    currentFilter = "favorites";
    currentCategory = "all";
    visibleCount = 12;

    if (categoryFilter) {
        categoryFilter.value = "all";
    }

    if (resultTitle) {
        resultTitle.textContent = "Your favorite recipes";
    }

    updateFilterButtons();
    displayRecipes();
}

if (searchForm) {
    searchForm.addEventListener("submit", event => {
        event.preventDefault();
        searchRecipes(searchInput?.value || "");
    });
}

document.querySelectorAll(".quick button").forEach(button => {
    button.addEventListener("click", () => {
        const query = button.dataset.query || "";

        if (searchInput) {
            searchInput.value = query;
        }

        searchRecipes(query);
    });
});

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        if (button.dataset.filter === "favorites") {
            loadFavoriteRecipes();
        } else {
            currentFilter = "all";
            currentCategory = "all";
            visibleCount = 12;

            if (categoryFilter) {
                categoryFilter.value = "all";
            }

            updateFilterButtons();
            displayRecipes();

            if (resultTitle) {
                resultTitle.textContent = "All recipes";
            }
        }
    });
});

if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
        filterByCategory(categoryFilter.value);
    });
}

if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
        visibleCount += 8;
        displayRecipes();
    });
}

function closeRecipeModal() {
    if (!recipeModal) return;

    activeRequestVersion++;
    recipeModal.classList.add("hidden");
    document.body.classList.remove("modal-open");
}

document.getElementById("closeModal")
    ?.addEventListener("click", closeRecipeModal);

document.getElementById("modalBackdrop")
    ?.addEventListener("click", closeRecipeModal);

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeRecipeModal();
    }
});

async function initializeApp() {
    displayRecentRecipes();

    setLoading("Preparing your recipe collection...");

    await Promise.allSettled([
        loadIngredients(),
        loadCategories()
    ]);

    await loadAllRecipes();
}

initializeApp();
