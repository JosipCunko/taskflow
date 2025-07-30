# Fixes and bugs

Read the docs about indexes in firebase console and protecting the master branch in github
caching - buggy unstable_cache to getTasksByUserId

place the ai in the ai route. Change the style - jotform

convert all dates to ISO strings

Error adding achievement streak_milestone_3 to user xCnbztrkjDb8RqWcWHIbhCq3BDP2: Error: Attempted to call trackAchievementUnlocked() from the server but trackAchievementUnlocked is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.
at <unknown> (app_lib\analytics.ts\proxy.mjs:8:23)
at addAchievementToUser (app_lib\achievements.ts:62:29)
at async checkAndAwardAchievements (app_lib\achievements.ts:102:10)
at async Object.jwt (app_lib\auth.ts:645:14)
at async HealthPage (app\webapp\health\page.tsx:13:18)
6 | );
7 | export const trackAchievementUnlocked = registerClientReference(

> 8 | function() { throw new Error("Attempted to call trackAchievementUnlocked() from the server but trackAchievementUnlocked is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component."); },
> GET /webapp/health 200 in 4434ms

addRecipeInformation

/\*
Create a component called MealCard.tsx that will be used to display all data there is for meals coming from Spoonacular (of type SpoonacularRecipeInfo) and from mealLogs collection (of type MealLog)

...

Features:
Use server actions
Log - if not already logged
Update - only if logged - when user clicks on ex. a title, it can already edit it. So the properties that are editable should be stored in an input field - can update only on the day it was logged - can update only these fields: servingSize, servingUnit, nutrition, title, mealType

Delete - can delete only on the day it was logged

...

Please, in the component use these utility functions:
const formatNutrient = (value: number, unit: string): string => {
if (value < 1) {
return `${value.toFixed(1)}${unit}`;
}
return `${Math.round(value)}${unit}`;
};
// Only if necessary, you can provide defaults even by this
const getRecipeImageUrl = function (
recipeId: number,
imageType: string = "jpg",
size:
| "90x90"
| "240x150"
| "312x150"
| "312x231"
| "480x360"
| "556x370"
| "636x393" = "312x231"
): string {
return `https://img.spoonacular.com/recipes/${recipeId}-${size}.${imageType}`;
};
// Would be extreamly good UX
const getIngredientImageUrl = function (
imageName: string,
size: "100x100" | "250x250" | "500x500" = "100x100"
): string {
return `https://img.spoonacular.com/ingredients_${size}/${imageName}`;
};
const getHealthScoreColor = (score: number) => {
if (score >= 80) return "text-success";
if (score >= 60) return "text-warning";
return "text-error";
};

// Calculate calories from macros for verification
const calculatedCalories =
nutrients.protein _ 4 + nutrients.carbs _ 4 + nutrients.fat \* 9;
const calorieDiscrepancy = Math.abs(nutrients.calories - calculatedCalories);
{calorieDiscrepancy > 50 && (
<div className="text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
⚠️ Nutritional data may be incomplete - calorie calculation
doesn&apos;t match macros
</div>
)}

...

You can use this part of nicely designed component for displaying the nutrition:
const macroNutrients = [
{
name: "Calories",
value: nutrients.calories,
unit: "kcal",
color: "bg-red-500",
},
{
name: "Protein",
value: nutrients.protein,
unit: "g",
color: "bg-blue-500",
},
{
name: "Carbs",
value: nutrients.carbs,
unit: "g",
color: "bg-yellow-500",
},
{ name: "Fat", value: nutrients.fat, unit: "g", color: "bg-green-500" },
];

const detailedNutrients = [
{
category: "Fiber & Sugars",
nutrients: [
{ name: "Fiber", value: nutrients.fiber, unit: "g" },
{ name: "Sugar", value: nutrients.sugar, unit: "g" },
],
},
{
category: "Fats",
nutrients: [
{ name: "Omega-3", value: nutrients.omega3, unit: "g" },
{ name: "Omega-6", value: nutrients.omega6, unit: "g" },
],
},
{
category: "Essential Minerals",
nutrients: [
{ name: "Sodium", value: nutrients.sodium, unit: "mg" },
{ name: "Potassium", value: nutrients.potassium, unit: "mg" },
{ name: "Calcium", value: nutrients.calcium, unit: "mg" },
{ name: "Magnesium", value: nutrients.magnesium, unit: "mg" },
{ name: "Zinc", value: nutrients.zinc, unit: "mg" },
],
},
{
category: "Key Vitamins",
nutrients: [
{ name: "Vitamin C", value: nutrients.vitaminC, unit: "mg" },
{ name: "Vitamin A", value: nutrients.vitaminA, unit: "mcg" },
{ name: "Vitamin D", value: nutrients.vitaminD, unit: "mcg" },
],
},
];

return (
<div className={`space-y-6 p-4 bg-background-600 rounded-lg ${className}`}>
<div className="text-center relative isolate">
<h3 className="text-lg font-semibold text-text-high">{foodName}</h3>

        <p className="text-text-low">
          Nutrition per {servingSize} {servingUnit}
        </p>

        <div className="absolute inset-0 bg-background-500 rounded-lg overflow-hidden -z-1">
          {imageUrl && !imageError ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 bg-background-500 animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <Image
                src={imageUrl}
                alt={foodName}
                fill
                className="object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
                sizes="64px"
              />
            </>
          ) : (
            <div className="w-full h-full bg-background-500 flex items-center justify-center"></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {macroNutrients.map((macro) => (
          <div
            key={macro.name}
            className="bg-background-625 border border-background-500 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-3 h-3 rounded-full ${macro.color}`} />
              <span className="text-sm font-medium text-text-high">
                {macro.name}
              </span>
            </div>
            <div className="text-xl font-bold text-text-high">
              {formatNutrient(macro.value, 0)}
              <span className="text-sm font-normal text-text-low ml-1">
                {macro.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-text-high">
          Calories by Macro
        </div>
        <div className="text-xs text-text-low mb-1">
          Shows what percentage of calories come from protein, carbs, and fat
        </div>
        <div className="flex rounded-lg overflow-hidden h-4">
          <div
            className="bg-blue-500"
            style={{
              width: `${((nutrients.protein * 4) / nutrients.calories) * 100}%`,
            }}
            title={`Protein: ${formatNutrient(
              nutrients.protein
            )}g = ${formatNutrient(
              nutrients.protein * 4,
              0
            )} calories (${formatNutrient(
              ((nutrients.protein * 4) / nutrients.calories) * 100,
              0
            )}%)`}
          />
          <div
            className="bg-yellow-500"
            style={{
              width: `${((nutrients.carbs * 4) / nutrients.calories) * 100}%`,
            }}
            title={`Carbs: ${formatNutrient(
              nutrients.carbs
            )}g = ${formatNutrient(
              nutrients.carbs * 4,
              0
            )} calories (${formatNutrient(
              ((nutrients.carbs * 4) / nutrients.calories) * 100,
              0
            )}%)`}
          />
          <div
            className="bg-green-500"
            style={{
              width: `${((nutrients.fat * 9) / nutrients.calories) * 100}%`,
            }}
            title={`Fat: ${formatNutrient(nutrients.fat)}g = ${formatNutrient(
              nutrients.fat * 9,
              0
            )} calories (${formatNutrient(
              ((nutrients.fat * 9) / nutrients.calories) * 100,
              0
            )}%)`}
          />
        </div>
        <div className="flex justify-between text-xs text-text-low">
          <span>
            Protein{" "}
            {formatNutrient(
              ((nutrients.protein * 4) / nutrients.calories) * 100,
              0
            )}
            %
          </span>
          <span>
            Carbs{" "}
            {formatNutrient(
              ((nutrients.carbs * 4) / nutrients.calories) * 100,
              0
            )}
            %
          </span>
          <span>
            Fat{" "}
            {formatNutrient(
              ((nutrients.fat * 9) / nutrients.calories) * 100,
              0
            )}
            %
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium text-text-high">
          Detailed Nutrition
        </div>
        {detailedNutrients.map((category) => (
          <div key={category.category} className="space-y-2">
            <h4 className="text-sm font-medium text-text-high border-b border-background-500 pb-1">
              {category.category}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {category.nutrients.map((nutrient) => (
                <div
                  key={nutrient.name}
                  className="flex justify-between text-sm"
                >
                  <span className="text-text-low">{nutrient.name}</span>
                  <span className="text-text-high font-medium">
                    {formatNutrient(nutrient.value)} {nutrient.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {(nutrients.fiber || nutrients.sugar || nutrients.sodium) && (
        <div className="mt-3 pt-3 border-t border-background-500">
          <div className="grid grid-cols-3 gap-2 text-xs">
            {nutrients.fiber && (
              <div className="text-center">
                <div className="font-medium text-text-high">
                  {nutrients.fiber}g
                </div>
                <div className="text-text-low">Fiber</div>
              </div>
            )}
            {nutrients.sugar && (
              <div className="text-center">
                <div className="font-medium text-text-high">
                  {nutrients.sugar}g
                </div>
                <div className="text-text-low">Sugar</div>
              </div>
            )}
            {nutrients.sodium && (
              <div className="text-center">
                <div className="font-medium text-text-high">
                  {nutrients.sodium}mg
                </div>
                <div className="text-text-low">Sodium</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>

);
\*/
