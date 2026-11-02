# Finanças · Controle financeiro pessoal

🇺🇸 [Read this in English](README.en.md)

Aplicação de finanças pessoais feita em **Angular 20** com **Angular Material**, **Signals** e **Chart.js**. Registre receitas e despesas, organize tudo em categorias com cores e ícones, defina orçamentos mensais por categoria e acompanhe o mês em um painel com saldo, alertas de orçamento e gráficos. Os dados ficam no `localStorage` do navegador, atrás de uma camada de repositório que pode ser trocada por uma API sem mexer nas telas. Na primeira visita, o app gera dados de demonstração para você explorar.

**Demo:** https://portfolio.brunoisaac.dev/angular-finance-tracker/

![Visão geral do app com saldo do mês, despesas por categoria e receitas x despesas](docs/screenshot.png)

## Funcionalidades

- **Visão geral do mês** com navegação entre meses: saldo, receitas e despesas, comparação com o mês anterior e últimas transações.
- **Transações (CRUD)** em um diálogo do Material com formulário reativo tipado e validação: descrição, valor, data (`dd/mm/aaaa`), tipo receita/despesa, categoria filtrada pelo tipo e observações. Exclusão com confirmação e opção de desfazer.
- **Tabela de transações** com busca por texto (ignora acentos; procura em descrição, observações e categoria), filtros por tipo e categoria, ordenação por coluna, paginação e totais do resultado. Pode mostrar só o mês selecionado ou todo o período.
- **Categorias** de receita e despesa com cor e ícone, com validação de nome duplicado. Uma categoria em uso não pode ser excluída nem mudar de tipo.
- **Orçamentos mensais** por categoria, com barra de progresso, aviso a partir de 80% e alerta quando passa do limite (também no painel). O diálogo mostra a média de gasto dos últimos meses como referência.
- **Gráficos**: despesas por categoria (rosca, com legenda acessível) e receitas x despesas nos últimos 6 meses (barras). Os dois acompanham o tema claro/escuro e carregam sob demanda com `@defer`.
- **CSV**: exporta todas as transações (`;`, vírgula decimal, UTF-8 com BOM, abre direto no Excel) e importa arquivos próprios ou de outras ferramentas (`;` ou `,`, datas ISO ou brasileiras, valores negativos como despesa, cabeçalhos em português ou inglês). Linhas inválidas são listadas com o número da linha, e categorias desconhecidas são criadas.
- **Dados de demonstração** na primeira visita, mais as ações **Limpar dados** e **Restaurar demonstração**.
- **Português e inglês**: toda a interface (textos, `aria-label`, títulos das páginas, mensagens de validação, toasts, paginador) traduzida com Transloco. O idioma troca na hora pelas bandeiras no topo ou nas configurações e fica salvo.
- **Formatação pelo idioma**: valores sempre em BRL, mas formatados conforme o idioma (`R$ 1.234,56` / `R$1,234.56`), assim como datas, porcentagens, eixos dos gráficos e o datepicker (`dd/mm/aaaa` ou `mm/dd/yyyy`).
- **Tema claro/escuro** (segue o sistema até você escolher), layout responsivo com menu lateral recolhível e tabela compacta no celular.
- **Acessibilidade**: link para pular ao conteúdo, landmarks, rótulos ARIA, foco visível, `aria-live` nos resultados e estados de carregando, vazio e erro.

## Stack

| Camada       | Tecnologia                                                         |
| ------------ | ------------------------------------------------------------------ |
| Framework    | Angular 20.3 (standalone, zoneless, Signals, controle de fluxo novo) |
| UI           | Angular Material / CDK 20.2 (tema Material 3)                     |
| i18n         | @jsverse/transloco 8.2 (escopos lazy por feature)                  |
| Gráficos     | Chart.js 4.5 + ng2-charts 9                                        |
| Formulários  | Reactive Forms tipados                                             |
| Linguagem    | TypeScript 5.9 (`strict`)                                          |
| Testes       | Karma 6.4 + Jasmine 5.9 (Chrome Headless)                          |
| Qualidade    | ESLint 9 + angular-eslint 20.7, Prettier 3.8                       |
| Build/Deploy | Angular CLI 20.3 (esbuild), GitHub Actions, Cloudflare (Workers static assets) |

## Arquitetura e decisões

```
src/app/
├── app.component.ts · app.config.ts · app.routes.ts
├── core/                     singletons usados pelo app todo
│   ├── i18n/                 Transloco, LanguageService, loader HTTP, títulos traduzidos
│   ├── layout/               shell (menu, barra superior, estados de carregando/erro)
│   ├── models/               Transaction, Category, Budget, FinanceData (*.model.ts)
│   ├── domain/               cálculos puros: resumo do mês, totais, orçamentos
│   ├── state/                FinanceStore e SelectedMonthStore (signals)
│   ├── storage/              FinanceRepository (abstração) + localStorage / memória
│   ├── services/             tema e notificações
│   └── data/                 categorias padrão e gerador de dados de demonstração
├── shared/                   componentes de UI, pipes, adapters e utils sem regra de negócio
└── features/                 cada feature é um chunk lazy
    ├── dashboard/            dashboard.routes.ts · pages/ · components/ · data-access/
    ├── transactions/         transactions.routes.ts · pages/ · components/ · data-access/
    ├── budgets/              budgets.routes.ts · pages/ · components/
    ├── categories/           categories.routes.ts · pages/ · components/ · models/
    └── settings/             settings.routes.ts · pages/ · data-access/ (CSV)
```

- **Lazy loading em todas as features.** O `app.routes.ts` só tem o shell e um `loadChildren` por feature, e cada `*.routes.ts` carrega a página com `loadComponent`. Nenhum componente de feature é importado fora dela. O build gera chunks separados para cada feature (`dashboard-routes`, `dashboard-page-component`, `transactions-routes`, `transactions-page-component`, `budgets-page-component`, `categories-page-component`, `settings-page-component`) e para cada gráfico (`expenses-chart-component`, `monthly-chart-component`). O Chart.js é registrado nos `providers` da rota do dashboard, então só baixa junto com esse chunk. Os gráficos ainda passam por `@defer (on viewport)`. Os chunks são pré-carregados em segundo plano com `PreloadAllModules`.
- **Signals como estado.** O `FinanceStore` guarda um único `signal<FinanceData>`. Todo o resto (categorias por id, uso por categoria, orçamentos) é `computed`, e um `effect` persiste cada mudança. Nas telas, filtros, ordenação e paginação também são signals. A página volta para a primeira página com `linkedSignal` quando os filtros mudam, e um `computed` mantém o índice dentro do intervalo quando linhas somem.
- **Repositório assíncrono.** `FinanceRepository` é uma classe abstrata usada como token de DI, com `load/save/clear` retornando `Promise`, como faria uma API HTTP. Existem a implementação com `localStorage` (que valida a forma e a versão dos dados salvos) e uma em memória para os testes.
- **Dinheiro em centavos.** Valores são inteiros (`amountCents`) para evitar erros de ponto flutuante. A formatação usa o pipe `brl` (`formatCurrency` com `pt-BR`).
- **Datas como `YYYY-MM-DD`.** Assim não há deslocamento de fuso (`new Date('2026-04-01')` seria 31/03 no Brasil). O pipe `isoDate` converte para data local antes do `DatePipe`, e o `BrDateAdapter` faz o datepicker entender `dd/mm/aaaa`.
- **Regras puras e testáveis.** Os cálculos financeiros, a consulta da tabela (filtrar, ordenar e paginar) e o CSV são funções puras, separadas dos componentes.
- **Zoneless + OnPush.** `provideZonelessChangeDetection()` e `ChangeDetectionStrategy.OnPush` em todos os componentes, garantidos por regra do ESLint.
- **Convenções.** Arquivos com sufixo de tipo (`*.component.ts`, `*.service.ts`, `*.routes.ts`, `*.model.ts`, `*.store.ts`), configurados nos `schematics` do `angular.json`. Tudo usa `input()`, `output()`, `model()`, `inject()` e bindings no objeto `host`.


## Internacionalização

O app está em **português (pt-BR, padrão)** e **inglês (en)**, com [Transloco](https://jsverse.gitbook.io/transloco).

**Como funciona**

- **Arquivos de tradução** em `public/i18n/`: `pt-BR.json` e `en.json` têm os textos globais (menu, shell, botões comuns, paginador, navegador de meses). Cada feature tem um **escopo** próprio em `public/i18n/<feature>/<idioma>.json` (`dashboard`, `transactions`, `budgets`, `categories`, `settings`).
- **Escopos lazy.** Cada `*.routes.ts` declara `provideTranslocoScope('<feature>')`, então as traduções de uma feature só são baixadas quando a rota abre, junto com o chunk dela. Os diálogos, que o `MatDialog` cria fora do injector da rota, declaram o próprio escopo.
- **Idioma inicial**: escolha salva no `localStorage`, depois o idioma do navegador (`pt*` vira pt-BR e `en*` vira en), e por último pt-BR. O `LanguageService` (signals) mantém o Transloco, o `<html lang>` e o `localStorage` sincronizados e expõe o `locale` ativo (`pt-BR` ou `en-US`).
- **Seletor de idioma**: um `radiogroup` com as bandeiras do Brasil e dos EUA em SVG inline (emoji de bandeira não funciona no Windows). Cada opção tem nome acessível no próprio idioma, atributo `lang`, tooltip e navegação por setas. Aparece no topo e em Configurações.
- **Formatação.** Os pipes `brl`, `localDate` e `localPercent` usam o locale ativo e marcam a view para checagem quando o idioma muda, por isso funcionam com OnPush. A moeda continua BRL, porque o domínio é brasileiro. Os dados locais de `pt` são registrados com `registerLocaleData`; os de `en` já vêm com o Angular.
- **Títulos das páginas**: o `title` de cada rota é uma chave, e um `TitleStrategy` próprio traduz e reaplica o título quando o idioma muda. O `MatPaginatorIntl` também é traduzido.
- **Texto no TypeScript**: valores calculados retornam `{ key, params }` (veja `shared/i18n/translated-text.ts`) e o template aplica `| transloco`. Rótulos de gráfico usam `translateSignal`.
- **Conteúdo gerado** (dados de demonstração e categorias padrão) é criado no idioma ativo no momento em que é gerado. Depois disso vira dado do usuário e não muda com o idioma, como qualquer texto digitado.
- **CSV no idioma ativo**: em pt-BR o arquivo sai com cabeçalhos em português, `;` e vírgula decimal; em inglês, com `date,description,amount,...`, `,` e ponto decimal. A importação aceita os dois formatos.

**Como adicionar um idioma** (por exemplo, `es`)

1. Copie `public/i18n/en.json` e cada `public/i18n/<feature>/en.json` para `es.json` e traduza.
2. Em `src/app/core/i18n/language.ts`, inclua `'es'` em `AVAILABLE_LANGS` e adicione as entradas em `LANG_LOCALES` (`'es-ES'`) e `LANG_LABELS` (`'Español'`). Ajuste `detectLanguage` se quiser detectar `es*`.
3. Registre os dados de locale em `src/app/core/i18n/register-locales.ts` (`registerLocaleData(localeEs, 'es-ES')`).
4. Adicione a bandeira em `shared/components/flag-icon/flag-icon.component.ts` e, se quiser, o formato de CSV em `CSV_FORMATS`.
5. Inclua os arquivos novos em `src/testing/i18n.testing.ts` para os testes.

## Como rodar

Pré-requisito: Node.js 22.

```bash
npm install
npm start            # http://localhost:4200
```

Outros scripts:

```bash
npm test             # testes em modo watch (Karma)
npm run test:ci      # testes uma vez em Chrome Headless
npm run lint         # ESLint (TS + templates, inclusive regras de acessibilidade)
npm run format       # Prettier
npm run build        # build de produção em dist/
```

Para gerar o build publicado (com base `/angular-finance-tracker/`): `npm run build:cf` (saída em `dist/angular-finance-tracker/browser`).

## CI

`.github/workflows/ci.yml`: em push e PR para `main`, roda `npm ci`, lint, verificação de formatação, testes em Chrome Headless e build.

## Deploy

Publicado na Cloudflare (Workers static assets) em https://portfolio.brunoisaac.dev/angular-finance-tracker/ pelo pipeline do repositório [portfolio](https://github.com/BrunoICosta/portfolio). O pipeline roda `npm run build:cf` e copia `dist/angular-finance-tracker/browser` para `/angular-finance-tracker/`. O fallback de SPA (qualquer rota servindo o `index.html` do app) fica no Worker.

## Próximos passos

- Backend real: implementar um `HttpFinanceRepository` e trocar o provider em `app.config.ts`.
- Transações recorrentes (salário, aluguel) e parcelamentos.
- Várias contas e cartões, com transferência entre contas.
- Metas de economia e projeção de saldo.
- Importação de OFX e mapeamento de colunas do CSV.
- Testes end-to-end com Playwright.
- Mais idiomas (espanhol) e formatos de data/CSV configuráveis pelo usuário.

## Autor

**Bruno Vinicius Isaac Costa** · https://github.com/BrunoICosta

Licença [MIT](LICENSE).
