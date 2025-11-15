const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const selectionMessage = document.getElementById('selectionMessage');
const namesPreview = document.getElementById('namesPreview');
const nameFileInput = document.getElementById('nameFileInput');
const keepSurnameButton = document.getElementById('keepSurname');
const keepNameButton = document.getElementById('keepName');
const manualInput = document.getElementById('manualInput');
const applyManualButton = document.getElementById('applyManual');

let names = [];
let originalNames = [];
let rotation = 0;
let spinning = false;
let previewUpdateTimer;

const pointerColor = '#ffb703';
const pointerMinHeight = 180;
const pointerDirection = Math.PI / 2; // pointer colocated en la parte inferior

function resizeCanvas() {
  const size = Math.min(canvas.parentElement.offsetWidth - 32, 500);
  canvas.width = size;
  canvas.height = size;
  drawWheel();
}

window.addEventListener('resize', resizeCanvas);

document.addEventListener('DOMContentLoaded', () => {
  resizeCanvas();
  showMessage('Carga un archivo con nombres para comenzar.');
  updateShortcutButtons();
});

function parseNames(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function updateNames(newNames, { storeOriginal = false } = {}) {
  if (!Array.isArray(newNames) || newNames.length === 0) {
    showMessage('Necesitamos al menos un nombre válido.');
    return false;
  }

  names = newNames;
  if (storeOriginal) {
    originalNames = [...newNames];
  }

  updatePreview();
  rotation = 0;
  drawWheel();
  updateShortcutButtons();
  return true;
}

function updatePreview() {
  namesPreview.value = names.join('\n');
}

function updateShortcutButtons() {
  const enabled = originalNames.length > 0;
  if (keepSurnameButton) keepSurnameButton.disabled = !enabled;
  if (keepNameButton) keepNameButton.disabled = !enabled;
}

function drawWheel() {
  const { width, height } = canvas;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;

  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(rotation);

  const sliceCount = Math.max(names.length, 1);
  const sliceAngle = (Math.PI * 2) / sliceCount;

  names.forEach((name, index) => {
    const startAngle = index * sliceAngle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#bcccdc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#102a43';
    ctx.font = `${Math.max(12, radius * 0.08)}px 'Segoe UI', sans-serif`;
    ctx.fillText(name, radius - 10, 5);
    ctx.restore();
  });

  ctx.restore();

  drawPointer(centerX, centerY, radius);
}

function drawPointer(centerX, centerY, radius) {
  const height = Math.max(canvas.width * 0.5, pointerMinHeight);
  const width = Math.min(canvas.width * 0.7, height * 0.85);
  const tipOffset = 10;
  const baseHeight = Math.min(height * 0.25, 80);
  const baseWidth = width * 0.6;
  const tipY = centerY + radius + tipOffset;
  const baseY = tipY + height;

  // Base capsule (oculta parcialmente si excede el canvas)
  ctx.fillStyle = '#1f2933';
  ctx.beginPath();
  ctx.roundRect(
    centerX - baseWidth / 2,
    baseY,
    baseWidth,
    baseHeight,
    baseHeight / 2
  );
  ctx.fill();

  // Triángulo gigante apuntando a la parte inferior de la ruleta
  ctx.fillStyle = pointerColor;
  ctx.beginPath();
  ctx.moveTo(centerX, tipY);
  ctx.lineTo(centerX - width / 2, baseY);
  ctx.lineTo(centerX + width / 2, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ff9f1c';
  ctx.lineWidth = Math.max(width * 0.05, 6);
  ctx.stroke();
}

function spinWheel() {
  if (spinning || names.length === 0) return;

  spinning = true;
  spinButton.disabled = true;
  showMessage('Girando...');

  const startRotation = rotation;
  const spinDistance = Math.PI * 6 + Math.random() * Math.PI * 4;
  const duration = 4500;
  let startTime = null;

  function animate(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    rotation = startRotation + spinDistance * eased;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      spinning = false;
      spinButton.disabled = false;
      const winner = getSelectedName();
      showMessage(`Seleccionado: ${winner}`);
    }
  }

  requestAnimationFrame(animate);
}

function getSelectedName() {
  if (names.length === 0) return '';
  const sliceAngle = (Math.PI * 2) / names.length;
  const normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  const relativeAngle = ((pointerDirection - normalizedRotation) + Math.PI * 2) % (Math.PI * 2);
  const index = Math.floor(relativeAngle / sliceAngle) % names.length;
  return names[index];
}

function showMessage(message) {
  selectionMessage.textContent = message;
}

function applyManualText(text, { source } = {}) {
  const parsed = parseNames(text || '');
  if (parsed.length === 0) {
    showMessage('Introduce al menos un nombre para actualizar la lista.');
    return;
  }

  if (updateNames(parsed, { storeOriginal: true })) {
    if (source === 'manualInput' && manualInput) {
      manualInput.value = '';
    }

    const message =
      source === 'manualInput'
        ? `Se cargaron ${parsed.length} nombres pegados.`
        : 'Lista editada manualmente.';
    showMessage(message);
  }
}

function keepPortion(type) {
  if (originalNames.length === 0) {
    showMessage('Primero carga un archivo con nombres.');
    return;
  }

  const transformed = originalNames.map((name) => {
    const clean = name.trim();
    if (clean.length === 0) return clean;
    const parts = clean.split(/\s+/);
    if (parts.length === 1) {
      return parts[0];
    }
    if (type === 'name') {
      return parts[parts.length - 1];
    }
    const surname = parts.slice(0, -1).join(' ').trim();
    return surname || clean;
  });

  if (updateNames(transformed)) {
    const which = type === 'name' ? 'nombre' : 'apellidos';
    showMessage(`Mostrando solo ${which}.`);
  }
}

spinButton.addEventListener('click', spinWheel);

nameFileInput.addEventListener('change', async () => {
  const [file] = nameFileInput.files;
  if (!file) return;

  try {
    const text = await file.text();
    const parsed = parseNames(text);
    if (updateNames(parsed, { storeOriginal: true })) {
      showMessage(`Se cargaron ${parsed.length} nombres.`);
    }
  } catch (error) {
    showMessage('No se pudo leer el archivo seleccionado.');
    console.error(error);
  }
});

keepSurnameButton?.addEventListener('click', () => keepPortion('surname'));
keepNameButton?.addEventListener('click', () => keepPortion('name'));

applyManualButton?.addEventListener('click', () => {
  if (!manualInput) return;
  const text = manualInput.value;
  if (!text.trim()) {
    showMessage('Pega al menos un nombre para aplicar los cambios.');
    return;
  }
  applyManualText(text, { source: 'manualInput' });
});

namesPreview.addEventListener('input', () => {
  clearTimeout(previewUpdateTimer);
  previewUpdateTimer = setTimeout(() => {
    if (!namesPreview.value.trim()) {
      showMessage('Introduce al menos un nombre para actualizar la lista.');
      return;
    }
    applyManualText(namesPreview.value, { source: 'preview' });
  }, 400);
});
