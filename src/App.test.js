import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { GetRandomCategories } from './functions/CategoriesGenerator';

let testApp;

beforeEach(() => {
  testApp = new App();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App />, div);
});

it('does not modify answers that are not duplicated', () => {
  const oldAllAnswers = [
    // Only valid answers
    {
      uid_0: { valid: true, value: 'foo' },
      uid_1: { valid: true, value: 'bar' },
      uid_2: { valid: true, value: 'baz' },
    },
    // Only invalid answers
    {
      uid_0: { valid: false, value: 'baz' },
      uid_1: { valid: false, value: 'foo' },
      uid_2: { valid: false, value: 'bar' },
    },
    // A max of valid and invalid answers
    {
      uid_0: { valid: true, value: 'bar' },
      uid_1: { valid: false, value: 'baz' },
      uid_2: { valid: true, value: 'foo' },
    },
  ];
  const categories = GetRandomCategories(oldAllAnswers.length);

  const newAllAnswers = testApp.markDuplicatesAsInvalid(oldAllAnswers, categories);

  expect(newAllAnswers).toBe(oldAllAnswers);
});

it('marks each duplicated answer as invalid', () => {
  const oldAllAnswers = [
    // Two duplicates
    {
      uid_0: { valid: true, value: 'foo' },
      uid_1: { valid: true, value: 'foo' },
      uid_2: { valid: true, value: 'bar' },
      uid_3: { valid: true, value: 'baz' },
    },
    // Three duplicates
    {
      uid_0: { valid: true, value: 'bar' },
      uid_1: { valid: true, value: 'bar' },
      uid_2: { valid: true, value: 'bar' },
      uid_3: { valid: true, value: 'baz' },
    },
    // Four duplicates
    {
      uid_0: { valid: true, value: 'baz' },
      uid_1: { valid: true, value: 'baz' },
      uid_2: { valid: true, value: 'baz' },
      uid_3: { valid: true, value: 'baz' },
    },
  ];
  const categories = GetRandomCategories(oldAllAnswers.length);

  const newAllAnswers = testApp.markDuplicatesAsInvalid(oldAllAnswers, categories);

  expect(newAllAnswers[0]).toStrictEqual({
    uid_0: { valid: false, value: 'foo' },
    uid_1: { valid: false, value: 'foo' },
    uid_2: { valid: true,  value: 'bar' },
    uid_3: { valid: true,  value: 'baz' },
  });

  expect(newAllAnswers[1]).toStrictEqual({
    uid_0: { valid: false, value: 'bar' },
    uid_1: { valid: false, value: 'bar' },
    uid_2: { valid: false, value: 'bar' },
    uid_3: { valid: true,  value: 'baz' },
  });

  expect(newAllAnswers[2]).toStrictEqual({
    uid_0: { valid: false, value: 'baz' },
    uid_1: { valid: false, value: 'baz' },
    uid_2: { valid: false, value: 'baz' },
    uid_3: { valid: false, value: 'baz' },
  });
});
