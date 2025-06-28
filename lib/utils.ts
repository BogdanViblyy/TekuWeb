// lib/utils.ts

/**
 * Форматирует путь к изображению для компонента Next.js <Image>.
 * Добавляет префикс /images/, если его нет.
 * @param path - Путь из базы данных.
 * @returns Строка с корректным путем или null.
 */
export function formatImageUrl(path: string | null | undefined): string | null {
  if (!path) {
      return null; // Если пути нет, вернем null, чтобы сработал getDefaultImageUrl
  }
  // Если путь уже абсолютный (начинается с http)
  if (path.startsWith('http')) {
      return path;
  }
  // Если путь уже содержит /images/
  if (path.includes('/images/')) {
      return path.startsWith('/') ? path : `/${path}`;
  }
  // Если это просто имя файла, добавляем префикс
  return `/images/${path}`;
}

/**
* Возвращает путь к изображению по умолчанию на основе категории продукта.
* @param categoryName - Название категории.
* @returns Строка с путем к изображению.
*/
export function getDefaultImageUrl(categoryName: string | null | undefined): string {
const generalDefault = '/images/default_general.png';
if (!categoryName) {
  return generalDefault;
}

switch (categoryName.toLowerCase()) {
  case 't-shirts': return '/images/default_tshirt.png';
  case 'jeans': return '/images/default_jeans.png';
  case 'jackets': return '/images/default_jacket.png'; 
  case 'accessories': return '/images/default_accessory.png';
  case 'pants': return '/images/default_pants.png';
  case 'dresses': return '/images/default_dress.png';
  case 'hats': return '/images/default_hat.png';
  case 'bags': return '/images/default_bag.png';
  case 'shoes': return '/images/default_shoes.png';
  case 'shorts': return '/images/default_shorts.png';
  case 'shirts': return '/images/default_shirt.png';
  // Дополнительные категории из вашей БД
  case 'suits': return '/images/default_jacket.png'; // Предположим, для костюмов подойдет иконка пиджака
  case 'gloves': return '/images/default_accessory.png';
  case 'sweaters': return '/images/default_shirt.png';
  default: return generalDefault;
}
}