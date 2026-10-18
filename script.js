
/* =====================================
   PH RECIPE RESCUE
   Filipino Dish Finder
   TheMealDB API + Filipino Recipes
   ===================================== */

const API_URL = "https://www.themealdb.com/api/json/v1/1";

// HTML elements
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const randomBtn = document.getElementById("randomBtn");
const recipeContainer = document.getElementById("recipeContainer");
const status = document.getElementById("status");
const sectionTitle = document.getElementById("sectionTitle");
const recipeDetails = document.getElementById("recipeDetails");
const detailsContent = document.getElementById("detailsContent");
const backBtn = document.getElementById("backBtn");
const searchSection = document.querySelector(".search-section");
const resultsSection = document.getElementById("resultsSection");

// Filipino recipes with food photo URLs
const filipinoRecipes = [
    {
        id: "local-adobo",
        strMeal: "Chicken Adobo",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://www.themealdb.com/images/media/meals/uuuspp1511297945.jpg",
        ingredients: [
            "1 kg chicken",
            "1/2 cup soy sauce",
            "1/2 cup vinegar",
            "1 cup water",
            "6 cloves garlic",
            "2 bay leaves",
            "1 teaspoon peppercorns"
        ],
        instructions:
            "1. Combine chicken, soy sauce, and crushed garlic. Let it marinate for at least 20 minutes.\n\n" +
            "2. Put the chicken and marinade in a pot. Add water, vinegar, bay leaves, and peppercorns.\n\n" +
            "3. Bring to a boil. Lower the heat and simmer until the chicken is cooked.\n\n" +
            "4. Taste the sauce and adjust the seasoning. Serve with rice."
    },
    {
        id: "local-sinigang",
        strMeal: "Sinigang na Baboy",
        strCategory: "Soup",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/pork,soup?lock=101",
        ingredients: [
            "500 g pork",
            "1 packet tamarind soup mix",
            "1 tomato",
            "1 onion",
            "1 radish",
            "Water",
            "Kangkong or other vegetables"
        ],
        instructions:
            "1. Boil the pork in water until it starts to become tender.\n\n" +
            "2. Add the onion and tomato. Simmer until the pork is tender.\n\n" +
            "3. Add the tamarind soup mix and radish.\n\n" +
            "4. Add the leafy vegetables near the end. Cook until tender and serve hot."
    },
    {
        id: "local-bicol",
        strMeal: "Bicol Express",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/pork,coconut?lock=102",
        ingredients: [
            "500 g pork, sliced",
            "1 cup coconut milk",
            "1/2 cup coconut cream",
            "Garlic",
            "Onion",
            "Chili peppers",
            "Shrimp paste"
        ],
        instructions:
            "1. Cook the garlic and onion in a pan until fragrant.\n\n" +
            "2. Add the pork and cook until lightly browned.\n\n" +
            "3. Add coconut milk and shrimp paste. Simmer until the pork is tender.\n\n" +
            "4. Add chili peppers and coconut cream. Simmer until the sauce thickens."
    },
    {
        id: "local-tinola",
        strMeal: "Tinolang Manok",
        strCategory: "Soup",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/chicken,soup?lock=103",
        ingredients: [
            "500 g chicken",
            "1 piece ginger",
            "Garlic",
            "Onion",
            "1 green papaya or chayote",
            "Malunggay or chili leaves",
            "Water"
        ],
        instructions:
            "1. Sauté garlic, onion, and ginger in a pot.\n\n" +
            "2. Add the chicken and cook until lightly browned.\n\n" +
            "3. Pour in water and simmer until the chicken is cooked and tender.\n\n" +
            "4. Add papaya or chayote. When tender, add the leaves and serve hot."
    },
    {
        id: "local-pancit",
        strMeal: "Pancit Bihon",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/filipino,noodles?lock=104",
        ingredients: [
            "250 g bihon noodles",
            "Chicken, sliced",
            "Carrots",
            "Cabbage",
            "Garlic",
            "Onion",
            "Soy sauce",
            "Chicken broth"
        ],
        instructions:
            "1. Soak the bihon noodles according to the package directions.\n\n" +
            "2. Sauté garlic and onion. Add the chicken and cook thoroughly.\n\n" +
            "3. Add the vegetables, soy sauce, and broth.\n\n" +
            "4. Add the noodles and toss until the liquid is absorbed and the noodles are tender."
    },
    {
        id: "local-tortang",
        strMeal: "Tortang Talong",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/eggplant,omelette?lock=105",
        ingredients: [
            "2 eggplants",
            "2 eggs",
            "Salt",
            "Pepper",
            "Cooking oil"
        ],
        instructions:
            "1. Cook the eggplants until soft, then allow them to cool.\n\n" +
            "2. Peel the skin while keeping the stems attached. Flatten the eggplants with a fork.\n\n" +
            "3. Beat the eggs with salt and pepper.\n\n" +
            "4. Dip each eggplant in the egg mixture and fry until golden and fully cooked."
    },
    {
        id: "local-menudo",
        strMeal: "Pork Menudo",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/pork,stew?lock=106",
        ingredients: [
            "500 g pork, cubed",
            "Tomato sauce",
            "Potatoes",
            "Carrots",
            "Garlic",
            "Onion",
            "Soy sauce",
            "Water"
        ],
        instructions:
            "1. Sauté garlic and onion in a pot.\n\n" +
            "2. Add the pork and cook until lightly browned.\n\n" +
            "3. Add tomato sauce, soy sauce, and water. Simmer until the pork is tender.\n\n" +
            "4. Add potatoes and carrots. Continue cooking until the vegetables are tender."
    },
    {
        id: "local-turon",
        strMeal: "Banana Turon",
        strCategory: "Snack",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/banana,dessert?lock=107",
        ingredients: [
            "Ripe saba bananas",
            "Spring roll wrappers",
            "Brown sugar",
            "Cooking oil"
        ],
        instructions:
            "1. Peel and slice the saba bananas.\n\n" +
            "2. Coat the banana slices with brown sugar and wrap them in spring roll wrappers.\n\n" +
            "3. Heat oil in a pan and carefully fry the wrapped bananas until golden and crisp.\n\n" +
            "4. Drain excess oil and allow to cool slightly before serving."
    },
    {
        id: "local-flan",
        strMeal: "Leche Flan",
        strCategory: "Dessert",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/caramel,custard?lock=108",
        ingredients: [
            "Egg yolks",
            "1 can condensed milk",
            "1 can evaporated milk",
            "Sugar",
            "Vanilla extract"
        ],
        instructions:
            "1. Melt sugar in a heat-safe mold to make the caramel. Let it cool.\n\n" +
            "2. Gently mix the egg yolks, condensed milk, evaporated milk, and vanilla.\n\n" +
            "3. Strain the mixture into the prepared mold.\n\n" +
            "4. Cover and steam until set, or bake in a water bath until cooked. Cool before serving."
    },
    {
        id: "local-sinangag",
        strMeal: "Sinangag",
        strCategory: "Main Dish",
        strArea: "Filipino",
        strMealThumb: "https://loremflickr.com/600/400/garlic,fried,rice?lock=109",
        ingredients: [
            "3 cups cooked rice",
            "4 cloves garlic, minced",
            "Cooking oil",
            "Salt"
        ],
        instructions:
            "1. Break up the cooked rice so there are no large clumps.\n\n" +
            "2. Heat a little oil in a pan and cook the garlic until lightly golden.\n\n" +
            "3. Add the rice and stir-fry until heated through.\n\n" +
            "4. Season with salt and serve warm."
    }
];

// Placeholder used if a food photo cannot load
function createPlaceholderImage() {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
            <rect width="100%" height="100%" fill="#eee9dc"/>
            <circle cx="300" cy="190" r="105" fill="#ffffff"/>
            <circle cx="300" cy="190" r="85" fill="#d9e6d5"/>
            <text x="300" y="220" font-size="85" text-anchor="middle">🍲</text>
            <text x="300" y="340" font-size="22" text-anchor="middle"
                  fill="#285943" font-family="Arial">Filipino Recipe</text>
        </svg>
    `;

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

// Get the best available image for a recipe
function getRecipeImage(recipe) {
    return recipe.strMealThumb && recipe.strMealThumb.trim()
        ? recipe.strMealThumb
        : createPlaceholderImage();
}

// Show a status message
function showStatus(message, type = "") {
    status.textContent = message;
    status.className = "status-message";

    if (type) {
        status.classList.add(type);
    }
}

// Show or hide the loading state
function setLoading(isLoading, message = "Finding recipes...") {
    searchBtn.disabled = isLoading;
    randomBtn.disabled = isLoading;

    searchBtn.textContent = isLoading ? "SEARCHING..." : "SEARCH";
    randomBtn.textContent = isLoading ? "PLEASE WAIT..." : "RANDOM RECIPE";

    if (isLoading) {
        showStatus(message);
    }
}

// Safely request data from TheMealDB
async function fetchMeals(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("The recipe service is unavailable.");
    }

    const data = await response.json();
    return data.meals || [];
}

// Convert an API meal into the format used by this website
function convertApiMeal(meal) {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
            const amount = measure ? measure.trim() : "";
            ingredients.push(
                amount ? `${amount} ${ingredient.trim()}` : ingredient.trim()
            );
        }
    }

    return {
        id: meal.idMeal,
        strMeal: meal.strMeal || "Untitled Recipe",
        strCategory: meal.strCategory || "Not specified",
        strArea: meal.strArea || "Not specified",
        strMealThumb: meal.strMealThumb || "",
        ingredients,
        instructions: meal.strInstructions || "No instructions are available."
    };
}

// Search local Filipino recipes
function searchLocalRecipes(query) {
    const searchTerm = query.toLowerCase();

    return filipinoRecipes.filter(recipe => {
        const searchableText = [
            recipe.strMeal,
            recipe.strCategory,
            recipe.strArea,
            ...recipe.ingredients
        ].join(" ").toLowerCase();

        return searchableText.includes(searchTerm);
    });
}

// Search TheMealDB by dish name and ingredient
async function searchApiRecipes(query) {
    const results = new Map();

    // Search by meal name
    try {
        const nameUrl = `${API_URL}/search.php?s=${encodeURIComponent(query)}`;
        const mealsByName = await fetchMeals(nameUrl);

        mealsByName.forEach(meal => {
            const converted = convertApiMeal(meal);
            results.set(converted.id, converted);
        });
    } catch (error) {
        console.warn("Meal-name search failed:", error);
    }

    // Search by a single ingredient
    try {
        const ingredient = query.trim().replace(/\s+/g, "_");
        const ingredientUrl =
            `${API_URL}/filter.php?i=${encodeURIComponent(ingredient)}`;
        const ingredientMeals = await fetchMeals(ingredientUrl);

        // Fetch full details for up to six ingredient matches
        const limitedMeals = ingredientMeals.slice(0, 6);

        const detailedMeals = await Promise.all(
            limitedMeals.map(async meal => {
                try {
                    const detailsUrl =
                        `${API_URL}/lookup.php?i=${encodeURIComponent(meal.idMeal)}`;
                    const details = await fetchMeals(detailsUrl);

                    if (details.length > 0) {
                        return convertApiMeal(details[0]);
                    }
                } catch (error) {
                    console.warn("Could not load a recipe:", error);
                }

                return null;
            })
        );

        detailedMeals.forEach(meal => {
            if (meal) {
                results.set(meal.id, meal);
            }
        });
    } catch (error) {
        console.warn("Ingredient search failed:", error);
    }

    return Array.from(results.values());
}

// Create an HTML element safely
function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// Set up a recipe image and a reliable fallback
function createRecipeImage(recipe, className = "") {
    const image = document.createElement("img");

    if (className) {
        image.className = className;
    }

    image.src = getRecipeImage(recipe);
    image.alt = `${recipe.strMeal} food photo`;
    image.loading = "lazy";

    image.onerror = () => {
        image.onerror = null;
        image.src = createPlaceholderImage();
    };

    return image;
}

// Display recipe cards
function displayRecipes(recipes) {
    recipeContainer.replaceChildren();

    if (recipes.length === 0) {
        showStatus("No recipes found. Try another dish or ingredient.", "error");
        return;
    }

    recipes.slice(0, 2).forEach(recipe => {
        const card = document.createElement("article");
        card.className = "recipe-card";

        const image = createRecipeImage(recipe);

        const content = document.createElement("div");
        content.className = "recipe-card-content";

        const name = createTextElement("h3", recipe.strMeal);
        const category = createTextElement(
            "p",
            `Category: ${recipe.strCategory}`
        );
        const cuisine = createTextElement(
            "p",
            `Cuisine: ${recipe.strArea}`
        );

        const viewButton = createTextElement(
            "button",
            "VIEW RECIPE",
            "view-recipe-btn"
        );

        viewButton.type = "button";
        viewButton.addEventListener("click", () => showRecipeDetails(recipe));

        content.append(name, category, cuisine, viewButton);
        card.append(image, content);
        recipeContainer.appendChild(card);
    });

    showStatus(
        `Found ${recipes.length} matching recipe${recipes.length === 1 ? "" : "s"}.`,
        "success"
    );
}

// Search button behavior
async function handleSearch(event) {
    if (event) {
        event.preventDefault();
    }

    const query = searchInput.value.trim();

    if (!query) {
        recipeContainer.replaceChildren();
        showStatus("Please enter an ingredient or dish to search.", "error");
        searchInput.focus();
        return;
    }

    setLoading(true, "Searching for recipes...");
    sectionTitle.textContent = "RECIPE RESULTS";
    recipeDetails.classList.add("hidden");
    searchSection.classList.remove("hidden");
    resultsSection.classList.remove("hidden");

    try {
        const localMatches = searchLocalRecipes(query);
        const apiMatches = await searchApiRecipes(query);

        // Filipino matches first; avoid duplicate recipe names
        const combined = [...localMatches];
        const existingNames = new Set(
            combined.map(recipe => recipe.strMeal.toLowerCase())
        );

        apiMatches.forEach(recipe => {
            const name = recipe.strMeal.toLowerCase();

            if (!existingNames.has(name)) {
                combined.push(recipe);
                existingNames.add(name);
            }
        });

        displayRecipes(combined);
    } catch (error) {
        console.error("Search error:", error);

        const localMatches = searchLocalRecipes(query);

        if (localMatches.length > 0) {
            displayRecipes(localMatches);
            showStatus(
                "Showing Filipino recipes saved in the app because the online search failed.",
                "success"
            );
        } else {
            recipeContainer.replaceChildren();
            showStatus(
                "Unable to connect to the recipe service. Check your internet connection and try again.",
                "error"
            );
        }
    } finally {
        setLoading(false);
    }
}

// Random recipe button behavior
async function handleRandomRecipe() {
    setLoading(true, "Finding a random recipe...");
    recipeDetails.classList.add("hidden");
    searchSection.classList.remove("hidden");
    resultsSection.classList.remove("hidden");
    sectionTitle.textContent = "RECIPE RESULTS";

    try {
        let meals = [];

        try {
            meals = await fetchMeals(`${API_URL}/filter.php?a=Filipino`);
        } catch (error) {
            console.warn("Filipino recipe list unavailable:", error);
        }

        if (meals.length > 0) {
            const selectedMeal =
                meals[Math.floor(Math.random() * meals.length)];

            const details = await fetchMeals(
                `${API_URL}/lookup.php?i=${encodeURIComponent(selectedMeal.idMeal)}`
            );

            if (details.length > 0) {
                displayRecipes([convertApiMeal(details[0])]);
                return;
            }
        }

        const randomLocal = filipinoRecipes[
            Math.floor(Math.random() * filipinoRecipes.length)
        ];

        displayRecipes([randomLocal]);
        showStatus(
            "Here's a random Filipino recipe from the app's recipe collection.",
            "success"
        );
    } catch (error) {
        console.error("Random recipe error:", error);

        const randomLocal = filipinoRecipes[
            Math.floor(Math.random() * filipinoRecipes.length)
        ];

        displayRecipes([randomLocal]);
        showStatus(
            "Showing a random Filipino recipe saved in the app.",
            "success"
        );
    } finally {
        setLoading(false);
    }
}

// Display the full recipe details
function showRecipeDetails(recipe) {
    detailsContent.replaceChildren();

    const image = createRecipeImage(recipe, "details-image");

    const info = document.createElement("div");
    info.className = "details-info";

    info.append(
        createTextElement("h3", recipe.strMeal),
        createTextElement("p", `Category: ${recipe.strCategory}`),
        createTextElement("p", `Cuisine: ${recipe.strArea}`)
    );

    const content = document.createElement("div");
    content.className = "details-content";

    content.appendChild(createTextElement("h3", "Ingredients"));

    const ingredientList = document.createElement("ul");

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        recipe.ingredients.forEach(ingredient => {
            ingredientList.appendChild(createTextElement("li", ingredient));
        });
    } else {
        ingredientList.appendChild(
            createTextElement("li", "No ingredient information is available.")
        );
    }

    content.appendChild(ingredientList);
    content.appendChild(createTextElement("h3", "Instructions"));

    const instructions = createTextElement(
        "p",
        recipe.instructions || "No instructions are available."
    );

    content.appendChild(instructions);
    detailsContent.append(image, info, content);

    searchSection.classList.add("hidden");
    resultsSection.classList.add("hidden");
    recipeDetails.classList.remove("hidden");

    recipeDetails.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Back to search button behavior
function handleBackToSearch() {
    recipeDetails.classList.add("hidden");
    searchSection.classList.remove("hidden");
    resultsSection.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Connect the buttons and form to their functions
searchForm.addEventListener("submit", handleSearch);
randomBtn.addEventListener("click", handleRandomRecipe);
backBtn.addEventListener("click", handleBackToSearch);

// Let the user press Enter to search
searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        event.preventDefault();
        handleSearch(event);
    }
});

// Confirm that JavaScript loaded successfully
console.log("PH Recipe Rescue JavaScript loaded successfully.");
showStatus("Search for an ingredient or Filipino dish.");
