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
    
    
        $('#dimensionForm').submit(function(event) {
            event.preventDefault();
            const gridSize = parseInt($('#gridSize').val());
            numMatrices = parseInt($('#numMatrices').val());
            const stableMatrixOption = $('#stableMatrixOption').val();
    
            // Generate state labels
            states = [];
            for (let i = 1; i <= gridSize; i++) {
                states.push('S' + i);
            }
    

            const numRows = parseInt($('#numRows').val());
            const numCols = parseInt($('#numCols').val());
            numMatrices = parseInt($('#numMatrices').val());
            const stableMatrixOption = $('#stableMatrixOption').val();
            
            // Generate state labels
            const statesFrom = [];
            const statesTo = [];
            for (let i = 1; i <= numRows; i++) {
                statesFrom.push('S' + i);
            }
            for (let j = 1; j <= numCols; j++) {
                statesTo.push('S' + j);
            }
            
            // Hide the initial form and show the matrix forms
            $('#initialForm').hide();
            generateMatrixForms(statesFrom, statesTo, numMatrices, stableMatrixOption);
            $('#matrixForms').show();

        });
    

           function generateMatrixForm(matrixId, statesFrom, statesTo) {
            let formHtml = `<table class="table table-bordered" id="${matrixId}">`;
            // Header row
            formHtml += '<thead class="thead-light"><tr><th></th>';
            statesTo.forEach(state => {
                formHtml += `<th>${state}</th>`;
            });
            formHtml += '</tr></thead><tbody>';
        
            // Input rows
            statesFrom.forEach((stateFrom) => {
                formHtml += `<tr><th>${stateFrom}</th>`;
                statesTo.forEach(() => {
                    formHtml += '<td><input type="number" step="any" min="0" max="1" class="form-control" required></td>';
                });
                formHtml += '</tr>';
            });
        
            formHtml += '</tbody></table>';
            return formHtml;
        }


        // Add Compute Button
        container.append('<button id="computeButton" class="btn btn-success mt-3">Compute Z-Shifts</button>');

        // Attach event handler to Compute button
        $('#computeButton').click(function() {
            computeZShifts(states, numMatrices, stableMatrixOption);
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
