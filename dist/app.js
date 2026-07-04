var content = document.getElementById('content');
var summaryEl = document.getElementById('summary');
var inp = document.getElementById('inp');
var catEl = document.getElementById('cat');
var rcat = document.getElementById('rcat');
var modal = document.getElementById('modal');
var tabsEl = document.getElementById('tabs');
var statsEl = document.getElementById('stats');
var filter = '';
var data = JSON.parse(localStorage.getItem('memos') || '[]');
var allCats = ['日常', '健身', '高光', '箴言'];

function pad(n) { return n < 10 ? '0' + n : n; }

function todayStr() {
  var d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function todayKey(timeStr) {
  if (!timeStr) return '';
  return timeStr.substring(0, 10);
}

function isToday(timeStr) {
  return todayKey(timeStr) === todayStr();
}

function now() {
  var d = new Date();
  return todayStr() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function todayItems() {
  return data.filter(function(i) { return isToday(i.time); });
}

function generateAISummary(items, counts) {
  var total = items.length;
  var fitness = counts['健身'] || 0;
  var highlight = counts['高光'] || 0;
  var mood;
  if (fitness >= 2) mood = '自律';
  else if (highlight >= 1) mood = '积极';
  else if (total >= 5) mood = '充实';
  else mood = '平稳';
  var insight;
  if (fitness >= 3) insight = '你今天的行动力很强，呈现高执行状态。';
  else if (fitness === 0 && highlight === 0) insight = '今天偏向记录与整理，没有明显行动事件。';
  else insight = '今天的节奏比较均衡，有一定生活记录。';
  var advice;
  if (fitness === 0) advice = '建议增加轻量运动，让状态更有活力。';
  else if (highlight === 0) advice = '可以尝试记录一些生活中的高光瞬间。';
  else advice = '保持当前节奏即可。';
  return { mood: mood, insight: insight, advice: advice };
}

function renderSummary() {
  var items = todayItems();
  var counts = {};
  allCats.forEach(function(c) { counts[c] = 0; });
  if (!items.length) {
    summaryEl.innerHTML = '<div class="dashboard">'
      + '<div class="dash-header"><h2>今日总结</h2></div>'
      + '<div class="dash-divider"></div>'
      + '<div class="summary-empty">今日暂无记录</div>'
      + '</div>';
    return;
  }
  items.forEach(function(i) { counts[i.category || '日常']++; });
  var sorted = items.slice().sort(function(a, b) { return b.time > a.time ? 1 : -1; });
  var latest = sorted[0];
  var ai = generateAISummary(items, counts);
  var saying = ai.insight;
  var moodText = ai.mood;
  var status, statusCls;
  if (counts['健身'] >= 2) { status = '自律'; statusCls = 'status-zl'; }
  else if (counts['高光'] >= 1) { status = '充实'; statusCls = 'status-cs'; }
  else if (items.length >= 5) { status = '活跃'; statusCls = 'status-hy'; }
  else { status = '平静'; statusCls = 'status-pj'; }
  var latestText = latest.text.length > 40 ? latest.text.slice(0, 40) + '...' : latest.text;
  summaryEl.innerHTML = '<div class="dashboard">'
    + '<div class="dash-header">'
    + '<h2>今日总结</h2>'
    + '<span class="dash-status ' + statusCls + '">' + status + '</span>'
    + '</div>'
    + '<div class="dash-divider"></div>'
    + '<div class="dash-stats">'
    + allCats.map(function(c) {
        return '<div class="dash-stat"><div class="dash-stat-num">' + counts[c] + '</div><div class="dash-stat-label">' + c + '</div></div>';
      }).join('')
    + '<div class="dash-stat"><div class="dash-stat-num">' + items.length + '</div><div class="dash-stat-label">总计</div></div>'
    + '</div>'
    + '<div class="dash-divider"></div>'
    + '<div class="dash-section">'
    + '<div class="dash-section-title">今日重点</div>'
    + '<div class="dash-section-text">' + latestText + '</div>'
    + '</div>'
    + '<div class="dash-divider"></div>'
    + '<div class="dash-section">'
    + '<div class="dash-section-title">行为洞察</div>'
    + '<div class="dash-section-text">' + saying + '</div>'
    + '</div>'
    + '<div class="dash-divider"></div>'
    + '<div class="dash-section">'
    + '<div class="dash-section-title">AI状态</div>'
    + '<div class="dash-section-saying">' + moodText + '</div>'
    + '</div>'
    + '<div class="dash-divider"></div>'
    + '<div class="dash-section">'
    + '<div class="dash-section-title">行为建议</div>'
    + '<div class="dash-section-text">' + ai.advice + '</div>'
    + '</div>'
    + '</div>';
}

function renderStats() {
  var total = data.length;
  var today = todayStr();
  var tc = data.filter(function(i) { return isToday(i.time); }).length;
  var counts = {};
  allCats.forEach(function(c) { counts[c] = 0; });
  data.forEach(function(i) { counts[i.category || '日常']++; });
  statsEl.innerHTML = '共 <b>' + total + '</b> 条 ' + today + ' <b>' + tc + '</b> · '
    + allCats.map(function(c) { return c + ':' + counts[c]; }).join(' ');
}

function renderFilters() {
  tabsEl.innerHTML = '';
  var list = ['全部'].concat(allCats);
  list.forEach(function(c) {
    var b = document.createElement('button');
    b.textContent = c;
    if ((c === '全部' && filter === '') || c === filter) b.className = 'active';
    b.onclick = function() { filter = (c === '全部') ? '' : c; render(); };
    tabsEl.appendChild(b);
  });
}

function renderList() {
  content.innerHTML = '';
  var pool = filter ? data.filter(function(i) { return (i.category || '日常') === filter; }) : data;
  var tItems = pool.filter(function(i) { return isToday(i.time); })
    .sort(function(a, b) { return b.time > a.time ? 1 : -1; });
  var oItems = pool.filter(function(i) { return !isToday(i.time); })
    .sort(function(a, b) { return b.time > a.time ? 1 : -1; });
  if (!pool.length) {
    var e = document.createElement('div');
    e.className = 'empty'; e.textContent = '暂无记录';
    content.appendChild(e);
    return;
  }
  if (tItems.length) addSection('日常记录', tItems);
  if (oItems.length) addSection('历史记录', oItems);
}

function addSection(title, items) {
  var h = document.createElement('div');
  h.className = 'section-title'; h.textContent = title;
  content.appendChild(h);
  var ul = document.createElement('ul');
  items.forEach(function(item) {
    if (!item.category) item.category = '日常';
    var li = document.createElement('li');
    var info = document.createElement('div'); info.className = 'info';
    var row = document.createElement('div'); row.className = 'row';
    var tag = document.createElement('span');
    tag.className = 'tag tag-' + item.category; tag.textContent = item.category;
    row.appendChild(tag);
    var txt = document.createElement('span'); txt.textContent = item.text;
    row.appendChild(txt);
    var time = document.createElement('div'); time.className = 'time'; time.textContent = item.time;
    info.appendChild(row); info.appendChild(time);
    var btn = document.createElement('span'); btn.className = 'del'; btn.textContent = '删除';
    btn.onclick = function() {
      var idx = data.indexOf(item);
      if (idx > -1) data.splice(idx, 1);
      localStorage.setItem('memos', JSON.stringify(data));
      render();
    };
    li.appendChild(info); li.appendChild(btn);
    ul.appendChild(li);
  });
  content.appendChild(ul);
}

function render() {
  renderSummary();
  renderStats();
  renderFilters();
  renderList();
}

function save() {
  var t = inp.value.trim(); if (!t) return;
  data.push({ text: t, time: now(), category: catEl.value });
  localStorage.setItem('memos', JSON.stringify(data));
  inp.value = '';
  render();
}

function recall() {
  var f = rcat.value;
  var pool = f ? data.filter(function(i) { return i.category === f; }) : data;
  if (!pool.length) { alert('暂无数据'); return; }
  var item = pool[Math.floor(Math.random() * pool.length)];
  document.getElementById('mTag').className = 'tag tag-' + item.category;
  document.getElementById('mTag').textContent = item.category;
  document.getElementById('mText').textContent = item.text;
  document.getElementById('mTime').textContent = item.time;
  modal.classList.add('show');
}

function closeModal() { modal.classList.remove('show'); }

render();