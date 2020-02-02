import detectIndent from 'detect-indent';
import pug, { compile } from 'pug';

import { Transformer, Options } from '../typings';

// Mixins to use svelte template features
const GET_MIXINS = (identationType: 'tab' | 'space') =>
  `mixin if(condition)
%_| {#if !{condition}}
%_block
%_| {/if}

mixin else
%_| {:else}
%_block

mixin elseif(condition)
%_| {:else if !{condition}}
%_block

mixin each(loop)
%_| {#each !{loop}}
%_block
%_| {/each}

mixin await(promise)
%_| {#await !{promise}}
%_block
%_| {/await}

mixin then(answer)
%_| {:then !{answer}}
%_block

mixin catch(error)
%_| {:catch !{error}}
%_block

mixin debug(variables)
%_| {@debug !{variables}}`.replace(
    /%_/g,
    identationType === 'tab' ? '\t' : '  ',
  );

const transformer: Transformer<Options.Pug> = async ({
  content,
  filename,
  options,
}) => {
  options = {
    doctype: 'html',
    filename,
    ...options,
  };

  const { type: identationType } = detectIndent(content);
  const code = `${GET_MIXINS(identationType)}\n${content}`;
  const compiled = pug.compileClientWithDependenciesTracked(code, {
    compileDebug: false,
    ...options,
  });
  return {
    code: pug.render(code, options),
    dependencies: compiled.dependencies ? compiled.dependencies : [],
  };
};

export default transformer;
