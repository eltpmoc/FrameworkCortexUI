// src/engine/nodes/index.js
import { CortexNode } from './CortexNode.js';
import { CortexRect } from './CortexRect.js';
import { CortexLine } from './CortexLine.js';
import { CortexText } from './CortexText.js';
import { CortexPath } from './CortexPath.js';
import { CortexEllipse } from './CortexEllipse.js';
import { CortexPolygon } from './CortexPolygon.js';
import { CortexStar } from './CortexStar.js';
import { CortexDiamond } from './CortexDiamond.js';
import { CortexArrow } from './CortexArrow.js';
import { CortexCallout } from './CortexCallout.js';

export {
  CortexNode,
  CortexRect,
  CortexLine,
  CortexText,
  CortexPath,
  CortexEllipse,
  CortexPolygon,
  CortexStar,
  CortexDiamond,
  CortexArrow,
  CortexCallout
};

/**
 * Fábrica para instanciar ou hidratar nós gráficos a partir de JSON.
 */
export function createNodeFromJSON(data = {}) {
  switch (data.type) {
    case 'rect':
    case 'rounded-rect':
      return new CortexRect(data);
    case 'ellipse':
    case 'circle':
      return new CortexEllipse(data);
    case 'polygon':
    case 'triangle':
      return new CortexPolygon(data);
    case 'star':
      return new CortexStar(data);
    case 'diamond':
      return new CortexDiamond(data);
    case 'arrow':
      return new CortexArrow(data);
    case 'callout':
      return new CortexCallout(data);
    case 'line':
      return new CortexLine(data);
    case 'text':
      return new CortexText(data);
    case 'path':
    case 'pencil':
      return new CortexPath(data);
    default:
      return new CortexRect(data);
  }
}
