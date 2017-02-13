import test from 'tape';
import mark, { down, up } from '../src/index';
import spec from './spec';

test('inferno-mark', t => {
  t.plan(7);

  t.comment('exports default object and named exports');
  t.ok(typeof mark === 'object');
  t.ok(typeof mark.down === 'function'); // eslint-disable-line import/no-named-as-default-member
  t.ok(typeof down === 'function');
  t.ok(mark.down === down); // eslint-disable-line import/no-named-as-default-member
  t.ok(typeof mark.up === 'function'); // eslint-disable-line import/no-named-as-default-member
  t.ok(typeof up === 'function');
  t.ok(mark.up === up); // eslint-disable-line import/no-named-as-default-member
});

spec('down');
spec('up');
