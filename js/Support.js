//------------------------------------------------------------------------------------------------
//!  Test Button: Toggle the Mineral Load section.
//
const hideMineralLoad = () => {
    const minerals = document.getElementById("MineralLoad");
    minerals.classList.toggle("Hide");
}



//------------------------------------------------------------------------------------------------
//!  Clears all of the raw mineral input fields.
//
const ClearInputs = () => {
    const elements = document.getElementsByClassName("rawSCUInput");
    for (let i = 0; i < elements.length; i++) {
        elements[i].value = "";
    }

    const switches = document.getElementsByClassName("checkbox");
    for (let i = 0; i < switches.length; i++) {
        switches[i].checked = false;
    }

    document.querySelectorAll(`[id$="-multiplier"]`).forEach(item => { item.innerHTML = 0; });
    document.querySelectorAll(`[id$="-refine-cost"]`).forEach(item => { item.innerHTML = 0; });
    document.querySelectorAll(`[id$="-scu-price"]`).forEach(item => { item.innerHTML = 0; });
    document.querySelectorAll(`[id$="-scu-yield"]`).forEach(item => { item.innerHTML = 0; });
    document.querySelectorAll(`[id$="-refine-duration-timer"]`).forEach(item => { item.innerHTML = 0; });
    document.querySelectorAll(`[id$="-profit"]`).forEach(item => { item.innerHTML = 0; });
}



const SubmitNewWorkOrder = () => {
    if (!ValidateRawMinerals()) { return; }

    //  Create a new refinery order.
    let refineryOrder = new RefineryOrder();
    orderHead.setAttribute("data-guid", refineryOrder.GUID);
    refineryOrder.Minerals = mineralList;
    RefineryOrders.push(refineryOrder);  //  Add order to master list.

    let orderInfo;  //  Passed to AddWorkOrder(), provides info for making a new work order.

    //  Prepare the header.
    const selectedRefinery = document.getElementById("Refineries");
    const refinery = selectedRefinery.options[selectedRefinery.selectedIndex].text;
    refineryOrder.Location = refinery;

    const selectedMethod = document.getElementById("processing_method");
    const processingMethod = selectedMethod.options[selectedMethod.selectedIndex].text;
    refineryOrder.Method = processingMethod;

    orderInfo.Refinery = refinery;
    orderInfo.ProcessingMethod = processingMethod;
    orderInfo.TotalYield = CalculateTotalYield(refineryOrder.Minerals);
}






var orderNumber = 0;

//  ****************************************************************************************************
//! ***************************  Add a new section to the Work Order table.  ***************************
//  ****************************************************************************************************
const AddWorkOrder = (orderInfo = null) => {
    //  Test to see if the browser supports the HTML template element by checking for the presence of the template element's content attribute.
    if (!("content" in document.createElement("template"))) {
        //  Find another way to add the rows to the table because the HTML template element is not supported.
        return false;  //  Since templates are not supported, returning false for now.
    }

    //  *************************************************************************************************
    //  ***********  Start with getting minerals selected for refining and validating them.  ************


    //  *************************************************************************************************
    //  **************************  Prepare the table for receiving an order  ***************************
    //  WorkOrders: Table containing all work orders in refinery.
    const container = document.getElementById("WorkOrders");
    //  WorkOrderTemplate: Template element containing format for new work order.
    const template = document.getElementById("WorkOrderTemplate");

    //  order_Main: <div> that wraps everything for a work order and is draggable.
    const orderMainClone = template.content.getElementById("order_Main").cloneNode(true);
    orderMainClone.id = "order" + orderNumber + "_Main";

    //  Append the new work order to the Work Order table.
    container.appendChild(orderMainClone);

    //  More prep work, change the IDs of the subcomponents for various roles
    const order = "order" + orderNumber;
    const orderToggle = document.getElementById("order_Toggle");
    const orderLabel = document.getElementById("order_Label");
    const bodyTable = document.getElementById("order_Body");
    const orderHead = document.getElementById("order_Head");

    orderToggle.id = order + "_Toggle";
    orderLabel.id = order + "_Label";
    orderLabel.htmlFor = orderToggle.id;
    bodyTable.id = order + "_Body";
    orderHead.id = order + "_Head";

    //  ****  This is where the magic happens: Fill in the order information here  ****
    // const headLabel = document.getElementById("order" + orderNumber + "_Label");  //  Summary
    // const summaryTable = document.getElementById(order + "_Head");  //  Summary
    //  *************************************************************************************************
    //  ****************************************  Order Summary  ****************************************
    // headLabel.innerHTML = "ID: " + orderNumber + " | 800 cSCU | Created: 07JUL | 7h | Avg Worth: 4000 aUEC";


    // document.querySelectorAll(`[id$="-refine-cost"]`).forEach(item => { item.innerHTML = 0; });



    // **  Required Parameters  **
    // orderInfo.Refinery           **Done**
    // orderInfo.ProcessingMethod   **Done**
    // orderInfo.TotalYield         **Done**
    // orderInfo.ProcessingTime
    // orderInfo.Minerals







    // TotalValue  => Calculate this
    let TotalValue = 0;
    orderInfo.Minerals.forEach(item => {

    });



    let location = addRow(orderHead);
    addCell(location, "Location", true);
    addCell(location, orderInfo.Refinery).colSpan = 3;

    let method = addRow(orderHead);
    addCell(method, "Method", true);
    addCell(method, orderInfo.ProcessingMethod).colSpan = 3;

    //  Header row
    let summaryHead = addRow(orderHead);
    addCell(summaryHead, "Total Yield", true);
    addCell(summaryHead, "Created", true);
    addCell(summaryHead, "Processing Time", true);
    addCell(summaryHead, "Avg Worth", true);

    const date = new Date();
    const month = date.toLocaleString('default', { month: 'short' });

    let summaryContent = addRow(orderHead);
    addCell(summaryContent, totalYield + " cSCU");          //  Total Yield
    addCell(summaryContent, date.getDate() + " " + month);  //  Created
    addCell(summaryContent, orderInfo.ProcessingTime);     //  TODO  Processing Time
    addCell(summaryContent, TotalValue);  //  TODO  Total Average Worth
    //  *************************************************************************************************


    //  *************************************************************************************************
    //  ****************************************  Order Details  ****************************************
    //  TODO  Replace with actual mineral values.
    orderInfo.Minerals.forEach(item => {
        let row = addRow(bodyTable);
        addCell(row, item.Name);            //  Mineral Name
        addCell(row, "12,000 aUEC");        //  TODO  Refinement Cost
        addCell(row, item.MineralYield);    //  Yield
        addCell(row, "16,000 aUEC");        //  TODO  Average Worth
    })
    //  *************************************************************************************************

    //  *********************
    //  Drag and drop support
    orderMainClone.addEventListener("dragstart", () => {
        orderMainClone.classList.add("is-dragging");
    });

    orderMainClone.addEventListener("dragend", () => {
        orderMainClone.classList.remove("is-dragging");
    });
    //  *********************

    orderNumber++;  //  Required for differentiating the IDs of the order's elements.

    ClearInputs();
}
//  ****************************************************************************************************
//  ****************************************************************************************************

//!  Insert a new row into the specified table.
//!  Return: Reference to the row that was inserted.
const addRow = (table) => {
    return table.insertRow();
}

//!  Insert a new cell into the specified row.
//!  Return: Reference to the cell that was inserted.
const addCell = (row, text = null, bold = false) => {
    let cell = null;
    if (bold) {
        cell = document.createElement("th");
    } else {
        cell = document.createElement("td");
    }

    if (text !== null) {
        cell.innerHTML = text;
    }

    row.appendChild(cell);
    return cell;
}


//------------------------------------------------------------------------------------------------
//!  Add cargo box slots to the designated ship.
//
const AddBoxes = (targetSVG, quantity) => {
    let rows = Math.floor(quantity / 10);
    let finalRowCount = quantity % 10;

    const boxList = document.getElementById(targetSVG);

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < 10; x++) {
            boxList.appendChild(createCargoBox(x, y));
        }
    }

    if (finalRowCount == 0) { return; }

    for (let x = 0; x < finalRowCount; x++) {
        boxList.appendChild(createCargoBox(x, rows));
    }
}

//------------------------------------------------------------------------------------------------
//!  Create a cargo box at the specified coordinates for appending to a cargo grid.
//
const createCargoBox = (x, y) => {
    const box = document.createElementNS("http://www.w3.org/2000/svg", "use");
    box.setAttribute("href", "/img/icons.svg#CargoBox");
    box.setAttribute("x", x * 25);
    box.setAttribute("y", y * 25);
    return box;
}


//------------------------------------------------------------------------------------------------
//!  Fill the specified number of cargo boxes.
//
const FillBoxes = (targetSVG, quantity) => {
    const boxList = document.getElementById(targetSVG);
    const boxes = boxList.children;

    for (let i = 0; i < boxes.length; i++) {
        removeClass(boxes[i], "fullCargoBox");
    };

    for (let i = 0; i < quantity; i++) {
        addClass(boxes[i], "fullCargoBox");
    }
}



//  TODO  Calculate refinery order information as it is typed into the order form.
//  TODO  Replace the IDs "orderHead" and "orderBody" with "order#_Head" and "order#_Body".
//  TODO  Save refinery orders to localstorage for preservation across sessions.
//  TODO  Add drag&drop support to the work orders.
//  TODO  Create drop zone for deleting work orders with confirmation.  Delete from localstorage as well.
//  TODO  Add support for dynamically pulling ship data from csv and populating the ship selection box.
//  TODO  Make the ship selection box expand to a listbox that stays open until a ship is selected.
//  TODO  Create drop zones for placing work orders into ships.
//  TODO  Create export button for refinery order data.
//  TODO  Preserve refinery location and processing method in localstorage.



//------------------------------------------------------------------------------------------------
//!  Add the work order to the selected transport ship.
//
const AddOrderToShip = (element) => {
    return;
}

//------------------------------------------------------------------------------------------------
//!  Delete the selected work order.
//
const DeleteOrder = (event) => {
    const orderNumber = this.id.split("_")[0];
    const orderHead = document.getElementById(orderNumber + "_Head");
    const orderBody = document.getElementById(orderNumber + "_Body");

    orderHead.replaceChildren();
    orderBody.replaceChildren();

    orderHead.remove();
    orderBody.remove();
}

//------------------------------------------------------------------------------------------------
//!  Drag and drop support.
//
const draggables = document.querySelectorAll(".task");
const dropZones = document.querySelectorAll(".dragContainer");

draggables.forEach((task) => {
    task.addEventListener("dragstart", () => {
        task.classList.add("is-dragging");
    });
    task.addEventListener("dragend", () => {
        task.classList.remove("is-dragging");
    });
});

dropZones.forEach((zone) => {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();


        //  Conditionally prevents element from being dropped on the targeted drop zone.
        //TODO  Get cargo capacity & orders already in ship => Determine if there is sufficient room for this order
        if (zone.id.includes("ship")) {
            if (zone.children.length > 2) { return; }
        }

        const bottomTask = insertAboveTask(zone, e.clientY);
        const curTask = document.querySelector(".is-dragging");

        if (!bottomTask) {
            zone.appendChild(curTask);
        } else {
            zone.insertBefore(curTask, bottomTask);
        }
    });
});

const insertAboveTask = (zone, mouseY) => {
    const els = zone.querySelectorAll(".task:not(.is-dragging)");

    let closestTask = null;
    let closestOffset = Number.NEGATIVE_INFINITY;

    els.forEach((task) => {
        const { top } = task.getBoundingClientRect();

        const offset = mouseY - top;

        if (offset < 0 && offset > closestOffset) {
            closestOffset = offset;
            closestTask = task;
        }
    });

    return closestTask;
};

//  -------------------------------------------------------------------------------------------------
//  --------------------  Input form sample: From the drag and drop kanban demo  --------------------
//  --------------------  https://github.com/TomIsLoading/drag-and-drop-kanban   --------------------
//  Section that adds a todo list
// const form = document.getElementById("todo-form");
// const input = document.getElementById("todo-input");
// const todoLane = document.getElementById("todo-lane");

// form.addEventListener("submit", (e) => {
//     e.preventDefault();
//     const value = input.value;

//     if (!value) return;

//     const newTask = document.createElement("p");
//     newTask.classList.add("task");
//     newTask.setAttribute("draggable", "true");
//     newTask.innerText = value;

//     newTask.addEventListener("dragstart", () => {
//         newTask.classList.add("is-dragging");
//     });

//     newTask.addEventListener("dragend", () => {
//         newTask.classList.remove("is-dragging");
//     });

//     todoLane.appendChild(newTask);

//     input.value = "";
// });
//  -------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
//!  Add/Remove class from element
//
const hasClass = (el, className) => {
    if (el.classList) { return el.classList.contains(className); }
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

/// <summary>
/// Add a class to the element.
/// </summary>
const addClass = (el, className) => {
    if (el.classList) { el.classList.add(className) }
    else if (!hasClass(el, className)) { el.className += " " + className; }
}

const removeClass = (el, className) => {
    if (el.classList) { el.classList.remove(className) }
    else if (hasClass(el, className)) {
        let reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}
//  -------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------
//!  Customize Ship List
//

//  -------------------------------------------------------------------------------------------------
