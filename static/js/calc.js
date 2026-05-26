// ── State ──
let current = '0';
let operator = null;
let firstOperand = null;
let waitingForSecond = false;
let justEvaluated = false;
let angleMode = 'deg';
let memory = 0;
let history = [];

// ── DOM refs ──
const disp = document.getElementById('disp');
const exprEl = document.getElementById('expr');
const unitRow = document.getElementById('unitRow');
const histStrip = document.getElementById('histStrip');
const memIndicator = document.getElementById('memIndicator');

// ── Display helpers ──
function setDisp(val, isError) {
  disp.classList.toggle('error', !!isError);
  disp.textContent = val;
}
function setExpr(val) { exprEl.textContent = val; }
function hideUnit() { unitRow.style.display = 'none'; }
function showUnit(a, b) {
  document.getElementById('unitA').textContent = a;
  document.getElementById('unitB').textContent = b;
  unitRow.style.display = 'flex';
}

// ── Format number ──
function fmtNum(n) {
  if (n === undefined || n === null || isNaN(n)) return '0';
  const s = parseFloat(parseFloat(n).toPrecision(10));
  if (Math.abs(s) >= 1e12 || (Math.abs(s) < 1e-7 && s !== 0)) {
    return s.toExponential(6);
  }
  return String(s);
}

// ── Number input ──
function inputNum(n) {
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (waitingForSecond) { current = n; waitingForSecond = false; }
  else { current = current === '0' ? n : current + n; }
  setDisp(current);
  hideUnit();
}

function inputDot() {
  if (justEvaluated) { current = '0'; justEvaluated = false; }
  if (waitingForSecond) { current = '0'; waitingForSecond = false; }
  if (!current.includes('.')) current += '.';
  setDisp(current);
  hideUnit();
}

function inputConst(name) {
  const val = name === 'pi' ? Math.PI : Math.E;
  current = String(val);
  setDisp(fmtNum(val));
  justEvaluated = false;
  waitingForSecond = false;
  hideUnit();
}

// ── Operator ──
function inputOp(op) {
  if (firstOperand !== null && operator && !justEvaluated) {
    runBinaryCalc();
  }
  firstOperand = parseFloat(current);
  operator = op;
  waitingForSecond = true;
  justEvaluated = false;

  const sym = { add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^' };
  setExpr(fmtNum(firstOperand) + ' ' + (sym[op] || op));
  hideUnit();
}

// ── Binary calculation ──
async function runBinaryCalc() {
  const second = parseFloat(current);
  const sym = { add: '+', subtract: '−', multiply: '×', divide: '÷', power: '^' };
  const exprStr = fmtNum(firstOperand) + ' ' + (sym[operator] || operator) + ' ' + fmtNum(second);

  try {
    const res = await apiCall({ operation: operator, num1: firstOperand, num2: second, angle_mode: angleMode });
    addHistory(exprStr, res);
    current = String(res);
    setDisp(fmtNum(res));
    setExpr(exprStr + ' =');
    operator = null;
    firstOperand = null;
    justEvaluated = true;
    hideUnit();
  } catch (e) {
    showError(e.message);
  }
}

// ── Evaluate (= button) ──
async function evaluate() {
  if (operator === null || firstOperand === null) return;
  await runBinaryCalc();
}

// ── Scientific function ──
async function applyFn(fn) {
  const x = parseFloat(current);
  const labels = {
    sin: `sin(${fmtNum(x)})`, cos: `cos(${fmtNum(x)})`, tan: `tan(${fmtNum(x)})`,
    asin: `sin⁻¹(${fmtNum(x)})`, acos: `cos⁻¹(${fmtNum(x)})`, atan: `tan⁻¹(${fmtNum(x)})`,
    log: `log(${fmtNum(x)})`, ln: `ln(${fmtNum(x)})`,
    sqrt: `√(${fmtNum(x)})`, cbrt: `∛(${fmtNum(x)})`,
    square: `(${fmtNum(x)})²`, cube: `(${fmtNum(x)})³`,
    reciprocal: `1/(${fmtNum(x)})`, abs: `|${fmtNum(x)}|`,
    factorial: `${fmtNum(x)}!`
  };
  const label = labels[fn] || fn;

  try {
    const res = await apiCall({ operation: fn, num1: x, num2: 0, angle_mode: angleMode });
    addHistory(label, res);
    current = String(res);
    setDisp(fmtNum(res));
    setExpr(label + ' =');
    justEvaluated = true;
    hideUnit();
  } catch (e) {
    showError(e.message);
  }
}

// ── Unit conversions ──
async function convertUnit(type) {
  const x = parseFloat(current);
  const unitMap = {
    deg_to_rad: ['deg', 'rad'], rad_to_deg: ['rad', 'deg'],
    deg_to_grad: ['deg', 'grad'], grad_to_deg: ['grad', 'deg']
  };
  const [ua, ub] = unitMap[type];
  const label = `${fmtNum(x)} ${ua} → ${ub}`;

  try {
    const res = await apiCall({ operation: type, num1: x, num2: 0, angle_mode: angleMode });
    addHistory(label, res);
    current = String(res);
    setDisp(fmtNum(res));
    setExpr(label + ' =');
    justEvaluated = true;
    showUnit(ua, ub);
  } catch (e) {
    showError(e.message);
  }
}

// ── Utility buttons ──
function toggleSign() {
  if (current === '0') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  setDisp(current);
}
function allClear() {
  current = '0'; operator = null; firstOperand = null;
  waitingForSecond = false; justEvaluated = false;
  setDisp('0'); setExpr(''); hideUnit();
}
function delLast() {
  if (justEvaluated) { allClear(); return; }
  current = current.length > 1 ? current.slice(0, -1) : '0';
  setDisp(current);
}

// ── Angle mode ──
function setAngle(mode) {
  angleMode = mode;
  ['deg', 'rad', 'grad'].forEach(m => {
    const id = 'mode' + m.charAt(0).toUpperCase() + m.slice(1);
    document.getElementById(id).classList.toggle('active', m === mode);
  });
}

// ── Memory ──
function memStore() { memory = parseFloat(current); updateMemIndicator(); setExpr('Stored → M'); }
function memRecall() { current = String(memory); setDisp(fmtNum(memory)); justEvaluated = false; setExpr('M = ' + fmtNum(memory)); }
function memAdd() { memory += parseFloat(current); updateMemIndicator(); setExpr('M + ' + fmtNum(parseFloat(current)) + ' = ' + fmtNum(memory)); }
function memSub() { memory -= parseFloat(current); updateMemIndicator(); setExpr('M − ' + fmtNum(parseFloat(current)) + ' = ' + fmtNum(memory)); }
function memClear() { memory = 0; updateMemIndicator(); setExpr('Memory cleared'); }
function memView() { setExpr('M = ' + fmtNum(memory)); }
function updateMemIndicator() { memIndicator.style.display = memory !== 0 ? 'block' : 'none'; }

// ── API call ──
async function apiCall(body) {
  const response = await fetch('/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Server error');
  return data.result;
}

// ── Error display ──
function showError(msg) {
  setDisp(msg || 'Error', true);
  setExpr('');
  setTimeout(() => {
    setDisp(current);
    disp.classList.remove('error');
  }, 2000);
}

// ── History ──
function addHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 12) history.pop();
  renderHistory();
}
function renderHistory() {
  if (!history.length) {
    histStrip.innerHTML = '<div class="hist-empty">no history yet</div>';
    return;
  }
  histStrip.innerHTML = history.map((h, i) =>
    `<div class="hist-item" onclick="recallHist(${i})">${h.expr} = <strong>${fmtNum(h.result)}</strong></div>`
  ).join('');
}
function recallHist(i) {
  current = String(history[i].result);
  setDisp(fmtNum(history[i].result));
  setExpr('recalled');
  justEvaluated = true;
}

// ── Keyboard ──
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') inputNum(e.key);
  else if (e.key === '.') inputDot();
  else if (e.key === '+') inputOp('add');
  else if (e.key === '-') inputOp('subtract');
  else if (e.key === '*') inputOp('multiply');
  else if (e.key === '/') { e.preventDefault(); inputOp('divide'); }
  else if (e.key === '^') inputOp('power');
  else if (e.key === 'Enter' || e.key === '=') evaluate();
  else if (e.key === 'Backspace') delLast();
  else if (e.key === 'Escape') allClear();
});
