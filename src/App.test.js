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

  expect(newAllAnswers[0]['uid_0'].valid).toBe(false);
  expect(newAllAnswers[0]['uid_0'].value).toBe(oldAllAnswers[0]['uid_0'].value);
  expect(newAllAnswers[0]['uid_1'].valid).toBe(false);
  expect(newAllAnswers[0]['uid_1'].value).toBe(oldAllAnswers[0]['uid_1'].value);
  expect(newAllAnswers[0]['uid_2'].valid).toBe(true);
  expect(newAllAnswers[0]['uid_2'].value).toBe(oldAllAnswers[0]['uid_2'].value);
  expect(newAllAnswers[0]['uid_3'].valid).toBe(true);
  expect(newAllAnswers[0]['uid_3'].value).toBe(oldAllAnswers[0]['uid_3'].value);

  expect(newAllAnswers[1]['uid_0'].valid).toBe(false);
  expect(newAllAnswers[1]['uid_0'].value).toBe(oldAllAnswers[1]['uid_0'].value);
  expect(newAllAnswers[1]['uid_1'].valid).toBe(false);
  expect(newAllAnswers[1]['uid_1'].value).toBe(oldAllAnswers[1]['uid_1'].value);
  expect(newAllAnswers[1]['uid_2'].valid).toBe(false);
  expect(newAllAnswers[1]['uid_2'].value).toBe(oldAllAnswers[1]['uid_2'].value);
  expect(newAllAnswers[1]['uid_3'].valid).toBe(true);
  expect(newAllAnswers[1]['uid_3'].value).toBe(oldAllAnswers[1]['uid_3'].value);

  expect(newAllAnswers[2]['uid_0'].valid).toBe(false);
  expect(newAllAnswers[2]['uid_0'].value).toBe(oldAllAnswers[2]['uid_0'].value);
  expect(newAllAnswers[2]['uid_1'].valid).toBe(false);
  expect(newAllAnswers[2]['uid_1'].value).toBe(oldAllAnswers[2]['uid_1'].value);
  expect(newAllAnswers[2]['uid_2'].valid).toBe(false);
  expect(newAllAnswers[2]['uid_2'].value).toBe(oldAllAnswers[2]['uid_2'].value);
  expect(newAllAnswers[2]['uid_3'].valid).toBe(false);
  expect(newAllAnswers[2]['uid_3'].value).toBe(oldAllAnswers[2]['uid_3'].value);

});
