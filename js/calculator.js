// ========================================
// CALCULADORA CIENTÍFICA PRO - CALCULATOR.JS
// Funciones básicas y control principal
// ========================================

// Variables globales
let currentDisplay = '0';
let previousDisplay = '';
let operator = null;
let waitingForOperand = false;
let calculation = null;
let shouldResetDisplay = false;

// Elementos del DOM
const display = document.getElementById('currentDisplay');
const historyDisplay = document.getElementById('history');

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    updateDisplay();
});

// Inicializar calculadora
function initializeCalculator() {
    currentDisplay = '0';
    previousDisplay = '';
    operator = null;
    waitingForOperand = false;
    calculation = null;
    shouldResetDisplay = false;
    updateDisplay();
    updateHistory('');
}

// Configurar event listeners
function setupEventListeners() {
    // Modo de calculadora
    document.getElementById('basicMode').addEventListener('click', () => switchMode('basic'));
    document.getElementById('scientificMode').addEventListener('click', () => switchMode('scientific'));
    document.getElementById('programmerMode').addEventListener('click', () => switchMode('programmer'));
    
    // Teclado
    document.addEventListener('keydown', handleKeyPress);
    
    // Prevenir zoom en mobile
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    });
}

// Cambiar modo de calculadora
function switchMode(mode) {
    // Remover clase active de todos los botones
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.calculator-mode').forEach(calc => calc.classList.remove('active'));
    
    // Activar modo seleccionado
    if (mode === 'basic') {
        document.getElementById('basicMode').classList.add('active');
        document.getElementById('basicCalculator').classList.add('active');
    } else if (mode === 'scientific') {
        document.getElementById('scientificMode').classList.add('active');
        document.getElementById('scientificCalculator').classList.add('active');
    } else if (mode === 'programmer') {
        document.getElementById('programmerMode').classList.add('active');
        document.getElementById('programmerCalculator').classList.add('active');
        updateProgrammerButtons();
    }
    
    // Limpiar display al cambiar modo
    clearAll();
}

// Agregar número al display
function appendNumber(num) {
    if (waitingForOperand || shouldResetDisplay) {
        currentDisplay = num;
        waitingForOperand = false;
        shouldResetDisplay = false;
    } else {
        if (currentDisplay === '0') {
            currentDisplay = num;
        } else {
            // Limitar cantidad de dígitos
            if (currentDisplay.length < 15) {
                currentDisplay += num;
            }
        }
    }
    updateDisplay();
}

// Agregar operador
function appendOperator(nextOperator) {
    const inputValue = parseFloat(currentDisplay);
    
    if (previousDisplay === '') {
        previousDisplay = currentDisplay;
    } else if (operator) {
        const currentValue = previousDisplay || 0;
        const newValue = calculate(currentValue, inputValue, operator);
        
        if (isNaN(newValue)) {
            showError('Error en cálculo');
            return;
        }
        
        currentDisplay = String(newValue);
        previousDisplay = currentDisplay;
    }
    
    waitingForOperand = true;
    operator = nextOperator;
    updateHistory(`${previousDisplay} ${getOperatorSymbol(nextOperator)}`);
    updateDisplay();
}

// Calcular resultado
function calculate(firstOperand = null, secondOperand = null, operator = null) {
    // Si no se proporcionan parámetros, usar los valores actuales
    if (firstOperand === null) {
        firstOperand = parseFloat(previousDisplay) || 0;
    }
    if (secondOperand === null) {
        secondOperand = parseFloat(currentDisplay) || 0;
    }
    if (operator === null) {
        operator = window.operator;
    }
    
    let result;
    
    try {
        switch (operator) {
            case '+':
                result = firstOperand + secondOperand;
                break;
            case '-':
                result = firstOperand - secondOperand;
                break;
            case '*':
                result = firstOperand * secondOperand;
                break;
            case '/':
                if (secondOperand === 0) {
                    throw new Error('División por cero');
                }
                result = firstOperand / secondOperand;
                break;
            case '%':
                result = firstOperand % secondOperand;
                break;
            case '^':
                result = Math.pow(firstOperand, secondOperand);
                break;
            default:
                return secondOperand;
        }
        
        // Redondear para evitar problemas de punto flotante
        result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;
        
        // Manejar números muy grandes o muy pequeños
        if (Math.abs(result) > 1e15) {
            result = result.toExponential(6);
        } else if (Math.abs(result) < 1e-10 && result !== 0) {
            result = result.toExponential(6);
        }
        
        return result;
        
    } catch (error) {
        showError(error.message);
        return NaN;
    }
}

// Ejecutar cálculo
function executeCalculation() {
    if (operator && previousDisplay !== '' && !waitingForOperand) {
        const firstOperand = parseFloat(previousDisplay);
        const secondOperand = parseFloat(currentDisplay);
        const operatorSymbol = getOperatorSymbol(operator);
        const expression = `${previousDisplay} ${operatorSymbol} ${currentDisplay}`;
        
        const result = calculate(firstOperand, secondOperand, operator);
        
        if (!isNaN(result)) {
            // Agregar al historial
            addToHistory(expression, result);
            
            currentDisplay = String(result);
            previousDisplay = '';
            operator = null;
            waitingForOperand = false;
            shouldResetDisplay = true;
            
            updateDisplay();
            updateHistory('');
            
            // Efecto visual
            animateCalculation();
        }
    }
}

// Función principal de cálculo (llamada por el botón =)
function calculate() {
    executeCalculation();
}

// Limpiar todo
function clearAll() {
    currentDisplay = '0';
    previousDisplay = '';
    operator = null;
    waitingForOperand = false;
    calculation = null;
    shouldResetDisplay = false;
    updateDisplay();
    updateHistory('');
}

// Limpiar entrada actual
function clearEntry() {
    currentDisplay = '0';
    updateDisplay();
}

// Borrar último carácter
function backspace() {
    if (currentDisplay.length > 1) {
        currentDisplay = currentDisplay.slice(0, -1);
    } else {
        currentDisplay = '0';
    }
    updateDisplay();
}

// Cambiar signo
function toggleSign() {
    if (currentDisplay !== '0') {
        if (currentDisplay.startsWith('-')) {
            currentDisplay = currentDisplay.substring(1);
        } else {
            currentDisplay = '-' + currentDisplay;
        }
        updateDisplay();
    }
}

// Actualizar display
function updateDisplay() {
    const displayElement = document.getElementById('currentDisplay');
    let displayValue = currentDisplay;
    
    // Formatear números grandes
    if (displayValue.length > 12) {
        displayElement.classList.add('small-number');
    } else if (displayValue.length > 8) {
        displayElement.classList.add('big-number');
    } else {
        displayElement.classList.remove('small-number', 'big-number');
    }
    
    // Formatear con separadores de miles para números grandes
    if (!isNaN(displayValue) && displayValue.indexOf('.') === -1 && displayValue.length > 6) {
        displayValue = parseFloat(displayValue).toLocaleString();
    }
    
    displayElement.textContent = displayValue;
}

// Actualizar historial
function updateHistory(text) {
    const historyElement = document.getElementById('history');
    historyElement.textContent = text;
}

// Obtener símbolo del operador
function getOperatorSymbol(op) {
    const symbols = {
        '+': '+',
        '-': '−',
        '*': '×',
        '/': '÷',
        '%': '%',
        '^': '^'
    };
    return symbols[op] || op;
}

// Mostrar error
function showError(message) {
    currentDisplay = 'Error';
    updateDisplay();
    document.getElementById('currentDisplay').classList.add('error');
    
    setTimeout(() => {
        document.getElementById('currentDisplay').classList.remove('error');
        clearAll();
    }, 2000);
    
    console.error('Calculator Error:', message);
}

// Animación de cálculo
function animateCalculation() {
    const displayElement = document.getElementById('currentDisplay');
    displayElement.classList.add('calculating');
    
    setTimeout(() => {
        displayElement.classList.remove('calculating');
    }, 500);
    
    // Crear partículas
    createParticles();
}

// Crear efecto de partículas
function createParticles() {
    const container = document.querySelector('.calculator');
    const colors = ['#3498db', '#e74c3c', '#f39c12', '#27ae60', '#9b59b6'];
    
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        container.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1000);
    }
}

// Manejo de teclado
function handleKeyPress(event) {
    const key = event.key;
    
    // Prevenir comportamiento por defecto para ciertas teclas
    if (['+', '-', '*', '/', 'Enter', '=', 'Escape', 'Backspace'].includes(key)) {
        event.preventDefault();
    }
    
    // Números
    if (key >= '0' && key <= '9') {
        appendNumber(key);
    }
    // Punto decimal
    else if (key === '.' && currentDisplay.indexOf('.') === -1) {
        appendNumber('.');
    }
    // Operadores
    else if (key === '+') {
        appendOperator('+');
    }
    else if (key === '-') {
        appendOperator('-');
    }
    else if (key === '*') {
        appendOperator('*');
    }
    else if (key === '/') {
        appendOperator('/');
    }
    else if (key === '%') {
        appendOperator('%');
    }
    // Cálculo
    else if (key === 'Enter' || key === '=') {
        calculate();
    }
    // Limpiar
    else if (key === 'Escape') {
        clearAll();
    }
    else if (key === 'Delete') {
        clearEntry();
    }
    // Borrar
    else if (key === 'Backspace') {
        backspace();
    }
    // Cambiar signo
    else if (key === 'F9') {
        toggleSign();
    }
}

// Funciones para modos específicos
function appendFunction(func) {
    // Esta función será sobrescrita por scientific.js
    console.log('Function not implemented:', func);
}

function appendConstant(constant) {
    // Esta función será sobrescrita por scientific.js
    console.log('Constant not implemented:', constant);
}

// Validar entrada
function validateInput(input) {
    // Verificar si es un número válido
    const num = parseFloat(input);
    if (isNaN(num)) {
        return false;
    }
    
    // Verificar límites
    if (Math.abs(num) > 1e308) {
        showError('Número demasiado grande');
        return false;
    }
    
    return true;
}

// Formatear número para display
function formatNumber(num) {
    const str = String(num);
    
    // Números muy grandes o muy pequeños en notación científica
    if (Math.abs(num) >= 1e15 || (Math.abs(num) < 1e-6 && num !== 0)) {
        return num.toExponential(6);
    }
    
    // Redondear decimales largos
    if (str.includes('.') && str.length > 12) {
        return parseFloat(num.toFixed(8)).toString();
    }
    
    return str;
}

// Utilitarios
function isOperator(char) {
    return ['+', '-', '*', '/', '%', '^'].includes(char);
}

function isNumber(char) {
    return !isNaN(parseFloat(char)) && isFinite(char);
}

// Funciones de conversión para modo programador
function convertBase(number, fromBase, toBase) {
    try {
        const decimal = parseInt(number, fromBase);
        return decimal.toString(toBase).toUpperCase();
    } catch (error) {
        showError('Error de conversión');
        return '0';
    }
}

// Funciones matemáticas básicas extendidas
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity; // Límite para evitar overflow
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return Math.abs(a);
}

function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
}

// Funciones de precisión
function addPrecision(a, b) {
    const factor = Math.pow(10, Math.max(
        (a.toString().split('.')[1] || '').length,
        (b.toString().split('.')[1] || '').length
    ));
    return (Math.round(a * factor) + Math.round(b * factor)) / factor;
}

function subtractPrecision(a, b) {
    const factor = Math.pow(10, Math.max(
        (a.toString().split('.')[1] || '').length,
        (b.toString().split('.')[1] || '').length
    ));
    return (Math.round(a * factor) - Math.round(b * factor)) / factor;
}

function multiplyPrecision(a, b) {
    const aStr = a.toString();
    const bStr = b.toString();
    const aDecimals = (aStr.split('.')[1] || '').length;
    const bDecimals = (bStr.split('.')[1] || '').length;
    const totalDecimals = aDecimals + bDecimals;
    
    const result = (a * Math.pow(10, aDecimals)) * (b * Math.pow(10, bDecimals));
    return result / Math.pow(10, totalDecimals);
}

function dividePrecision(a, b) {
    if (b === 0) {
        throw new Error('División por cero');
    }
    
    const aStr = a.toString();
    const bStr = b.toString();
    const aDecimals = (aStr.split('.')[1] || '').length;
    const bDecimals = (bStr.split('.')[1] || '').length;
    
    const aInt = a * Math.pow(10, aDecimals);
    const bInt = b * Math.pow(10, bDecimals);
    
    return (aInt / bInt) * Math.pow(10, bDecimals - aDecimals);
}

// Funciones de ayuda para el historial
function addToHistory(operation, result) {
    const historyList = document.getElementById('historyList');
    const noHistoryMsg = historyList.querySelector('.no-history');
    
    if (noHistoryMsg) {
        noHistoryMsg.remove();
    }
    
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
        <div class="operation">${operation}</div>
        <div class="result">${formatNumber(result)}</div>
    `;
    
    historyItem.addEventListener('click', () => {
        currentDisplay = String(result);
        updateDisplay();
    });
    
    historyList.insertBefore(historyItem, historyList.firstChild);
    
    // Limitar historial a 50 items
    const items = historyList.querySelectorAll('.history-item');
    if (items.length > 50) {
        items[items.length - 1].remove();
    }
}

function clearHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '<p class="no-history">No hay operaciones en el historial</p>';
}

function toggleHistory() {
    const historyPanel = document.getElementById('historyPanel');
    historyPanel.classList.toggle('open');
}

// Función para mostrar información
function showAbout() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('aboutModal');
    modal.style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('aboutModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Funciones de estado para debugging
function getCalculatorState() {
    return {
        currentDisplay,
        previousDisplay,
        operator,
        waitingForOperand,
        shouldResetDisplay
    };
}

function setCalculatorState(state) {
    currentDisplay = state.currentDisplay || '0';
    previousDisplay = state.previousDisplay || '';
    operator = state.operator || null;
    waitingForOperand = state.waitingForOperand || false;
    shouldResetDisplay = state.shouldResetDisplay || false;
    updateDisplay();
}

// Exportar funciones principales para otros módulos
window.calculatorCore = {
    appendNumber,
    appendOperator,
    calculate: executeCalculation,
    clearAll,
    clearEntry,
    backspace,
    toggleSign,
    updateDisplay,
    showError,
    formatNumber,
    addToHistory,
    getCalculatorState,
    setCalculatorState
};

console.log('Calculator.js loaded successfully');