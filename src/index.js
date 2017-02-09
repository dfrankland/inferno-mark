import rehype from 'rehype';
import remark from 'remark';
import mdastToHast from 'mdast-util-to-hast';
import hastSanitize from 'hast-util-sanitize';
import hastToHyperscript from 'hast-to-hyperscript';
import infernoHyperscript from 'inferno-hyperscript';

const div = (children = []) => ({
  type: 'element',
  tagName: 'div',
  properties: {},
  children,
});

const hyperscriptWrapper = components => (name = 'div', props = {}, children = []) => {
  const nameLowerCase = name.toLocaleLowerCase();
  const component = components[nameLowerCase];
  if (component) return component({ ...props, children });
  return infernoHyperscript(nameLowerCase, props, children);
};

const createMark = getHastFromString => (
  (strings, ...valueArgs) => (
    (props = {}) => {
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
        wrapper,
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
        if (newHast.type === 'root') newHast = div(newHast.children);
      }

      const components = (
        Array.isArray(userComponents) ||
        typeof userComponents !== 'object'
      ) ? {} : userComponents;
      let newHyperscript = hastToHyperscript(hyperscriptWrapper(components), newHast, prefix);
      if (typeof wrapper === 'function') {
        newHyperscript = wrapper({ ...props, children: newHyperscript.children });
      }

      return newHyperscript;
    }
  )
);

const reducePlugins = (processor, plugins) => {
  if (plugins.length < 1) return processor;
  return plugins.reduce(
    (newProcessor, nextPlugin) => newProcessor.use(nextPlugin),
    processor,
  );
};

export const up = createMark(
  (string, plugins) => {
    const processor = reducePlugins(rehype, plugins);
    const hast = processor().parse(string);

    // Return the innerHTML of the body
    return hast.children[0].children[1];
  },
);

export const down = createMark(
  (string, plugins) => {
    const processor = reducePlugins(remark, plugins);
    const mdast = processor().parse(string);

    // Convert from mdast to hast
    return mdastToHast(mdast);
  },
);

export default { up, down };
