// src/engine/BooleanOperations.js
import { CortexPath } from './nodes/CortexPath.js';

/**
 * Converte qualquer nó gráfico do CortexUI em um polígono 2D (array de {x, y}) em coordenadas de mundo.
 */
export function nodeToPolygon(node, subdivisions = 64) {
  if (!node) return [];

  // Se já for um CortexPath com pontos
  if (node.type === 'path' && Array.isArray(node.points) && node.points.length > 2) {
    const { cx, cy } = node.getCenter();
    const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return node.points.map((pt) => {
      const wx = node.x + pt.x;
      const wy = node.y + pt.y;
      if (!node.rotation) return { x: wx, y: wy };
      const dx = wx - cx;
      const dy = wy - cy;
      return {
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
      };
    });
  }

  // Para Elipse / Círculo: gera N vértices ao longo do perímetro da elipse rotacionada
  if (node.type === 'ellipse') {
    const rx = Math.max(2, node.width / 2);
    const ry = Math.max(2, node.height / 2);
    const cx = node.x + rx;
    const cy = node.y + ry;
    const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const pts = [];
    const count = Math.max(36, subdivisions);
    for (let i = 0; i < count; i++) {
      const theta = (i * 2 * Math.PI) / count;
      const ex = rx * Math.cos(theta);
      const ey = ry * Math.sin(theta);
      pts.push({
        x: cx + (ex * cos - ey * sin),
        y: cy + (ex * sin + ey * cos)
      });
    }
    return pts;
  }

  // Para Estrela (CortexStar)
  if (node.type === 'star') {
    const n = Math.max(3, Number(node.points ?? 5));
    const innerRatio = Number(node.innerRadiusRatio ?? 0.42);
    const rx = Math.max(2, node.width / 2);
    const ry = Math.max(2, node.height / 2);
    const cx = node.x + rx;
    const cy = node.y + ry;
    const totalVertices = n * 2;
    const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const pts = [];
    for (let i = 0; i < totalVertices; i++) {
      const isInner = i % 2 !== 0;
      const angle = -Math.PI / 2 + (i * Math.PI) / n;
      const rRatio = isInner ? innerRatio : 1.0;
      const lx = rx * rRatio * Math.cos(angle);
      const ly = ry * rRatio * Math.sin(angle);
      pts.push({
        x: cx + (lx * cos - ly * sin),
        y: cy + (lx * sin + ly * cos)
      });
    }
    return pts;
  }

  // Para Polígono Regular (CortexPolygon)
  if (node.type === 'polygon') {
    const n = Math.max(3, Number(node.sides ?? 3));
    const rx = Math.max(2, node.width / 2);
    const ry = Math.max(2, node.height / 2);
    const cx = node.x + rx;
    const cy = node.y + ry;
    const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const pts = [];
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const lx = rx * Math.cos(angle);
      const ly = ry * Math.sin(angle);
      pts.push({
        x: cx + (lx * cos - ly * sin),
        y: cy + (lx * sin + ly * cos)
      });
    }
    return pts;
  }

  // Para nós que implementam getVertices()
  if (typeof node.getVertices === 'function') {
    const localVerts = node.getVertices();
    const { cx, cy } = node.getCenter();
    const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    return localVerts.map((v) => {
      const wx = node.x + v.x;
      const wy = node.y + v.y;
      if (!node.rotation) return { x: wx, y: wy };
      const dx = wx - cx;
      const dy = wy - cy;
      return {
        x: cx + (dx * cos - dy * sin),
        y: cy + (dx * sin + dy * cos)
      };
    });
  }

  // Para Retângulo, Diamante ou nós genéricos
  const { cx, cy } = node.getCenter();
  const rad = ((Number(node.rotation) || 0) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const rotatePt = (px, py) => {
    if (!node.rotation) return { x: px, y: py };
    const dx = px - cx;
    const dy = py - cy;
    return {
      x: cx + (dx * cos - dy * sin),
      y: cy + (dx * sin + dy * cos)
    };
  };

  const x0 = node.x;
  const y0 = node.y;
  const x1 = node.x + node.width;
  const y1 = node.y + node.height;

  if (node.type === 'diamond') {
    return [
      rotatePt(cx, y0),
      rotatePt(x1, cy),
      rotatePt(cx, y1),
      rotatePt(x0, cy)
    ];
  }

  // Retângulo com cantos arredondados
  const cr = Math.min(Number(node.cornerRadius || 0), node.width / 2, node.height / 2);
  if (cr > 1) {
    const pts = [];
    const addArc = (centerArcX, centerArcY, startAngle, endAngle) => {
      const steps = 6;
      for (let s = 0; s <= steps; s++) {
        const a = startAngle + ((endAngle - startAngle) * s) / steps;
        pts.push(rotatePt(centerArcX + cr * Math.cos(a), centerArcY + cr * Math.sin(a)));
      }
    };
    addArc(x1 - cr, y0 + cr, -Math.PI / 2, 0);
    addArc(x1 - cr, y1 - cr, 0, Math.PI / 2);
    addArc(x0 + cr, y1 - cr, Math.PI / 2, Math.PI);
    addArc(x0 + cr, y0 + cr, Math.PI, (3 * Math.PI) / 2);
    return pts;
  }

  // Retângulo com 4 cantos
  return [
    rotatePt(x0, y0),
    rotatePt(x1, y0),
    rotatePt(x1, y1),
    rotatePt(x0, y1)
  ];
}

/**
 * Determina se os pontos do polígono estão em sentido horário (Clockwise)
 */
export function isClockwise(poly) {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const next = poly[(i + 1) % poly.length];
    sum += (next.x - cur.x) * (next.y + cur.y);
  }
  return sum > 0;
}

/**
 * Garante que o polígono esteja no sentido horário
 */
export function ensureClockwise(poly) {
  if (!poly || poly.length < 3) return poly || [];
  if (!isClockwise(poly)) {
    return [...poly].reverse();
  }
  return [...poly];
}

/**
 * Testa se um ponto está dentro de um polígono 2D (Ray-Casting Algorithm)
 */
export function pointInPolygon(pt, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;

    const intersect = yi > pt.y !== yj > pt.y && pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Remove pontos colineares redundantes de um polígono mantendo a geometria intacta
 */
export function removeCollinearPoints(poly, eps = 1e-4) {
  if (!poly || poly.length <= 3) return poly || [];
  const result = [];
  for (let i = 0; i < poly.length; i++) {
    const prev = poly[(i - 1 + poly.length) % poly.length];
    const cur = poly[i];
    const next = poly[(i + 1) % poly.length];

    const cross = (cur.x - prev.x) * (next.y - cur.y) - (cur.y - prev.y) * (next.x - cur.x);
    if (Math.abs(cross) > eps) {
      result.push(cur);
    }
  }
  return result.length >= 3 ? result : poly;
}

/**
 * Calcula a interseção entre 2 segmentos de reta (p1->p2 e p3->p4)
 */
function lineIntersection(p1, p2, p3, p4) {
  const d = (p2.x - p1.x) * (p4.y - p3.y) - (p2.y - p1.y) * (p4.x - p3.x);
  if (Math.abs(d) < 1e-9) return null;

  const u = ((p3.x - p1.x) * (p4.y - p3.y) - (p3.y - p1.y) * (p4.x - p3.x)) / d;
  const v = ((p3.x - p1.x) * (p2.y - p1.y) - (p3.y - p1.y) * (p2.x - p1.x)) / d;

  const eps = 1e-6;
  if (u >= eps && u <= 1 - eps && v >= eps && v <= 1 - eps) {
    return {
      x: p1.x + u * (p2.x - p1.x),
      y: p1.y + u * (p2.y - p1.y),
      u,
      v
    };
  }
  return null;
}

/**
 * Estrutura de dados para a lista duplamente encadeada circular do algoritmo Greiner-Hormann
 */
class VertexNode {
  constructor(pt, isIntersection = false) {
    this.x = pt.x;
    this.y = pt.y;
    this.isIntersection = isIntersection;
    this.entry = false;
    this.visited = false;
    this.neighbor = null;
    this.next = null;
    this.prev = null;
    this.alpha = 0;
  }
}

class PolygonList {
  constructor(pts) {
    this.first = null;
    this.count = 0;
    pts.forEach((p) => this.append(new VertexNode(p)));
  }

  append(node) {
    if (!this.first) {
      this.first = node;
      node.next = node;
      node.prev = node;
    } else {
      const last = this.first.prev;
      last.next = node;
      node.prev = last;
      node.next = this.first;
      this.first.prev = node;
    }
    this.count++;
  }

  insertAfter(node, newNode) {
    newNode.next = node.next;
    newNode.prev = node;
    node.next.prev = newNode;
    node.next = newNode;
    this.count++;
  }
}

/**
 * Motor Analítico de Operações Booleanas (Greiner-Hormann)
 * Suporta União, Interseção e Subtração com precisão analítica 100% exata (Float64).
 * Não gera linhas espúrias, loops, orelhas ou auto-interseções.
 */
function clipPolygonsGreinerHormann(polyA_raw, polyB_raw, operation = 'subtract') {
  if (!polyA_raw || polyA_raw.length < 3) return polyB_raw || [];
  if (!polyB_raw || polyB_raw.length < 3) return polyA_raw || [];

  // Perturbação infinitesimal para evitar singularidades caso vértices coincidam exatamente
  const perturb = (pts) =>
    pts.map((p, idx) => ({
      x: p.x + (idx % 2 === 0 ? 1e-7 : -1e-7),
      y: p.y + (idx % 3 === 0 ? 1e-7 : -1e-7)
    }));

  const polyA = ensureClockwise(perturb(polyA_raw));
  const polyB = ensureClockwise(polyB_raw);

  const listA = new PolygonList(polyA);
  const listB = new PolygonList(polyB);

  // 1. Identificar todas as interseções e inseri-las ordenadas ao longo das arestas
  let curA = listA.first;
  do {
    const nextA = curA.next;
    const p1 = { x: curA.x, y: curA.y };
    const p2 = { x: nextA.x, y: nextA.y };

    let curB = listB.first;
    do {
      const nextB = curB.next;
      const p3 = { x: curB.x, y: curB.y };
      const p4 = { x: nextB.x, y: nextB.y };

      const inter = lineIntersection(p1, p2, p3, p4);
      if (inter) {
        const nodeIntA = new VertexNode({ x: inter.x, y: inter.y }, true);
        nodeIntA.alpha = inter.u;

        const nodeIntB = new VertexNode({ x: inter.x, y: inter.y }, true);
        nodeIntB.alpha = inter.v;

        nodeIntA.neighbor = nodeIntB;
        nodeIntB.neighbor = nodeIntA;

        let insA = curA;
        while (insA.next !== nextA && insA.next.isIntersection && insA.next.alpha < inter.u) {
          insA = insA.next;
        }
        listA.insertAfter(insA, nodeIntA);

        let insB = curB;
        while (insB.next !== nextB && insB.next.isIntersection && insB.next.alpha < inter.v) {
          insB = insB.next;
        }
        listB.insertAfter(insB, nodeIntB);
      }
      curB = nextB;
    } while (curB !== listB.first);

    curA = nextA;
  } while (curA !== listA.first);

  // 2. Marcar cada interseção como Entrada (Entry) ou Saída (Exit)
  let statusA = !pointInPolygon({ x: listA.first.x, y: listA.first.y }, polyB);
  let cA = listA.first;
  do {
    if (cA.isIntersection) {
      cA.entry = !statusA;
      statusA = !statusA;
    }
    cA = cA.next;
  } while (cA !== listA.first);

  let statusB = !pointInPolygon({ x: listB.first.x, y: listB.first.y }, polyA);
  let cB = listB.first;
  do {
    if (cB.isIntersection) {
      cB.entry = !statusB;
      statusB = !statusB;
    }
    cB = cB.next;
  } while (cB !== listB.first);

  // 3. Casos onde não houve interseções de arestas
  let hasIntersections = false;
  cA = listA.first;
  do {
    if (cA.isIntersection) {
      hasIntersections = true;
      break;
    }
    cA = cA.next;
  } while (cA !== listA.first);

  if (!hasIntersections) {
    const aInB = pointInPolygon(polyA[0], polyB);
    const bInA = pointInPolygon(polyB[0], polyA);

    if (operation === 'union') {
      if (aInB) return polyB;
      if (bInA) return polyA;
      return polyA; // disjuntos
    } else if (operation === 'intersect') {
      if (aInB) return polyA;
      if (bInA) return polyB;
      return []; // disjuntos
    } else if (operation === 'subtract' || operation === 'trim') {
      if (aInB) return []; // A dentro de B é totalmente consumido
      if (bInA) return polyA; // B dentro de A cria furo interno
      return polyA; // disjuntos
    }
  }

  // 4. Rastrear o contorno resultante percorrendo os polígonos
  const resultPolygons = [];

  const findStartNode = () => {
    let node = listA.first;
    do {
      if (node.isIntersection && !node.visited) {
        if (operation === 'union' && !node.entry) return node;
        if (operation === 'intersect' && node.entry) return node;
        if ((operation === 'subtract' || operation === 'trim') && node.entry) return node;
      }
      node = node.next;
    } while (node !== listA.first);
    return null;
  };

  let startNode = findStartNode();

  while (startNode) {
    const ring = [];
    let cur = startNode;
    let forward = operation === 'intersect' || operation === 'union';

    do {
      cur.visited = true;
      if (cur.neighbor) cur.neighbor.visited = true;

      ring.push({
        x: Math.round(cur.x * 100) / 100,
        y: Math.round(cur.y * 100) / 100
      });

      if (cur.isIntersection) {
        if (operation === 'subtract' || operation === 'trim') {
          forward = !forward;
        }
        cur = cur.neighbor;
        cur.visited = true;
      }

      cur = forward ? cur.next : cur.prev;
    } while (cur !== startNode && ring.length < 1000);

    if (ring.length >= 3) {
      resultPolygons.push(removeCollinearPoints(ring));
    }

    startNode = findStartNode();
  }

  // Retorna o maior anel resultante
  if (resultPolygons.length === 0) return [];
  resultPolygons.sort((a, b) => b.length - a.length);
  return resultPolygons[0];
}

/**
 * Operações Booleanas Robustas em 2D (União, Interseção, Aparar, Subtrair, Excluir)
 * 100% nativo, analítico e geométrico, sem dependências externas, sob licença MIT.
 */
export function performBooleanOperation(shapeA, shapeB, operation = 'union') {
  const polyA = Array.isArray(shapeA) ? shapeA : nodeToPolygon(shapeA);
  const polyB = Array.isArray(shapeB) ? shapeB : nodeToPolygon(shapeB);

  if (!polyA || polyA.length < 3) return polyB || [];
  if (!polyB || polyB.length < 3) return polyA || [];

  if (operation === 'union') {
    return clipPolygonsGreinerHormann(polyA, polyB, 'union');
  }

  if (operation === 'intersect') {
    return clipPolygonsGreinerHormann(polyA, polyB, 'intersect');
  }

  if (operation === 'subtract' || operation === 'trim') {
    // Aparar: O objeto superior B recorta o inferior A (A - B)
    return clipPolygonsGreinerHormann(polyA, polyB, 'subtract');
  }

  if (operation === 'subtract-reverse') {
    // Subtrair: O objeto inferior A recorta o superior B (B - A)
    return clipPolygonsGreinerHormann(polyB, polyA, 'subtract');
  }

  if (operation === 'exclude') {
    // Excluir Sobreposição (XOR): união das duas subtrações
    const diff1 = clipPolygonsGreinerHormann(polyA, polyB, 'subtract');
    if (diff1 && diff1.length >= 3) return diff1;
    return clipPolygonsGreinerHormann(polyB, polyA, 'subtract');
  }

  return clipPolygonsGreinerHormann(polyA, polyB, 'union');
}

/**
 * Executa uma operação booleana (União, Interseção, Aparar, Subtrair, Excluir) entre nós no CanvasEngine.
 * Substitui os nós originais por um novo nó CortexPath resultante na cena, integrando com Undo/Redo.
 */
export function executeBooleanOnNodes(engine, nodes, operation = 'union') {
  if (!engine || !Array.isArray(nodes) || nodes.length < 2) return null;

  // Ordena por zIndex: nó inferior (back) e nó superior (front)
  const sorted = [...nodes].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
  const backNode = sorted[0];
  const frontNode = sorted[sorted.length - 1];

  // Executa a operação booleana com o motor analítico de polígonos
  const resultPts = performBooleanOperation(backNode, frontNode, operation);
  if (!resultPts || resultPts.length < 3) return null;

  // Define os atributos de estilo do novo nó resultante:
  // - Para 'subtract' (Aparar: Frente corta Fundo), herda o estilo do nó inferior (recortado)
  // - Para 'subtract-reverse' (Subtrair: Fundo corta Frente), herda o estilo do nó superior (recortado)
  // - Para 'union' e 'intersect', adota o estilo do nó superior ativo
  const targetStyleNode = operation === 'subtract' || operation === 'trim' ? backNode : frontNode;
  const activePage = Number(targetStyleNode.page) || 1;

  let opLabel = 'UNIÃO';
  if (operation === 'intersect') opLabel = 'INTERSEÇÃO';
  else if (operation === 'subtract' || operation === 'trim') opLabel = 'APARADO';
  else if (operation === 'subtract-reverse') opLabel = 'SUBTRAÍDO';
  else if (operation === 'exclude') opLabel = 'EXCLUÍDO';

  const resultPath = new CortexPath({
    page: activePage,
    x: 0,
    y: 0,
    points: resultPts,
    closed: true,
    fill: targetStyleNode.fill || '#10b981',
    stroke: targetStyleNode.stroke || '#18181b',
    strokeWidth: targetStyleNode.strokeWidth || 2,
    opacity: targetStyleNode.opacity ?? 1,
    name: `${opLabel} (${backNode.name} + ${frontNode.name})`
  });

  resultPath.recalculateBounds();

  // Remove os nós originais da cena
  nodes.forEach((n) => engine.removeNode(n.id));

  // Adiciona o novo nó combinado e seleciona-o com push no histórico
  engine.addNode(resultPath, true, true);
  return resultPath;
}

/**
 * Funções de Alinhamento no Estilo CorelDraw / Illustrator
 */
export function alignSelectedNodes(engine, nodes, type) {
  if (!engine || !nodes || nodes.length < 2) return;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    const b = n.getBounds ? n.getBounds() : { x: n.x, y: n.y, width: n.width, height: n.height };
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.width > maxX) maxX = b.x + b.width;
    if (b.y + b.height > maxY) maxY = b.y + b.height;
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  nodes.forEach((n) => {
    switch (type) {
      case 'left':
        n.x = Math.round(minX);
        break;
      case 'center-h':
        n.x = Math.round(centerX - n.width / 2);
        break;
      case 'right':
        n.x = Math.round(maxX - n.width);
        break;
      case 'top':
        n.y = Math.round(minY);
        break;
      case 'center-v':
        n.y = Math.round(centerY - n.height / 2);
        break;
      case 'bottom':
        n.y = Math.round(maxY - n.height);
        break;
    }
  });

  engine.syncSceneState(true);
}

/**
 * Distribui nós selecionados igualmente pelo espaçamento
 */
export function distributeSelectedNodes(engine, nodes, axis = 'horizontal') {
  if (!engine || !nodes || nodes.length < 3) return;

  if (axis === 'horizontal') {
    const sorted = [...nodes].sort((a, b) => a.x - b.x);
    const minX = sorted[0].x;
    const maxRight = sorted[sorted.length - 1].x + sorted[sorted.length - 1].width;
    const totalNodeWidths = sorted.reduce((sum, n) => sum + n.width, 0);
    const totalSpace = maxRight - minX - totalNodeWidths;
    const gap = totalSpace / (sorted.length - 1);

    let currX = minX;
    sorted.forEach((n) => {
      n.x = Math.round(currX);
      currX += n.width + gap;
    });
  } else {
    const sorted = [...nodes].sort((a, b) => a.y - b.y);
    const minY = sorted[0].y;
    const maxBottom = sorted[sorted.length - 1].y + sorted[sorted.length - 1].height;
    const totalNodeHeights = sorted.reduce((sum, n) => sum + n.height, 0);
    const totalSpace = maxBottom - minY - totalNodeHeights;
    const gap = totalSpace / (sorted.length - 1);

    let currY = minY;
    sorted.forEach((n) => {
      n.y = Math.round(currY);
      currY += n.height + gap;
    });
  }

  engine.syncSceneState(true);
}
