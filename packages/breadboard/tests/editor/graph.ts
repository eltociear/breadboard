/**
 * @license
 * Copyright 2024 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import test from "ava";

import { editGraph } from "../../src/editor/index.js";
import { NodeHandler } from "../../src/types.js";

const testEditGraph = () => {
  return editGraph(
    structuredClone({
      nodes: [
        {
          id: "node0",
          type: "foo",
        },
        {
          id: "node2",
          type: "bar",
        },
      ],
      edges: [{ from: "node0", out: "out", to: "node0", in: "in" }],
    }),
    {
      kits: [
        {
          url: "",
          handlers: {
            foo: {
              invoke: async () => {},
              describe: async () => {
                return {
                  inputSchema: {
                    additionalProperties: false,
                    properties: {
                      in: { type: "string" },
                    },
                  },
                  outputSchema: {
                    additionalProperties: false,
                    properties: {
                      out: { type: "string" },
                    },
                  },
                };
              },
            } as NodeHandler,
            bar: {
              invoke: async () => {},
              describe: async () => {
                return {
                  inputSchema: {},
                  outputSchema: {
                    additionalProperties: false,
                    properties: {
                      out: { type: "string" },
                    },
                  },
                };
              },
            } as NodeHandler,
          },
        },
      ],
    }
  );
};

test("editor API successfully tests for node addition", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.canAddNode({
      id: "node1",
      type: "foo",
    });

    t.true(result.success);
  }
  {
    const result = await graph.canAddNode({
      id: "node0",
      type: "foo",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canAddNode({
      id: "node1",
      type: "unknown type",
    });

    t.false(result.success);
  }
});

test("editor API successfully adds a node", async (t) => {
  const graph = testEditGraph();

  const result = await graph.addNode({
    id: "node1",
    type: "foo",
  });

  t.true(result.success);

  const raw = graph.raw();
  t.deepEqual(
    raw.nodes.map((n) => n.id),
    ["node0", "node2", "node1"]
  );
});

test("editor API successfully tests for node removal", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.canRemoveNode("node0");

    t.true(result.success);
  }
  {
    const result = await graph.canRemoveNode("node1");

    t.false(result.success);
  }
});

test("editor API successfully removes a node", async (t) => {
  const graph = testEditGraph();
  {
    const result = await graph.removeNode("node0");

    t.true(result.success);

    const raw = graph.raw();
    t.deepEqual(
      raw.nodes.map((n) => n.id),
      ["node2"]
    );
    t.deepEqual(
      raw.edges.map((e) => [e.from, e.to]),
      []
    );
  }

  {
    const result = await graph.canAddNode({ id: "node0", type: "foo" });
    t.true(result.success);
  }
});

test("editor API successfully tests for edge addition", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.canAddEdge({
      from: "node0",
      out: "out",
      to: "node2",
      in: "in",
    });

    t.true(result.success);
  }
  {
    const result = await graph.canAddEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "in",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canAddEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "baz",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canAddEdge({
      from: "unknown node",
      out: "out",
      to: "node2",
      in: "in",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canAddEdge({
      from: "node0",
      out: "out",
      to: "unknown node",
      in: "in",
    });

    t.false(result.success);
  }
});

test("editor API successfully adds an edge", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.addEdge({
      from: "node0",
      out: "out",
      to: "node2",
      in: "in",
    });

    t.true(result.success);

    const raw = graph.raw();
    t.deepEqual(
      raw.edges.map((e) => [e.from, e.to]),
      [
        ["node0", "node0"],
        ["node0", "node2"],
      ]
    );
  }
  {
    const result = await graph.canAddEdge({
      from: "node0",
      out: "out",
      to: "node2",
      in: "in",
    });

    t.false(result.success);
  }
});

test("editor API successfully tests for edge removal", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.canRemoveEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "in",
    });

    t.true(result.success);
  }
  {
    const result = await graph.canRemoveEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "baz",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canRemoveEdge({
      from: "unknown node",
      out: "out",
      to: "node0",
      in: "in",
    });

    t.false(result.success);
  }
  {
    const result = await graph.canRemoveEdge({
      from: "node0",
      out: "out",
      to: "unknown node",
      in: "in",
    });

    t.false(result.success);
  }
});

test("editor API successfully removes an edge", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.removeEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "in",
    });

    t.true(result.success);

    const raw = graph.raw();
    t.deepEqual(
      raw.edges.map((e) => [e.from, e.to]),
      []
    );
  }
  {
    const result = await graph.canRemoveEdge({
      from: "node0",
      out: "out",
      to: "node0",
      in: "in",
    });

    t.false(result.success);
  }
});

test("editor API allows adding built-in nodes", async (t) => {
  const graph = testEditGraph();

  {
    const result = await graph.addNode({
      id: "node1",
      type: "input",
    });

    t.true(result.success);

    const raw = graph.raw();
    t.deepEqual(
      raw.nodes.map((n) => n.id),
      ["node0", "node2", "node1"]
    );
  }

  {
    const result = await graph.addNode({
      id: "node3",
      type: "output",
    });

    t.true(result.success);

    const raw = graph.raw();
    t.deepEqual(
      raw.nodes.map((n) => n.id),
      ["node0", "node2", "node1", "node3"]
    );
  }
});

test("editor API allows changing edge", async (t) => {
  const graph = testEditGraph();

  const before = graph.inspect().edges()[0];

  const result = await graph.changeEdge(
    { from: "node0", out: "out", to: "node0", in: "in" },
    { from: "node0", out: "out", to: "node2", in: "in" }
  );

  t.true(result.success);

  const raw = graph.raw();
  t.deepEqual(
    raw.edges.map((e) => [e.from, e.to]),
    [["node0", "node2"]]
  );

  const after = graph.inspect().edges()[0];
  t.assert(before === after);
});

test("editor API does not allow connecting a specific output port to a star port", async (t) => {
  const graph = testEditGraph();

  const edgeSpec = { from: "node0", out: "out", to: "node2", in: "*" };
  const result = await graph.canAddEdge(edgeSpec);
  t.false(result.success);
});

test("editor API correctly works with no subgraphs", (t) => {
  const graph = testEditGraph();

  const raw = graph.raw();
  t.falsy(raw.graphs);
});

test("editor API correctly allows adding, removing, replacing subgraphs", (t) => {
  const graph = testEditGraph();
  const subgraph = testEditGraph().raw();

  t.assert(graph.addGraph("foo", subgraph) !== null);

  t.truthy(graph.raw().graphs);

  t.is(graph.version(), 1);

  t.assert(graph.addGraph("foo", subgraph) === null);

  t.true(graph.removeGraph("foo").success);
  t.false(graph.removeGraph("foo").success);

  t.falsy(graph.raw().graphs);

  t.is(graph.version(), 2);

  t.assert(graph.replaceGraph("foo", subgraph) === null);

  t.is(graph.version(), 2);

  t.assert(graph.addGraph("foo", subgraph) !== null);

  t.is(graph.version(), 3);

  t.assert(graph.replaceGraph("foo", subgraph) !== null);

  t.is(graph.version(), 4);

  t.truthy(graph.raw().graphs);
});

test("editor API allows using 'star` ports as drop zones", async (t) => {
  const edgeSpec = { from: "node0", out: "out", to: "node2", in: "*" };
  {
    const graph = testEditGraph();
    const result = await graph.canAddEdge(edgeSpec);
    if (result.success) {
      t.fail();
    } else {
      t.deepEqual(result.alternative, {
        from: "node0",
        out: "out",
        to: "node2",
        in: "out",
      });
    }
  }
  {
    const graph = testEditGraph();
    const result = await graph.addEdge(edgeSpec);
    t.true(result.success);
    t.true(
      graph.inspect().hasEdge({
        from: "node0",
        out: "out",
        to: "node2",
        in: "out",
      })
    );
    t.is(graph.version(), 1);
  }
  {
    const graph = testEditGraph();
    const result = await graph.addEdge(edgeSpec, true);
    t.false(result.success);
    t.false(
      graph.inspect().hasEdge({
        from: "node0",
        out: "out",
        to: "node2",
        in: "out",
      })
    );
    t.is(graph.version(), 0);
  }
});
