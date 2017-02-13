import createElement from 'inferno-create-element';
import testUtils from 'inferno-test-utils';
import { renderToString } from 'inferno-server';
import test from 'tape';
import { down, up } from '../src/index';

const HoC = ({ children }) => createElement('marquee', {}, children);

export default method => {
  let mark;
  let Title;
  let TitleHoC;
  if (method === 'down') {
    mark = down;
    Title = mark`# Hello World, this is my ${props => props.count || 'first'} mark component!`;
    TitleHoC = mark(HoC)`# Hello World, this is my first mark component!`;
  } else if (method === 'up') {
    mark = up;
    Title = mark`<h1>Hello World, this is my ${props => props.count || 'first'} mark component!</h1>`;
    TitleHoC = mark(HoC)`<h1>Hello World, this is my first mark component!</h1>`;
  } else {
    throw new Error('No method given...');
  }

  const testName = `inferno-mark::${method}`;

  test(testName, t => {
    t.plan(11);

    t.comment(`${testName} renders`);
    t.ok(testUtils.isVNode(createElement(Title)));

    (() => {
      t.comment(`${testName} renders, defaulting to div wrapper`);
      const fixture = '<div><h1>Hello World, this is my first mark component!</h1></div>';
      t.ok(renderToString(createElement(Title)) === fixture);
    })();

    (() => {
      t.comment(`${testName} uses plugins`);
      let pluginUseCount = 0;
      const pluginSpy = () => {
        pluginUseCount += 1;
      };
      renderToString(createElement(Title, { infernoMarkOptions: { plugins: [pluginSpy] } }));
      t.ok(pluginUseCount === 1);
    })();

    (() => {
      t.comment(`${testName} uses template strings`);
      const fixture = '<div><h1>Hello World, this is my second mark component!</h1></div>';
      t.ok(renderToString(createElement(Title, { count: 'second' })) === fixture);
    })();

    (() => {
      t.comment(`${testName} uses component substitutions`);
      const fixture = '<div><h2>Hello World, this is my first mark component!</h2></div>';
      const props = {
        infernoMarkOptions: {
          components: {
            h1: (h1Props) => createElement('h2', h1Props),
          },
        },
      };
      t.ok(renderToString(createElement(Title, props)) === fixture);
    })();

    (() => {
      t.comment(`${testName} can disable sanitization`);
      const fixture = '<div><h1>Hello World, this is my first mark component!</h1></div>';
      const sanitizeSchema = { tagNames: ['div'] };
      const props = { infernoMarkOptions: { sanitize: false, sanitizeSchema } };
      t.ok(renderToString(createElement(Title, props)) === fixture);
    })();

    (() => {
      t.comment(`${testName} can pass custom sanitization schema`);
      const fixture = '<div>Hello World, this is my first mark component!</div>';
      const sanitizeSchema = { tagNames: ['div'] };
      const props = { infernoMarkOptions: { sanitizeSchema } };
      t.ok(renderToString(createElement(Title, props)) === fixture);
    })();

    (() => {
      t.comment(`${testName} doesn't fail on complete sanitization`);
      const fixture = '<div></div>';
      const sanitizeSchema = { tagNames: [] };
      const props = { infernoMarkOptions: { sanitizeSchema } };

      // "text" node
      t.ok(renderToString(createElement(Title, props)) === fixture);

      // "root" node
      t.ok(renderToString(createElement(mark``, props)) === fixture);
    })();

    t.comment(`${testName} accepts HoC and renders`);
    t.ok(testUtils.isVNode(createElement(TitleHoC)));

    (() => {
      t.comment(`${testName} renders using HoC`);
      const fixture = '<marquee><h1>Hello World, this is my first mark component!</h1></marquee>';
      t.ok(renderToString(createElement(TitleHoC)) === fixture);
    })();
  });
};
