function evaluarFuncion(expr, variable, x) {
    let e = expr.replace(new RegExp(variable, 'g'), `(${x})`);
    e = e.replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/exp\(/g, 'Math.exp(')
        .replace(/log\(/g, 'Math.log(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/\^/g, '**')
        .replace(/pi/gi, 'Math.PI')
        .replace(/e(?![a-zA-Z])/g, 'Math.E');
    try {
        return eval(e);
    } catch {
        return NaN;
    }
}

function graficarFuncion(funcion, tipo, limiteInferior, limiteSuperior) {
    const canvas = document.getElementById('function-plot');
    const ctx = canvas.getContext('2d');
    if (window.functionChart) window.functionChart.destroy();

    const variable = "x";
    let xMin = tipo === "definite" ? Math.min(limiteInferior, limiteSuperior) - 1 : -5;
    let xMax = tipo === "definite" ? Math.max(limiteInferior, limiteSuperior) + 1 : 5;
    const numPoints = 200;
    const xStep = (xMax - xMin) / numPoints;
    const data = [];
    const areaData = [];

    for (let i = 0; i <= numPoints; i++) {
        const x = xMin + i * xStep;
        const y = evaluarFuncion(funcion, variable, x);
        if (isFinite(y) && Math.abs(y) < 1e4) {
            data.push({ x, y });
            if (tipo === "definite" && x >= limiteInferior && x <= limiteSuperior) {
                areaData.push({ x, y });
            }
        }
    }

    if (tipo === "definite" && areaData.length > 0) {
        areaData.unshift({ x: limiteInferior, y: 0 });
        areaData.push({ x: limiteSuperior, y: 0 });
    }

    const datasets = [
        {
            label: `f(${variable})`,
            data: data,
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false
        }
    ];
    if (tipo === "definite" && areaData.length > 0) {
        datasets.push({
            label: 'Área',
            data: areaData,
            backgroundColor: 'rgba(75, 192, 192, 0.3)',
            borderColor: 'rgba(75, 192, 192, 0.7)',
            borderWidth: 1,
            pointRadius: 0,
            fill: true
        });
    }

    window.functionChart = new Chart(ctx, {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: variable }
                },
                y: {
                    title: { display: true, text: `f(${variable})` }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `f(${ctx.parsed.x.toFixed(2)}) = ${ctx.parsed.y.toFixed(4)}`
                    }
                }
            }
        }
    });
}

function mostrarResolucionIntegral() {
    const funcion = document.getElementById('input-funcion').value.trim();
    const tipo = document.getElementById('input-tipo').value;
    const a = parseFloat(document.getElementById('input-limite-inferior').value);
    const b = parseFloat(document.getElementById('input-limite-superior').value);
    const variable = 'x';
    let procedimiento = '';

    try {
        let integralIndef = '';
        let pasos = '';

        // Casos comunes
        if (/^x\^(\d+)$/.test(funcion)) {
            // x^n
            const n = parseInt(funcion.match(/^x\^(\d+)$/)[1]);
            integralIndef = `\\frac{x^{${n + 1}}}{${n + 1}}`;
            pasos = `\\int x^{${n}} dx = \\frac{x^{${n + 1}}}{${n + 1}} + C`;
        } else if (funcion === 'x') {
            integralIndef = '\\frac{x^2}{2}';
            pasos = '\\int x dx = \\frac{x^2}{2} + C';
        } else if (funcion === '1/x') {
            integralIndef = '\\ln|x|';
            pasos = '\\int \\frac{1}{x} dx = \\ln|x| + C';
        } else if (funcion === 'sin(x)') {
            integralIndef = '-\\cos(x)';
            pasos = '\\int \\sin(x) dx = -\\cos(x) + C';
        } else if (funcion === 'cos(x)') {
            integralIndef = '\\sin(x)';
            pasos = '\\int \\cos(x) dx = \\sin(x) + C';
        } else if (funcion === 'e^x') {
            integralIndef = 'e^x';
            pasos = '\\int e^x dx = e^x + C';
        } else {
            throw new Error('No se pudo resolver la integral simbólicamente.');
        }

        if (tipo === 'definite') {
            // Integral definida: evaluar en los límites
            let F = x => {
                if (/^x\^(\d+)$/.test(funcion)) {
                    const n = parseInt(funcion.match(/^x\^(\d+)$/)[1]);
                    return Math.pow(x, n + 1) / (n + 1);
                } else if (funcion === 'x') {
                    return Math.pow(x, 2) / 2;
                } else if (funcion === '1/x') {
                    return Math.log(Math.abs(x));
                } else if (funcion === 'sin(x)') {
                    return -Math.cos(x);
                } else if (funcion === 'cos(x)') {
                    return Math.sin(x);
                } else if (funcion === 'e^x') {
                    return Math.exp(x);
                }
                return NaN;
            };
            const F_b = F(b);
            const F_a = F(a);
            const resultado = F_b - F_a;

            procedimiento = `
                \\[
                ${pasos.replace('+ C', '')}
                \\]
                \\[
                \\left[${integralIndef}\\right]_{${a}}^{${b}} = ${F_b.toFixed(4)} - (${F_a.toFixed(4)}) = \\boxed{${resultado.toFixed(4)}}
                \\]
            `;
        } else {
            // Integral indefinida
            procedimiento = `
                \\[
                ${pasos}
                \\]
            `;
        }
    } catch (e) {
        procedimiento = 'No se pudo resolver la integral simbólicamente.';
    }

    document.getElementById('integral-procedure').innerHTML = procedimiento;
    if (window.renderMathInElement) renderMathInElement(document.getElementById('integral-procedure'));
}

function graficarDesdeFormulario() {
    const funcion = document.getElementById('input-funcion').value;
    const tipo = document.getElementById('input-tipo').value;
    const limiteInferior = parseFloat(document.getElementById('input-limite-inferior').value);
    const limiteSuperior = parseFloat(document.getElementById('input-limite-superior').value);
    graficarFuncion(funcion, tipo, limiteInferior, limiteSuperior);
}

// Graficar inicialmente con valores por defecto
window.addEventListener('DOMContentLoaded', () => {
    graficarDesdeFormulario();
});
// Llama a la función cada vez que se grafica
const oldGraficarDesdeFormulario = graficarDesdeFormulario;
graficarDesdeFormulario = function () {
    oldGraficarDesdeFormulario();
    mostrarResolucionIntegral();
};

// Mostrar al cargar
window.addEventListener('DOMContentLoaded', mostrarResolucionIntegral);