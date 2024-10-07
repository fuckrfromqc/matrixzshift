// zshift.js


function computeZShifts(states, numMatrices, stableMatrixOption) {
    const matrices = validateMatrices(states, numMatrices, stableMatrixOption);
    if (!matrices) return; // Validation failed

    let stableMatrix;
    let observedMatrices;

    if (stableMatrixOption === 'input') {
        stableMatrix = matrices[0];
        observedMatrices = matrices.slice(1);
    } else {
        observedMatrices = matrices;
        // Compute the stable matrix as the average of observed matrices
        stableMatrix = computeAverageMatrix(observedMatrices);
    }

    const zShifts = [];

    // For each observed matrix, compute z-shift
    observedMatrices.forEach((Q, index) => {
        const z = optimizeZShift(stableMatrix, Q);
        zShifts.push(z);
    });

    // Display Results
    displayResults(zShifts);
}

function computeAverageMatrix(matrices) {
    const numMatrices = matrices.length;
    const gridSize = matrices[0].length;
    const avgMatrix = [];

    for (let i = 0; i < gridSize; i++) {
        avgMatrix[i] = [];
        for (let j = 0; j < gridSize; j++) {
            let sum = 0;
            for (let k = 0; k < numMatrices; k++) {
                sum += matrices[k][i][j];
            }
            avgMatrix[i][j] = sum / numMatrices;
        }
    }
    return avgMatrix;
}


function validateMatrices(states, numMatrices, stableMatrixOption) {
    let valid = true;
    const matrices = [];

    if (stableMatrixOption === 'input') {
        // Validate Stable Matrix
        const stableMatrix = getMatrixData('stableMatrix', states);
        if (!validateMatrix(stableMatrix)) {
            alert('Each row of the stable matrix must sum to 1.');
            valid = false;
        } else {
            matrices.push(stableMatrix);
        }
    }

    // Validate Observed Matrices
    for (let i = 0; i < numMatrices; i++) {
        const observedMatrix = getMatrixData(`observedMatrix${i}`, states);
        if (!validateMatrix(observedMatrix)) {
            alert(`Each row of observed matrix ${i + 1} must sum to 1.`);
            valid = false;
            break;
        } else {
            matrices.push(observedMatrix);
        }
    }

    return valid ? matrices : null;
}


function getMatrixData(matrixId, states) {
    const matrix = [];
    const table = $(`#${matrixId}`);
    table.find('tbody tr').each(function() {
        const row = [];
        $(this).find('td input').each(function() {
            row.push(parseFloat($(this).val()));
        });
        matrix.push(row);
    });
    return matrix;
}

function validateMatrix(matrix) {
    for (const row of matrix) {
        const sum = row.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1) > 0.01) { // Allow small numerical errors
            return false;
        }
    }
    return true;
}

function optimizeZShift(P, Q) {
    const epsilon = 1e-10;
    let a = -10, b = 10;
    const tol = 1e-5;
    let z;

    function objective(z) {
        // Compute sum of squared differences
        let sumSquares = 0;
        for (let i = 0; i < P.length; i++) {
            for (let j = 0; j < P[i].length; j++) {
                const pij = Math.min(Math.max(P[i][j], epsilon), 1 - epsilon);
                const qij = Math.min(Math.max(Q[i][j], epsilon), 1 - epsilon);
                const Lij = Math.log(pij / (1 - pij));
                const Lij_shifted = Lij + z;
                const pij_shifted = 1 / (1 + Math.exp(-Lij_shifted));
                const diff = pij_shifted - qij;
                sumSquares += diff * diff;
            }
        }
        return sumSquares;
    }

    // Simple implementation of Golden Section Search
    const phi = (1 + Math.sqrt(5)) / 2;
    let c = b - (b - a) / phi;
    let d = a + (b - a) / phi;
    while (Math.abs(b - a) > tol) {
        if (objective(c) < objective(d)) {
            b = d;
        } else {
            a = c;
        }
        c = b - (b - a) / phi;
        d = a + (b - a) / phi;
    }
    z = (b + a) / 2;
    return z;
}

function displayResults(zShifts) {
    // Hide matrix forms
    $('#matrixForms').hide();

    const container = $('#resultsSection');
    container.html('<h2>Z-Shift Results</h2>');

    // Display z-shifts in a table
    let tableHtml = '<table class="table table-striped"><thead><tr><th>Matrix Number</th><th>Z-Shift Value</th></tr></thead><tbody>';
    zShifts.forEach((z, index) => {
        tableHtml += `<tr><td>${index + 1}</td><td>${z.toFixed(4)}</td></tr>`;
    });
    tableHtml += '</tbody></table>';
    container.append(tableHtml);

    // Create a canvas for the chart
    container.append('<div class="chart-container"><canvas id="zShiftChart"></canvas></div>');

    // Prepare data for the chart
    const labels = zShifts.map((_, index) => `Matrix ${index + 1}`);
    const data = {
        labels: labels,
        datasets: [{
            label: 'Z-Shift Value',
            data: zShifts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
    };

    // Configure and render the chart
    const ctx = document.getElementById('zShiftChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });

    // Add Export Button
    container.append('<button id="exportButton" class="btn btn-secondary mt-3">Export Results</button>');

    $('#exportButton').click(function() {
        exportResults(zShifts);
    });

    container.show();
}

function exportResults(zShifts) {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Matrix Number,Z-Shift Value\n";
    zShifts.forEach((z, index) => {
        csvContent += `${index + 1},${z}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "z_shift_results.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
}
