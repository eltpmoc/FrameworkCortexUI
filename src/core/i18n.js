// src/core/i18n.js
/**
 * CortexUI i18n — Internacionalização Central (Português PT-BR / English).
 *
 * Contrato de uso nos componentes:
 *
 *   import { t, tx, registerMessages } from '../core/i18n.js';
 *
 *   registerMessages({
 *     'pt-BR': { 'kanban.addTask': 'Adicionar Tarefa', 'kanban.moved': 'Card {room} movido para "{col}"' },
 *     en:      { 'kanban.addTask': 'Add Task',         'kanban.moved': 'Card {room} moved to "{col}"' }
 *   });
 *
 *   t('kanban.addTask');                          // -> texto no idioma ativo
 *   t('kanban.moved', { room: '507', col: 'Done' }); // -> interpolação {param}
 *   tx({ 'pt-BR': 'Olá', en: 'Hello' });          // -> texto inline bilíngue (útil em datasets / docs)
 *
 * O idioma ativo fica em AppState ('language'), é persistido em localStorage ('cortex_lang')
 * e qualquer CortexElement é re-renderizado automaticamente ao trocar o idioma
 * (ver CortexElement.onLanguageChange()).
 */

import { AppState } from './Store.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'pt-BR', label: 'Português (BR)', short: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇺🇸' }
];

export const DEFAULT_LANGUAGE = 'pt-BR';
const STORAGE_KEY = 'cortex_lang';

const MESSAGES = { 'pt-BR': {}, en: {} };

function normalizeLanguage(code) {
  if (!code) return DEFAULT_LANGUAGE;
  const lower = String(code).toLowerCase();
  if (lower.startsWith('pt')) return 'pt-BR';
  if (lower.startsWith('en')) return 'en';
  return DEFAULT_LANGUAGE;
}

function readSavedLanguage() {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeLanguage(saved);
    }
  } catch (_e) {
    // localStorage bloqueado: usa o padrão
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Registra (mescla) um dicionário de mensagens por idioma.
 * Cada componente registra suas próprias chaves com prefixo (ex: 'kanban.*', 'docs.*').
 */
export function registerMessages(dict = {}) {
  Object.entries(dict).forEach(([lang, entries]) => {
    const code = normalizeLanguage(lang);
    MESSAGES[code] = Object.assign(MESSAGES[code] || {}, entries || {});
  });
}

export function getLanguage() {
  return AppState.get('language') || DEFAULT_LANGUAGE;
}

export function setLanguage(code) {
  const next = normalizeLanguage(code);
  AppState.setState({ language: next });
  return next;
}

export function toggleLanguage() {
  return setLanguage(getLanguage() === 'pt-BR' ? 'en' : 'pt-BR');
}

function interpolate(str, params) {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (m, name) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m
  );
}

/**
 * Traduz uma chave registrada. Fallback: idioma ativo -> pt-BR -> en -> a própria chave.
 */
export function t(key, params) {
  const lang = getLanguage();
  const str =
    MESSAGES[lang]?.[key] ?? MESSAGES[DEFAULT_LANGUAGE]?.[key] ?? MESSAGES.en?.[key] ?? key;
  return interpolate(String(str), params);
}

/**
 * Resolve um valor inline bilíngue: string simples ou { 'pt-BR': '...', en: '...' }.
 */
export function tx(value, params) {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return interpolate(String(value), params);
  const lang = getLanguage();
  const str = value[lang] ?? value[DEFAULT_LANGUAGE] ?? value.en ?? '';
  return interpolate(String(str), params);
}

/** Locale BCP-47 do idioma ativo para APIs Intl. */
export function getLocale() {
  return getLanguage() === 'en' ? 'en-US' : 'pt-BR';
}

/** Nomes dos meses no idioma ativo (format: 'long' | 'short'). */
export function getMonthNames(format = 'long') {
  const fmt = new Intl.DateTimeFormat(getLocale(), { month: format });
  return Array.from({ length: 12 }, (_, m) => {
    const name = fmt.format(new Date(2021, m, 1));
    return name.charAt(0).toUpperCase() + name.slice(1);
  });
}

/** Nomes dos dias da semana (Domingo primeiro) no idioma ativo (format: 'long' | 'short' | 'narrow'). */
export function getWeekdayNames(format = 'short') {
  const fmt = new Intl.DateTimeFormat(getLocale(), { weekday: format });
  // 3 de janeiro de 2021 foi um domingo
  return Array.from({ length: 7 }, (_, d) => {
    const name = fmt.format(new Date(2021, 0, 3 + d)).replace('.', '');
    return name.charAt(0).toUpperCase() + name.slice(1);
  });
}

/** Formata uma data no idioma ativo. */
export function formatDate(date, options = { day: 'numeric', month: 'numeric', year: 'numeric' }) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(getLocale(), options).format(d);
}

/** Formata um horário (ex: 9:30 AM / 09:30) no idioma ativo. */
export function formatTime(hours, minutes = 0) {
  const d = new Date(2021, 0, 1, hours, minutes);
  return new Intl.DateTimeFormat(getLocale(), { hour: 'numeric', minute: '2-digit' }).format(d);
}

/* ----------------------------------------------------------------------------
 * Mensagens comuns compartilhadas por todo o framework ('common.*', 'lang.*')
 * -------------------------------------------------------------------------- */
registerMessages({
  'pt-BR': {
    'common.ok': 'OK',
    'common.save': 'Salvar',
    'common.saveChanges': 'Salvar Alterações',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.add': 'Adicionar',
    'common.create': 'Criar',
    'common.close': 'Fechar',
    'common.apply': 'Aplicar',
    'common.confirm': 'Confirmar',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar...',
    'common.all': '(Todos)',
    'common.yes': 'Sim',
    'common.no': 'Não',
    'common.loading': 'Carregando...',
    'common.today': 'Hoje',
    'common.clear': 'Limpar',
    'common.export': 'Exportar',
    'common.refresh': 'Atualizar',
    'common.undo': 'Desfazer',
    'common.redo': 'Refazer',
    'common.copy': 'Copiar',
    'common.copied': 'Copiado!',
    'common.openCalendar': 'Abrir Calendário',
    'common.prevMonth': 'Mês anterior',
    'common.nextMonth': 'Próximo mês',
    'common.systemNotice': 'Aviso do Sistema',
    'common.confirmation': 'Confirmação',
    'common.confirmContinue': 'Tem certeza que deseja continuar?',
    'common.dataEntry': 'Entrada de Dados',
    'common.settings': 'Configurações',
    'common.deleteConfirm': 'Deseja realmente excluir "{name}"?',
    'lang.label': 'Idioma',
    'lang.changed': 'Idioma alterado para Português (BR)',
    'lang.pt-BR': 'Português (BR)',
    'lang.en': 'English',

    // Menus
    'menu.file': 'Arquivo',
    'menu.edit': 'Editar',
    'menu.layout': 'Layout',
    'menu.type': 'Texto',
    'menu.object': 'Objeto',
    'menu.table': 'Tabela',
    'menu.documents': 'Documentos',
    'menu.chat': 'Chat & Mensagens',
    'menu.view': 'Exibir',
    'menu.window': 'Janela',
    'menu.help': 'Ajuda',
    'menu.newDoc': 'Novo Documento',
    'menu.openJson': 'Abrir / Importar JSON...',
    'menu.saveJson': 'Salvar / Exportar JSON...',
    'menu.exportImage': 'Exportar Imagem...',
    'menu.close': 'Fechar',
    'menu.undo': 'Desfazer',
    'menu.redo': 'Refazer',
    'menu.cut': 'Recortar',
    'menu.copy': 'Copiar',
    'menu.paste': 'Colar',
    'menu.duplicate': 'Duplicar',
    'menu.delete': 'Excluir',
    'menu.insertPage': 'Inserir Página',
    'menu.marginsGuides': 'Margens e Colunas...',
    'menu.toggleFacing': 'Alternar Páginas Opostas',
    'menu.insertText': 'Inserir Caixa de Texto',
    'menu.fontSizeUp': 'Aumentar Tamanho da Fonte',
    'menu.fontSizeDown': 'Diminuir Tamanho da Fonte',
    'menu.insertRect': 'Inserir Retângulo',
    'menu.insertLine': 'Inserir Linha',
    'menu.bringFront': 'Trazer para Frente',
    'menu.sendBack': 'Enviar para Trás',
    'menu.insertTable': 'Inserir Tabela...',
    'menu.zoomIn': 'Aumentar Zoom',
    'menu.zoomOut': 'Diminuir Zoom',
    'menu.zoomReset': 'Tamanho Real (100%)',
    'menu.rulers': 'Mostrar / Ocultar Réguas',
    'menu.guides': 'Mostrar / Ocultar Guias',
    'menu.grid': 'Mostrar / Ocultar Grade',

    // Schedulers
    'scheduler.day': 'Dia',
    'scheduler.week': 'Semana',
    'scheduler.workWeek': 'Semana Útil',
    'scheduler.month': 'Mês',
    'scheduler.allDay': 'Dia inteiro',
    'scheduler.newAppointment': 'Novo Agendamento',
    'scheduler.editAppointment': 'Editar Agendamento',
    'scheduler.service': 'Tipo de Serviço',
    'scheduler.room': 'Quarto / Local',
    'scheduler.resource': 'Profissional',
    'scheduler.startTime': 'Horário Inicial',
    'scheduler.duration': 'Duração (blocos de 30m)',
    'scheduler.appointmentDeleted': 'Agendamento "{name}" excluído.',
    'scheduler.appointmentUpdated': 'Agendamento "{name}" atualizado!',
    'scheduler.appointmentCreated': 'Agendamento "{name}" criado!',
    'scheduler.dragMoved': 'Agendamento "{title}" movido para {resource} às {time}',

    // Tasks Grid (DevExtreme)
    'tasks.title': 'Tasks',
    'tasks.taskId': 'Task ID',
    'tasks.subject': 'Subject',
    'tasks.status': 'Status',
    'tasks.priority': 'Priority',
    'tasks.assignedTo': 'Assigned To',
    'tasks.startDate': 'Start Date',
    'tasks.dueDate': 'Due Date',
    'tasks.priorityCode': 'Priority',
    'tasks.filterPlaceholder': 'Filtrar...',
    'tasks.editTask': 'Editar Tarefa #{id} - {subject}',
    'tasks.createTask': 'Nova Tarefa',
    'tasks.itemsPerPage': 'Itens por página:',
    'tasks.of': 'de',
    'tasks.page': 'Página',

    // Kanban
    'kanban.addTask': '+ ADICIONAR TAREFA',
    'kanban.taskSearch': 'Buscar Tarefa...',
    'kanban.planned': 'Planejado',
    'kanban.inProgress': 'Em Andamento',
    'kanban.done': 'Concluído',
    'kanban.cardMoved': 'Card {room} movido para "{col}"',
    'kanban.resetBoard': 'Restaurar Quadro Inicial',

    // Gantt
    'gantt.title': 'Planejamento do Projeto (Gantt)',
    'gantt.task': 'Tarefa',
    'gantt.start': 'Início',
    'gantt.end': 'Fim',
    'gantt.duration': 'Duração',
    'gantt.progress': 'Progresso',
    'gantt.predecessor': 'Predecessora',
    'gantt.days': 'dias',
    'gantt.editTask': 'Editar Tarefa Gantt',
    'gantt.undoSuccess': 'Ação desfeita com sucesso.',
    'gantt.redoSuccess': 'Ação refeita com sucesso.',

    // Inspector & Document
    'inspector.noSelection': 'Nenhuma Seleção',
    'inspector.selected': 'Selecionado',
    'inspector.name': 'Nome',
    'inspector.fill': 'Preenchimento',
    'inspector.stroke': 'Contorno',
    'inspector.document': 'Documento',
    'inspector.facingPages': 'Páginas Opostas',
    'inspector.margins': 'Margens',
    'inspector.rulersAndGrids': 'Réguas & Grades',
    'inspector.rulers': 'Réguas',
    'inspector.guides': 'Guias',
    'inspector.grid': 'Grade',
    'inspector.quickActions': 'Ações Rápidas',
    'inspector.addRect': '+ Adicionar Retângulo',
    'inspector.exportJson': 'Exportar JSON',
    'inspector.importJson': 'Importar JSON',
    'inspector.pages': 'Páginas',
    'inspector.addPage': '+ Nova Página',
    'inspector.page': 'Página',
    'inspector.tabProperties': 'Propriedades',
    'inspector.tabPages': 'Páginas',
    'inspector.tabLayers': 'Camadas',
    'inspector.toggleDrawer': 'Abrir/Fechar Inspector',

    // Layers
    'layers.title': 'Camadas',
    'layers.count': '{count} objeto(s) na Página {page}',
    'layers.front': 'Topo',
    'layers.back': 'Base',
    'layers.frontTitle': 'Trazer para Frente (Topo)',
    'layers.backTitle': 'Enviar para Trás (Base)',
    'layers.empty': 'Nenhuma camada nesta página.<br/>Adicione formas ou textos no palco.',
    'layers.dragHint': 'Arraste para reordenar Z-Index',
    'layers.renameHint': 'Duplo clique para renomear',
    'layers.hide': 'Ocultar Camada',
    'layers.show': 'Mostrar Camada',
    'layers.lock': 'Bloquear Camada',
    'layers.unlock': 'Desbloquear Camada',
    'layers.delete': 'Excluir Camada',
    'layers.renameTitle': 'Renomear Camada',
    'layers.renamePrompt': 'Informe o novo nome para esta camada:',

    // Statusbar & Menubar
    'statusbar.page': 'Pág:',
    'statusbar.prevPage': 'Página Anterior',
    'statusbar.nextPage': 'Próxima Página / Adicionar Página',
    'statusbar.zoomIn': 'Aumentar Zoom',
    'statusbar.zoomOut': 'Diminuir Zoom',
    'statusbar.engineActive': 'Motor Gráfico 2D Ativo (60 FPS)',
    'statusbar.working': '[Básico] (trabalhando) • Sem erros',
    'menubar.docs': 'Docs & Manual',
    'menubar.login': 'Login UI (10)',
    'menubar.theme': 'Tema',
    'menubar.workspace': 'Área de Trabalho',
    'menubar.search': 'Pesquisar...',

    // Tools
    'tool.select': 'Ferramenta de Seleção (V)',
    'tool.direct-select': 'Ferramenta de Seleção Direta (A)',
    'tool.rect': 'Forma Retangular (M)',
    'tool.rounded-rect': 'Retângulo Arredondado (U)',
    'tool.ellipse': 'Círculo / Elipse (O)',
    'tool.polygon': 'Polígono / Triângulo (G)',
    'tool.star': 'Estrela Vetorial (S)',
    'tool.diamond': 'Losango / Fluxograma (D)',
    'tool.line': 'Ferramenta de Linha (L)',
    'tool.arrow': 'Seta Vetorial (W)',
    'tool.pen': 'Ferramenta Caneta Bézier (P)',
    'tool.pencil': 'Lápis / Desenho Livre (N)',
    'tool.text': 'Ferramenta de Texto (T)',
    'tool.callout': 'Balão de Mensagem (C)',
    'tool.rotate': 'Ferramenta Girar Objeto (R)',
    'tool.eyedropper': 'Conta-gotas / Copiar Cor (I)',
    'tool.eraser': 'Borracha / Excluir (E)',
    'tool.pan': 'Ferramenta Mão / Rolagem (H)',
    'tool.zoom': 'Ferramenta de Zoom (Z)'
  },
  en: {
    'common.ok': 'OK',
    'common.save': 'Save',
    'common.saveChanges': 'Save Changes',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.create': 'Create',
    'common.close': 'Close',
    'common.apply': 'Apply',
    'common.confirm': 'Confirm',
    'common.search': 'Search',
    'common.filter': 'Filter...',
    'common.all': '(All)',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.loading': 'Loading...',
    'common.today': 'Today',
    'common.clear': 'Clear',
    'common.export': 'Export',
    'common.refresh': 'Refresh',
    'common.undo': 'Undo',
    'common.redo': 'Redo',
    'common.copy': 'Copy',
    'common.copied': 'Copied!',
    'common.openCalendar': 'Open Calendar',
    'common.prevMonth': 'Previous month',
    'common.nextMonth': 'Next month',
    'common.systemNotice': 'System Notice',
    'common.confirmation': 'Confirmation',
    'common.confirmContinue': 'Are you sure you want to continue?',
    'common.dataEntry': 'Data Entry',
    'common.settings': 'Settings',
    'common.deleteConfirm': 'Do you really want to delete "{name}"?',
    'lang.label': 'Language',
    'lang.changed': 'Language changed to English',
    'lang.pt-BR': 'Português (BR)',
    'lang.en': 'English',

    // Menus
    'menu.file': 'File',
    'menu.edit': 'Edit',
    'menu.layout': 'Layout',
    'menu.type': 'Type',
    'menu.object': 'Object',
    'menu.table': 'Table',
    'menu.documents': 'Documents',
    'menu.chat': 'Chat & Messages',
    'menu.view': 'View',
    'menu.window': 'Window',
    'menu.help': 'Help',
    'menu.newDoc': 'New Document',
    'menu.openJson': 'Open / Import JSON...',
    'menu.saveJson': 'Save / Export JSON...',
    'menu.exportImage': 'Export Image...',
    'menu.close': 'Close',
    'menu.undo': 'Undo',
    'menu.redo': 'Redo',
    'menu.cut': 'Cut',
    'menu.copy': 'Copy',
    'menu.paste': 'Paste',
    'menu.duplicate': 'Duplicate',
    'menu.delete': 'Delete',
    'menu.insertPage': 'Insert Page',
    'menu.marginsGuides': 'Margins and Columns...',
    'menu.toggleFacing': 'Toggle Facing Pages',
    'menu.insertText': 'Insert Text Frame',
    'menu.fontSizeUp': 'Increase Font Size',
    'menu.fontSizeDown': 'Decrease Font Size',
    'menu.insertRect': 'Insert Rectangle',
    'menu.insertLine': 'Insert Line',
    'menu.bringFront': 'Bring to Front',
    'menu.sendBack': 'Send to Back',
    'menu.insertTable': 'Insert Table...',
    'menu.zoomIn': 'Zoom In',
    'menu.zoomOut': 'Zoom Out',
    'menu.zoomReset': 'Actual Size (100%)',
    'menu.rulers': 'Show / Hide Rulers',
    'menu.guides': 'Show / Hide Guides',
    'menu.grid': 'Show / Hide Grid',

    // Schedulers
    'scheduler.day': 'Day',
    'scheduler.week': 'Week',
    'scheduler.workWeek': 'Work Week',
    'scheduler.month': 'Month',
    'scheduler.allDay': 'All day',
    'scheduler.newAppointment': 'New Appointment',
    'scheduler.editAppointment': 'Edit Appointment',
    'scheduler.service': 'Service Type',
    'scheduler.room': 'Room / Location',
    'scheduler.resource': 'Resource / Staff',
    'scheduler.startTime': 'Start Time',
    'scheduler.duration': 'Duration (30m slots)',
    'scheduler.appointmentDeleted': 'Appointment "{name}" deleted.',
    'scheduler.appointmentUpdated': 'Appointment "{name}" updated!',
    'scheduler.appointmentCreated': 'Appointment "{name}" created!',
    'scheduler.dragMoved': 'Appointment "{title}" moved to {resource} at {time}',

    // Tasks Grid (DevExtreme)
    'tasks.title': 'Tasks',
    'tasks.taskId': 'Task ID',
    'tasks.subject': 'Subject',
    'tasks.status': 'Status',
    'tasks.priority': 'Priority',
    'tasks.assignedTo': 'Assigned To',
    'tasks.startDate': 'Start Date',
    'tasks.dueDate': 'Due Date',
    'tasks.priorityCode': 'Priority',
    'tasks.filterPlaceholder': 'Filter...',
    'tasks.editTask': 'Edit Task #{id} - {subject}',
    'tasks.createTask': 'New Task',
    'tasks.itemsPerPage': 'Items per page:',
    'tasks.of': 'of',
    'tasks.page': 'Page',

    // Kanban
    'kanban.addTask': '+ ADD TASK',
    'kanban.taskSearch': 'Task Search',
    'kanban.planned': 'Planned',
    'kanban.inProgress': 'In Progress',
    'kanban.done': 'Done',
    'kanban.cardMoved': 'Card {room} moved to "{col}"',
    'kanban.resetBoard': 'Restore Initial Board',

    // Gantt
    'gantt.title': 'Project Planning (Gantt)',
    'gantt.task': 'Task',
    'gantt.start': 'Start',
    'gantt.end': 'End',
    'gantt.duration': 'Duration',
    'gantt.progress': 'Progress',
    'gantt.predecessor': 'Predecessor',
    'gantt.days': 'days',
    'gantt.editTask': 'Edit Gantt Task',
    'gantt.undoSuccess': 'Action undone successfully.',
    'gantt.redoSuccess': 'Action redone successfully.',

    // Inspector & Document
    'inspector.noSelection': 'No Selection',
    'inspector.selected': 'Selected',
    'inspector.name': 'Name',
    'inspector.fill': 'Fill',
    'inspector.stroke': 'Stroke',
    'inspector.document': 'Document',
    'inspector.facingPages': 'Facing Pages',
    'inspector.margins': 'Margins',
    'inspector.rulersAndGrids': 'Rulers & Grids',
    'inspector.rulers': 'Rulers',
    'inspector.guides': 'Guides',
    'inspector.grid': 'Grid',
    'inspector.quickActions': 'Quick Actions',
    'inspector.addRect': '+ Add Rectangle',
    'inspector.exportJson': 'Export JSON',
    'inspector.importJson': 'Import JSON',
    'inspector.pages': 'Pages',
    'inspector.addPage': '+ New Page',
    'inspector.page': 'Page',
    'inspector.tabProperties': 'Properties',
    'inspector.tabPages': 'Pages',
    'inspector.tabLayers': 'Layers',
    'inspector.toggleDrawer': 'Open/Close Inspector',

    // Layers
    'layers.title': 'Layers',
    'layers.count': '{count} object(s) on Page {page}',
    'layers.front': 'Top',
    'layers.back': 'Bottom',
    'layers.frontTitle': 'Bring to Front (Top)',
    'layers.backTitle': 'Send to Back (Bottom)',
    'layers.empty': 'No layers on this page.<br/>Add shapes or text to the canvas.',
    'layers.dragHint': 'Drag to reorder Z-Index',
    'layers.renameHint': 'Double click to rename',
    'layers.hide': 'Hide Layer',
    'layers.show': 'Show Layer',
    'layers.lock': 'Lock Layer',
    'layers.unlock': 'Unlock Layer',
    'layers.delete': 'Delete Layer',
    'layers.renameTitle': 'Rename Layer',
    'layers.renamePrompt': 'Enter the new name for this layer:',

    // Statusbar & Menubar
    'statusbar.page': 'Page:',
    'statusbar.prevPage': 'Previous Page',
    'statusbar.nextPage': 'Next Page / Add Page',
    'statusbar.zoomIn': 'Zoom In',
    'statusbar.zoomOut': 'Zoom Out',
    'statusbar.engineActive': 'Canvas 2D Engine Active (60 FPS)',
    'statusbar.working': '[Basic] (working) • No errors',
    'menubar.docs': 'Docs & Manual',
    'menubar.login': 'Login UI (10)',
    'menubar.theme': 'Theme',
    'menubar.workspace': 'Workspace',
    'menubar.search': 'Search...',

    // Tools
    'tool.select': 'Selection Tool (V)',
    'tool.direct-select': 'Direct Selection Tool (A)',
    'tool.rect': 'Rectangle Tool (M)',
    'tool.rounded-rect': 'Rounded Rectangle (U)',
    'tool.ellipse': 'Ellipse / Circle Tool (O)',
    'tool.polygon': 'Polygon / Triangle Tool (G)',
    'tool.star': 'Star Tool (S)',
    'tool.diamond': 'Diamond / Flowchart Tool (D)',
    'tool.line': 'Line Tool (L)',
    'tool.arrow': 'Arrow Tool (W)',
    'tool.pen': 'Pen Tool / Bézier (P)',
    'tool.pencil': 'Pencil / Freehand Brush (N)',
    'tool.text': 'Type Tool (T)',
    'tool.callout': 'Callout / Speech Bubble (C)',
    'tool.rotate': 'Rotate Tool (R)',
    'tool.eyedropper': 'Eyedropper / Color Picker (I)',
    'tool.eraser': 'Eraser Tool (E)',
    'tool.pan': 'Hand / Pan Tool (H)',
    'tool.zoom': 'Zoom Tool (Z)'
  }
});

/* ----------------------------------------------------------------------------
 * Inicialização: idioma salvo -> AppState, <html lang>, persistência e evento global
 * -------------------------------------------------------------------------- */
const initialLanguage = readSavedLanguage();
AppState.setState({ language: initialLanguage });

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('lang', initialLanguage);
}

AppState.subscribe('language', (next) => {
  const lang = normalizeLanguage(next);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lang);
  }
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.setItem === 'function') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  } catch (_e) {
    // Ignora caso localStorage esteja bloqueado
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cortex-language-change', { detail: { language: lang } }));
  }
});

export const I18n = {
  t,
  tx,
  registerMessages,
  getLanguage,
  setLanguage,
  toggleLanguage,
  getLocale,
  getMonthNames,
  getWeekdayNames,
  formatDate,
  formatTime,
  SUPPORTED_LANGUAGES
};

if (typeof window !== 'undefined') {
  window.CortexI18n = I18n;
}
