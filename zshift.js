// zshift.js

// zshift.js

function computeZShifts(statesFrom, statesTo, numMatrices, stableMatrixOption, methodology) {
    const matrices = validateMatrices(statesFrom, statesTo, numMatrices, stableMatrixOption);
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

    // Get rho from the input
    const rho = parseFloat($('#rho').val());

    const zShifts = [];

    if (methodology === 'imf') {
        // Compute bin boundaries from the stable matrix
        const binBoundaries = computeBinBoundaries(stableMatrix);

        // For each observed matrix, compute z-shift using IMF methodology
        observedMatrices.forEach((Q, index) => {
            const z = optimizeZShiftIMF(Q, binBoundaries, rho);
            zShifts.push(z);
        });
    } else if (methodology === 'alternative') {
        // Alternative methodology (e.g., original implementation)
        observedMatrices.forEach((Q, index) => {
            const z = optimizeZShiftAlternative(stableMatrix, Q);
            zShifts.push(z);
        });
    } else {
        alert('Invalid methodology selected.');
        return;
    }

    // Display Results
    displayResults(zShifts);
}

function computeBinBoundaries(stableMatrix) {
    const binBoundaries = [];
    for (let i = 0; i < stableMatrix.length; i++) {
        const row = stableMatrix[i];
        const cumProbs = [0];
        let cumSum = 0;
        for (let j = 0; j < row.length; j++) {
            cumSum += row[j];
            cumProbs.push(cumSum);
        }
        const x_i = cumProbs.map(p => jStat.normal.inv(p, 0, 1));
        binBoundaries.push(x_i);
    }
    return binBoundaries;
}

function optimizeZShiftIMF(P_obs, binBoundaries, rho) {
    function cdfStandardNormal(x) {
        return jStat.normal.cdf(x, 0, 1);
    }

    function objective(Z) {
        let sumSquares = 0;
        for (let i = 0; i < P_obs.length; i++) {
            const x_i = binBoundaries[i]; // Array of bin boundaries for state i
            for (let j = 0; j < P_obs[i].length; j++) {
                const A = x_i[j];     // Lower bin boundary
                const B = x_i[j + 1]; // Upper bin boundary
                const denom = Math.sqrt(1 - rho);
                const adjustedA = (A - Math.sqrt(rho) * Z) / denom;
                const adjustedB = (B - Math.sqrt(rho) * Z) / denom;
                const P_expected = cdfStandardNormal(adjustedB) - cdfStandardNormal(adjustedA);
                const P_obs_ij = P_obs[i][j];
                const diff = P_obs_ij - P_expected;
                sumSquares += diff * diff;
            }
        }
        return sumSquares;
    }

    // Use Golden Section Search to find Z that minimizes objective(Z)
    const tol = 1e-5;
    let a = -5;
    let b = 5;
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
    const Z_opt = (a + b) / 2;
    return Z_opt;
}

function optimizeZShiftAlternative(P, Q) {
    // Alternative method (e.g., previous implementation)
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

    // Golden Section Search
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



function validateMatrices(statesFrom, statesTo, numMatrices, stableMatrixOption) {
    let valid = true;
    const matrices = [];

    if (stableMatrixOption === 'input') {
        // Validate Stable Matrix
        const stableMatrix = getMatrixData('stableMatrix', statesFrom, statesTo);
        if (!validateMatrix(stableMatrix, 'stableMatrix')) {
            alert('Each row of the stable matrix must sum to 1.');
            valid = false;
        } else {
            matrices.push(stableMatrix);
        }
    }

    // Validate Observed Matrices
    for (let i = 0; i < numMatrices; i++) {
        const observedMatrix = getMatrixData(`observedMatrix${i}`, statesFrom, statesTo);
        if (!validateMatrix(observedMatrix, `observedMatrix${i}`)) {
            alert(`Each row of observed matrix ${i + 1} must sum to 1.`);
            valid = false;
            break;
        } else {
            matrices.push(observedMatrix);
        }
    }

    return valid ? matrices : null;
}



function getMatrixData(matrixId, statesFrom, statesTo) {
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

function validateMatrix(matrix, matrixId) {
    let valid = true;
    matrix.forEach((row, rowIndex) => {
        const sum = row.reduce((a, b) => a + b, 0);
        const rowElement = $(`#${matrixId} tbody tr:eq(${rowIndex})`);
        if (Math.abs(sum - 1) > 0.01) { // Allow small numerical errors
            valid = false;
            // Highlight the invalid row
            rowElement.addClass('table-danger');
        } else {
            // Remove any previous highlighting
            rowElement.removeClass('table-danger');
        }
    });
    return valid;
}

function computeAverageMatrix(matrices) {
    const numMatrices = matrices.length;
    const numRows = matrices[0].length;
    const numCols = matrices[0][0].length;
    const avgMatrix = [];

    for (let i = 0; i < numRows; i++) {
        avgMatrix[i] = [];
        for (let j = 0; j < numCols; j++) {
            let sum = 0;
            for (let k = 0; k < numMatrices; k++) {
                sum += matrices[k][i][j];
            }
            avgMatrix[i][j] = sum / numMatrices;
        }
    }
    return avgMatrix;
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
