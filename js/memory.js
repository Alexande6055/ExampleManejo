let memoryValue = 0;
let memoryInUse = false;

// Funciones de memoria
function memoryClear() {
    memoryValue = 0;
    memoryInUse = false;
    updateMemoryIndicator();
}

function memoryRecall() {
    if (memoryInUse) {
        document.getElementById('currentDisplay').textContent = memoryValue;
    }
}

function memoryAdd() {
    const currentValue = parseFloat(document.getElementById('currentDisplay').textContent);
    if (!isNaN(currentValue)) {
        memoryValue += currentValue;
        memoryInUse = true;
        updateMemoryIndicator();
    }
}

function memorySubtract() {
    const currentValue = parseFloat(document.getElementById('currentDisplay').textContent);
    if (!isNaN(currentValue)) {
        memoryValue -= currentValue;
        memoryInUse = true;
        updateMemoryIndicator();
    }
}

function memoryStore() {
    const currentValue = parseFloat(document.getElementById('currentDisplay').textContent);
    if (!isNaN(currentValue)) {
        memoryValue = currentValue;
        memoryInUse = true;
        updateMemoryIndicator();
    }
}

function updateMemoryIndicator() {
    const indicator = document.getElementById('memoryIndicator');
    indicator.style.display = memoryInUse ? 'block' : 'none';
}