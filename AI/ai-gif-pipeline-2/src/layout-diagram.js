const NODE_WIDTH = 218;
const NODE_HEIGHT = 124;
// Labels stay in the whitespace between columns. This is still substantially
// tighter than the old 200px gap, while leaving room for technical edge names.
const COLUMN_GAP = 132;
const ROW_GAP = 64;
const MARGIN_X = 64;
const CONTENT_TOP = 172;
const CONTENT_BOTTOM = 72;

function groupByRank(nodes, ranks) {
  const groups = [];
  nodes.forEach((node) => {
    const rank = ranks.get(node.id) || 0;
    if (!groups[rank]) groups[rank] = [];
    groups[rank].push(node);
  });
  return groups.filter(Boolean);
}

function rankNodes(nodes, edges) {
  const ids = new Set(nodes.map((node) => node.id));
  const indegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, []]));
  edges.forEach((edge) => {
    if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to) return;
    outgoing.get(edge.from).push(edge.to);
    indegree.set(edge.to, indegree.get(edge.to) + 1);
  });

  const rank = new Map(nodes.map((node) => [node.id, 0]));
  const queue = nodes.filter((node) => indegree.get(node.id) === 0).map((node) => node.id);
  const visited = new Set();
  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    outgoing.get(id).forEach((target) => {
      rank.set(target, Math.max(rank.get(target), rank.get(id) + 1));
      indegree.set(target, indegree.get(target) - 1);
      if (indegree.get(target) === 0) queue.push(target);
    });
  }

  // Paper diagrams should be DAGs. If a model still returns a cycle, keep the
  // cyclic nodes together instead of allowing rank relaxation to grow forever.
  nodes.forEach((node) => {
    if (!visited.has(node.id)) rank.set(node.id, 0);
  });

  const usedRanks = [...new Set(rank.values())].sort((a, b) => a - b);
  const compactRank = new Map(usedRanks.map((value, index) => [value, index]));
  nodes.forEach((node) => rank.set(node.id, compactRank.get(rank.get(node.id))));
  return rank;
}

function orderRows(groups, edges, ranks, originalOrder) {
  const incoming = new Map();
  edges.forEach((edge) => {
    if (!incoming.has(edge.to)) incoming.set(edge.to, []);
    incoming.get(edge.to).push(edge.from);
  });

  const rowById = new Map();
  groups.forEach((group) => group.forEach((node, index) => rowById.set(node.id, index)));
  for (let rank = 1; rank < groups.length; rank += 1) {
    groups[rank].sort((a, b) => {
      const barycenter = (node) => {
        const parents = (incoming.get(node.id) || []).filter((id) => ranks.get(id) < rank);
        if (!parents.length) return originalOrder.get(node.id);
        return parents.reduce((sum, id) => sum + (rowById.get(id) || 0), 0) / parents.length;
      };
      return barycenter(a) - barycenter(b) || originalOrder.get(a.id) - originalOrder.get(b.id);
    });
    groups[rank].forEach((node, index) => rowById.set(node.id, index));
  }
}

function layoutDiagram(input) {
  const diagram = JSON.parse(JSON.stringify(input));
  const nodes = Array.isArray(diagram.nodes) ? diagram.nodes : [];
  const edges = Array.isArray(diagram.edges) ? diagram.edges : [];
  const originalOrder = new Map(nodes.map((node, index) => [node.id, index]));
  const ranks = rankNodes(nodes, edges);
  const groups = groupByRank(nodes, ranks);
  orderRows(groups, edges, ranks, originalOrder);

  const columnCount = Math.max(1, groups.length);
  const maxRows = Math.max(1, ...groups.map((group) => group.length));
  const contentHeight = maxRows * NODE_HEIGHT + Math.max(0, maxRows - 1) * ROW_GAP;
  diagram.layoutMode = 'layered';
  diagram.width = Math.max(1080, MARGIN_X * 2 + columnCount * NODE_WIDTH + Math.max(0, columnCount - 1) * COLUMN_GAP);
  diagram.height = Math.max(620, CONTENT_TOP + contentHeight + CONTENT_BOTTOM);

  const columnStep = columnCount === 1
    ? 0
    : (diagram.width - MARGIN_X * 2 - NODE_WIDTH) / (columnCount - 1);
  const positions = new Map();
  groups.forEach((group, rank) => {
    const groupHeight = group.length * NODE_HEIGHT + Math.max(0, group.length - 1) * ROW_GAP;
    const groupTop = CONTENT_TOP + (contentHeight - groupHeight) / 2;
    group.forEach((node, row) => {
      positions.set(node.id, {
        x: MARGIN_X + rank * columnStep,
        y: groupTop + row * (NODE_HEIGHT + ROW_GAP),
        rank,
        row
      });
    });
  });

  diagram.nodes = nodes.map((node) => ({
    ...node,
    ...positions.get(node.id),
    width: NODE_WIDTH,
    height: NODE_HEIGHT
  }));
  diagram.animation = Array.isArray(diagram.animation) && diagram.animation.length
    ? diagram.animation
    : edges.map((edge) => ({ target: edge.id, effect: 'flow', at: 0, loop: true, speed: 24, period: 1.8 }));
  return diagram;
}

module.exports = { layoutDiagram };
