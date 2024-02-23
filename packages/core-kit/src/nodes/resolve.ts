/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SchemaBuilder,
  type InputValues,
  type NodeHandler,
  type NodeHandlerContext,
  type OutputValues,
} from "@google-labs/breadboard";

export default {
  describe: async (_inputs?: InputValues) => {
    // TODO(aomarks) Should I be doing something with inputs?
    return {
      inputSchema: new SchemaBuilder()
        .addProperties({
          // TODO(aomarks) Is this supposed to show up in the serialized BGL? It
          // doesn't seem to.
          $base: {
            title: "$base",
            description:
              "Base URL to use for resolution. " +
              "If omitted, the base URL of the current graph is used.",
            type: "string",
          },
        })
        .build(),
      outputSchema: new SchemaBuilder().build(),
    };
  },
  invoke: async (
    inputs: InputValues,
    context: NodeHandlerContext
  ): Promise<OutputValues> => {
    const base = inputs.$base ?? context.base?.href;
    if (!base) {
      throw new Error(
        `Resolve could not find a base URL. The $base input was undefined, ` +
          `and so was the handler context base.`
      );
    }
    if (typeof base !== "string") {
      throw new Error(`Resolve base must be a string, got ${typeof base}.`);
    }
    const resolved: Record<string, string> = {};
    for (const [name, value] of Object.entries(inputs)) {
      if (name === "$base") {
        continue;
      }
      if (typeof value !== "string") {
        throw new Error(
          `Resolve requires string inputs. Input "${name}" had type "${typeof value}".`
        );
      }
      resolved[name] = new URL(value, base).href;
    }
    return resolved;
  },
} satisfies NodeHandler;
