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
 * Renderiza a máscara sólida de um nó ou polígono no canvas offscreen
 */
function drawShapeSolid(ctx, item, minX, minY, scale) {
  if (!item) return;

  ctx.save();
  ctx.fillStyle = '#ffffff';

  // Se for um nó do CortexUI com buildPath()
  if (typeof item.buildPath === 'function') {
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    if (item.rotation) {
      const { cx, cy } = item.getCenter();
      ctx.translate(cx, cy);
      ctx.rotate(((item.rotation || 0) * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    const path = item.buildPath();
    ctx.fill(path);
    ctx.restore();
    return;
  }

  // Se for um nó sem buildPath() mas com renderShape()
  if (typeof item.renderShape === 'function') {
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    if (item.rotation) {
      const { cx, cy } = item.getCenter();
      ctx.translate(cx, cy);
      ctx.rotate(((item.rotation || 0) * Math.PI) / 180);
      ctx.translate(-cx, -cy);
    }

    item.renderShape(ctx);
    ctx.restore();
    return;
  }

  // Se for um array de pontos 2D (polígono)
  const poly = Array.isArray(item) ? item : nodeToPolygon(item);
  if (poly && poly.length >= 3) {
    ctx.beginPath();
    ctx.moveTo((poly[0].x - minX) * scale, (poly[0].y - minY) * scale);
    for (let i = 1; i < poly.length; i++) {
      ctx.lineTo((poly[i].x - minX) * scale, (poly[i].y - minY) * scale);
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Operações Booleanas de Alta Precisão (União, Interseção, Aparar, Subtrair, Excluir)
 * Utiliza Rasterização Vetorial 1:1 + GlobalCompositeOperation + Contour Tracing.
 * 100% nativo, sem dependências externas, sob licença MIT.
 */
export function performBooleanOperation(shapeA, shapeB, operation = 'union') {
  // 1. Determina a Bounding Box combinada dos dois objetos
  const polyA = Array.isArray(shapeA) ? shapeA : nodeToPolygon(shapeA);
  const polyB = Array.isArray(shapeB) ? shapeB : nodeToPolygon(shapeB);

  const allPts = [...polyA, ...polyB];
  if (allPts.length === 0) return [];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  allPts.forEach((p) => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  const pad = 16;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;

  const width = Math.max(10, Math.ceil(maxX - minX));
  const height = Math.max(10, Math.ceil(maxY - minY));

  // Resolução 1:1 para máxima fidelidade geométrica (limite de 1000px para alta performance)
  const maxDim = 1000;
  const scale = Math.min(1.0, maxDim / Math.max(width, height));
  const canvasW = Math.max(20, Math.round(width * scale));
  const canvasH = Math.max(20, Math.round(height * scale));

  // Cria canvas offscreen
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasW;
  offscreen.height = canvasH;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.imageSmoothingEnabled = true;

  // Aplica as operações booleanas via GlobalCompositeOperation
  ctx.fillStyle = '#ffffff';

  if (operation === 'union') {
    // União / Soldar (Weld): Desenha A, depois desenha B unindo contornos
    drawShapeSolid(ctx, shapeA, minX, minY, scale);
    ctx.globalCompositeOperation = 'source-over';
    drawShapeSolid(ctx, shapeB, minX, minY, scale);

  } else if (operation === 'intersect') {
    // Interseção (Intersect): Mantém apenas a área comum onde B cruza A
    drawShapeSolid(ctx, shapeA, minX, minY, scale);
    ctx.globalCompositeOperation = 'source-in';
    drawShapeSolid(ctx, shapeB, minX, minY, scale);

  } else if (operation === 'subtract' || operation === 'trim') {
    // Aparar / Subtrair (A - B): O objeto B (superior) apara/recorta o objeto A (inferior)
    drawShapeSolid(ctx, shapeA, minX, minY, scale);
    ctx.globalCompositeOperation = 'destination-out';
    drawShapeSolid(ctx, shapeB, minX, minY, scale);

  } else if (operation === 'subtract-reverse') {
    // Subtrair Inverso (B - A): O objeto A (inferior) apara/recorta o objeto B (superior)
    drawShapeSolid(ctx, shapeB, minX, minY, scale);
    ctx.globalCompositeOperation = 'destination-out';
    drawShapeSolid(ctx, shapeA, minX, minY, scale);

  } else if (operation === 'exclude') {
    // Excluir Sobreposição (XOR): Mantém apenas as áreas externas não sobrepostas
    drawShapeSolid(ctx, shapeA, minX, minY, scale);
    ctx.globalCompositeOperation = 'xor';
    drawShapeSolid(ctx, shapeB, minX, minY, scale);
  }

  // 2. Extrai o contorno contínuo da máscara alfa
  const imgData = ctx.getImageData(0, 0, canvasW, canvasH);
  const data = imgData.data;

  const isFilled = (x, y) => {
    if (x < 0 || x >= canvasW || y < 0 || y >= canvasH) return false;
    const idx = (y * canvasW + x) * 4;
    return data[idx + 3] > 80; // Alpha significativo
  };

  // Encontra o primeiro pixel preenchido da borda superior
  let startX = -1;
  let startY = -1;

  outerLoop: for (let y = 0; y < canvasH; y++) {
    for (let x = 0; x < canvasW; x++) {
      if (isFilled(x, y)) {
        startX = x;
        startY = y;
        break outerLoop;
      }
    }
  }

  if (startX === -1) {
    return []; // Operação resultou em formato vazio
  }

  // Rastreamento de contorno robusto (Moore-Neighbor com Jacob's Stopping Criterion)
  const contour = [];
  let currX = startX;
  let currY = startY;

  // 8 direções no sentido horário: [dx, dy]
  const dirs = [
    { dx: 0, dy: -1 }, // 0: N
    { dx: 1, dy: -1 }, // 1: NE
    { dx: 1, dy: 0 },  // 2: E
    { dx: 1, dy: 1 },  // 3: SE
    { dx: 0, dy: 1 },  // 4: S
    { dx: -1, dy: 1 }, // 5: SW
    { dx: -1, dy: 0 }, // 6: W
    { dx: -1, dy: -1 } // 7: NW
  ];

  let dirIndex = 0;
  let checkDir = 6; // Começa olhando 90 graus à esquerda
  let firstStepDir = -1;
  const maxSteps = canvasW * canvasH * 3;
  let steps = 0;

  contour.push({
    x: minX + currX / scale,
    y: minY + currY / scale
  });

  while (steps++ < maxSteps) {
    let foundNext = false;

    for (let i = 0; i < 8; i++) {
      const idx = (checkDir + i) % 8;
      const nx = currX + dirs[idx].dx;
      const ny = currY + dirs[idx].dy;

      if (isFilled(nx, ny)) {
        currX = nx;
        currY = ny;
        dirIndex = idx;
        checkDir = (idx + 6) % 8;
        foundNext = true;
        break;
      }
    }

    if (!foundNext) break;

    if (firstStepDir === -1) {
      firstStepDir = dirIndex;
    }

    contour.push({
      x: minX + currX / scale,
      y: minY + currY / scale
    });

    // Condição de parada de Jacob: voltou ao ponto inicial na mesma direção após pelo menos 4 passos
    if (currX === startX && currY === startY && dirIndex === firstStepDir && contour.length > 4) {
      break;
    }
  }

  // 3. Suaviza e simplifica o contorno com tolerância calibrada para preservar esquinas e pontas finas
  return simplifyPolygon(contour, 0.9);
}

/**
 * Algoritmo de Douglas-Peucker para simplificação de polígonos
 * Preserva vértices angulares significativos e remove apenas pontos redundantes em retas.
 */
function simplifyPolygon(points, tolerance = 0.9) {
  if (!points || points.length <= 4) return points || [];

  function getSqSegDist(p, p1, p2) {
    let x = p1.x;
    let y = p1.y;
    let dx = p2.x - x;
    let dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {
      const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
      if (t > 1) {
        x = p2.x;
        y = p2.y;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;
    return dx * dx + dy * dy;
  }

  function simplifyStep(pts, first, last, sqTol, simplified) {
    let maxSqDist = sqTol;
    let index = -1;

    for (let i = first + 1; i < last; i++) {
      const sqDist = getSqSegDist(pts[i], pts[first], pts[last]);
      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTol) {
      if (index - first > 1) simplifyStep(pts, first, index, sqTol, simplified);
      simplified.push(pts[index]);
      if (last - index > 1) simplifyStep(pts, index, last, sqTol, simplified);
    }
  }

  const last = points.length - 1;
  const simplified = [points[0]];
  simplifyStep(points, 0, last, tolerance * tolerance, simplified);
  simplified.push(points[last]);

  return simplified;
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

  // Executa a operação booleana passando diretamente os nós para renderização vetorial precisa
  const resultPts = performBooleanOperation(backNode, frontNode, operation);
  if (!resultPts || resultPts.length < 3) return null;

  // Define os atributos do novo nó resultante:
  // - Para 'subtract' (Aparar: Frente corta Fundo), o estilo vem do nó inferior (recortado)
  // - Para 'subtract-reverse' (Subtrair: Fundo corta Frente), o estilo vem do nó superior (recortado)
  // - Para 'union' e 'intersect', adota as cores do nó superior ativo
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
    fill: targetStyleNode.fill || '#8b5cf6',
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
