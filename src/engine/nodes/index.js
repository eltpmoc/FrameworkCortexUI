// src/engine/nodes/index.js
import { CortexNode } from './CortexNode.js';
import { CortexRect } from './CortexRect.js';
import { CortexLine } from './CortexLine.js';
import { CortexText } from './CortexText.js';
import { CortexPath } from './CortexPath.js';

export { CortexNode, CortexRect, CortexLine, CortexText, CortexPath };

/**
 * Fábrica para instanciar ou hidratar nós gráficos a partir de JSON.
 */
export function createNodeFromJSON(data = {}) {
  switch (data.type) {
    case 'rect':
      return new CortexRect(data);
    case 'line':
      return new CortexLine(data);
    case 'text':
      return new CortexText(data);
    case 'path':
      return new CortexPath(data);
    default:
      return new CortexRect(data);
  }
}
