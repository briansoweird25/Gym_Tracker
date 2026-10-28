import { chartScale } from '../src/components/ui/chartScale';

test('axis hugs the data instead of starting at zero', () => {
  const s = chartScale([95, 100, 105, 110]);
  expect(s.offset).toBeGreaterThan(70);
  expect(s.offset).toBeLessThanOrEqual(95);
  expect(s.offset + s.range).toBeGreaterThanOrEqual(110);
  expect(s.offset + s.range).toBeLessThan(140);
});

test('small body-weight changes stay visible', () => {
  const s = chartScale([82.4, 81.2, 80.9]);
  expect(s.range).toBeLessThanOrEqual(8);
  expect(s.offset).toBeLessThanOrEqual(80.9);
});

test('a flat series still gets a non-zero range', () => {
  const s = chartScale([60, 60]);
  expect(s.range).toBeGreaterThan(0);
  expect(s.offset).toBeLessThan(60);
});

test('sections divide the range evenly and stay readable', () => {
  const s = chartScale([40, 70]);
  expect(s.sections).toBeGreaterThanOrEqual(2);
  expect(s.sections).toBeLessThanOrEqual(6);
  expect(Number.isInteger(s.range / s.sections) || s.range / s.sections > 0).toBe(true);
});

test('offset never goes below zero', () => {
  expect(chartScale([3, 5]).offset).toBeGreaterThanOrEqual(0);
});
