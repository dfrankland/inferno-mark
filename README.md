# `inferno-mark`

Create mark(up/down) components similar to [`styled-components`][1].

```bash
npm install --save inferno-mark
```

## Usage

### Basic

This creates two `inferno` components, `<Title>` and `<Menu>`:

```js
import Inferno from 'inferno';
import mark from 'inferno-mark';

const Title = mark.down`
# Hello World, this is my first markup component!
`;

const Menu = mark.up`
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="https://github.com/dfrankland">Github</a></li>
</ul>
`;
```

You render them like so:

```js
<Title />
<Menu />
```

### Mapped components

Mark components can substitute components with user-defined ones:

```js
import Inferno from 'inferno';
import mark from 'inferno-mark';

// Create links with both internal and external links
const Menu = mark.up`
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="https://github.com/dfrankland">Github</a></li>
</ul>
`;
```

You can pass an object with a key of the tag name and a value of an `inferno`
component that it should be substituted with:

```js
// Add `target="_blank"` to external links
<Menu
  infernoMarkOptions={{
    components: {
      a: ({ children, ...props}) => (
        <a
          {...{
            ...props,
            ...(/^https?:\/\//gi.test(props.href) ? { target: '_blank' } : {}),
          }}
        >
          {children}
        </a>
      ),
    }
  }}
/>
```

Which will render as such:

```html
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="https://github.com/dfrankland" target="_blank">Github</a></li>
</ul>
```

### Adapting based on props

The same powerful way that [`styled-components`][1] can change styles based on
props, so can `inferno-mark`! Say for example you'd like to make a more
dynamically created menu:

```js
import Inferno from 'inferno';
import mark from 'inferno-mark';

const Menu = mark.down`
${props => props.items.map(item => `* [${item}](/${item.toLowerCase()})`).join('\n')}
`;
```

Pass props like so:
```js
<Menu items={['Blog', 'Contact', 'Demo']} />
```

Finally, see it rendered as such:
```html
<ul>
  <li><a href="/blog">Blog</a></li>
  <li><a href="/contact">Contact</a></li>
  <li><a href="/demo">Demo</a></li>
</ul>
```

[1]: https://github.com/styled-components/styled-components
