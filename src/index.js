import rehype from 'rehype';
import remark from 'remark';
import mdastToHast from 'mdast-util-to-hast';
import hastSanitize from 'hast-util-sanitize';
import hastToHyperscript from 'hast-to-hyperscript';
import infernoHyperscript from 'inferno-hyperscript';

const div = (children) => ({
  type: 'element',
  tagName: 'div',
  properties: {},
  children,
});

const hyperscriptWrapper = components => (name, props = {}, children = []) => {
  const nameLowerCase = name.toLocaleLowerCase();
  const component = components[nameLowerCase];
  if (component) return component({ ...props, children });
  return infernoHyperscript(nameLowerCase, props, children);
};

const taggedTemplate = (getHastFromString, wrapper) => (strings, ...valueArgs) => (
  props => {
    // Construct tagged template string with props
    const values = [...valueArgs];
    let string = '';
    for (let i = 0; i < strings.length; i += 1) {
      string += strings[i];
      if (values[i]) string += values[i](props);
    }

    // Set defaults and deconstruct options
    let infernoMarkOptions = props.infernoMarkOptions;
    if (
      Array.isArray(infernoMarkOptions) ||
      typeof props.infernoMarkOptions !== 'object'
    ) infernoMarkOptions = {};
    const {
      plugins: userPlugins,
      wrapper: wrapperOverride = wrapper,
      sanitize = true,
      sanitizeSchema,
      components: userComponents,
      prefix,
    } = infernoMarkOptions;

    // Pass user plugins and constuct hast
    const plugins = Array.isArray(userPlugins) ? userPlugins : [];
    const hast = getHastFromString(string, plugins);

    // Wrap hast and optionally sanitize it with a schema
    let newHast = div(hast.children);
    if (sanitize) {
      let schema = sanitizeSchema;
      if (Array.isArray(schema) || typeof sanitizeSchema !== 'object') schema = null;
      newHast = hastSanitize(newHast, schema);
      if (
        newHast.type === 'root' ||
        newHast.type === 'text'
      ) newHast = div(newHast.children);
    }

    const components = (
      Array.isArray(userComponents) ||
      typeof userComponents !== 'object'
    ) ? {} : userComponents;
    let newHyperscript = hastToHyperscript(hyperscriptWrapper(components), newHast, prefix);
    if (typeof wrapperOverride === 'function') {
      newHyperscript = wrapperOverride({ ...props, children: newHyperscript.children });
    }

    return newHyperscript;
  }
);

const createMark = getHastFromString => (
  (stringsOrComponent, ...valueArgs) => {
    // HoC
    if (typeof stringsOrComponent === 'function') {
      return taggedTemplate(getHastFromString, stringsOrComponent);
    }

    // Tagged Template
    return taggedTemplate(getHastFromString)(stringsOrComponent, ...valueArgs);
  }
);

export const up = createMark(
  (string, plugins) => {
    const hast = rehype().use(plugins).parse(string);

    // Return the innerHTML of the body
    return hast.children[0].children[1];
  },
);

export const down = createMark(
  (string, plugins) => {
    const mdast = remark().use(plugins).parse(string);

    // Convert from mdast to hast
    return mdastToHast(mdast);
  },
);

export default { up, down };
