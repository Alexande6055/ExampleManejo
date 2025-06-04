// ========================================
// CALCULADORA CIENTÍFICA PRO - SCIENTIFIC.JS
// Funciones matemáticas avanzadas
// ========================================

// Estado para modo angular (radianes/grados)
let angleMode = 'rad'; // 'rad' o 'deg'
let isInverseMode = false; // Para funciones inversas (sin⁻¹, cos⁻¹, etc.)
let isHyperbolicMode = false; // Para funciones hiperbólicas

// Constantes matemáticas
const MATH_CONSTANTS = {
    PI: Math.PI,
    E: Math.E,
    PHI: (1 + Math.sqrt(5)) / 2, // Número áureo
    EULER_GAMMA: 0.5772156649015329, // Constante de Euler-Mascheroni
    LN2: Math.LN2,
    LN10: Math.LN10,
    LOG2E: Math.LOG2E,
    LOG10E: Math.LOG10E,
    SQRT2: Math.SQRT2,
    SQRT1_2: Math.SQRT1_2
};

// Agregar función matemática
function appendFunction(func) {
    const currentValue = parseFloat(currentDisplay) || 0;
    
    try {
        let result;
        let expression = '';
        
        switch (func) {
            // Funciones trigonométricas
            case 'sin(':
                result = isInverseMode ? 
                    (isHyperbolicMode ? Math.asinh(currentValue) : Math.asin(currentValue)) :
                    (isHyperbolicMode ? Math.sinh(convertAngle(currentValue)) : Math.sin(convertAngle(currentValue)));
                expression = getTrigoLabel('sin', currentValue);
                break;
                
            case 'cos(':
                result = isInverseMode ? 
                    (isHyperbolicMode ? Math.acosh(currentValue) : Math.acos(currentValue)) :
                    (isHyperbolicMode ? Math.cosh(convertAngle(currentValue)) : Math.cos(convertAngle(currentValue)));
                expression = getTrigoLabel('cos', currentValue);
                break;
                
            case 'tan(':
                result = isInverseMode ? 
                    (isHyperbolicMode ? Math.atanh(currentValue) : Math.atan(currentValue)) :
                    (isHyperbolicMode ? Math.tanh(convertAngle(currentValue)) : Math.tan(convertAngle(currentValue)));
                expression = getTrigoLabel('tan', currentValue);
                break;
            
            // Funciones logarítmicas
            case 'log(':
                result = Math.log10(currentValue);
                expression = `log(${currentValue})`;
                if (currentValue <= 0) throw new Error('Logaritmo de número no positivo');
                break;
                
            case 'ln(':
                result = Math.log(currentValue);
                expression = `ln(${currentValue})`;
                if (currentValue <= 0) throw new Error('Logaritmo natural de número no positivo');
                break;
                
            case 'log2(':
                result = Math.log2(currentValue);
                expression = `log₂(${currentValue})`;
                if (currentValue <= 0) throw new Error('Logaritmo base 2 de número no positivo');
                break;
            
            // Funciones exponenciales
            case 'exp(':
                result = Math.exp(currentValue);
                expression = `e^(${currentValue})`;
                break;
                
            case 'pow(':
                // Esta función requiere dos operandos, se manejará diferente
                handlePowerFunction();
                return;
            
            // Funciones de raíz
            case 'sqrt(':
                if (currentValue < 0) throw new Error('Raíz cuadrada de número negativo');
                result = Math.sqrt(currentValue);
                expression = `√(${currentValue})`;
                break;
                
            case 'cbrt(':
                result = Math.cbrt(currentValue);
                expression = `∛(${currentValue})`;
                break;
                
            case 'nthroot(':
                // Función para raíz n-ésima, requiere dos operandos
                handleNthRootFunction();
                return;
            
            // Otras funciones
            case 'factorial(':
                result = factorial(currentValue);
                expression = `${currentValue}!`;
                break;
                
            case 'abs(':
                result = Math.abs(currentValue);
                expression = `|${currentValue}|`;
                break;
                
            case 'ceil(':
                result = Math.ceil(currentValue);
                expression = `⌈${currentValue}⌉`;
                break;
                
            case 'floor(':
                result = Math.floor(currentValue);
                expression = `⌊${currentValue}⌋`;
                break;
                
            case 'round(':
                result = Math.round(currentValue);
                expression = `round(${currentValue})`;
                break;
                
            case 'frac(':
                result = currentValue - Math.floor(currentValue);
                expression = `frac(${currentValue})`;
                break;
                
            // Funciones de conversión angular
            case 'deg(':
                result = (currentValue * 180) / Math.PI;
                expression = `${currentValue} rad → deg`;
                break;
                
            case 'rad(':
                result = (currentValue * Math.PI) / 180;
                expression = `${currentValue} deg → rad`;
                break;
                
            default:
                throw new Error('Función no reconocida: ' + func);
        }
        
        // Validar resultado
        if (!validateNumber(result)) {
            throw new Error('Resultado inválido');
        }
        
        // Convertir ángulos de vuelta si es necesario
        if (['sin(', 'cos(', 'tan('].includes(func) && isInverseMode && !isHyperbolicMode) {
            result = convertAngleBack(result);
        }
        
        // Agregar al historial
        addToHistory(expression, result);
        
        // Actualizar display
        currentDisplay = formatNumber(result);
        shouldResetDisplay = true;
        updateDisplay();
        
    } catch (error) {
        showError(error.message);
    }
}

// Agregar constante matemática
function appendConstant(constant) {
    let value;
    let name;
    
    switch (constant) {
        case 'Math.PI':
            value = MATH_CONSTANTS.PI;
            name = 'π';
            break;
        case 'Math.E':
            value = MATH_CONSTANTS.E;
            name = 'e';
            break;
        case 'PHI':
            value = MATH_CONSTANTS.PHI;
            name = 'φ';
            break;
        case 'GAMMA':
            value = MATH_CONSTANTS.EULER_GAMMA;
            name = 'γ';
            break;
        default:
            showError('Constante no reconocida');
            return;
    }
    
    // Agregar al historial
    addToHistory(name, value);
    
    currentDisplay = formatNumber(value);
    shouldResetDisplay = true;
    updateDisplay();
}

// Convertir ángulo según el modo actual
function convertAngle(angle) {
    if (angleMode === 'deg') {
        return (angle * Math.PI) / 180;
    }
    return angle;
}

// Convertir ángulo de vuelta según el modo actual
function convertAngleBack(angle) {
    if (angleMode === 'deg') {
        return (angle * 180) / Math.PI;
    }
    return angle;
}

// Obtener etiqueta para funciones trigonométricas
function getTrigoLabel(func, value) {
    let prefix = '';
    let suffix = '';
    
    if (isInverseMode) prefix = 'arc';
    if (isHyperbolicMode) suffix = 'h';
    
    const angleUnit = angleMode === 'deg' ? '°' : '';
    return `${prefix}${func}${suffix}(${value}${angleUnit})`;
}

// Calcular factorial
function factorial(n) {
    if (n < 0 || !Number.isInteger(n)) {
        throw new Error('Factorial solo definido para enteros no negativos');
    }
    
    if (n > 170) {
        throw new Error('Factorial demasiado grande');
    }
    
    if (n === 0 || n === 1) {
        return 1;
    }
    
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    
    return result;
}

// Manejar función de potencia (x^y)
function handlePowerFunction() {
    if (previousDisplay === '') {
        previousDisplay = currentDisplay;
        currentDisplay = '';
        operator = '^';
        waitingForOperand = true;
        updateHistory(`${previousDisplay}^`);
    } else {
        appendOperator('^');
    }
}

// Manejar función de raíz n-ésima
function handleNthRootFunction() {
    if (previousDisplay === '') {
        previousDisplay = currentDisplay;
        currentDisplay = '';
        operator = 'nthroot';
        waitingForOperand = true;
        updateHistory(`${previousDisplay}√`);
    }
}

// Calcular raíz n-ésima
function nthRoot(radicand, index) {
    if (index === 0) {
        throw new Error('Índice de raíz no puede ser cero');
    }
    
    if (radicand < 0 && index % 2 === 0) {
        throw new Error('Raíz par de número negativo');
    }
    
    return Math.pow(Math.abs(radicand), 1/index) * (radicand < 0 ? -1 : 1);
}

// Cambiar modo angular
function toggleAngleMode() {
    angleMode = angleMode === 'rad' ? 'deg' : 'rad';
    updateAngleModeDisplay();
}

// Actualizar display del modo angular
function updateAngleModeDisplay() {
    const modeIndicator = document.getElementById('angleMode');
    if (modeIndicator) {
        modeIndicator.textContent = angleMode.toUpperCase();
        modeIndicator.classList.toggle('active', angleMode === 'deg');
    }
}

// Toggle modo inverso
function toggleInverseMode() {
    isInverseMode = !isInverseMode;
    updateInverseModeButtons();
}

// Toggle modo hiperbólico
function toggleHyperbolicMode() {
    isHyperbolicMode = !isHyperbolicMode;
    updateHyperbolicModeButtons();
}

// Actualizar botones en modo inverso
function updateInverseModeButtons() {
    const inverseBtn = document.getElementById('inverseBtn');
    if (inverseBtn) {
        inverseBtn.classList.toggle('active', isInverseMode);
    }
    
    // Actualizar texto de botones trigonométricos
    updateTrigonometricButtonLabels();
}

// Actualizar botones en modo hiperbólico
function updateHyperbolicModeButtons() {
    const hypBtn = document.getElementById('hyperbolicBtn');
    if (hypBtn) {
        hypBtn.classList.toggle('active', isHyperbolicMode);
    }
    
    updateTrigonometricButtonLabels();
}

// Actualizar etiquetas de botones trigonométricos
function updateTrigonometricButtonLabels() {
    const functions = ['sin', 'cos', 'tan'];
    
    functions.forEach(func => {
        const btn = document.querySelector(`[onclick="appendFunction('${func}(')"]`);
        if (btn) {
            let label = func;
            
            if (isInverseMode) {
                label = func + '⁻¹';
            }
            if (isHyperbolicMode) {
                label = label + 'h';
            }
            
            btn.textContent = label;
        }
    });
}

// Funciones estadísticas básicas
function calculateStatistics(numbers) {
    if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('Se requiere un array no vacío de números');
    }
    
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / numbers.length;
    
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const median = numbers.length % 2 === 0 ?
        (sortedNumbers[numbers.length / 2 - 1] + sortedNumbers[numbers.length / 2]) / 2 :
        sortedNumbers[Math.floor(numbers.length / 2)];
    
    const variance = numbers.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / numbers.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
        sum,
        mean,
        median,
        variance,
        standardDeviation,
        min: Math.min(...numbers),
        max: Math.max(...numbers),
        count: numbers.length
    };
}

// Conversiones de unidades
const UNIT_CONVERSIONS = {
    length: {
        meter: 1,
        kilometer: 0.001,
        centimeter: 100,
        millimeter: 1000,
        inch: 39.3701,
        foot: 3.28084,
        yard: 1.09361,
        mile: 0.000621371
    },
    weight: {
        kilogram: 1,
        gram: 1000,
        pound: 2.20462,
        ounce: 35.274,
        ton: 0.001
    },
    temperature: {
        celsius: (c) => c,
        fahrenheit: (c) => (c * 9/5) + 32,
        kelvin: (c) => c + 273.15
    }
};

// Convertir unidades
function convertUnit(value, fromUnit, toUnit, category) {
    if (!UNIT_CONVERSIONS[category]) {
        throw new Error('Categoría de unidad no válida');
    }
    
    const conversions = UNIT_CONVERSIONS[category];
    
    if (category === 'temperature') {
        // Temperatura requiere lógica especial
        let celsius;
        switch (fromUnit) {
            case 'celsius':
                celsius = value;
                break;
            case 'fahrenheit':
                celsius = (value - 32) * 5/9;
                break;
            case 'kelvin':
                celsius = value - 273.15;
                break;
            default:
                throw new Error('Unidad de temperatura no válida');
        }
        
        return conversions[toUnit](celsius);
    } else {
        // Otras conversiones
        if (!conversions[fromUnit] || !conversions[toUnit]) {
            throw new Error('Unidad no válida');
        }
        
        // Convertir a unidad base y luego a unidad deseada
        const baseValue = value / conversions[fromUnit];
        return baseValue * conversions[toUnit];
    }
}

// Funciones de combinatoria
function combination(n, r) {
    if (r > n || r < 0 || n < 0) {
        throw new Error('Valores inválidos para combinación');
    }
    
    if (r === 0 || r === n) return 1;
    if (r === 1) return n;
    
    // Optimización: C(n,r) = C(n,n-r)
    if (r > n - r) r = n - r;
    
    let result = 1;
    for (let i = 0; i < r; i++) {
        result = result * (n - i) / (i + 1);
    }
    
    return Math.round(result);
}

function permutation(n, r) {
    if (r > n || r < 0 || n < 0) {
        throw new Error('Valores inválidos para permutación');
    }
    
    let result = 1;
    for (let i = n; i > n - r; i--) {
        result *= i;
    }
    
    return result;
}

// Funciones para números complejos (básico)
class ComplexNumber {
    constructor(real, imaginary = 0) {
        this.real = real;
        this.imaginary = imaginary;
    }
    
    add(other) {
        return new ComplexNumber(
            this.real + other.real,
            this.imaginary + other.imaginary
        );
    }
    
    subtract(other) {
        return new ComplexNumber(
            this.real - other.real,
            this.imaginary - other.imaginary
        );
    }
    
    multiply(other) {
        return new ComplexNumber(
            this.real * other.real - this.imaginary * other.imaginary,
            this.real * other.imaginary + this.imaginary * other.real
        );
    }
    
    divide(other) {
        const denominator = other.real * other.real + other.imaginary * other.imaginary;
        if (denominator === 0) {
            throw new Error('División por cero en números complejos');
        }
        
        return new ComplexNumber(
            (this.real * other.real + this.imaginary * other.imaginary) / denominator,
            (this.imaginary * other.real - this.real * other.imaginary) / denominator
        );
    }
    
    magnitude() {
        return Math.sqrt(this.real * this.real + this.imaginary * this.imaginary);
    }
    
    phase() {
        return Math.atan2(this.imaginary, this.real);
    }
    
    toString() {
        if (this.imaginary === 0) return this.real.toString();
        if (this.real === 0) return `${this.imaginary}i`;
        
        const sign = this.imaginary >= 0 ? '+' : '';
        return `${this.real}${sign}${this.imaginary}i`;
    }
}

// Exportar funciones científicas
window.scientificCalculator = {
    appendFunction,
    appendConstant,
    toggleAngleMode,
    toggleInverseMode,
    toggleHyperbolicMode,
    factorial,
    calculateStatistics,
    convertUnit,
    combination,
    permutation,
    ComplexNumber,
    MATH_CONSTANTS
};