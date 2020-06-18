import { GetRandomCategories } from './CategoriesGenerator'

test('Get too many categories', () => {
  expect(() => {
    GetRandomCategories(Number.MAX_SAFE_INTEGER);
  }).toThrow(RangeError);
});

test('Get 0 category', () => {
  const arr = GetRandomCategories(0);
  expect(arr.length).toBe(0);
});

test('Get 1 to 20 categories', () => {
  for (let i = 1; i <= 20; i++) {
    const arr = GetRandomCategories(i);
    expect(arr.length).toBe(i);
    for (let j = 0; j < arr.length; j++) {
      expect(arr[j].id).toBe(j);
      expect(arr[j].name).toBeDefined();
      expect(arr[j].answer).toBe('');
    }
  }
});
