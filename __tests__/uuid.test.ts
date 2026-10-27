import { newId } from '../src/utils/uuid';

test('newId returns distinct v4-style uuids', () => {
  const a = newId();
  const b = newId();
  expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(a).not.toBe(b);
});
