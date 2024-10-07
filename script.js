// script.js

$(document).ready(function() {
    let statesFrom = [];
    let statesTo = [];
    let numMatrices = 0;
    let stableMatrixOption = '';

    // Initialize tooltips
    $('[data-toggle="tooltip"]').tooltip();

    // Handle the initial form submission
    $('#dimensionForm').submit(function(event) {
        event.preventDefault();
        const numRows = parseInt($('#numRows').val());
        const numCols = parseInt($('#numCols').val());
        numMatrices = parseInt($('#numMatrices').val());
        stableMatrixOption = $('#stableMatrixOption').val();

        // Generate state labels
        statesFrom = [];
        statesTo = [];
        for (let i = 1; i <= numRows; i++) {
            statesFrom.push('S' + i);
        }
        for (let j = 1; j <= numCols; j++) {
            statesTo.push('S' + j);
        }

        // Generate matrix input forms
        generateMatrixForms(statesFrom, statesTo, numMatrices, stableMatrixOption);

        // Show the compute button if not already visible
        if ($('#computeButton').length === 0) {
            // Add Compute Button
            $('#mainContent').append('<button id="computeButton" class="btn btn-success mt-3">Compute Z-Shifts</button>');

            // Attach event handler to Compute button
            $('#computeButton').click(function() {
                computeZShifts(statesFrom, statesTo, numMatrices, stableMatrixOption);
            });
        }

        // Scroll to the matrix forms
        $('html, body').animate({
            scrollTop: $("#matrixForms").offset().top - 20
        }, 500);
    });

    // Add real-time validation for input fields
    $('#numRows, #numCols, #numMatrices').on('input', function() {
        const value = $(this).val();
        if (value <= 0) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Function to generate matrix input forms
    function generateMatrixForms(statesFrom, statesTo, numMatrices, stableMatrixOption) {
        const container = $('#matrixForms');
        container.html('');

        // Conditionally display the stable matrix form
        if (stableMatrixOption === 'input') {
            container.append('<h2>Stable (Neutral) Matrix</h2>');
            container.append(generateMatrixForm('stableMatrix', statesFrom, statesTo));
        }

        // Observed Matrices Forms
        for (let i = 0; i < numMatrices; i++) {
            container.append(`<h2>Observed Matrix ${i + 1}</h2>`);
            container.append(generateMatrixForm(`observedMatrix${i}`, statesFrom, statesTo));
        }
    }

    // Function to generate a matrix input form
    function generateMatrixForm(matrixId, statesFrom, statesTo) {
        let formHtml = `<table class="table table-bordered" id="${matrixId}">`;
        // Header row
        formHtml += '<thead class="thead-light"><tr><th></th>';
        statesTo.forEach(state => {
            formHtml += `<th>${state}</th>`;
        });
        formHtml += '</tr></thead><tbody>';

        // Input rows
        statesFrom.forEach(stateFrom => {
            formHtml += `<tr><th>${stateFrom}</th>`;
            statesTo.forEach(() => {
                formHtml += '<td><input type="number" step="any" min="0" max="1" class="form-control" required></td>';
            });
            formHtml += '</tr>';
        });

        formHtml += '</tbody></table>';
        return formHtml;
    }
});
