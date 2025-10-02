import sql from 'better-sqlite3';
const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  throw new Error('Simulated fetch error');
  const meals = db.prepare('SELECT * FROM meals').all();
  return meals;
}
