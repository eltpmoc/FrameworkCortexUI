// src/components/cortex-document-management.js
/**
 * CortexUI Document Management Suite
 * Módulo agregador dos 5 componentes corporativos de documentos:
 * 1. Office File API (<cortex-office-api>) - Word, Excel, PDF/PowerPoint, faturas, balanços e exportação nativa
 * 2. Spreadsheet (<cortex-spreadsheet>) - Planilha eletrônica com abas Ribbon, fórmulas e gráficos vetoriais (Pie & Bar)
 * 3. Rich Edit (<cortex-rich-edit>) - Editor de texto estilo Word com Ribbon, régua, folha A4 e legendas (Captions)
 * 4. File Manager (<cortex-file-manager>) - Gerenciador de arquivos com árvore, tabela, grid e menu de contexto
 * 5. File Uploader (<cortex-file-uploader>) - Upload moderno com Drag & Drop, progresso animado e limite de 15 MB
 *
 * 100% nativo, sem bibliotecas externas, sob licença MIT.
 */

export { CortexOfficeApi } from './document/cortex-office-api.js';
export { CortexSpreadsheet } from './document/cortex-spreadsheet.js';
export { CortexRichEdit } from './document/cortex-rich-edit.js';
export { CortexFileManager } from './document/cortex-file-manager.js';
export { CortexFileUploader } from './document/cortex-file-uploader.js';
