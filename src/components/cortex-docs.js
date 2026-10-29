// src/components/cortex-docs.js
import { CortexElement } from '../core/CortexElement.js';
import { AppState } from '../core/Store.js';
import { CortexModal } from './cortex-modal.js';
import { CortexMask } from '../core/RouterAndUtils.js';
import { t, tx, getLanguage, toggleLanguage } from '../core/i18n.js';
import './cortex-color-picker.js';
import './cortex-font-picker.js';
import './cortex-widgets.js';
import './cortex-enterprise-views.js';
import './cortex-planning-views.js';
import './cortex-advanced-views.js';

const DOC_SECTIONS = [
  {
    category: '🚀 Introdução & Arquitetura',
    items: [
      {
        id: 'getting-started',
        title: '⚡ Início Rápido (Quick Start)',
        tag: 'Arquitetura ES6',
        badge: 'Zero Dependências',
        summary:
          'Estrutura base do Framework CortexUI utilizando Web Components nativos (Custom Elements + Shadow DOM), CSS Custom Properties e ES6 Modules.',
        previewType: 'quickstart',
        code: `<!DOCTYPE html>
<html lang="pt-BR" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="./src/styles/theme.css" />
</head>
<body>
  <!-- Casca Desktop Universal CortexUI -->
  <div class="cortex-shell">
    <cortex-menubar app-badge="Cx" app-name="MinhaAppDesktop"></cortex-menubar>
    <cortex-tabbar></cortex-tabbar>
    <cortex-toolbar></cortex-toolbar>
    <cortex-workspace></cortex-workspace>
    <cortex-inspector></cortex-inspector>
    <cortex-statusbar></cortex-statusbar>
  </div>

  <!-- Overlays e Utilitários Globais -->
  <cortex-context-menu></cortex-context-menu>
  <cortex-command-palette></cortex-command-palette>
  <cortex-floating-window></cortex-floating-window>
  <cortex-login></cortex-login>
  <cortex-modal></cortex-modal>

  <script type="module" src="./src/index.js"></script>
</body>
</html>`,
        api: [
          { name: 'CortexElement', type: 'Base Class', desc: 'Classe base para todos os Web Components com Shadow DOM, baseStyles, watchState() e emit().' },
          { name: '.cortex-shell', type: 'CSS Grid Layout', desc: 'Grid responsivo Desktop de 5 zonas (Menubar, Tabbar, Toolbar, Workspace, Inspector e Statusbar).' },
          { name: 'window.CortexUI', type: 'Global Namespace', desc: 'Expõe { AppState, EventBus, CortexModal } globalmente para fácil integração e depuração.' }
        ]
      },
      {
        id: 'store-eventbus',
        title: '🔄 Store Reativo & EventBus',
        tag: 'AppState / EventBus',
        badge: 'Observer Pattern',
        summary:
          'Gerenciamento centralizado de estado com histórico de Undo/Redo integrado e sincronização automática entre Web Components e o motor Canvas 2D.',
        previewType: 'store-demo',
        code: `import { AppState } from './src/core/Store.js';
import { EventBus } from './src/core/EventBus.js';

// 1. Ler ou alterar estados globais reativos
const paginaAtual = AppState.get('currentPage');
AppState.setState({
  zoom: 125,
  fillColor: '#00f0ff',
  theme: 'futuristic'
});

// 2. Escutar mudanças em propriedades específicas
const unsubscribe = AppState.subscribe('fillColor', (novaCor, estadoCompleto) => {
  console.log('Cor de preenchimento atualizada:', novaCor);
});

// 3. Em um Web Component herdando de CortexElement:
this.watchState(['selectedNodeId', 'currentPage'], (val, key) => {
  this.render();
});

// 4. Undo / Redo de Histórico da Cena
if (AppState.canUndo()) AppState.undo();
if (AppState.canRedo()) AppState.redo();`,
        api: [
          { name: 'AppState.get(key)', type: 'Method', desc: 'Retorna o valor atual de uma chave da Store (ex: theme, zoom, currentPage, activeTool, sceneNodes).' },
          { name: 'AppState.setState(partial)', type: 'Method', desc: 'Atualiza uma ou mais propriedades da Store e notifica apenas os inscritos afetados.' },
          { name: 'AppState.subscribe(key, fn)', type: 'Method', desc: 'Inscreve um callback para reagir sempre que a chave informada mudar.' },
          { name: 'AppState.pushHistory(nodes)', type: 'Method', desc: 'Salva um snapshot serializado da árvore de objetos na pilha de Undo/Redo.' }
        ]
      },
      {
        id: 'themes',
        title: '🎨 Sistema de 12 Temas Desktop',
        tag: 'data-theme / CSS Variables',
        badge: '12 Temas',
        summary:
          'Suporte nativo a 12 temas completos (Dark Pro, Hacker CRT, Ultra-Futurista 2099, macOS Light, macOS Ventura, Médio Verde/Azul, Windows 12, XP, 2000, 98 SE e MS-DOS) que estilizam Web Components, Scrollbars, Modais e o palco Canvas 2D.',
        previewType: 'themes-demo',
        code: `import { AppState } from './src/core/Store.js';

// Alterar o tema dinamicamente via Store (persiste no localStorage e atualiza <html data-theme="...">)
AppState.setState({ theme: 'hacker' });      // Hacker Terminal (Matrix Phosphor #00ff66)
AppState.setState({ theme: 'futuristic' });  // Ultra-Futurista (Quantum Holo-HUD 2099)
AppState.setState({ theme: 'macos-ventura' }); // macOS Ventura (Poppy & Ocean)
AppState.setState({ theme: 'win98' });       // Windows 98 SE (Teal & Silver 3D Bevel)
AppState.setState({ theme: 'msdos' });       // MS-DOS Editor (EDIT.COM VGA Text Mode)

/* Usando variáveis semânticas de tema em componentes customizados */
.meu-painel {
  background: var(--bg-panel);
  color: var(--text-primary);
  border: 1px solid var(--border-input);
  box-shadow: var(--btn-bevel-shadow);
}`,
        api: [
          { name: 'dark | hacker | futuristic', type: 'Temas Escuros / Sci-Fi', desc: 'Cortex Dark Pro (padrão), Hacker Terminal (#00ff66) e Quantum Holo-HUD 2099 (#00f0ff).' },
          { name: 'macos-light | macos-ventura', type: 'Temas Apple macOS', desc: 'macOS Cupertino Claro e macOS 13 Ventura com acento California Poppy (#e85d25).' },
          { name: 'medium-green | medium-blue', type: 'Temas Médios Suaves', desc: 'Contraste ergonômico cinza-ardósia com tons suaves de verde sálvia ou azul sereno.' },
          { name: 'win12 | winxp | win2000 | win98 | msdos', type: 'Temas Microsoft', desc: 'Desde o moderno Windows 12 Fluent até o chanfro 3D clássico do WinXP, Win2000, Win98 e MS-DOS.' }
        ]
      }
    ]
  },
  {
    category: '🖥️ Shell & Navegação Desktop',
    items: [
      {
        id: 'menubar',
        title: '🗂️ Barra de Menus (<cortex-menubar>)',
        tag: '<cortex-menubar>',
        badge: 'Desktop & Mobile Drawer',
        summary:
          'Barra superior de aplicação Desktop com menus cascata (File, Edit, Layout, Type, Object, Table, View, Window, Help), seletor de temas, seletor de workspace e gaveta responsiva para telas menores.',
        previewType: 'shell-menubar',
        code: `<!-- Uso no HTML -->
<cortex-menubar app-badge="Id" app-name="DesignCraft"></cortex-menubar>

<script type="module">
  // Escutando ações disparadas pelos itens de menu
  window.addEventListener('cortex-menu-action', (e) => {
    console.log('Ação de menu acionada:', e.detail.action);
  });
</script>`,
        api: [
          { name: 'app-badge', type: 'Attribute (String)', desc: 'Sigla exibida no emblema do aplicativo no canto superior esquerdo (ex: "Id", "Cx").' },
          { name: 'app-name', type: 'Attribute (String)', desc: 'Nome principal da aplicação exibido na barra de título central.' },
          { name: 'cortex-menu-action', type: 'CustomEvent', desc: 'Disparado ao clicar em qualquer comando do menu (detail: { action }).' },
          { name: 'cortex-theme-change', type: 'CustomEvent', desc: 'Disparado quando o usuário alterna o tema pelo seletor rápido da barra superior.' }
        ]
      },
      {
        id: 'tabbar-toolbar-statusbar',
        title: '🧭 Tabbar, Toolbar & Statusbar',
        tag: '<cortex-tabbar> / <cortex-toolbar> / <cortex-statusbar>',
        badge: 'Controles de Palco',
        summary:
          'Conjunto de barras acopladas para gerenciamento de múltiplos documentos em abas, seleção de ferramentas de desenho (Select, Text, Line, Pen, Rect, Hand, Zoom) e telemetria de coordenadas/páginas no rodapé.',
        previewType: 'shell-bars',
        code: `<!-- Abas de Documentos Multi-Páginas -->
<cortex-tabbar></cortex-tabbar>

<!-- Barra de Ferramentas Lateral (Desktop) / Inferior (Mobile) -->
<cortex-toolbar></cortex-toolbar>

<!-- Barra de Status com Paginação, Zoom, Coordenadas X/Y e FPS -->
<cortex-statusbar></cortex-statusbar>`,
        api: [
          { name: 'openTabs / activeTabId', type: 'Store State', desc: 'Controla a lista de abas abertas [{ id, title, dirty }] e a aba ativa em <cortex-tabbar>.' },
          { name: 'activeTool', type: 'Store State', desc: 'Ferramenta ativa em <cortex-toolbar>: "select" | "text" | "line" | "pen" | "rect" | "hand" | "zoom".' },
          { name: 'cursorX / cursorY / zoom', type: 'Store State', desc: 'Coordenadas em tempo real e nível de zoom exibidos em <cortex-statusbar>.' }
        ]
      }
    ]
  },
  {
    category: '🎛️ Inputs & Seletores Especializados',
    items: [
      {
        id: 'color-picker',
        title: '🎯 Seletor de Cores 2D HSV (<cortex-color-picker>)',
        tag: '<cortex-color-picker>',
        badge: '60 FPS Two-Way Binding',
        summary:
          'Componente de seleção cromática avançada com espectro 2D de Saturação/Brilho, barra de Matiz (Hue), opção "Sem Cor (None)", input HEX direto e grade de Swatches profissionais.',
        previewType: 'color-picker-live',
        code: `<!-- Exemplo de Uso Declarativo -->
<cortex-color-picker
  label="Fill"
  value="#0078d4"
></cortex-color-picker>

<script type="module">
  const picker = document.querySelector('cortex-color-picker');
  picker.addEventListener('cortex-color-change', (e) => {
    const { value, commit } = e.detail;
    console.log('Nova cor HEX:', value, 'Finalizou arraste?', commit);
  });
</script>`,
        api: [
          { name: 'label', type: 'Attribute (String)', desc: 'Rótulo exibido antes do botão disparador (ex: "Fill", "Str").' },
          { name: 'value', type: 'Attribute (HEX | "none")', desc: 'Cor atual em formato hexadecimal (#RRGGBB) ou "none" para transparente.' },
          { name: 'allow-none', type: 'Attribute (Boolean)', desc: 'Quando diferente de "false", habilita o botão de remoção de cor (transparente).' },
          { name: 'cortex-color-change', type: 'CustomEvent', desc: 'Disparado em tempo real durante o arraste (commit: false) e ao soltar (commit: true).' }
        ]
      },
      {
        id: 'font-picker',
        title: '🔤 Seletor de Fontes (<cortex-font-picker>)',
        tag: '<cortex-font-picker>',
        badge: 'Preview Tipográfico',
        summary:
          'Dropdown tipográfico com busca instantânea, filtro por categoria (Sans-Serif, Serif, Monospace, Display), renderização de cada item na própria fonte e fechamento automático ao selecionar.',
        previewType: 'font-picker-live',
        code: `<!-- Exemplo de Uso Declarativo -->
<cortex-font-picker value="Segoe UI"></cortex-font-picker>

<script type="module">
  const fontPicker = document.querySelector('cortex-font-picker');
  fontPicker.addEventListener('cortex-font-change', (e) => {
    console.log('Família tipográfica selecionada:', e.detail.fontFamily);
  });
</script>`,
        api: [
          { name: 'value', type: 'Attribute (String)', desc: 'Nome da família de fonte atualmente selecionada (ex: "Segoe UI", "Consolas", "Georgia").' },
          { name: 'cortex-font-change', type: 'CustomEvent', desc: 'Emitido imediatamente ao escolher uma fonte na lista (detail: { fontFamily }).' }
        ]
      },
      {
        id: 'ui-controls',
        title: '🔘 Botões, Inputs, Badges & Alertas',
        tag: 'Padrão Visual CortexUI',
        badge: 'Adaptável aos 12 Temas',
        summary:
          'Elementos de formulário, botões de ação, contêineres chanfrados, tags e banners de feedback que se adaptam automaticamente às variáveis semânticas de todos os 12 temas.',
        previewType: 'ui-controls-live',
        code: `<!-- Botões Padrão CortexUI -->
<button class="btn-primary">Ação Principal</button>
<button class="btn-secondary">Ação Secundária</button>
<button class="btn-danger">Excluir Registro</button>

<!-- Input com Chanfro / Foco Temático -->
<input type="text" class="cortex-input" placeholder="Digite um valor..." />

<!-- Usando as variáveis CSS do CortexUI -->
<style>
  .btn-primary {
    background: var(--accent-blue);
    color: var(--accent-text);
    border: 1px solid var(--border-focus);
    border-radius: var(--radius-xs);
    box-shadow: var(--btn-bevel-shadow);
  }
  .cortex-input {
    background: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-input);
    box-shadow: var(--input-bevel-shadow);
  }
</style>`,
        api: [
          { name: '--btn-bevel-shadow', type: 'CSS Custom Property', desc: 'Aplica automaticamente chanfro 3D no Win98/2000, sombra sólida no MS-DOS ou glow neon no Futurista.' },
          { name: '--input-bevel-shadow', type: 'CSS Custom Property', desc: 'Aplica borda afundada clássica ou foco moderno nos campos de texto conforme o tema.' },
          { name: '--accent-text', type: 'CSS Custom Property', desc: 'Garante contraste perfeito do texto sobre botões coloridos em qualquer tema.' }
        ]
      },
      {
        id: 'radiogroup',
        title: '🔘 Radio Buttons & Radio Cards (<cortex-radiogroup>)',
        tag: '<cortex-radiogroup>',
        badge: 'Inline & Cards Detalhados',
        summary:
          'Grupo de botões de opção (Radio Buttons) com suporte a layout horizontal clássico Desktop e Radio Cards ricos com descrição, badge técnica, navegação por teclado (Enter/Espaço) e estados desabilitados.',
        previewType: 'radiogroup-live',
        code: `<!-- Exemplo de Radio Group (Suporta variant="both" | "inline" | "cards") -->
<cortex-radiogroup value="standard" variant="both"></cortex-radiogroup>

<script type="module">
  const rg = document.querySelector('cortex-radiogroup');
  rg.addEventListener('cortex-radio-change', (e) => {
    console.log('Opção selecionada:', e.detail.value, e.detail.option);
  });
</script>`,
        api: [
          { name: 'value', type: 'Attribute / Property', desc: 'ID da opção atualmente selecionada no grupo.' },
          { name: 'variant', type: 'Attribute ("inline" | "cards" | "both")', desc: 'Define o estilo visual de renderização dos botões de opção.' },
          { name: 'options', type: 'Property (Array)', desc: 'Lista de opções [{ id, label, desc, badge, disabled }].' },
          { name: 'cortex-radio-change', type: 'CustomEvent', desc: 'Disparado ao selecionar uma opção (detail: { value, option }).' }
        ]
      },
      {
        id: 'search-list',
        title: '🔍 Lista com Busca Interna (<cortex-search-list>)',
        tag: '<cortex-search-list>',
        badge: 'Filtro Instantâneo & Categorias',
        summary:
          'Listbox Desktop com barra de busca interna em tempo real, filtro por pílulas de categoria, contador de resultados encontrados, ícones e rodapé de seleção ativa.',
        previewType: 'search-list-live',
        code: `<!-- Lista com Busca Interna e Filtro por Categoria -->
<cortex-search-list></cortex-search-list>

<script type="module">
  const searchList = document.querySelector('cortex-search-list');
  searchList.addEventListener('cortex-list-select', (e) => {
    console.log('Item selecionado na lista:', e.detail.id, e.detail.item);
  });
</script>`,
        api: [
          { name: 'items', type: 'Property (Array)', desc: 'Define os itens da lista [{ id, title, category, meta, icon }].' },
          { name: 'cortex-list-select', type: 'CustomEvent', desc: 'Emitido ao clicar em qualquer item filtrado na lista (detail: { id, item }).' }
        ]
      },
      {
        id: 'check-list',
        title: '☑️ Lista com Checkbox Interna (<cortex-check-list>)',
        tag: '<cortex-check-list>',
        badge: 'Multi-Seleção & Lote',
        summary:
          'Listbox multi-seleção com checkboxes customizados em cada linha, checkbox mestre "Selecionar Todos" (com suporte a estado indeterminado), busca interna para filtrar opções, botões "Inverter Seleção" / "Limpar" e barra de progresso.',
        previewType: 'check-list-live',
        code: `<!-- Lista com Checkboxes Internos, Busca e Ações em Lote -->
<cortex-check-list></cortex-check-list>

<script type="module">
  const checkList = document.querySelector('cortex-check-list');
  checkList.addEventListener('cortex-checklist-change', (e) => {
    console.log('IDs marcados:', e.detail.checkedIds);
  });
</script>`,
        api: [
          { name: 'getCheckedIds()', type: 'Method -> Array<String>', desc: 'Retorna o array com os IDs de todos os checkboxes atualmente marcados.' },
          { name: 'cortex-checklist-change', type: 'CustomEvent', desc: 'Disparado ao marcar/desmarcar um item ou usar Selecionar Todos / Inverter.' }
        ]
      },
      {
        id: 'combobox-datepicker',
        title: '📅 Combobox Multi-Tags & Calendário DatePicker',
        tag: '<cortex-combobox> / <cortex-datepicker>',
        badge: 'Chips & Calendário PT-BR',
        summary:
          'Seleção múltipla com chips removíveis e autocomplete em tempo real (<cortex-combobox>) combinada ao calendário mensal interativo com navegação de mês/ano e atalhos rápidos (<cortex-datepicker>).',
        previewType: 'combobox-datepicker-live',
        code: `<!-- Multi-Select Combobox com Chips/Tags -->
<cortex-combobox></cortex-combobox>

<!-- Calendário Desktop Interativo -->
<cortex-datepicker></cortex-datepicker>`,
        api: [
          { name: 'cortex-combobox-change', type: 'CustomEvent', desc: 'Disparado ao adicionar ou remover uma tag no <cortex-combobox> (detail: { values }).' },
          { name: 'cortex-date-change', type: 'CustomEvent', desc: 'Disparado ao escolher um dia ou preset no <cortex-datepicker> (detail: { date: "DD/MM/YYYY" }).' }
        ]
      },
      {
        id: 'switches-masks',
        title: '🎚️ Toggle Switches & Máscaras de Input (CortexMask)',
        tag: '<cortex-switch> / CortexMask',
        badge: 'CPF, CNPJ, Moeda, Tel, CEP',
        summary:
          'Interruptores estilo Toggle Switch (On/Off) animados e utilitário nativo CortexMask para formatação instantânea de CPF, CNPJ, Moeda (R$), Telefone e CEP.',
        previewType: 'switches-masks-live',
        code: `import { CortexMask } from './src/core/RouterAndUtils.js';

// Usando o componente Toggle Switch
// <cortex-switch></cortex-switch>

// Aplicando máscaras automaticamente em qualquer input
inputCpf.value = CortexMask.cpf('12345678901');           // "123.456.789-01"
inputMoeda.value = CortexMask.currencyBRL('154990');      // "R$ 1.549,90"
inputTel.value = CortexMask.phone('11988776655');         // "(11) 98877-6655"`,
        api: [
          { name: 'CortexMask.cpf(v) / cnpj(v)', type: 'Static Method', desc: 'Formata strings numéricas no padrão de CPF ou CNPJ.' },
          { name: 'CortexMask.currencyBRL(v)', type: 'Static Method', desc: 'Converte dígitos em moeda Real Brasileiro (R$ 0,00).' },
          { name: 'CortexMask.phone(v) / cep(v)', type: 'Static Method', desc: 'Aplica máscara de telefone fixo/celular com DDD e CEP.' },
          { name: 'cortex-switch-change', type: 'CustomEvent', desc: 'Emitido ao alternar um interruptor em <cortex-switch>.' }
        ]
      }
    ]
  },
  {
    category: '📊 Navegação, Gráficos & Contêineres',
    items: [
      {
        id: 'accordion-tabs-stepper',
        title: '📑 Accordion, Abas Internas & Wizard Stepper',
        tag: '<cortex-accordion> / <cortex-tabs> / <cortex-stepper>',
        badge: 'Fluxos & Painéis',
        summary:
          'Conjunto de contêineres estruturais para organizar configurações em sanfona (<cortex-accordion>), abas internas com contadores (<cortex-tabs>) e fluxos guiados passo a passo (<cortex-stepper>).',
        previewType: 'containers-live',
        code: `<!-- Painéis Expansíveis (Accordion) -->
<cortex-accordion></cortex-accordion>

<!-- Abas Internas Reutilizáveis -->
<cortex-tabs></cortex-tabs>

<!-- Wizard Passo a Passo (Stepper) -->
<cortex-stepper></cortex-stepper>`,
        api: [
          { name: '<cortex-accordion>', type: 'Custom Element', desc: 'Permite expandir e recolher múltiplas seções com badges de status.' },
          { name: '<cortex-tabs>', type: 'Custom Element', desc: 'Abas internas independentes para organizar formulários, logs e detalhes.' },
          { name: '<cortex-stepper>', type: 'Custom Element', desc: 'Wizard interativo com estados pendente, ativo e concluído (✓).' }
        ]
      },
      {
        id: 'charts-progress',
        title: '📈 Gráficos Canvas 2D, Progresso & Skeletons',
        tag: '<cortex-chart> / <cortex-progress>',
        badge: 'Barras, Linha & Donut High-DPI',
        summary:
          'Visualização de dados nativa em Canvas 2D (Barras, Linha/Área e Donut/Pizza) sincronizada em tempo real com os 12 temas, além de barras de progresso e Skeleton Loaders animados.',
        previewType: 'charts-progress-live',
        code: `<!-- Gráfico Nativo Canvas 2D High-DPI (type="bar" | "line" | "donut") -->
<cortex-chart type="bar"></cortex-chart>

<!-- Barra de Progresso e Skeleton Loader -->
<cortex-progress></cortex-progress>`,
        api: [
          { name: 'type="bar" | "line" | "donut"', type: 'Attribute (<cortex-chart>)', desc: 'Alterna entre gráfico de barras verticais, linha com área preenchida ou rosca/pizza.' },
          { name: '<cortex-progress>', type: 'Custom Element', desc: 'Exibe barra percentual animada e placeholders Skeleton Shimmer.' }
        ]
      },
      {
        id: 'splitter-pagination-dropzone',
        title: '↔️ Sizer Splitter, Paginação & Upload Dropzone',
        tag: '<cortex-splitter> / <cortex-pagination> / <cortex-dropzone>',
        badge: 'Layout & Arquivos',
        summary:
          'Divisor de painéis redimensionável a 60 FPS (<cortex-splitter>), trilha Breadcrumb + barra de paginação completa (<cortex-pagination>) e área de upload Drag & Drop (<cortex-dropzone>).',
        previewType: 'layout-files-live',
        code: `<!-- Painel Dividido com Sizer Horizontal Arrastável -->
<cortex-splitter></cortex-splitter>

<!-- Breadcrumb e Barra de Paginação -->
<cortex-pagination></cortex-pagination>

<!-- Upload de Arquivos Drag & Drop -->
<cortex-dropzone></cortex-dropzone>`,
        api: [
          { name: '<cortex-splitter>', type: 'Custom Element', desc: 'Divide dois painéis com barra Sizer arrastável e duplo clique para centralizar (50%/50%).' },
          { name: '<cortex-pagination>', type: 'Custom Element', desc: 'Renderiza trilha Breadcrumb e paginação numerada com contador de registros.' },
          { name: '<cortex-dropzone>', type: 'Custom Element', desc: 'Área para seleção/arraste de múltiplos arquivos com lista de anexos.' }
        ]
      }
    ]
  },
  {
    category: '🏢 Views Corporativas & Data Grids (CRM / ERP)',
    items: [
      {
        id: 'card-view',
        title: '🪪 1. Card View (<cortex-card-view>)',
        tag: '<cortex-card-view>',
        badge: 'Filtros, Fotos & Paginação',
        summary:
          'Grade responsiva de cartões de contatos executivos com barra superior de pílulas de ordenação/filtro (Status, Full Name, Position, Company, Assigned to, Phone, Email), seleção por checkbox com destaque no cartão, botões de editar/excluir, foto de perfil, campos estruturados, botão "Send Email" e paginação inferior.',
        previewType: 'card-view-live',
        code: `<!-- 1. Card View Corporativo com Filtros, Ordenação e Paginação -->
<cortex-card-view></cortex-card-view>`,
        api: [
          { name: 'Sort & Filter Pills', type: 'Toolbar', desc: 'Clique em Status, Full Name, Position ou Company para alternar a ordenação ascendente/descendente.' },
          { name: 'Card Checkbox & Actions', type: 'Interactive Card', desc: 'Permite selecionar múltiplos cartões, editar nome via prompt modal, excluir ou enviar e-mail.' },
          { name: 'Page 1 of 3 (12 items)', type: 'Pagination', desc: 'Paginação circular integrada no rodapé direito.' }
        ]
      },
      {
        id: 'list-view',
        title: '📋 2. List View (<cortex-list-view>)',
        tag: '<cortex-list-view>',
        badge: 'Multi-Seleção & Ordenação',
        summary:
          'Listagem tabular limpa com checkbox mestre (suporte a estado indeterminado), destaque automático nas linhas marcadas, nome + cargo empilhados, indicador semântico de Status (Qualified, Unqualified, Lead) e ordenação clicando nas colunas.',
        previewType: 'list-view-live',
        code: `<!-- 2. List View Tabular com Seleção em Lote e Destaque de Linha -->
<cortex-list-view></cortex-list-view>`,
        api: [
          { name: 'Master Checkbox', type: 'Header Control', desc: 'Marca ou desmarca todas as 12 linhas simultaneamente.' },
          { name: 'Sortable Columns', type: 'Column Header', desc: 'Clique em Full Name, Company, Status ou Assigned to para reordenar a lista.' }
        ]
      },
      {
        id: 'datagrid-grouped',
        title: '📊 3. jQuery Data Grid (<cortex-datagrid-grouped>)',
        tag: '<cortex-datagrid-grouped>',
        badge: 'Agrupamento & Sparkline Bars',
        summary:
          'Data Grid analítico com agrupamento dinâmico expansível/recolhível (Product: Eco Max, Product: Eco Supreme, ou por Region/Channel), busca rápida no topo, barras horizontais proporcionais na coluna "Discount %", seletor de tamanho de página (10, 25, 50, 100) e paginação.',
        previewType: 'datagrid-grouped-live',
        code: `<!-- 3. jQuery Data Grid com Agrupamento Expansível e Barras de Desconto -->
<cortex-datagrid-grouped></cortex-datagrid-grouped>`,
        api: [
          { name: 'Group By (Product / Region / Channel)', type: 'Grouping Bar', desc: 'Agrupa as linhas dinamicamente e permite recolher/expandir cada grupo clicando no cabeçalho.' },
          { name: 'Discount % Bar', type: 'Inline Sparkline', desc: 'Renderiza barra horizontal proporcional ao percentual de desconto dentro da célula.' },
          { name: 'Page Size (10 | 25 | 50 | 100)', type: 'Footer Control', desc: 'Alterna a densidade de registros por página.' }
        ]
      },
      {
        id: 'datagrid-detail',
        title: '📊 3.1 jQuery Data Grid com Detalhes da Linha (<cortex-datagrid-detail>)',
        tag: '<cortex-datagrid-detail>',
        badge: 'Master-Detail Row Expansion',
        summary:
          'Data Grid Master-Detail corporativo fiel ao modelo com toolbar completa: botões NEW (cadastro via modal) e DELETE (com confirmação), ícones de Analytics 📊, Filtros inline 🌪️, Seletor de colunas 🗂️, Exportação CSV 📤 e busca em tempo real 🔍. Cada linha possui o botão circular ⓘ para expandir o painel de detalhes com foto de perfil, dados cadastrais com botão ✎ de edição e histórico de Avaliações com adição dinâmica.',
        previewType: 'datagrid-detail-live',
        code: `<!-- 3.1 jQuery Data Grid Master-Detail com Todos os Botões e Painel de Avaliações -->
<cortex-datagrid-detail></cortex-datagrid-detail>`,
        api: [
          { name: 'NEW / DELETE', type: 'Toolbar Actions', desc: 'Inclusão de colaborador via modal com datepicker e exclusão com confirmação de segurança.' },
          { name: 'Analytics, Filtro & Colunas (📊 🌪️ 🗂️ 📤)', type: 'Toolbar Utilities', desc: 'Exibe métricas chave, inputs de filtro por coluna, gerenciador de visibilidade de colunas e exportação em CSV.' },
          { name: 'Details Toggle (ⓘ)', type: 'Master-Detail Expansion', desc: 'Expande/recolhe o cartão do colaborador com foto, cargo, endereço, telefone e e-mail.' },
          { name: 'Edit (✎) & Evaluations (+ Adicionar)', type: 'Interactive Record', desc: 'Permite editar os dados do colaborador no modal e cadastrar novas avaliações de desempenho em tempo real.' }
        ]
      },
      {
        id: 'form-view',
        title: '📝 4. Form View Split com Sizer & Chat (<cortex-form-view>)',
        tag: '<cortex-form-view>',
        badge: 'Form Details + Sizer + Chat/Tasks',
        summary:
          'Visão de formulário corporativo dividida em duas colunas por um Sizer Horizontal arrastável: à esquerda, o formulário completo de Details & Contacts (Foto, Status, First/Last Name, Position, Assigned to, Company, Address, City, State, Zip, Phone, Email e botões Save/Cancel); à direita, painel em abas (Chat interativo com envio de mensagens em tempo real, Tasks, Activities e Notes).',
        previewType: 'form-view-live',
        code: `<!-- 4. Form View Split com Sizer Central e Painel de Chat / Tasks / Activities / Notes -->
<cortex-form-view></cortex-form-view>`,
        api: [
          { name: 'Central Sizer Handle (|)', type: 'Resizable Splitter', desc: 'Arraste a barra central entre o formulário Details e o painel Chat para ajustar a proporção (duplo clique restaura 50%/50%).' },
          { name: 'Chat / Tasks / Activities / Notes', type: 'Interactive Tabs', desc: 'Envie novas mensagens no Chat (Enter ou botão ➤) ou alterne entre tarefas, atividades e notas.' },
          { name: 'Save / Cancel', type: 'Form Actions', desc: 'Salva as edições com confirmação em Toast ou restaura os dados originais.' }
        ]
      },
      {
        id: 'treelist',
        title: '🌲 3.2. Tree List Hierárquico (<cortex-treelist>)',
        tag: '<cortex-treelist>',
        badge: 'Hierarquia, Checkboxes & Toolbar',
        summary:
          'Componente de Tree List corporativo fiel ao modelo com controle hierárquico em árvore, checkboxes de seleção (com suporte a estado indeterminado), botões NEW para tarefas/subtarefas via modal e DELETE com confirmação de segurança, ícone de métricas 📊, filtros de coluna 🌪️, seletor de colunas 🗂️, exportação CSV 📤 e busca em tempo real 🔍.',
        previewType: 'treelist-live',
        code: `<!-- 3.2 Tree List Hierárquico com Checkboxes e Toolbar Completa -->
<cortex-treelist></cortex-treelist>`,
        api: [
          { name: 'Master Checkbox', type: 'Selection Control', desc: 'Marca ou desmarca todas as tarefas e subtarefas, com suporte visual a estado indeterminado (−).' },
          { name: 'Tree Expansion (∨ / >)', type: 'Hierarchy Toggle', desc: 'Expande ou recolhe nós e subtarefas mantendo os caminhos de busca sincronizados.' },
          { name: 'NEW / DELETE & Double-Click', type: 'Interactive Modals', desc: 'Cadastra novas tarefas ou subtarefas, exclui registros marcados e edita tarefas com duplo clique.' },
          { name: 'Toolbar Utilities (📊 🌪️ 🗂️ 📤)', type: 'Data Utilities', desc: 'Exibe métricas chave de conclusão, linha de filtros embutida, seletor de colunas e download CSV.' }
        ]
      },
      {
        id: 'diagram',
        title: '📐 5. Diagram Editor & Organograma (<cortex-diagram>)',
        tag: '<cortex-diagram>',
        badge: 'Conexão Magnética 🧲 (Snap Imã) + Toolbar Compacta + Linhas Móveis + Agrupamento 📦',
        summary:
          'Editor de diagramas vetoriais e organogramas profissional e interativo: portas de conexão magnética nos objetos (efeito imã 🧲 com fixação automática das retas e setas aos nós conectados, acompanhando sua movimentação em tempo real); barra superior compacta com rótulos abaixo do ícone e alternador de modo (⚡), ajuste manual de barramentos e descidas (↕ / ↔), agrupamento unificado (Ctrl+G), rotação 360° pelos cantos, alças de resize e paletas completas de cores e tipografia CortexUI.',
        previewType: 'diagram-live',
        code: `<!-- 5. Diagram Editor & Organograma com Rotação 360° com Mouse pelos Cantos, Linhas, Resize 8 Alças e Fontes -->
<cortex-diagram></cortex-diagram>`,
        api: [
          { name: 'Pontos de Conexão Magnética (Efeito Imã 🧲)', type: 'Magnetic Anchor Ports & Snap', desc: 'Portas de ancoragem cardinais (topo, base, esquerda, direita) em todos os objetos. Retas e setas atraem e encaixam como um imã nos pontos de conexão com indicador visual pulsante, ficando permanentemente fixadas: ao mover qualquer objeto, as linhas conectadas esticam, giram e acompanham o movimento automaticamente.' },
          { name: 'Linhas e Conectores Móveis (↕ / ↔)', type: 'Interactive Orthogonal Wires', desc: 'Permite mover manualmente qualquer linha de conexão ou barramento: arraste a barra horizontal (↕) para subir/descer, arraste a linha vertical (↔) para a esquerda/direita ou mova os nós conectados para atualização em tempo real. Suporta seleção, exclusão (Delete), paleta de cores e setas do teclado.' },
          { name: 'Agrupar & Desagrupar Objetos (📦 / 🔓)', type: 'Unified Grouping', desc: 'Agrupe dois ou mais objetos selecionados (Ctrl+G, barra superior ou menu de contexto). O grupo comporta-se como um único objeto unificado: mova, redimensione proporcionalmente (escalonando nós filhos) ou rotacione em 360°. Desagrupe com Ctrl+Shift+G.' },
          { name: 'Rotação 360° com o Mouse (⟳)', type: 'Corner & Stem Rotation', desc: 'Gire qualquer objeto clicando e arrastando pelos 4 cantos ou pela alça superior com haste. Segure Shift para snap a cada 15°, ou use o botão rápido ⟳ 90° / atalho R.' },
          { name: 'Ferramentas de Linhas e Conectores', type: 'Lines & Arrows', desc: '4 tipos: Linha Reta (―), Seta à Direita (⟶), Seta à Esquerda (⟵) e Seta Bidirecional (⟷). Clique para inserir ou arraste no palco para traçar.' },
          { name: 'Barra Superior Compacta (Rótulos Abaixo / Ícones)', type: 'Smart Responsive Toolbar', desc: 'Design compacto profissional com ícone acima e rótulo abaixo, sem cortes laterais. Inclui botão de alternância rápida entre modo Rótulos e modo Somente Ícones (⚡), além de arraste livre no palco.' },
          { name: 'Barra de Ferramentas Móvel (:::) ', type: 'Draggable Toolbar', desc: 'Barra superior flutuante que pode ser arrastada livremente para qualquer área do palco.' },
          { name: 'Redimensionamento 8 Alças (Resize)', type: 'Interactive Handles', desc: '8 alças azuis ativas para redimensionar qualquer objeto ou linha no diagrama com proporção e limites inteligentes.' },
          { name: 'Menu de Contexto Z-Order (Botão Direito)', type: 'Context Menu', desc: 'Controle de camadas: Trazer para Frente, Enviar para Trás, Avançar/Recuar camada, Rotacionar 90°, Duplicar (Ctrl+D), Editar Texto e Excluir.' },
          { name: 'Paleta de Fontes Completa (🔤)', type: 'Typography Popover', desc: 'Famílias de fontes clássicas CortexUI (Inter, Segoe UI, Roboto, Verdana, Georgia, JetBrains Mono), tamanhos de 10 a 32px, Bold, Italic, Underline e Alinhamento.' },
          { name: 'Paleta de Cores CortexUI (🎨)', type: 'Color Palette Popover', desc: '24 cores oficiais para Borda/Linha (Stroke), Preenchimento (Fill) e Texto com aplicação em lote nos objetos selecionados.' }
        ]
      },
      {
        id: 'admin-dashboard',
        title: '📊 6. Admin Dashboard (<cortex-admin-dashboard>)',
        tag: '<cortex-admin-dashboard>',
        badge: '3 Colunas + Scroll H/V + Donut & Sparklines',
        summary:
          'Painel executivo de administração moderno dividido diretamente em 3 colunas responsivas fiéis ao modelo (sem rail lateral): Coluna 1 com tabela de e-mails/contatos com abas e badges de status (New, Progress, Done) com suporte completo a rolagens horizontal e vertical sem corte; Coluna 2 com cards executivos de Tarefas com prazos, prioridades e adição modal; Coluna 3 com gráfico Donut multissetorial "Revenues by Sector", sparklines de tendências e contadores analíticos.',
        previewType: 'admin-dashboard-live',
        code: `<!-- 6. Admin Dashboard Corporativo de 3 Colunas com Scroll H/V -->
<cortex-admin-dashboard></cortex-admin-dashboard>`,
        api: [
          { name: 'Mail / Contacts Table & Scrolls', type: 'Interactive List', desc: 'Abas com listagem de mensagens, ordenação por data, badges de status e rolagem vertical e horizontal sem corte de colunas.' },
          { name: 'Tasks Cards (+ Nova Tarefa)', type: 'Action Cards', desc: 'Cards executivos com prazos, prioridades coloridas e inclusão de novas tarefas via modal.' },
          { name: 'Sales by Channel & Sparklines', type: 'Analytics', desc: 'Gráfico de rosca vetorial com 6 setores, sparklines com percentuais e contadores de pedidos.' }
        ]
      },
      {
        id: 'saas-dashboard',
        title: '🚀 7. SaaS Applications Dashboard (<cortex-saas-dashboard>)',
        tag: '<cortex-saas-dashboard>',
        badge: 'Revenue Combo Chart + Top Products',
        summary:
          'Dashboard analítico para aplicações SaaS: Card superior esquerdo com gráfico Combo de Faturamento (Revenue) com barras verdes mensais, linha de tendência azul e alternador Week / Month / Year; Card superior direito com sparklines diárias e barras de progresso proporcionais (Order, Pending, Delivered); Seção inferior com tabela completa de "Top Selling Products", ícones de produtos, descontos e paginação integrada.',
        previewType: 'saas-dashboard-live',
        code: `<!-- 7. SaaS Applications Dashboard com Gráfico Combo e Top Selling Products -->
<cortex-saas-dashboard></cortex-saas-dashboard>`,
        api: [
          { name: 'Revenue Combo Chart (Week | Month | Year)', type: 'Dual-Axis Chart', desc: 'Combina barras verticais e linha de tendência com eixos duplos e filtro de período dinâmico.' },
          { name: 'KPI Performance & Progress Bars', type: 'Trend Indicators', desc: 'Sparklines de Daily Orders e Earnings com barras de progresso coloridas para Order, Pending e Delivered.' },
          { name: 'Top Selling Products Table', type: 'Product Grid', desc: 'Tabela de produtos com ícones, preços, canais de distribuição, descontos e cadastro modal.' },
          { name: 'Numbered Pager', type: 'Pagination', desc: 'Paginação numerada circular (1, 2, 3, 4) para navegar entre os registros.' }
        ]
      }
    ]
  },
  {
    category: '📅 Agendamento, Kanban & Gantt (Scheduler / PM)',
    items: [
      {
        id: 'scheduler-resources',
        title: '👥 1 & 2. Scheduler / jQuery Scheduler 1 por Recursos (<cortex-scheduler-resources>)',
        tag: '<cortex-scheduler-resources>',
        badge: 'Colunas por Profissional + Blocos Coloridos',
        summary:
          'Grade de agendamento multi-recursos (Maria Garcia, Barbara Johnson, William Smith, Taylor Riley, Kent Samuel, Walter Hobbs) com seletor de período (22-28 February 2018), alternador Day / Week / Month, eixo de horário (8:00 AM - 2:00 PM) e blocos de tarefas coloridos clicáveis para editar ou criar novos agendamentos.',
        previewType: 'scheduler-resources-live',
        code: `<!-- 1 & 2. Scheduler por Recursos (jQuery Scheduler 1) -->
<cortex-scheduler-resources></cortex-scheduler-resources>`,
        api: [
          { name: 'Colunas por Recurso', type: 'Resource Columns', desc: 'Cada profissional possui sua coluna dedicada e paleta de cor exclusiva (#8cc657, #1db2f5, #f59638, #9c7bd3, #66c18c, #eec01c).' },
          { name: 'Click no Bloco / Célula Vazia', type: 'Interactive Modal', desc: 'Clique em qualquer bloco (ex: Room 523) para editar ou em um horário vazio para criar um novo agendamento.' },
          { name: 'Day | Week | Month', type: 'View Switcher', desc: 'Alterna entre os modos de visualização e períodos de datas.' }
        ]
      },
      {
        id: 'scheduler-workweek',
        title: '📆 2.1. jQuery Scheduler 2 — Work Week (<cortex-scheduler-workweek>)',
        tag: '<cortex-scheduler-workweek>',
        badge: 'Work Week + All-Day Row + Blocos Horários',
        summary:
          'Calendário corporativo Work Week (26-30 April 2021 — Mon 26 a Fri 30) com faixa superior de eventos "All day" (Book Flights to San Fran..., Customer Workshop) e blocos horários detalhados (Website Re-Design Plan, Install New Database, Prepare 2021 Marketing Plan, Launch New Website) com edição e criação via clique.',
        previewType: 'scheduler-workweek-live',
        code: `<!-- 2.1. jQuery Scheduler 2 — Visão Work Week com All-Day e Compromissos -->
<cortex-scheduler-workweek></cortex-scheduler-workweek>`,
        api: [
          { name: 'All day Row', type: 'Header Banner Row', desc: 'Exibe eventos de dia inteiro no topo da coluna correspondente (Mon 26, Thu 29).' },
          { name: 'Timed Event Blocks', type: 'Interactive Appointments', desc: 'Blocos proporcionais à duração em minutos (ex: 9:30 AM - 11:30 AM, 9:45 AM - 11:15 AM, 12:20 PM - 2:00 PM) com modal de edição.' }
        ]
      },
      {
        id: 'tasks-scheduler-grid',
        title: '🗓️ 2.2. jQuery Scheduler 3 — Tasks Grid & Calendar Popover (<cortex-tasks-scheduler-grid>)',
        tag: '<cortex-tasks-scheduler-grid>',
        badge: 'Filtros Inline + Calendário Popover June 2025',
        summary:
          'Componente de visualização e gestão de Tarefas (Tasks Data Grid) com título "Tasks", linha de filtros por coluna com ícones de lupa em cada coluna, busca textual em Subject, seletor de prioridade (All, High, Normal, Urgent), botões para Popover de Calendário flutuante (June 2025), suporte completo a rolagens horizontal e vertical sem corte de colunas, seleção de linha, modal desktop para edição e exclusão de tarefas com campos de data/datepicker integrados sem corte e paginação inferior (5, 10, 20 itens por página).',
        previewType: 'tasks-scheduler-grid-live',
        code: `<!-- 2.2. jQuery Scheduler 3 — Tasks Grid com Filtro de Data e Calendário Popover -->
<cortex-tasks-scheduler-grid></cortex-tasks-scheduler-grid>`,
        api: [
          { name: 'Start Date / Due Date Filter', type: 'Calendar Popover Trigger', desc: 'Clique no ícone de calendário na linha de filtro para abrir/fechar o seletor June 2025 e escolher qualquer dia.' },
          { name: 'Inline Filter Row', type: 'Column Filters', desc: 'Filtre em tempo real por Subject ou Priority ((All), High, Normal, Urgent).' },
          { name: 'Page Size & Pager (5 / 10 / 20)', type: 'Pagination Bar', desc: 'Alterna a quantidade de itens por página e a página ativa (Page 1 of 19 - 183 items).' }
        ]
      },
      {
        id: 'kanban-board',
        title: '📌 3. Kanban Board Drag & Drop (<cortex-kanban-board>)',
        tag: '<cortex-kanban-board>',
        badge: 'Planned / In Progress / Done + Drag & Drop',
        summary:
          'Quadro Kanban interativo com barra de ferramentas (+ ADD TASK, Exportar, Refresh, Task Search), 3 colunas (Planned, In Progress, Done), cards com barra lateral colorida, número do quarto, botão de edição (✎), horário e avatar circular com iniciais (MG, BJ, WS, TR, KS) e suporte nativo a Drag & Drop entre colunas.',
        previewType: 'kanban-board-live',
        code: `<!-- 3. Quadro Kanban com Drag & Drop, Busca em Tempo Real e Avatares -->
<cortex-kanban-board></cortex-kanban-board>`,
        api: [
          { name: 'HTML5 Drag & Drop', type: 'Column Reordering', desc: 'Arraste qualquer card entre as colunas Planned, In Progress e Done.' },
          { name: '+ ADD TASK / + Add Task', type: 'Task Creation Modal', desc: 'Adiciona novos cards no quadro geral ou diretamente na coluna desejada.' },
          { name: 'Task Search & Edit (✎)', type: 'Live Filter & Edit', desc: 'Filtra cards por serviço, quarto ou iniciais do responsável e permite editar qualquer card.' }
        ]
      },
      {
        id: 'gantt-chart',
        title: '📊 4. Gráfico Gantt com Dependências SVG & Timeline (<cortex-gantt-chart>)',
        tag: '<cortex-gantt-chart>',
        badge: 'Árvore WBS + Barras de Progresso + Marcos & Recursos',
        summary:
          'Cronograma de projeto Gantt dividido entre a árvore WBS colapsável à esquerda (Software Development -> Scope -> Analysis/Software Requirements) e o gráfico de linha do tempo à direita (semanas e dias) com barras de resumo com colchetes, barras de tarefas laranjas com preenchimento de progresso, setas de dependência, losango de marco (Scope complete) e tags de recursos (Management, Project Manager).',
        previewType: 'gantt-chart-live',
        code: `<!-- 4. Gráfico de Gantt Hierárquico com WBS, Zoom e Marcos -->
<cortex-gantt-chart></cortex-gantt-chart>`,
        api: [
          { name: 'Collapsible WBS Tree (▾ / ▶)', type: 'Hierarchical Tree', desc: 'Expanda ou recolha fases inteiras (Software Development, Scope, Analysis/Software Requirements) sincronizando a tabela e o gráfico.' },
          { name: 'Timeline Zoom In / Out (🔍+ / 🔍-)', type: 'Scale Control', desc: 'Ajusta dinamicamente a escala de pixels por dia na linha do tempo.' },
          { name: '+ ADD TASK & Delete', type: 'WBS Task Manager', desc: 'Adiciona novas tarefas à estrutura WBS ou remove a tarefa selecionada.' }
        ]
      }
    ]
  },
  {
    category: '🪟 Janelas, Modais & Overlays',
    items: [
      {
        id: 'modal',
        title: '💬 Modais, Dialogs & Toasts (CortexModal)',
        tag: '<cortex-modal> / CortexModal',
        badge: 'Promise API Async/Await',
        summary:
          'Sistema completo de caixas de diálogo assíncronas baseadas em Promises (Alert, Confirm, Prompt, Form Builder multi-campos) e notificações flutuantes (Toasts).',
        previewType: 'modal-live',
        code: `import { CortexModal } from './src/components/cortex-modal.js';

// 1. Alert Dialog (info | warning | error | success)
await CortexModal.alert({
  title: 'Exportação Concluída',
  message: 'O documento foi processado sem erros.',
  type: 'success'
});

// 2. Confirm Dialog (retorna true ou false)
const confirmar = await CortexModal.confirm({
  title: 'Excluir Camada',
  message: 'Deseja realmente remover este objeto da página?',
  confirmText: 'Sim, Excluir',
  danger: true
});

// 3. Prompt Dialog (retorna string ou null)
const nome = await CortexModal.prompt({
  title: 'Renomear Camada',
  defaultValue: 'RECT 1'
});

// 4. Form Modal Dinâmico (retorna objeto com os campos ou null)
const dados = await CortexModal.form({
  title: 'Novo Documento',
  fields: [
    { name: 'titulo', label: 'Título:', type: 'text', value: 'Projeto-01' },
    { name: 'largura', label: 'Largura (mm):', type: 'number', value: 210 },
    { name: 'ativo', label: 'Páginas Opostas', type: 'checkbox', value: true }
  ]
});

// 5. Toast Notification
CortexModal.toast('Alterações salvas com sucesso!', 'success', 2800);`,
        api: [
          { name: 'CortexModal.alert(opts)', type: 'Async Method -> Promise<true>', desc: 'Exibe um alerta modal com ícone semântico (info, warning, error, success).' },
          { name: 'CortexModal.confirm(opts)', type: 'Async Method -> Promise<boolean>', desc: 'Exibe confirmação com suporte a modo destrutivo (danger: true).' },
          { name: 'CortexModal.prompt(opts)', type: 'Async Method -> Promise<string|null>', desc: 'Solicita entrada rápida de texto ao usuário com suporte a Enter/Escape.' },
          { name: 'CortexModal.form(opts)', type: 'Async Method -> Promise<Object|null>', desc: 'Gera um formulário modal estruturado (text, number, select, checkbox).' },
          { name: 'CortexModal.toast(msg, type, ms)', type: 'Static Method', desc: 'Dispara notificação empilhável no canto inferior direito.' }
        ]
      },
      {
        id: 'floating-window',
        title: '🪟 Janelas Flutuantes MDI (<cortex-floating-window>)',
        tag: '<cortex-floating-window>',
        badge: 'Z-Index Auto-Focus',
        summary:
          'Gerenciador de janelas flutuantes arrastáveis (Desktop Data Grid e Scene TreeView Explorer) com botão minimizar/fechar e elevação automática de Z-Index ao clicar em qualquer parte da janela.',
        previewType: 'floating-window-live',
        code: `const floatingWin = document.querySelector('cortex-floating-window');

// Abrir ou trazer para a frente a janela Desktop Data Grid
floatingWin.openWindow({
  id: 'win-datagrid',
  title: 'Desktop Data Grid — Objetos do Documento',
  type: 'datatable'
});

// Abrir ou trazer para a frente a janela Scene TreeView Explorer
floatingWin.openWindow({
  id: 'win-treeview',
  title: 'Scene TreeView Explorer',
  type: 'tree'
});

// Trazer programaticamente qualquer janela aberta para a frente
floatingWin.bringToFront('win-datagrid');`,
        api: [
          { name: 'openWindow({ id, title, type })', type: 'Method', desc: 'Abre uma janela MDI ("datatable" ou "tree") ou a restaura e traz para a frente se já estiver aberta.' },
          { name: 'bringToFront(id)', type: 'Method', desc: 'Incrementa o Z-Index da janela especificada e aplica a classe .active-window.' },
          { name: 'closeWindow(id)', type: 'Method', desc: 'Fecha a janela especificada e transfere o foco para a próxima janela no topo da pilha.' }
        ]
      },
      {
        id: 'context-menu-palette',
        title: '🖱️ Context Menu & Command Palette',
        tag: '<cortex-context-menu> / <cortex-command-palette>',
        badge: 'Atalhos Rápidos',
        summary:
          'Menu contextual de botão direito com posicionamento inteligente anti-transbordo e Command Palette estilo VS Code / Spotlight (Ctrl+K) com busca fuzzy.',
        previewType: 'context-palette-live',
        code: `// 1. Abrir Menu de Contexto nas coordenadas do mouse
const contextMenu = document.querySelector('cortex-context-menu');
contextMenu.open(event.clientX, event.clientY, [
  { label: 'Duplicar Objeto', shortcut: 'Ctrl+D', action: 'duplicate' },
  { type: 'divider' },
  { label: 'Excluir', shortcut: 'Del', action: 'delete', danger: true }
]);

// 2. Abrir Command Palette (ou pressione Ctrl+K)
const palette = document.querySelector('cortex-command-palette');
palette.open();`,
        api: [
          { name: 'contextMenu.open(x, y, items)', type: 'Method', desc: 'Abre o menu de contexto ajustando automaticamente às bordas da janela e fecha ao clicar em um item.' },
          { name: 'contextMenu.close()', type: 'Method', desc: 'Fecha o menu de contexto imediatamente.' },
          { name: 'palette.open() / palette.close()', type: 'Method', desc: 'Abre ou fecha a paleta de comandos rápidos (atalho global Ctrl+K).' }
        ]
      }
    ]
  },
  {
    category: '📋 Painéis, Camadas & Login',
    items: [
      {
        id: 'login-screens',
        title: '🔐 10 Modelos de Telas de Login (<cortex-login>)',
        tag: '<cortex-login>',
        badge: '10 Designs + Banners de Erro',
        summary:
          'Coleção de 10 arquiteturas completas de autenticação Desktop/Web (Creative Splash, Enterprise ERP, Minimal Glass, Workstation OS, DevOps IDE, Bento QR, Split Dark-Gold, Sci-Fi Biometric, Swiss Brutalist e Neubrutalism) com validação e sistema de mensagens de erro/sucesso.',
        previewType: 'login-live',
        code: `const loginEl = document.querySelector('cortex-login');

// Abrir qualquer um dos 10 modelos ('1' a '10')
loginEl.open('1');  // 1. Creative Splash (Adobe / Studio)
loginEl.open('2');  // 2. Enterprise ERP & FinTech
loginEl.open('5');  // 5. DevOps Cloud IDE & SSH Key
loginEl.open('8');  // 8. Sci-Fi Biometric HUD

// Disparar mensagem de erro ou alerta na tela de login ativa:
loginEl.showFeedback(
  'error',
  'ERR_AUTH_401: Credenciais inválidas ou token expirado.',
  'Falha na Autenticação'
);`,
        api: [
          { name: 'open(modelId)', type: 'Method', desc: 'Abre a vitrine no modelo desejado ("1" a "10").' },
          { name: 'showFeedback(type, message, title)', type: 'Method', desc: 'Exibe banner de diagnóstico na tela de login ativa ("error" | "warning" | "info" | "success").' },
          { name: 'clearFeedback()', type: 'Method', desc: 'Oculta o banner de erro/mensagem da tela de login atual.' }
        ]
      },
      {
        id: 'inspector-layers',
        title: '🛠️ Inspetor Docked & Camadas (<cortex-inspector>)',
        tag: '<cortex-inspector> / <cortex-layers>',
        badge: 'Multi-Colunas & Drag-and-Drop',
        summary:
          'Painel lateral adaptativo que exibe simultaneamente Properties, Pages e Layers em monitores widescreen (>1600px), abas compactas em laptops e gaveta off-canvas em dispositivos móveis.',
        previewType: 'inspector-info',
        code: `<!-- Inspetor adaptativo com gerenciador de camadas <cortex-layers> embutido -->
<cortex-inspector></cortex-inspector>

<script type="module">
  // Escutar ações de camadas (seleção, reordenação Drag & Drop, Z-Index e exclusão)
  window.addEventListener('cortex-layer-action', (e) => {
    const { action, id, sourceId, targetId } = e.detail;
    console.log('Ação de camada:', action, { id, sourceId, targetId });
  });
</script>`,
        api: [
          { name: 'cortex-update-property', type: 'CustomEvent', desc: 'Emitido a 60 FPS ao editar X, Y, W, H, Fill, Stroke, Opacidade ou Tipografia no Inspector.' },
          { name: 'cortex-layer-action', type: 'CustomEvent', desc: 'Ações emitidas por <cortex-layers>: "select", "reorder", "bring-front", "send-back", "delete".' }
        ]
      }
    ]
  },
  {
    category: '🎨 Motor Gráfico 2D',
    items: [
      {
        id: 'canvas-engine',
        title: '📐 Motor Canvas 2D, Réguas & Nós Gráficos',
        tag: 'CanvasEngine / CortexNode',
        badge: 'High-DPI & Hit Detection',
        summary:
          'Motor de renderização vetorial HTML5 Canvas com suporte a DevicePixelRatio, réguas horizontais/verticais sincronizadas com Pan/Zoom, páginas independentes e classes serializáveis (CortexRect, CortexText, CortexPath).',
        previewType: 'canvas-info',
        code: `import { CortexRect, CortexText } from './src/engine/CortexNode.js';

const workspace = document.querySelector('cortex-workspace');
const engine = workspace.engine;

// 1. Adicionar um novo Retângulo na página ativa
engine.addDefaultRect();

// 2. Atualizar propriedade de um nó em tempo real (60 FPS)
engine.updateNodeProperty(engine.selectedNode.id, 'fill', '#10b981', true);

// 3. Exportar e Importar toda a árvore do documento em JSON
const json = engine.exportSceneJSON();
engine.importSceneJSON(json);`,
        api: [
          { name: 'CortexRect / CortexText / CortexPath', type: 'Scene Classes', desc: 'Classes de modelo gráfico com hitTest(px, py, tolerance), draw(ctx) e toJSON().' },
          { name: 'engine.centerPage(resetZoom)', type: 'Method', desc: 'Centraliza a folha de documento ativa no palco.' },
          { name: 'engine.exportSceneJSON()', type: 'Method -> String', desc: 'Serializa metadados de página e todos os nós de todas as páginas em JSON.' }
        ]
      }
    ]
  }
];

export class CortexDocs extends CortexElement {
  constructor() {
    super();
    this._isOpen = false;
    this._activeSectionId = 'getting-started';
    this._searchQuery = '';
    this._demoColor = '#0078d4';
    this._demoFont = 'Segoe UI';
    this._leftWidth = 280;
    this._rightWidth = 240;
  }

  onMount() {
    if (this.getAttribute('standalone') === 'true') {
      this._isOpen = true;
      this.render();
    }

    this.watchState(['theme', 'zoom', 'currentPage', 'totalPages'], () => {
      if (this._isOpen) {
        this._syncLiveThemeSelect();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this._isOpen && this.getAttribute('standalone') !== 'true') {
        this.close();
      }
    });
  }

  open(sectionId) {
    if (sectionId) {
      this._activeSectionId = sectionId;
    }
    this._isOpen = true;
    this.render();
    if (sectionId) {
      requestAnimationFrame(() => {
        const el = this.shadowRoot?.querySelector(`#sec-${sectionId}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  close() {
    if (this.getAttribute('standalone') === 'true') {
      const isSubdir = window.location.pathname.includes('/docs/');
      window.location.href = isSubdir ? '../index.html' : './index.html';
      return;
    }
    this._isOpen = false;
    this.render();
  }

  _syncLiveThemeSelect() {
    const sel = this.shadowRoot?.querySelector('#docs-theme-select');
    if (sel) {
      sel.value = AppState.get('theme') || 'dark';
    }
  }

  _escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  _renderLivePreview(item) {
    const currentTheme = AppState.get('theme') || 'dark';

    switch (item.previewType) {
      case 'quickstart':
        return `
          <div class="live-demo-grid">
            <div class="arch-card">
              <div class="arch-badge">Web Components</div>
              <strong>14 Custom Elements</strong>
              <span>Encapsulamento Shadow DOM nativo sem dependências externas.</span>
            </div>
            <div class="arch-card">
              <div class="arch-badge">Store Reativo</div>
              <strong>Observer Pattern + Undo/Redo</strong>
              <span>Sincronização imediata em 60 FPS entre UI e Canvas 2D.</span>
            </div>
            <div class="arch-card">
              <div class="arch-badge">Design System</div>
              <strong>12 Temas + 10 Logins</strong>
              <span>De MS-DOS e Win98 até macOS Ventura, Hacker CRT e Futurista 2099.</span>
            </div>
          </div>
        `;

      case 'store-demo':
        return `
          <div class="demo-interactive-row">
            <div class="state-readout">
              <span><strong>Tema Ativo:</strong> <code>${currentTheme}</code></span>
              <span><strong>Página Atual:</strong> <code>${AppState.get('currentPage')} / ${AppState.get('totalPages')}</code></span>
              <span><strong>Zoom Palco:</strong> <code>${AppState.get('zoom')}%</code></span>
            </div>
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="store-add-page">+ Criar Nova Página na Store</button>
              <button class="doc-btn" data-doc-act="store-zoom">+25% Zoom Global</button>
              <button class="doc-btn" data-doc-act="store-toast">Testar Evento de Toast</button>
            </div>
          </div>
        `;

      case 'themes-demo':
        return `
          <div class="themes-grid-demo">
            ${[
              { id: 'dark', name: '🌙 Dark Pro (Padrão)', desc: 'Adobe / DaVinci Dark' },
              { id: 'hacker', name: '👾 Hacker Terminal', desc: 'Matrix Phosphor #00ff66' },
              { id: 'futuristic', name: '🚀 Ultra-Futurista 2099', desc: 'Quantum Holo-HUD #00f0ff' },
              { id: 'macos-light', name: ' macOS Claro', desc: 'Cupertino Daylight' },
              { id: 'macos-ventura', name: '🌅 macOS Ventura', desc: 'Poppy Orange & Ocean' },
              { id: 'medium-green', name: '🌿 Médio Verde', desc: 'Sage Green & Slate' },
              { id: 'medium-blue', name: '🌊 Médio Azul', desc: 'Steel Blue & Slate' },
              { id: 'win12', name: '💠 Windows 12', desc: 'Fluent Lavender-Blue' },
              { id: 'winxp', name: '🪟 Windows XP', desc: 'Luna Blue & Olive Green' },
              { id: 'win2000', name: '🖥 Windows 2000', desc: 'Classic Tahitian Gray' },
              { id: 'win98', name: '💾 Windows 98 SE', desc: 'Teal #008080 & Silver' },
              { id: 'msdos', name: '⌨ MS-DOS EDIT.COM', desc: 'VGA Blue #0000AA & Cyan' }
            ]
              .map(
                (t) => `
              <button class="theme-card-btn ${currentTheme === t.id ? 'active' : ''}" data-set-theme="${t.id}">
                <strong>${t.name}</strong>
                <span>${t.desc}</span>
              </button>
            `
              )
              .join('')}
          </div>
        `;

      case 'shell-menubar':
      case 'shell-bars':
        return `
          <div class="demo-interactive-row">
            <p style="margin:0; color: var(--text-secondary);">
              Os componentes de casca (<code>&lt;cortex-menubar&gt;</code>, <code>&lt;cortex-tabbar&gt;</code>, <code>&lt;cortex-toolbar&gt;</code> e <code>&lt;cortex-statusbar&gt;</code>) formam a estrutura principal do workspace.
            </p>
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="trigger-new-doc">Testar Ação: Novo Documento (Modal Form)</button>
              <button class="doc-btn" data-doc-act="close-docs">Ver no Workspace Principal</button>
            </div>
          </div>
        `;

      case 'color-picker-live':
        return `
          <div class="demo-interactive-row">
            <div style="display:flex; align-items:center; gap: 14px; flex-wrap: wrap;">
              <cortex-color-picker id="doc-live-color" label="Cor de Teste:" value="${this._demoColor}"></cortex-color-picker>
              <div id="doc-color-preview-box" style="padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-input); background: ${this._demoColor === 'none' ? 'transparent' : this._demoColor}; color: #ffffff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); font-family: var(--font-mono); font-size: 12px;">
                 Amostra ao Vivo: ${this._demoColor}
              </div>
            </div>
            <span style="font-size: 11px; color: var(--text-muted);">Clique no seletor acima para abrir o espectro 2D HSV, testar os swatches e ver a atualização em 60 FPS.</span>
          </div>
        `;

      case 'font-picker-live':
        return `
          <div class="demo-interactive-row">
            <div style="display:flex; align-items:center; gap: 16px; flex-wrap: wrap; width: 100%;">
              <div style="width: 240px;">
                <cortex-font-picker id="doc-live-font" value="${this._demoFont}"></cortex-font-picker>
              </div>
              <div id="doc-font-preview-text" style="flex:1; min-width: 220px; padding: 10px 14px; background: var(--bg-input); border: 1px solid var(--border-input); border-radius: var(--radius-sm); font-family: '${this._demoFont}', sans-serif; font-size: 16px; color: var(--text-primary);">
                CortexUI Desktop Framework — Tipografia em '${this._demoFont}' (0123456789)
              </div>
            </div>
          </div>
        `;

      case 'ui-controls-live':
        return `
          <div class="ui-controls-showcase">
            <div class="demo-btn-group">
              <button class="doc-btn primary">Botão Primário (.primary)</button>
              <button class="doc-btn">Botão Secundário</button>
              <button class="doc-btn success">Confirmar Ação</button>
              <button class="doc-btn danger">Ação Destrutiva</button>
            </div>
            <div style="display:flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-top: 10px;">
              <input type="text" class="doc-input" value="Input Desktop com suporte aos 12 temas" style="width: 260px;" />
              <select class="doc-input" style="width: 180px;">
                <option>Opção Selecionada 01</option>
                <option>Opção Selecionada 02</option>
              </select>
              <span class="doc-badge">BADGE v4.0</span>
              <span class="doc-badge accent">60 FPS ENGINE</span>
            </div>
          </div>
        `;

      case 'radiogroup-live':
        return `<cortex-radiogroup></cortex-radiogroup>`;

      case 'search-list-live':
        return `<cortex-search-list></cortex-search-list>`;

      case 'check-list-live':
        return `<cortex-check-list></cortex-check-list>`;

      case 'combobox-datepicker-live':
        return `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; align-items: start;">
            <div>
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Multi-Select Combobox com Tags &amp; Busca</div>
              <cortex-combobox></cortex-combobox>
            </div>
            <div>
              <div style="font-size:11px; font-weight:700; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase;">Calendário Desktop Interativo</div>
              <cortex-datepicker></cortex-datepicker>
            </div>
          </div>
        `;

      case 'switches-masks-live':
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <cortex-switch></cortex-switch>
            <div style="padding: 12px 14px; background: var(--bg-panel); border: 1px solid var(--border-input); border-radius: var(--radius-sm); display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px;">
              <div>
                <label style="font-size:10.5px; color:var(--text-secondary); display:block; margin-bottom:4px;">Máscara CPF:</label>
                <input type="text" class="doc-input" data-mask-input="cpf" value="123.456.789-01" style="width:100%;" placeholder="000.000.000-00" />
              </div>
              <div>
                <label style="font-size:10.5px; color:var(--text-secondary); display:block; margin-bottom:4px;">Máscara Moeda (BRL):</label>
                <input type="text" class="doc-input" data-mask-input="currencyBRL" value="R$ 2.450,90" style="width:100%;" placeholder="R$ 0,00" />
              </div>
              <div>
                <label style="font-size:10.5px; color:var(--text-secondary); display:block; margin-bottom:4px;">Máscara Telefone:</label>
                <input type="text" class="doc-input" data-mask-input="phone" value="(11) 98877-6655" style="width:100%;" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label style="font-size:10.5px; color:var(--text-secondary); display:block; margin-bottom:4px;">Máscara CEP:</label>
                <input type="text" class="doc-input" data-mask-input="cep" value="01310-100" style="width:100%;" placeholder="00000-000" />
              </div>
            </div>
          </div>
        `;

      case 'containers-live':
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <cortex-stepper></cortex-stepper>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
              <cortex-accordion></cortex-accordion>
              <cortex-tabs></cortex-tabs>
            </div>
          </div>
        `;

      case 'charts-progress-live':
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <cortex-chart type="bar"></cortex-chart>
            <cortex-progress></cortex-progress>
          </div>
        `;

      case 'layout-files-live':
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <cortex-splitter></cortex-splitter>
            <cortex-pagination></cortex-pagination>
            <cortex-dropzone></cortex-dropzone>
          </div>
        `;

      case 'card-view-live':
        return `<cortex-card-view></cortex-card-view>`;

      case 'list-view-live':
        return `<cortex-list-view></cortex-list-view>`;

      case 'datagrid-grouped-live':
        return `<cortex-datagrid-grouped></cortex-datagrid-grouped>`;

      case 'datagrid-detail-live':
        return `<cortex-datagrid-detail></cortex-datagrid-detail>`;

      case 'form-view-live':
        return `<cortex-form-view></cortex-form-view>`;

      case 'treelist-live':
        return `<cortex-treelist></cortex-treelist>`;

      case 'diagram-live':
        return `<cortex-diagram></cortex-diagram>`;

      case 'admin-dashboard-live':
        return `<cortex-admin-dashboard></cortex-admin-dashboard>`;

      case 'saas-dashboard-live':
        return `<cortex-saas-dashboard></cortex-saas-dashboard>`;

      case 'scheduler-resources-live':
        return `<cortex-scheduler-resources></cortex-scheduler-resources>`;

      case 'scheduler-workweek-live':
        return `<cortex-scheduler-workweek></cortex-scheduler-workweek>`;

      case 'tasks-scheduler-grid-live':
        return `<cortex-tasks-scheduler-grid></cortex-tasks-scheduler-grid>`;

      case 'kanban-board-live':
        return `<cortex-kanban-board></cortex-kanban-board>`;

      case 'gantt-chart-live':
        return `<cortex-gantt-chart></cortex-gantt-chart>`;

      case 'modal-live':
        return `
          <div class="demo-interactive-row">
            <span style="color: var(--text-secondary); font-size: 12px;">Clique nos botões abaixo para testar ao vivo cada modalidade do <code>CortexModal</code>:</span>
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="modal-alert">Disparar Alert()</button>
              <button class="doc-btn" data-doc-act="modal-confirm">Disparar Confirm()</button>
              <button class="doc-btn" data-doc-act="modal-prompt">Disparar Prompt()</button>
              <button class="doc-btn" data-doc-act="modal-form">Disparar Form() Multi-Campos</button>
              <button class="doc-btn success" data-doc-act="modal-toast">Disparar Toast()</button>
            </div>
          </div>
        `;

      case 'floating-window-live':
        return `
          <div class="demo-interactive-row">
            <span style="color: var(--text-secondary); font-size: 12px;">Abra as janelas flutuantes MDI e clique entre elas para testar a elevação automática de Z-Index:</span>
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="open-datagrid">Abrir Desktop Data Grid</button>
              <button class="doc-btn primary" data-doc-act="open-treeview">Abrir Scene TreeView Explorer</button>
            </div>
          </div>
        `;

      case 'context-palette-live':
        return `
          <div class="demo-interactive-row">
            <div
              id="doc-context-zone"
              style="padding: 18px; border: 1px dashed var(--accent-blue); border-radius: var(--radius-sm); background: var(--accent-blue-alpha); color: var(--text-primary); text-align: center; cursor: context-menu; width: 100%;"
            >
              🖱️ <strong>Clique com o Botão Direito do Mouse AQUI</strong> (ou clique no botão abaixo) para testar o <code>&lt;cortex-context-menu&gt;</code> ao vivo!
            </div>
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="open-palette">Abrir Command Palette (Ctrl+K)</button>
              <button class="doc-btn" data-doc-act="open-context-btn">Abrir Context Menu Aqui</button>
            </div>
          </div>
        `;

      case 'login-live':
        return `
          <div class="demo-interactive-row">
            <span style="color: var(--text-secondary); font-size: 12px;">Clique em qualquer um dos <strong>10 Modelos de Tela de Login</strong> abaixo para abri-lo em tela cheia:</span>
            <div class="demo-btn-group">
              ${[
                ['1', '1. Creative Splash'],
                ['2', '2. Enterprise ERP'],
                ['3', '3. Minimal Glass'],
                ['4', '4. Workstation OS'],
                ['5', '5. DevOps Cloud IDE'],
                ['6', '6. Bento QR Auth'],
                ['7', '7. Split Dark-Gold'],
                ['8', '8. Sci-Fi Biometric'],
                ['9', '9. Swiss Brutalist'],
                ['10', '10. Neubrutalism Pop']
              ]
                .map(
                  ([id, label]) => `
                <button class="doc-btn ${id === '1' || id === '8' ? 'primary' : ''}" data-open-login-model="${id}">
                  &#128274; ${label}
                </button>
              `
                )
                .join('')}
            </div>
          </div>
        `;

      default:
        return `
          <div class="demo-interactive-row">
            <div class="demo-btn-group">
              <button class="doc-btn primary" data-doc-act="add-rect-stage">+ Adicionar Retângulo no Palco 2D</button>
              <button class="doc-btn" data-doc-act="close-docs">Inspecionar no Workspace Principal</button>
            </div>
          </div>
        `;
    }
  }

  render() {
    const isStandalone = this.getAttribute('standalone') === 'true';
    if (isStandalone) {
      this._isOpen = true;
    }
    const currentTheme = AppState.get('theme') || 'dark';
    const q = this._searchQuery.trim().toLowerCase();

    const filteredCategories = DOC_SECTIONS.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)
      )
    })).filter((cat) => cat.items.length > 0);

    const allVisibleItems = filteredCategories.flatMap((c) => c.items);

    this.shadowRoot.innerHTML = `
      <style>
        ${this.baseStyles}

        :host {
          display: ${this._isOpen ? 'block' : 'none'};
          position: fixed;
          inset: 0;
          z-index: ${isStandalone ? 1000 : 9000};
          background-color: var(--bg-app);
          color: var(--text-primary);
          font-family: var(--font-sans);
        }

        .docs-shell {
          --docs-left-w: ${this._leftWidth}px;
          --docs-right-w: ${this._rightWidth}px;
          display: grid;
          grid-template-rows: 52px 1fr;
          grid-template-columns: var(--docs-left-w) 6px 1fr 6px var(--docs-right-w);
          grid-template-areas:
            "header header header header header"
            "sidebar sizer-l main sizer-r toc";
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        /* Sizers Horizontais para Redimensionar os 2 Painéis Verticais (Sidebar & TOC) */
        .docs-sizer {
          position: relative;
          background: var(--bg-panel);
          border-left: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          cursor: col-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          transition: background-color 0.12s ease, border-color 0.12s ease;
          touch-action: none;
        }

        .docs-sizer.sizer-left {
          grid-area: sizer-l;
        }

        .docs-sizer.sizer-right {
          grid-area: sizer-r;
        }

        .docs-sizer::after {
          content: "";
          width: 2px;
          height: 36px;
          border-radius: 999px;
          background: var(--text-muted);
          opacity: 0.45;
          transition: height 0.12s ease, background-color 0.12s ease, opacity 0.12s ease;
        }

        .docs-sizer:hover,
        .docs-sizer.dragging {
          background: var(--accent-blue-alpha);
          border-color: var(--accent-blue);
        }

        .docs-sizer:hover::after,
        .docs-sizer.dragging::after {
          height: 56px;
          background: var(--accent-blue);
          opacity: 1;
        }

        /* Header estilo Bootstrap Docs */
        .docs-header {
          grid-area: header;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 0 20px;
          background: var(--win-header-bg, var(--bg-panel-header));
          color: var(--win-header-text, var(--text-primary));
          border-bottom: 1px solid var(--border-subtle);
        }

        .brand-area {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 800;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--btn-bevel-shadow);
        }

        .brand-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .version-pill {
          font-size: 10px;
          padding: 2px 7px;
          border-radius: 999px;
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-input);
          font-family: var(--font-mono);
        }

        .header-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .docs-search {
          height: 30px;
          width: 250px;
          padding: 0 10px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--input-bevel-shadow);
          font-size: 12px;
        }

        .docs-search:focus {
          border-color: var(--border-focus);
        }

        .docs-theme-select {
          height: 30px;
          padding: 0 10px;
          border-radius: var(--radius-sm);
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          font-size: 12px;
          cursor: pointer;
        }

        .docs-theme-select option {
          background: var(--bg-panel);
          color: var(--text-primary);
        }

        /* Sidebar Esquerda */
        .docs-sidebar {
          grid-area: sidebar;
          background: var(--bg-panel);
          border-right: 1px solid var(--border-subtle);
          overflow-y: auto;
          padding: 18px 14px 40px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .nav-cat-title {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 6px;
          padding: 0 8px;
        }

        .nav-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          text-align: left;
          padding: 7px 10px;
          border-radius: var(--radius-xs);
          font-size: 12px;
          color: var(--text-secondary);
          transition: background 0.12s ease, color 0.12s ease;
        }

        .nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--accent-blue);
          color: var(--accent-text);
          font-weight: 600;
          box-shadow: var(--btn-bevel-shadow);
        }

        /* Conteúdo Central */
        .docs-main {
          grid-area: main;
          overflow-y: auto;
          padding: 28px 36px 80px;
          scroll-behavior: smooth;
        }

        .docs-hero {
          max-width: 920px;
          margin: 0 auto 28px;
          padding: 22px 26px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          box-shadow: var(--btn-bevel-shadow);
        }

        .docs-hero h1 {
          margin: 0 0 8px;
          font-size: 22px;
          color: var(--text-primary);
        }

        .docs-hero p {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .doc-section-card {
          max-width: 920px;
          margin: 0 auto 34px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-md);
          overflow: hidden;
          box-shadow: var(--btn-bevel-shadow);
        }

        .doc-section-header {
          padding: 18px 24px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .doc-section-header h2 {
          margin: 0 0 6px;
          font-size: 17px;
          color: var(--text-primary);
        }

        .doc-tag-code {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--accent-blue);
          background: var(--bg-input);
          padding: 2px 8px;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-input);
        }

        .doc-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 9px;
          border-radius: var(--radius-xs);
          font-size: 10px;
          font-weight: 700;
          background: var(--bg-input);
          color: var(--text-secondary);
          border: 1px solid var(--border-input);
          font-family: var(--font-mono);
        }

        .doc-badge.accent {
          background: var(--accent-blue-alpha);
          color: var(--text-primary);
          border-color: var(--accent-blue);
        }

        .doc-section-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .doc-summary {
          margin: 0;
          font-size: 13px;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Caixa de Preview Ao Vivo estilo Bootstrap (.bd-example) */
        .bd-example {
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          overflow: visible;
          background: var(--bg-app);
        }

        .bd-example-header {
          padding: 7px 14px;
          background: var(--bg-elevated);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .bd-example-stage {
          padding: 18px;
        }

        /* Bloco de Código com Botão Copiar */
        .bd-code-block {
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: var(--bg-input);
        }

        .bd-code-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 12px;
          background: var(--bg-panel-header);
          border-bottom: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }

        .copy-code-btn {
          padding: 3px 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-panel);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .copy-code-btn:hover {
          background: var(--accent-blue);
          color: var(--accent-text);
        }

        .bd-code-pre {
          margin: 0;
          padding: 14px 16px;
          overflow-x: auto;
          font-family: var(--font-mono);
          font-size: 11.5px;
          line-height: 1.55;
          color: var(--text-primary);
        }

        /* Tabela de API */
        .api-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--border-input);
          border-radius: var(--radius-sm);
        }

        .api-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
          text-align: left;
        }

        .api-table th {
          background: var(--bg-panel-header);
          color: var(--text-secondary);
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
          font-weight: 600;
        }

        .api-table td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-primary);
          vertical-align: top;
        }

        .api-table tr:last-child td {
          border-bottom: none;
        }

        /* Elementos Interativos das Demos */
        .live-demo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 12px;
        }

        .arch-card {
          padding: 14px;
          border-radius: var(--radius-sm);
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .arch-badge {
          align-self: flex-start;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 3px;
          background: var(--accent-blue-alpha);
          color: var(--text-primary);
        }

        .arch-card span {
          font-size: 11.5px;
          color: var(--text-secondary);
        }

        .demo-interactive-row {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .state-readout {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding: 10px 14px;
          background: var(--bg-panel);
          border: 1px solid var(--border-input);
          border-radius: var(--radius-xs);
          font-size: 12px;
        }

        .demo-btn-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .doc-btn {
          height: 30px;
          padding: 0 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-panel);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .doc-btn:hover {
          background: var(--bg-hover);
        }

        .doc-btn.primary {
          background: var(--accent-blue);
          color: var(--accent-text);
          border-color: var(--border-focus);
        }

        .doc-btn.success {
          background: var(--status-ok);
          color: #04130a;
          border-color: var(--status-ok);
        }

        .doc-btn.danger {
          background: var(--status-error);
          color: #ffffff;
          border-color: var(--status-error);
        }

        .doc-input {
          height: 30px;
          padding: 0 10px;
          border-radius: var(--radius-xs);
          background: var(--bg-input);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--input-bevel-shadow);
          font-size: 12px;
        }

        .themes-grid-demo {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
          gap: 8px;
        }

        .theme-card-btn {
          padding: 10px 12px;
          border-radius: var(--radius-xs);
          background: var(--bg-panel);
          color: var(--text-primary);
          border: 1px solid var(--border-input);
          box-shadow: var(--btn-bevel-shadow);
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 3px;
          text-align: left;
          cursor: pointer;
        }

        .theme-card-btn span {
          font-size: 10.5px;
          color: var(--text-secondary);
        }

        .theme-card-btn.active {
          border-color: var(--accent-blue);
          background: var(--accent-blue-alpha);
        }

        /* Índice Direito (Table of Contents) */
        .docs-toc {
          grid-area: toc;
          background: var(--bg-panel);
          border-left: 1px solid var(--border-subtle);
          padding: 18px 14px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .toc-link {
          text-align: left;
          font-size: 11.5px;
          color: var(--text-secondary);
          padding: 4px 8px;
          border-left: 2px solid var(--border-subtle);
          cursor: pointer;
        }

        .toc-link:hover,
        .toc-link.active {
          color: var(--text-primary);
          border-left-color: var(--accent-blue);
          background: var(--bg-hover);
        }

        @media (max-width: 1180px) {
          .docs-shell {
            grid-template-columns: var(--docs-left-w) 6px 1fr;
            grid-template-areas:
              "header header header"
              "sidebar sizer-l main";
          }
          .docs-toc,
          .docs-sizer.sizer-right {
            display: none;
          }
        }

        @media (max-width: 780px) {
          .docs-shell {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
            grid-template-areas:
              "header"
              "sidebar"
              "main";
          }
          .docs-sizer {
            display: none;
          }
          .docs-header {
            padding: 10px 14px;
            flex-wrap: wrap;
          }
          .docs-sidebar {
            max-height: 150px;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
            padding: 10px 14px;
          }
          .docs-main {
            padding: 16px;
          }
        }
      </style>

      <div class="docs-shell">
        <!-- Barra Superior da Documentação -->
        <header class="docs-header">
          <div class="brand-area">
            <span class="brand-logo">Cx</span>
            <span class="brand-title">CortexUI Docs — Manual de Componentes</span>
            <span class="version-pill">v4.0 Desktop</span>
          </div>

          <div class="header-controls">
            <input
              type="search"
              id="docs-search-input"
              class="docs-search"
              placeholder="Filtrar componentes, tags ou APIs..."
              value="${this._searchQuery}"
            />

            <select id="docs-theme-select" class="docs-theme-select" title="Testar Documentação nos 12 Temas">
              <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>&#127769; Tema: Dark Pro (Padrão)</option>
              <option value="hacker" ${currentTheme === 'hacker' ? 'selected' : ''}>&#128126; Tema: Hacker Terminal</option>
              <option value="futuristic" ${currentTheme === 'futuristic' ? 'selected' : ''}>&#128640; Tema: Ultra-Futurista 2099</option>
              <option value="macos-light" ${currentTheme === 'macos-light' ? 'selected' : ''}>&#63743; Tema: macOS Claro</option>
              <option value="macos-ventura" ${currentTheme === 'macos-ventura' ? 'selected' : ''}>&#127749; Tema: macOS Ventura</option>
              <option value="medium-green" ${currentTheme === 'medium-green' ? 'selected' : ''}>&#127807; Tema: Médio Verde</option>
              <option value="medium-blue" ${currentTheme === 'medium-blue' ? 'selected' : ''}>&#127754; Tema: Médio Azul</option>
              <option value="win12" ${currentTheme === 'win12' ? 'selected' : ''}>&#128160; Tema: Windows 12</option>
              <option value="winxp" ${currentTheme === 'winxp' ? 'selected' : ''}>&#129695; Tema: Windows XP</option>
              <option value="win2000" ${currentTheme === 'win2000' ? 'selected' : ''}>&#128421; Tema: Windows 2000</option>
              <option value="win98" ${currentTheme === 'win98' ? 'selected' : ''}>&#128190; Tema: Windows 98 SE</option>
              <option value="msdos" ${currentTheme === 'msdos' ? 'selected' : ''}>&#9000; Tema: MS-DOS (EDIT.COM)</option>
            </select>

            <button class="doc-btn" data-doc-act="toggle-lang" style="font-weight:700; cursor:pointer;" title="${t('lang.label')}">
              ${getLanguage() === 'pt-BR' ? '🇧🇷 PT' : '🇺🇸 EN'}
            </button>

            ${
              !isStandalone
                ? `<a href="./docs" target="_blank" class="doc-btn" style="text-decoration:none;">&#8599; Abrir /docs</a>`
                : `<a href="${window.location.pathname.includes('/docs/') ? '../index.html' : './index.html'}" class="doc-btn" style="text-decoration:none;">&#8592; Ir para Workspace</a>`
            }

            <button class="doc-btn primary" data-doc-act="close-docs">
              ${isStandalone ? '&#128421; Abrir Aplicação' : 'Voltar ao Workspace &times;'}
            </button>
          </div>
        </header>

        <!-- Sidebar de Categorias e Componentes (Estilo Bootstrap Docs) -->
        <aside class="docs-sidebar" aria-label="Menu da Documentação">
          ${filteredCategories
            .map(
              (cat) => `
            <div>
              <div class="nav-cat-title">${this._escapeHtml(cat.category)}</div>
              <div class="nav-list">
                ${cat.items
                  .map(
                    (item) => `
                  <button
                    class="nav-link ${this._activeSectionId === item.id ? 'active' : ''}"
                    data-scroll-to="${item.id}"
                  >
                    <span>${this._escapeHtml(item.title)}</span>
                  </button>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </aside>

        <!-- Sizer Horizontal Esquerdo (Redimensiona Sidebar Esquerda) -->
        <div
          class="docs-sizer sizer-left"
          id="docs-sizer-left"
          title="Arraste para redimensionar o painel esquerdo (Duplo clique restaura largura padrão)"
        ></div>

        <!-- Conteúdo Principal com Todos os Componentes Separados e Interativos -->
        <main class="docs-main" id="docs-scroll-container">
          <div class="docs-hero">
            <h1>Manual Oficial de Utilização — Framework CortexUI</h1>
            <p>
              Explore todos os componentes Web Desktop, seletores cromáticos/tipográficos, janelas flutuantes MDI,
              modais assíncronos, 10 telas de login, 12 temas visuais e o motor gráfico Canvas 2D. Cada seção abaixo
              oferece um <strong>Preview Interativo ao Vivo</strong>, <strong>Código de Exemplo Copiável</strong> e a
              <strong>Tabela de Referência da API</strong>.
            </p>
          </div>

          ${allVisibleItems
            .map(
              (item) => `
            <section class="doc-section-card" id="sec-${item.id}">
              <div class="doc-section-header">
                <div>
                  <h2>${this._escapeHtml(item.title)}</h2>
                  <span class="doc-tag-code">${this._escapeHtml(item.tag)}</span>
                </div>
                <span class="doc-badge accent">${this._escapeHtml(item.badge)}</span>
              </div>

              <div class="doc-section-body">
                <p class="doc-summary">${item.summary}</p>

                <!-- Preview Interativo Ao Vivo -->
                <div class="bd-example">
                  <div class="bd-example-header">
                    <span>&#9889; Demonstração Interativa ao Vivo (Live Preview)</span>
                    <span>Tema ativo: ${currentTheme}</span>
                  </div>
                  <div class="bd-example-stage">
                    ${this._renderLivePreview(item)}
                  </div>
                </div>

                <!-- Exemplo de Código HTML / JS -->
                <div class="bd-code-block">
                  <div class="bd-code-bar">
                    <span>HTML / ES6 Module Example</span>
                    <button class="copy-code-btn" data-copy-code="${encodeURIComponent(item.code)}">
                      &#128203; Copiar Código
                    </button>
                  </div>
                  <pre class="bd-code-pre"><code>${this._escapeHtml(item.code)}</code></pre>
                </div>

                <!-- Tabela de Referência de API -->
                <div class="api-table-wrap">
                  <table class="api-table">
                    <thead>
                      <tr>
                        <th style="width: 28%;">Propriedade / Método / Evento</th>
                        <th style="width: 22%;">Tipo</th>
                        <th>Descrição de Utilização</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${item.api
                        .map(
                          (row) => `
                        <tr>
                          <td><code class="doc-tag-code">${this._escapeHtml(row.name)}</code></td>
                          <td><span class="doc-badge">${this._escapeHtml(row.type)}</span></td>
                          <td>${this._escapeHtml(row.desc)}</td>
                        </tr>
                      `
                        )
                        .join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          `
            )
            .join('')}
        </main>

        <!-- Sizer Horizontal Direito (Redimensiona Painel Direito "Nesta Página") -->
        <div
          class="docs-sizer sizer-right"
          id="docs-sizer-right"
          title="Arraste para redimensionar o painel direito (Duplo clique restaura largura padrão)"
        ></div>

        <!-- Índice Direito (Nesta Página) -->
        <aside class="docs-toc" aria-label="Índice Rápido">
          <div class="nav-cat-title">📋 ${getLanguage() === 'pt-BR' ? 'Nesta Página' : 'On this page'} (${allVisibleItems.length})</div>
          ${allVisibleItems
            .map(
              (item) => `
            <button
              class="toc-link ${this._activeSectionId === item.id ? 'active' : ''}"
              data-scroll-to="${item.id}"
            >
              ${this._escapeHtml(item.title)}
            </button>
          `
            )
            .join('')}
        </aside>
      </div>
    `;

    this._bindDocEvents();
  }

  _bindDocEvents() {
    const shell = this.shadowRoot.querySelector('.docs-shell');

    // Sizer Horizontal Esquerdo (Redimensiona .docs-sidebar em 60 FPS)
    const sizerLeft = this.shadowRoot.querySelector('#docs-sizer-left');
    if (sizerLeft && shell) {
      let draggingLeft = false;
      sizerLeft.addEventListener('pointerdown', (e) => {
        sizerLeft.setPointerCapture(e.pointerId);
        draggingLeft = true;
        sizerLeft.classList.add('dragging');
      });
      sizerLeft.addEventListener('pointermove', (e) => {
        if (!draggingLeft) return;
        const nextW = Math.max(180, Math.min(520, e.clientX));
        this._leftWidth = nextW;
        shell.style.setProperty('--docs-left-w', `${nextW}px`);
      });
      const stopLeft = () => {
        draggingLeft = false;
        sizerLeft.classList.remove('dragging');
      };
      sizerLeft.addEventListener('pointerup', stopLeft);
      sizerLeft.addEventListener('pointercancel', stopLeft);
      sizerLeft.addEventListener('dblclick', () => {
        this._leftWidth = 280;
        shell.style.setProperty('--docs-left-w', '280px');
      });
    }

    // Sizer Horizontal Direito (Redimensiona .docs-toc em 60 FPS)
    const sizerRight = this.shadowRoot.querySelector('#docs-sizer-right');
    if (sizerRight && shell) {
      let draggingRight = false;
      sizerRight.addEventListener('pointerdown', (e) => {
        sizerRight.setPointerCapture(e.pointerId);
        draggingRight = true;
        sizerRight.classList.add('dragging');
      });
      sizerRight.addEventListener('pointermove', (e) => {
        if (!draggingRight) return;
        const nextW = Math.max(160, Math.min(480, window.innerWidth - e.clientX));
        this._rightWidth = nextW;
        shell.style.setProperty('--docs-right-w', `${nextW}px`);
      });
      const stopRight = () => {
        draggingRight = false;
        sizerRight.classList.remove('dragging');
      };
      sizerRight.addEventListener('pointerup', stopRight);
      sizerRight.addEventListener('pointercancel', stopRight);
      sizerRight.addEventListener('dblclick', () => {
        this._rightWidth = 240;
        shell.style.setProperty('--docs-right-w', '240px');
      });
    }
    // Filtro de busca instantânea
    const searchInput = this.shadowRoot.querySelector('#docs-search-input');
    searchInput?.addEventListener('input', (e) => {
      const pos = e.target.selectionStart;
      this._searchQuery = e.target.value;
      this.render();
      const nextInput = this.shadowRoot.querySelector('#docs-search-input');
      if (nextInput) {
        nextInput.focus();
        nextInput.setSelectionRange(pos, pos);
      }
    });

    // Seletor de Temas na barra superior da Documentação
    const themeSelect = this.shadowRoot.querySelector('#docs-theme-select');
    themeSelect?.addEventListener('change', (e) => {
      AppState.setState({ theme: e.target.value });
      this.render();
    });

    // Cards de Temas na seção "Sistema de 12 Temas"
    this.shadowRoot.querySelectorAll('[data-set-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        AppState.setState({ theme: btn.dataset.setTheme });
        this.render();
      });
    });

    // Navegação Sidebar / TOC com scroll suave até a seção
    this.shadowRoot.querySelectorAll('[data-scroll-to]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.scrollTo;
        this._activeSectionId = targetId;
        this.shadowRoot.querySelectorAll('[data-scroll-to]').forEach((b) => {
          b.classList.toggle('active', b.dataset.scrollTo === targetId);
        });
        const secEl = this.shadowRoot.querySelector(`#sec-${targetId}`);
        secEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Botões de Copiar Código
    this.shadowRoot.querySelectorAll('[data-copy-code]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const rawCode = decodeURIComponent(btn.dataset.copyCode);
        try {
          await navigator.clipboard.writeText(rawCode);
        } catch {
          // fallback silencioso
        }
        const originalText = btn.innerHTML;
        btn.innerHTML = '&#10003; Copiado!';
        CortexModal.toast('Código copiado para a área de transferência!', 'success', 1800);
        setTimeout(() => {
          btn.innerHTML = originalText;
        }, 1600);
      });
    });

    // Live Demo: Color Picker
    const liveColorPicker = this.shadowRoot.querySelector('#doc-live-color');
    const colorBox = this.shadowRoot.querySelector('#doc-color-preview-box');
    liveColorPicker?.addEventListener('cortex-color-change', (e) => {
      this._demoColor = e.detail.value;
      if (colorBox) {
        colorBox.style.background = this._demoColor === 'none' ? 'transparent' : this._demoColor;
        colorBox.textContent = `Amostra ao Vivo: ${this._demoColor}`;
      }
    });

    // Live Demo: Font Picker
    const liveFontPicker = this.shadowRoot.querySelector('#doc-live-font');
    const fontText = this.shadowRoot.querySelector('#doc-font-preview-text');
    liveFontPicker?.addEventListener('cortex-font-change', (e) => {
      this._demoFont = e.detail.fontFamily;
      if (fontText) {
        fontText.style.fontFamily = `'${this._demoFont}', sans-serif`;
        fontText.textContent = `CortexUI Desktop Framework — Tipografia em '${this._demoFont}' (0123456789)`;
      }
    });

    // Live Demo: Context Menu Zone
    const ctxZone = this.shadowRoot.querySelector('#doc-context-zone');
    ctxZone?.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const ctxEl = document.querySelector('cortex-context-menu');
      ctxEl?.open(e.clientX, e.clientY, [
        { label: 'Exemplo: Ação de Contexto 01', shortcut: 'Ctrl+1', action: 'add-rect' },
        { label: 'Exemplo: Abrir Data Grid', shortcut: 'Ctrl+Alt+T', action: 'insert-table' },
        { type: 'divider' },
        { label: 'Exemplo: Item Destrutivo', shortcut: 'Del', action: 'delete', danger: true }
      ]);
    });

    // Live Demo: Abrir um dos 10 Modelos de Login
    this.shadowRoot.querySelectorAll('[data-open-login-model]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const loginEl = document.querySelector('cortex-login');
        loginEl?.open(btn.dataset.openLoginModel);
      });
    });

    // Live Demo: Máscaras de Input (CPF, Moeda BRL, Telefone, CEP)
    this.shadowRoot.querySelectorAll('[data-mask-input]').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const maskType = inp.dataset.maskInput;
        e.target.value = CortexMask.apply(maskType, e.target.value);
      });
    });

    // Ações interativas gerais das demonstrações
    this.shadowRoot.querySelectorAll('[data-doc-act]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const act = btn.dataset.docAct;

        switch (act) {
          case 'close-docs':
            this.close();
            break;

          case 'store-add-page': {
            const next = (AppState.get('totalPages') || 1) + 1;
            AppState.setState({ totalPages: next, currentPage: next });
            this.render();
            CortexModal.toast(`Página ${next} adicionada via AppState.setState()!`, 'success');
            break;
          }

          case 'store-zoom': {
            const nextZoom = Math.min(400, (AppState.get('zoom') || 100) + 25);
            AppState.setState({ zoom: nextZoom });
            this.render();
            CortexModal.toast(`Zoom atualizado para ${nextZoom}%`, 'info');
            break;
          }

          case 'store-toast':
            CortexModal.toast('Evento disparado com sucesso pelo Store Demo!', 'info');
            break;

          case 'toggle-lang':
            toggleLanguage();
            this.render();
            break;

          case 'trigger-new-doc':
            window.dispatchEvent(new CustomEvent('cortex-menu-action', { detail: { action: 'new-doc' } }));
            break;

          case 'modal-alert':
            await CortexModal.alert({
              title: 'Demonstração — CortexModal.alert()',
              message: 'Este é um diálogo de alerta nativo do Framework CortexUI renderizado com suporte a todos os 12 temas.',
              type: 'info'
            });
            break;

          case 'modal-confirm': {
            const ok = await CortexModal.confirm({
              title: 'Demonstração — CortexModal.confirm()',
              message: 'Deseja confirmar esta operação de teste na documentação?',
              confirmText: 'Confirmar Teste',
              cancelText: 'Cancelar'
            });
            CortexModal.toast(`Resultado do Confirm: ${ok ? 'Confirmado (true)' : 'Cancelado (false)'}`, ok ? 'success' : 'warning');
            break;
          }

          case 'modal-prompt': {
            const val = await CortexModal.prompt({
              title: 'Demonstração — CortexModal.prompt()',
              message: 'Informe um nome para testar o retorno da Promise:',
              defaultValue: 'Componente CortexUI'
            });
            if (val !== null) {
              CortexModal.toast(`Valor digitado: "${val}"`, 'success');
            }
            break;
          }

          case 'modal-form': {
            const formRes = await CortexModal.form({
              title: 'Demonstração — CortexModal.form()',
              message: 'Formulário dinâmico gerado via configuração JSON:',
              fields: [
                { name: 'nome', label: 'Projeto:', type: 'text', value: 'Manual CortexUI' },
                { name: 'formato', label: 'Formato:', type: 'select', value: 'Desktop Widescreen', options: ['Desktop Widescreen', 'A4 Print', 'Mobile Responsive'] },
                { name: 'validado', label: 'Ativar Telemetria', type: 'checkbox', value: true }
              ],
              confirmText: 'Salvar Configuração'
            });
            if (formRes) {
              CortexModal.toast(`Form enviado: ${formRes.nome} (${formRes.formato})`, 'success');
            }
            break;
          }

          case 'modal-toast':
            CortexModal.toast('Notificação Toast disparada pela documentação!', 'success', 2600);
            break;

          case 'open-datagrid':
            if (this.getAttribute('standalone') !== 'true') this.close();
            window.dispatchEvent(new CustomEvent('cortex-menu-action', { detail: { action: 'insert-table' } }));
            CortexModal.toast('Janela Desktop Data Grid aberta e em foco!', 'info');
            break;

          case 'open-treeview':
            if (this.getAttribute('standalone') !== 'true') this.close();
            window.dispatchEvent(new CustomEvent('cortex-menu-action', { detail: { action: 'open-tree' } }));
            CortexModal.toast('Janela Scene TreeView Explorer aberta e em foco!', 'info');
            break;

          case 'open-palette':
            document.querySelector('cortex-command-palette')?.open();
            break;

          case 'open-context-btn': {
            const rect = e.currentTarget.getBoundingClientRect();
            document.querySelector('cortex-context-menu')?.open(rect.left, rect.bottom + 6, [
              { label: 'Ação de Demonstração 01', shortcut: 'Ctrl+1', action: 'add-rect' },
              { label: 'Abrir Command Palette', shortcut: 'Ctrl+K', action: 'open-palette' },
              { type: 'divider' },
              { label: 'Fechar Menu', shortcut: 'Esc', action: 'none' }
            ]);
            break;
          }

          case 'add-rect-stage':
            window.dispatchEvent(new CustomEvent('cortex-menu-action', { detail: { action: 'add-rect' } }));
            break;

          default:
            break;
        }
      });
    });
  }
}

customElements.define('cortex-docs', CortexDocs);
