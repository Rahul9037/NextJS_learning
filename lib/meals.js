import fs from 'node:fs';

import sql from 'better-sqlite3';
import slugify from 'slugify';
import xss from 'xss';
import { error } from 'node:console';
const db = sql('meals.db');

export async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const meals = db.prepare('SELECT * FROM meals').all();
  return meals;
}

export function getMeal(slug) {
  return db.prepare('SELECT * from meals where slug = ?').get(slug);
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}-${Date.now()}.${extension}`;

  const stream = fs.createWriteStream(`public/images/${fileName}`);
  const bufferImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferImage), (error) => {
    if (error) {
      throw new Error('Failed to save image.');
    }
  });

  meal.image = `/images/${fileName}`;

  const statement = db.prepare(`
    INSERT INTO meals (creator, creator_email, title, slug, summary, instructions, image)
    VALUES (@creator, @creator_email, @title, @slug, @summary, @instructions, @image)
  `);
  const info = statement.run(meal);
  if (info.changes !== 1) {
    throw new Error('Could not save meal.');
  }
  return getMeal(meal.slug);
}
