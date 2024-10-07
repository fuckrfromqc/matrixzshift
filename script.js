// script.js

$(document).ready(function() {
    let states = [];
    let numMatrices = 0;

    // Handle the initial form submission
    $('#dimensionForm').submit(function(event) {
        event.preventDefault();
        const gridSize = parseInt($('#gridSize').val());
        numMatrices = parseInt($('#numMatrices').val());

        // Generate state labels
        states = [];
        for (let i = 1; i <= gridSize; i++) {
            states.push('S' + i);
        }

        // Hide the initial form and show the matrix forms
        $('#initialForm').hide();
        generateMatrixForms(states, numMatrices);
        $('#matrixForms').show();
    });

    // Function to generate matrix input forms
    function generateMatrixForms(states, numMatrices) {
        const container = $('#matrixForms');
        container.html('');

        // Stable Matrix Form
        container.append('<h2>Stable (Neutral) Matrix</h2>');
        container.append(generateMatrixForm('stableMatrix', states));

        // Observed Matrices Forms
        for (let i = 0; i < numMatrices; i++) {
            container.append(`<h2>Observed Matrix ${i + 1}</h2>`);
            container.append(generateMatrixForm(`observedMatrix${i}`, states));
        }

        // Add Compute Button
        container.append('<button id="computeButton" class="btn btn-success mt-3">Compute Z-Shifts</button>');

        // Attach event handler to Compute button
        $('#computeButton').click(function() {
            computeZShifts(states, numMatrices);
        });
    }

    // Function to generate a matrix input form
    function generateMatrixForm(matrixId, states) {
        let formHtml = `<table class="table table-bordered" id="${matrixId}">`;
        // Header row
        formHtml += '<thead class="thead-light"><tr><th></th>';
        states.forEach(state => {
            formHtml += `<th>${state}</th>`;
        });
        formHtml += '</tr></thead><tbody>';

        // Input rows
        states.forEach(stateFrom => {
            formHtml += `<tr><th>${stateFrom}</th>`;
            states.forEach(stateTo => {
                formHtml += '<td><input type="number" step="any" min="0" max="1" class="form-control" required></td>';
            });
            formHtml += '</tr>';
        });

        formHtml += '</tbody></table>';
        return formHtml;
    }
});
