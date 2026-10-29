# CortexUI Framework 🧠✨

> Framework de Componentes Web Nativos (Custom Elements & Shadow DOM), Suíte Enterprise Completa, Editores Visuais e Sistema Dinâmico de 12 Temas Retrô, Modernos e Futuristas.

![CortexUI Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Vanilla Web Components](https://img.shields.io/badge/tech-Web%20Components%20%7C%20ES%20Modules-green.svg)
![12 Themes Supported](https://img.shields.io/badge/themes-12%20Active%20Themes-purple.svg)
![Zero Heavy Dependencies](https://img.shields.io/badge/dependencies-0%20(Pure%20Vanilla)-orange.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🌟 Visão Geral

O **CortexUI** é um framework moderno e autossuficiente para desenvolvimento de aplicações web corporativas de alto desempenho e ricas em recursos gráficos e de produtividade desktop. Desenvolvido 100% sobre padrões abertos da web (**Web Components**, **Custom Elements**, **Shadow DOM**, **CSS Custom Properties** e **ES Modules**), o CortexUI opera diretamente no navegador com **zero dependências pesadas de terceiros**.

---

## 🚀 Principais Módulos e Componentes

### 📐 1. Advanced Views & Editores Visuais
* **`<cortex-diagram>` (Diagram Editor & Organograma)**:
  - Editor vetorial interativo de fluxo de processos, arquiteturas e organogramas empresariais.
  - Conectores magnéticos inteligentes ortogonais e retos com setas direcionais.
  - Alças de redimensionamento em 8 direções, rotação contínua $360^\circ$ e agrupamento/desagrupamento (`Ctrl+G` / `Ctrl+Shift+G`).
  - Janela flutuante desktop interna para edição de texto sem perda do modo Tela Cheia (*Fullscreen*).
  - Menu de contexto Z-Order (Trazer para frente, avançar camada, recuar, girar $90^\circ$, duplicar).
* **`<cortex-tree-list>`**: Árvore hierárquica multinível com ordenação, filtro rápido, seleção de linhas e arrasto dinâmico de nós.
* **`<cortex-pivot-grid>`**: Tabela dinâmica analítica OLAP com dimensões configuráveis, cálculo automático de totais/médias e drill-down.
* **`<cortex-spreadsheet>`**: Planilha eletrônica estilo Excel com suporte a fórmulas matemáticas (`SUM`, `AVERAGE`, `COUNT`, `MAX`, `MIN`), múltiplas abas e formatação monetária.
* **`<cortex-file-manager>`**: Gerenciador de arquivos estilo Windows Explorer/macOS Finder com visualização em grade e lista, pré-visualizações, busca instantânea e manipulação de pastas.

### 📅 2. Suíte de Planejamento & Produtividade
* **`<cortex-scheduler-resources>`**:
  - Grade de agendamento multi-recursos (por colaboradores, salas ou veículos).
  - Vistas flexíveis de **Dia**, **Semana** e **Mês**.
  - Arrasto e redimensionamento de agendamentos (*drag & drop*) com recálculo automático de horários.
* **`<cortex-scheduler-workweek>`**: Calendário corporativo semanal (*Work Week*) com linha dedicada para eventos de dia inteiro (*All-day*) e blocos horários contínuos.
* **`<cortex-tasks-scheduler-grid>`**: Grade de tarefas com calendário popover integrado, classificação multi-coluna e paginação.
* **`<cortex-kanban>`**: Quadro Kanban interativo com colunas de status, contadores de cartões e movimentação fluida.
* **`<cortex-gantt>`**: Gráfico de Gantt empresarial com linhas do tempo, marcos (*milestones*), dependências e percentual de progresso.

### 🪟 3. Desktop Shell & Infraestrutura
* **`<cortex-floating-window>`**: Janelas flutuantes com cabeçalho arrastável, redimensionamento pelos cantos, minimizar, maximizar e fechar.
* **`<cortex-command-palette>`**: Paleta de comandos universal estilo VS Code / Raycast (`Ctrl+K`).
* **`<cortex-menubar>` & `<cortex-toolbar>`**: Barras de menu clássicas e toolbars modulares personalizáveis.
* **`<cortex-context-menu>`**: Menus de contexto acionados com botão direito adaptados ao tema ativo.
* **`<cortex-modal>`**: Sistema de diálogos e formulários modais declarativos assíncronos (`CortexModal.form(...)`).
* **`<cortex-statusbar>`**: Barra de status inferior com telemetria, contadores de zoom e status de conexão.

---

## 🎨 Sistema de 12 Temas Dinâmicos

O CortexUI conta com um sistema de temas baseado em CSS Variables que atravessam o Shadow DOM perfeitamente:

| Tema | Descrição / Inspiração |
| :--- | :--- |
| **`dark`** | Dark mode moderno e elegante estilo VS Code / Linear |
| **`macos-light`** | Design limpo e translúcido inspirado no macOS Sonoma |
| **`macos-ventura`** | Palco Stage Manager em azul-oceano e janelas elegantes |
| **`medium-green`** | Verde floresta profundo relaxante e focado |
| **`medium-blue`** | Slate blue corporativo com alto contraste |
| **`win12`** | Design Fluent contemporâneo com tons lavanda e vidro acrílico |
| **`winxp`** | Visual Luna autêntico com barra azul clássica e relevos 3D |
| **`win2000`** | Relevos clássicos chanfrados (Bevel) e paleta corporativa Windows 2000 |
| **`win98`** | Estilo retrô nostálgico com fundo Desktop Teal `#008080` e botões chanfrados |
| **`msdos`** | Azul VGA clássico (`#0000aa`) com tipografia monoespaçada CRT |
| **`hacker`** | Verde Fósforo Matrix sobre preto obsidiana para terminais e dashboards |
| **`futuristic`** | Deep Space holográfico com tons neon ciano e roxo |

---

## 🌍 Suporte Multilíngue (i18n)

Internacionalização nativa com suporte a:
- 🇧🇷 Português (pt-BR)
- 🇺🇸 Inglês (en-US)
- 🇪🇸 Espanhol (es-ES)
- 🇫🇷 Francês (fr-FR)
- 🇩🇪 Alemão (de-DE)

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
Apenas o **Node.js** instalado (para servir os arquivos estáticos) ou qualquer servidor HTTP local.

### Passos:

1. Clone o repositório:
```bash
git clone https://github.com/eltpmoc/FrameworkCortexUI.git
cd FrameworkCortexUI
```

2. Inicie o servidor local:
```bash
npm start
```
*Ou usando npx direto:*
```bash
npx serve -l 3000 .
```

3. Abra no navegador:
- Demonstração Interativa completa: **`http://localhost:3000/docs`**
- Aplicação Desktop Shell: **`http://localhost:3000/index.html`**

---

## 📁 Estrutura de Diretórios

```
FrameworkCortexUI/
├── docs/                 # Guias, exemplos e documentação de apoio
├── img/                  # Ativos gráficos e ícones
├── src/
│   ├── components/       # Componentes Web (Diagram, Schedulers, Views, etc.)
│   │   └── planning/     # Suítes especializadas de Scheduler, Gantt e Kanban
│   ├── core/             # Base CortexElement, State Store e motor de i18n
│   ├── engine/           # Motores de renderização e utilitários
│   └── styles/           # Sistema de 12 temas CSS (theme.css)
├── docs.html             # Showcase e documentação interativa ao vivo
├── index.html            # Shell desktop com todos os módulos integrados
├── package.json          # Metadados e scripts
└── README.md             # Documentação principal
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte `LICENSE` para mais detalhes.

---
*Desenvolvido com carinho por **Elton Alves Pereira**.*
