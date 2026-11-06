const app = document.getElementById('app');
const toastBox = document.getElementById('toast');
const navButtons = Array.from(document.querySelectorAll('[data-route]'));
const storageKey = 'recomeco-pwa-v2';
const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
state.start = state.start || new Date(Date.now() - 41 * 86400000).toISOString();
state.records = Array.isArray(state.records) ? state.records : [];
let registerTab = 'drinks';
let selectedOption = 0;
let amount = 1;

function save() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}
function daysSober() {
  return Math.max(1, Math.floor((Date.now() - new Date(state.start)) / 86400000) + 1);
}
function notify(message) {
  toastBox.textContent = message;
  toastBox.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(function () {
    toastBox.classList.remove('show');
  }, 2300);
}
function setActiveNav(route) {
  navButtons.forEach(function (button) {
    button.classList.toggle('active', button.dataset.route === route);
  });
}
function icon(name, className) {
  const cls = className || 'icon';
  const common = 'class="' + cls + '" viewBox="0 0 48 48" fill="none" stroke="#123c2f" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  const icons = {
    home: '<svg ' + common + '><path d="m7 22 17-14 17 14v17a3 3 0 0 1-3 3h-9V30h-10v12H10a3 3 0 0 1-3-3Z"/></svg>',
    chart: '<svg ' + common + '><path d="M9 39V9M9 39h32"/><path d="m15 31 7-7 6 4 10-14"/></svg>',
    plus: '<svg ' + common + '><circle cx="24" cy="24" r="17"/><path d="M24 15v18M15 24h18"/></svg>',
    book: '<svg ' + common + '><path d="M9 8a4 4 0 0 1 4-4h26v35H13a4 4 0 0 0-4 4Z"/><path d="M9 8v35M17 13h14M17 20h14M17 27h10"/></svg>',
    user: '<svg ' + common + '><circle cx="24" cy="16" r="7"/><path d="M10 39c2-7 6.6-10.5 14-10.5S36 32 38 39"/></svg>',
    back: '<svg ' + common + '><path d="m29 10-14 14 14 14"/></svg>',
    pencil: '<svg ' + common + '><path d="m9 38 3-10L31 9a5 5 0 0 1 7 7L19 35Z"/><path d="m27 13 8 8M9 38h10"/></svg>',
    trophy: '<svg ' + common + '><path d="M15 10h18v10c0 7-4.5 11-9 11s-9-4-9-11Z"/><path d="M15 14H8v2c0 4 2 7 7 7M33 14h7v2c0 4-2 7-7 7M24 31v6M17 41h14"/></svg>',
    heart: '<svg ' + common + '><path d="M24 40S7 29.8 7 18.3C7 12.5 11 9 16.5 9c3.1 0 5.8 1.7 7.5 4.3C25.7 10.7 28.4 9 31.5 9 37 9 41 12.5 41 18.3 41 29.8 24 40 24 40Z"/></svg>',
    check: '<svg ' + common + '><circle cx="24" cy="24" r="17"/><path d="m16 24 5 5 11-12"/></svg>',
    info: '<svg ' + common + '><circle cx="24" cy="24" r="16"/><path d="M24 21v11M24 15h.01"/></svg>',
    pig: '<svg ' + common + '><path d="M12 28c0-8 5-13 14-13 5 0 9 2 11 7h3v7h-4c-1 5-5 8-11 8h-5c-5 0-8-3-8-9Z"/><path d="M14 18 10 14M36 20l4-3M20 26h.01M29 26h.01M22 37v5M31 37v5"/></svg>',
    moon: '<svg ' + common + '><path d="M34 8c-2 8 3 16 11 18-3 7-9 11-18 11-10 0-18-7-18-17 0-8 5-15 13-17-1 2-1 4 0 6 2 4 7 5 12 2Z" fill="#73504e" stroke="#73504e"/><path d="m37 12 2-2M41 18l3-1"/></svg>',
    calendar: '<svg ' + common + '><rect x="9" y="11" width="30" height="28" rx="3"/><path d="M15 7v8M33 7v8M9 19h30M16 27l4 4 9-10"/></svg>',
    beer: '<svg ' + common + '><path d="M13 18h22v19H13z" fill="#ffd15b"/><path d="M35 22h4a5 5 0 0 1 0 10h-4"/><path d="M17 12v6M23 11v7M29 12v6"/><path d="M13 18c2-5 4-6 7-4 2-4 5-4 7 0 3-2 6 0 8 4Z" fill="#fffaf1"/></svg>',
    chopp: '<svg ' + common + '><path d="M12 18h22v19H12z" fill="#ffd15b"/><path d="M34 22h4a5 5 0 0 1 0 10h-4"/><path d="M16 13c2-4 4-4 6-1 2-4 5-4 7 0 2-2 4-1 6 3H14Z" fill="#fffaf1"/></svg>',
    wineRed: '<svg ' + common + '><path d="M14 11h20c0 9-4 13-10 13s-10-4-10-13Z" fill="#a63e52"/><path d="M24 24v11M17 39h14"/></svg>',
    wineWhite: '<svg ' + common + '><path d="M14 11h20c0 9-4 13-10 13s-10-4-10-13Z" fill="#f5d57f"/><path d="M24 24v11M17 39h14"/></svg>',
    sparkleWine: '<svg ' + common + '><path d="M14 10h20c0 9-4 14-10 14s-10-5-10-14Z" fill="#f4d97c"/><path d="M24 24v11M17 39h14M10 8h3M11.5 6v4"/></svg>',
    vodka: '<svg ' + common + '><path d="M19 8h10v5h-2v24H17V13h2Z" fill="#c7d8f2"/><path d="M17 19h10"/></svg>',
    whisky: '<svg ' + common + '><path d="M10 17h28l-3 20H13Z" fill="#f3ab2c"/><path d="M10 17h28M16 25h16"/></svg>',
    cachaca: '<svg ' + common + '><path d="M12 18h24l-3 19H15Z" fill="#e8d991"/><path d="M14 24h20"/></svg>',
    rum: '<svg ' + common + '><path d="M10 17h28l-3 20H13Z" fill="#f0a72d"/><path d="M10 17h28M16 25h16"/></svg>',
    gin: '<svg ' + common + '><path d="m10 12 14 22 14-22Z" fill="#87d6bd"/><path d="M24 34v5M17 42h14M34 8l4-3M37 2v5"/></svg>',
    tequila: '<svg ' + common + '><path d="M12 17h24l-2 20H14Z" fill="#f6bc43"/><path d="M12 17h24M17 26h14"/></svg>',
    cocktail: '<svg ' + common + '><path d="m9 12 15 16 15-16Z" fill="#fb883e"/><path d="M24 28v10M17 42h14M35 9l6-5"/><path d="M33 15c5-1 8 1 8 6-5 1-8-1-8-6Z" fill="#88bd54"/></svg>',
    cannabis: '<svg ' + common + '><path d="M24 41V20"/><path d="M24 29c-8 0-13-5-13-12 7 0 12 4 13 12ZM24 29c8 0 13-5 13-12-7 0-12 4-13 12Z" fill="#4a9c52"/><path d="M24 23c-5-5-5-11-1-17 5 4 5 10 1 17ZM24 23c5-5 5-11 1-17-5 4-5 10-1 17Z" fill="#5da65a"/></svg>',
    cocaine: '<svg ' + common + '><path d="M8 33c5-6 12-9 20-8 5 0 9 3 12 8" fill="#eee9eb"/><path d="M13 27c4-7 10-8 15-3M22 25c3-7 7-7 11-2" stroke="#9e89ab"/></svg>',
    crack: '<svg ' + common + '><path d="m9 34 7-11 9 8 6-13 8 16Z" fill="#eca869"/><path d="m16 23 4 6M31 18l2 10"/></svg>',
    mdma: '<svg ' + common + '><path d="M13 31c-3-3-3-8 0-11l11-9c3-3 8-3 11 0s3 8 0 11l-11 9c-3 3-8 3-11 0Z" fill="#d6b7eb"/><path d="m17 19 13 11"/></svg>',
    amphetamine: '<svg ' + common + '><path d="M13 31c-3-3-3-8 0-11l11-9c3-3 8-3 11 0s3 8 0 11l-11 9c-3 3-8 3-11 0Z" fill="#b4d99a"/><path d="m17 19 13 11"/></svg>',
    meth: '<svg ' + common + '><path d="m13 31 4-15 7 6 6-12 5 13-8 10Z" fill="#b9a6ee"/><path d="m13 31 11-9 11 1"/></svg>',
    opioid: '<svg ' + common + '><path d="M13 31c-3-3-3-8 0-11l11-9c3-3 8-3 11 0s3 8 0 11l-11 9c-3 3-8 3-11 0Z" fill="#e2c9eb"/><path d="m17 19 13 11"/></svg>',
    heroin: '<svg ' + common + '><path d="M8 33c5-6 12-9 20-8 5 0 9 3 12 8" fill="#eee9eb"/><path d="M13 27c4-7 10-8 15-3M22 25c3-7 7-7 11-2" stroke="#9e89ab"/></svg>',
    benzo: '<svg ' + common + '><rect x="10" y="15" width="28" height="18" rx="9" fill="#dbcae6"/><path d="M24 15v18"/></svg>',
    inhalant: '<svg ' + common + '><path d="M17 20h15v20H17z" fill="#d5c2ea"/><path d="M20 16h8v4h-8ZM28 17h9M36 13l5-3M37 22h5"/></svg>',
    tobacco: '<svg ' + common + '><path d="M11 34c11-13 19-20 29-23-2 12-9 21-22 26Z" fill="#7bb45e"/><path d="M12 38c6-9 12-15 22-21"/></svg>',
    other: '<svg ' + common + '><circle cx="13" cy="24" r="2" fill="#123c2f"/><circle cx="24" cy="24" r="2" fill="#123c2f"/><circle cx="35" cy="24" r="2" fill="#123c2f"/></svg>'
  };
  return icons[name] || icons.other;
}

function brandMark() {
  return '<svg viewBox="0 0 48 48" fill="none"><path d="M24 42V20" stroke="#237e4e" stroke-width="2.2"/><path d="M24 29C14 29 8 23 8 13c9 0 16 5 16 16Z" fill="#479d55"/><path d="M24 34c10 0 16-6 16-16-9 0-16 5-16 16Z" fill="#78b563"/></svg>';
}

const drinks = [
  ['beer', 'Cerveja'], ['chopp', 'Chopp'], ['wineRed', 'Vinho tinto'], ['wineWhite', 'Vinho branco'],
  ['sparkleWine', 'Espumante'], ['vodka', 'Vodka'], ['whisky', 'Whisky'], ['cachaca', 'Cachaça'],
  ['rum', 'Rum'], ['gin', 'Gin'], ['tequila', 'Tequila'], ['wineRed', 'Licor'],
  ['cocktail', 'Drinks'], ['other', 'Outra bebida']
];
const drugs = [
  ['cannabis', 'Cannabis'], ['cocaine', 'Cocaína'], ['crack', 'Crack'],
  ['mdma', 'MDMA / ecstasy'], ['amphetamine', 'Anfetaminas'], ['meth', 'Metanfetamina'],
  ['opioid', 'Opioides'], ['heroin', 'Heroína'], ['benzo', 'Benzodiazepínicos'],
  ['inhalant', 'Inalantes'], ['tobacco', 'Tabaco'], ['other', 'Outra substância']
];

function renderHome() {
  const count = daysSober();
  setActiveNav('inicio');
  app.innerHTML =
    '<section class="screen">' +
      '<header class="home-header"><h1 class="home-title">Recomeço</h1><button class="round-button" data-action="profile" aria-label="Perfil">' + icon('user') + '</button></header>' +
      '<div class="landscape" aria-hidden="true"><span class="sun"></span><span class="road"></span><span class="leaf"></span><span class="leaf two"></span></div>' +
      '<div class="streak"><div><strong>' + count + ' dias</strong><span>sem beber e sem usar</span></div></div>' +
      '<div class="stats"><div class="stat green">' + icon('trophy') + '<small>Recorde sóbrio</small><strong>' + Math.max(87, count) + ' dias</strong></div><div class="stat peach">' + icon('heart') + '<small>Marco de saúde</small><strong>' + Math.min(30, count) + ' dias</strong></div></div>' +
      '<h2 class="section-title">Conselho do dia</h2>' +
      '<div class="advice"><p>Você não precisa decidir tudo agora. Escolha o próximo minuto.</p></div>' +
      '<button class="primary" data-route="registrar">' + icon('pencil') + 'Registrar consumo</button>' +
    '</section>';
}

function renderRegister() {
  setActiveNav('registrar');
  const list = registerTab === 'drinks' ? drinks : drugs;
  app.innerHTML =
    '<section class="screen">' +
      '<div class="register-top"><button class="back" data-route="inicio" aria-label="Voltar">' + icon('back') + '</button><div class="brand">' + brandMark() + '<span>Recomeço</span></div><span class="ghost"></span></div>' +
      '<h1 class="register-title">Registrar consumo</h1>' +
      '<div class="segmented"><button class="' + (registerTab === 'drinks' ? 'active' : '') + '" data-tab="drinks">Bebidas alcoólicas</button><button class="' + (registerTab === 'drugs' ? 'active' : '') + '" data-tab="drugs">Outras drogas</button></div>' +
      '<div class="wave"><span class="wave-mark ' + (registerTab === 'drinks' ? 'sun' : 'heart') + '"></span></div>' +
      '<h2 class="question">' + (registerTab === 'drinks' ? 'Qual bebida você bebeu?' : 'O que você usou?') + '</h2>' +
      '<div class="option-grid ' + (registerTab === 'drugs' ? 'drugs' : '') + '">' +
        list.map(function (item, index) {
          return '<button class="option ' + (selectedOption === index ? 'selected' : '') + '" data-option="' + index + '">' + (selectedOption === index ? '<span class="check">✓</span>' : '') + icon(item[0]) + '<span>' + item[1] + '</span></button>';
        }).join('') +
      '</div>' +
      (registerTab === 'drinks'
        ? '<div class="quantity"><div><strong>Quantidade</strong><small>Dose / lata / taça</small></div><div class="quantity-control"><button data-amount="-">−</button><output>' + amount + '</output><button data-amount="+">+</button></div></div><button class="primary" data-action="save">Continuar</button>'
        : '<div class="info">' + icon('heart') + '<span>Registrar é informação para cuidar.</span></div><button class="primary" data-action="save">Salvar registro</button>') +
    '</section>';
}

function renderPath() {
  setActiveNav('caminho');
  app.innerHTML =
    '<section class="screen">' +
      '<div class="path-heading"><h1 class="path-title">Meu caminho</h1><svg class="path-leaf" viewBox="0 0 90 90" fill="none"><path d="M38 85V37" stroke="#287d4f" stroke-width="2"/><path d="M38 57C21 57 10 46 10 28c16 0 28 10 28 29Z" fill="#6eaa63"/><path d="M39 68c17 0 29-11 29-30-16 0-29 10-29 30Z" fill="#90bd75"/></svg></div>' +
      '<div class="path-backdrop"><div class="ring"><div class="ring-content"><strong>' + daysSober() + '</strong><span>dias</span></div></div></div>' +
      '<div class="metrics"><div class="metric green">' + icon('pig') + '<span>Economizei</span><strong>R$ 1.260</strong></div><div class="metric peach">' + icon('moon') + '<span>Sono<br>melhorando</span></div><div class="metric lav">' + icon('calendar') + '<span>3 check-ins<br>esta semana</span></div></div>' +
      '<h2 class="history-title">Histórico recente</h2>' +
      '<div class="history"><div class="history-row"><div class="history-left"><span class="history-check">✓</span><strong>Hoje <em>· sem consumo</em></strong></div><span class="history-arrow">›</span></div><div class="history-row"><div class="history-left"><span class="history-check">✓</span><strong>Ontem <em>· sem consumo</em></strong></div><span class="history-arrow">›</span></div></div>' +
      '<button class="primary" data-action="checkin">' + icon('check') + 'Fazer check-in</button>' +
    '</section>';
}

function renderSupport() {
  setActiveNav('apoio');
  app.innerHTML =
    '<section class="screen"><div class="support"><div class="brand" style="justify-content:flex-start;margin-bottom:17px">' + brandMark() + '<span>Recomeço</span></div><h1>Apoio para agora.</h1><p>Você não precisa atravessar uma vontade sozinho. Escolha um pequeno passo e siga no seu ritmo.</p><button class="support-link" data-route="registrar">' + icon('pencil') + '<span><strong>Registrar com cuidado</strong><small>Informação também é autocuidado.</small></span></button><button class="support-link" data-action="checkin">' + icon('heart') + '<span><strong>Fazer check-in</strong><small>Nomeie como você está hoje.</small></span></button></div><div class="info">' + icon('info') + '<span>Em uma emergência, ligue 192 ou procure atendimento imediato.</span></div></section>';
}

function render() {
  const route = location.hash.slice(1) || 'inicio';
  if (route === 'registrar') renderRegister();
  else if (route === 'caminho') renderPath();
  else if (route === 'apoio') renderSupport();
  else renderHome();
}

document.addEventListener('click', function (event) {
  const routeTarget = event.target.closest('[data-route]');
  if (routeTarget) {
    location.hash = routeTarget.dataset.route;
    return;
  }
  const tabTarget = event.target.closest('[data-tab]');
  if (tabTarget) {
    registerTab = tabTarget.dataset.tab;
    selectedOption = 0;
    renderRegister();
    return;
  }
  const optionTarget = event.target.closest('[data-option]');
  if (optionTarget) {
    selectedOption = Number(optionTarget.dataset.option);
    renderRegister();
    return;
  }
  const amountTarget = event.target.closest('[data-amount]');
  if (amountTarget) {
    amount = Math.max(1, amount + (amountTarget.dataset.amount === '+' ? 1 : -1));
    renderRegister();
    return;
  }
  const actionTarget = event.target.closest('[data-action]');
  const action = actionTarget && actionTarget.dataset.action;
  if (action === 'profile') notify('Seu progresso fica salvo neste aparelho.');
  if (action === 'checkin') notify('Check-in salvo. Obrigado por se ouvir.');
  if (action === 'save') {
    const list = registerTab === 'drinks' ? drinks : drugs;
    state.records.push({ label: list[selectedOption][1], amount: amount, date: new Date().toISOString() });
    save();
    notify('Registro salvo com cuidado.');
    setTimeout(function () { location.hash = 'caminho'; }, 350);
  }
});

window.addEventListener('hashchange', render);
document.querySelectorAll('[data-nav-icon]').forEach(function (slot) {
  slot.innerHTML = icon(slot.dataset.navIcon);
});
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/app/recomeco/sw.js', { scope: '/app/recomeco/' }).catch(function () {});
  });
}
render();
