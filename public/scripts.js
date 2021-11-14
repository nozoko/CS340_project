document.addEventListener('DOMContentLoaded', bindButtons);

function bindButtons(){
    document.getElementById("submit").addEventListener('click', addEntry);
    document.getElementById("resetTable").addEventListener('click', resetTable);
}

var idCounter

function buildTable(rows) {
    var table = document.getElementById("table");
    for (var i = 0; i < rows.length; i++) {
        var newRow = document.createElement("tr");
        var col = 0;
        for (key in rows[i]) {
            newInput = document.createElement("input");
            newInput.value = rows[i][key];
            newInput.readOnly = true;

            if (key == "name") {
                newInput.setAttribute("type", "text");
            }
            else if (key == "reps" || key == "lbs" || key == "id") {
                newInput.setAttribute("type", "number");
            }
            else if (key == "date") {
                newInput.setAttribute("type", "date");
            }
            else {
                newInput.setAttribute("type", "text");
            }

            newData = document.createElement("td");
            if (key == "id") {
                newData.style.display = "none";
            }

            newData.appendChild(newInput);
            newRow.appendChild(newData);
            col++;
        }

        newData = document.createElement("td");
        newButton = document.createElement("button");
        newButton.textContent = "Edit";
        newButton.id = "Edit"+idCounter;
        newData.appendChild(newButton);
        newRow.appendChild(newData);
        newData = document.createElement("td");
        newButton = document.createElement("button");
        newButton.textContent = "Delete";
        newButton.id = "Delete"+idCounter;
        newData.appendChild(newButton);
        newRow.appendChild(newData);
        table.appendChild(newRow);
        document.getElementById("Delete"+idCounter).addEventListener('click', deleteEntry(idCounter));
        idCounter++
    }
}

function resetTable(event) {
    idCounter = 0
    event.preventDefault();
    var req = new XMLHttpRequest();
    req.open('GET', 'http://flip3.engr.oregonstate.edu:6950/reset-table', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("table").innerHTML = "";
            buildTable(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
}

function addEntry() {
    event.preventDefault();
    var req = new XMLHttpRequest();
    var payload = {
        name: null,
        reps: null,
        weight: null,
        date: null,
        lbs: null
    };
    //assign user input to payload input
    payload.name = document.getElementById('name').value;
    payload.reps = document.getElementById('reps').value;
    payload.weight = document.getElementById('weight').value;
    payload.date = document.getElementById('date').value;
    if (document.getElementById('lbs').value.lower == "kg"){
        payload.lbs = new Boolean(false);
    }
    else {
        payload.lbs = new Boolean(true);
    }

    //open new post request and set request header
    req.open('POST', 'http://flip3.engr.oregonstate.edu:6950/',true);
    req.setRequestHeader('Content-Type', 'application/json');
    //if post response received post to window, else log error
    req.addEventListener('load',function(){
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("table").innerHTML = "";
            buildTable(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    //send request
    req.send(JSON.stringify(payload));
}

function deleteEntry(deleteId) {
    event.preventDefault();
    var payload = {id: deleteId};
    var req = new XMLHttpRequest();
    req.open('DELETE', 'http://flip3.engr.oregonstate.edu:6950/', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', () => {
        if (req.status >= 200 && req.status < 400) {
            var response = JSON.parse(req.responseText);
            document.getElementById("table").innerHTML = "";
            buildTable(response);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(JSON.stringify(payload));
}