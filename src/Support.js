//!   ****************************************************************************************************
/**
 * Test Button: Toggle the Mineral Load section.
 * @param {event} event Holds the ID of the button that triggered the switch.
 */
function SwitchTabs(event) {
    ActiveTab = event.target.id;
    SwitchToTab();
}

const SwitchToTab = () => {
    const mainContent = document.getElementById("mainContent");
    const minerals = document.getElementById("MineralLoad");
    const shipCargo = document.getElementById("ShipCargo");

    mainContent.classList.add("Hide");

    mainContent.addEventListener('animationend', () => {
        if (ActiveTab === "tabCargoShip") {
            minerals.classList.add("Hidden");
            shipCargo.classList.remove("Hidden");

            ChangeSelectedShip(GenerateShipEventID(ActiveShipID));
        } else {
            minerals.classList.remove("Hidden");
            shipCargo.classList.add("Hidden");

            ChangeSelectedShip(GenerateShipEventID("None"));
        }

        mainContent.classList.remove("Hide");
    }, { once: true });
}



//!   ****************************************************************************************************
/**
 * Clears all of the raw mineral input fields.
 */
function ClearInputs() {
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
    document.getElementById("Summary-scu-price").innerHTML = "-";

    for (const key in Minerals) {
        RefineryMinerals[key] = new Mineral(key);
    }
    RefineryInvoice = new RefinerySummary();
}


//!   ****************************************************************************************************
/**
 * Create a new refinery work order.
 */
function SubmitNewWorkOrder() {
    if (!ValidateRawMinerals()) { return; }

    //  Create a new refinery order.
    let refineryOrder = new RefineryOrder();
    let orderMinerals = new Array();


    for (const key in RefineryMinerals) {
        if (RefineryMinerals[key].MineralYield == 0) { continue; }

        let newMineral = RefineryMinerals[key];
        newMineral.GUID = refineryOrder.GUID;
        orderMinerals.push(newMineral);
    }


    //  Prepare the header.
    const selectedRefinery = document.getElementById("Refineries");
    const refinery = selectedRefinery.options[selectedRefinery.selectedIndex].text;
    refineryOrder.Refinery = refinery;

    const selectedMethod = document.getElementById("processing_method");
    const processingMethod = selectedMethod.options[selectedMethod.selectedIndex].text;
    refineryOrder.Method = processingMethod;

    refineryOrder.TotalMineralYield = RefineryInvoice.TotalMineralYield;
    refineryOrder.TotalDuration = RefineryInvoice.TotalDuration;
    refineryOrder.TotalProfit = RefineryInvoice.TotalProfit;

    //  Add order to master list of orders currently in the refinery.
    RefineryOrders.push(refineryOrder);
    OrderMinerals.push(orderMinerals);


    localStorage.setItem("RefineryOrders", JSON.stringify(RefineryOrders));
    localStorage.setItem("OrderMinerals", JSON.stringify(OrderMinerals));

    ClearInputs();
    AddWorkOrder(refineryOrder, orderMinerals);
}


//!   ****************************************************************************************************
/**
 * Recreate refinery work orders that have been saved.
 */
function ResubmitSavedOrders() {
    for (let i = 0; i < RefineryOrders.length; i++) {
        for (let j = 0; j < OrderMinerals.length; j++) {
            if (OrderMinerals[j][0].GUID === RefineryOrders[i].GUID) {
                AddWorkOrder(RefineryOrders[i], OrderMinerals[j]);
                break;
            }
        }
    }
}

//!   ****************************************************************************************************
/**
 * Add a new section to the work order table.
 * @param {RefinerySummary} orderInfo Contains the general information about a refinery order
 * @param {Mineral} orderMinerals Contains the minerals this refinery order contains
 * @returns None
 */
function AddWorkOrder(orderInfo, orderMinerals) {
    //  Test to see if the browser supports the HTML template element by checking for the presence of the template element's content attribute.
    if (!("content" in document.createElement("template"))) {
        //  Find another way to add the rows to the table because the HTML template element is not supported.
        return false; //  Since templates are not supported, returning false for now.
    }

    //  =================================================================================================
    //  **************************  Prepare the table for receiving an order  ***************************
    //  WorkOrders: Table containing all work orders in refinery.
    const container = document.getElementById("WorkOrders");
    //  WorkOrderTemplate: Template element containing format for new work order.
    const template = document.getElementById("WorkOrderTemplate");

    const orderPrefix = "order" + OrderNumber;

    //  order_Main: <div> that wraps everything for a work order.
    const orderMainClone = template.content.getElementById("order_Main").cloneNode(true);
    orderMainClone.id = orderPrefix + "_Main";

    //  Append the new work order to the Work Order table.
    container.appendChild(orderMainClone);

    //  More prep work, change the IDs of the sub-components for various roles
    const orderToggle = document.getElementById("order_Toggle");
    const orderLabel = document.getElementById("order_Label");
    const bodyTable = document.getElementById("order_Body");
    const orderHead = document.getElementById("order_Head");
    const orderSendButtonLocation = document.getElementById("order_SendButtonLocation");
    const orderSendButton = document.getElementById("order_SendButton");

    orderToggle.id = orderPrefix + "_Toggle";
    orderLabel.id = orderPrefix + "_Label";
    orderLabel.htmlFor = orderToggle.id;
    bodyTable.id = orderPrefix + "_Body";
    orderHead.id = orderPrefix + "_Head";
    orderMainClone.setAttribute("data-guid", orderInfo.GUID);
    orderSendButtonLocation.id = orderPrefix + "_SendButtonLocation";
    orderSendButton.id = orderPrefix + "_SendButton";


    //  |||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
    //  *************  This is where the magic happens: Fill in the order information here  *************
    //  =================================================================================================
    //  ****************************************  Order Summary  ****************************************
    let location = orderHead.insertRow();
    addCell(location, "Location", true);
    addCell(location, orderInfo.Refinery).colSpan = 3;

    let method = orderHead.insertRow();
    addCell(method, "Method", true);
    addCell(method, orderInfo.Method).colSpan = 3;

    //  Header row
    let summaryHead = orderHead.insertRow();
    addCell(summaryHead, "Total Yield", true);
    addCell(summaryHead, "Created", true);
    addCell(summaryHead, "Processing Time", true);
    addCell(summaryHead, "Avg Worth", true);

    const date = new Date();
    const month = date.toLocaleString('default', { month: 'short' });

    let summaryContent = orderHead.insertRow();
    addCell(summaryContent, orderInfo.TotalMineralYield + " cSCU"); //  Total yield of minerals
    addCell(summaryContent, date.getDate() + " " + month); //  Date work order is created
    addCell(summaryContent, ConvertSecondsToTime(orderInfo.TotalDuration)); //  Total work order processing time
    addCell(summaryContent, orderInfo.TotalProfit.toLocaleString() + " aUEC"); //  Average amount this work order will sell for




    //  =================================================================================================
    //  ****************************************  Order Details  ****************************************
    for (const key in orderMinerals) {
        let row = bodyTable.insertRow();
        addCell(row, orderMinerals[key].Name); //  Mineral Name
        addCell(row, orderMinerals[key].RefineCost).classList.add("textRight"); //  Refinement Cost
        addCell(row, orderMinerals[key].MineralYield).classList.add("textRight"); //  Yield
        addCell(row, orderMinerals[key].Profit.toLocaleString() + " aUEC").classList.add("textRight"); //  Average Worth
    }


    //  Button to send order to ship <-> refinery
    orderSendButton.addEventListener("click", (event) => {
        SendOrder(event);
    });
    //  =====================
    //  Used for creating unique html tag IDs for each refinery order.
    OrderNumber++;
}


//!   ****************************************************************************************************
/**
 * Create a new cargo ship.
 */
function SubmitNewCargoShip() {
    let cargoShip = new CargoShipInvoice();

    const cargoShipCode = document.getElementById("cargo_ships").value;
    let selectedCargoShip = Ships.filter(item => item.ShipCode === cargoShipCode)[0];

    cargoShip.ShipName = selectedCargoShip.Name;
    cargoShip.Capacity = selectedCargoShip.Capacity;
    cargoShip.CargoGUIDs = new Array();

    SelectedShips.push(cargoShip);

    //  Save the ship manifest change to localStorage
    localStorage.setItem("SelectedShips", JSON.stringify(SelectedShips));
    AddCargoShip(cargoShip);
}


//!   ****************************************************************************************************
/**
 * Recreate cargo ships that have been saved.
 */
function ResubmitSavedCargoShips() {
    SelectedShips.forEach((ship) => {
        AddCargoShip(ship);

        if (ship.CargoGUIDs.length === 0) { return; }

        ship.CargoGUIDs.forEach((storedGUID) => {
            RefineryOrders.forEach((order) => {
                if (order.GUID !== storedGUID) { return; }
                const orderID = document.querySelector(`[data-guid="` + storedGUID + `"]`).id.split('_')[0];
                const shipID = document.querySelector(`[data-guid="` + ship.GUID + `"]`).id.split('_')[0];

                AddToShip(orderID, shipID, false);
            });
        });
    });
}


//!   ****************************************************************************************************
/**
 * Add a new cargo ship to the ship list.
 * @param {Ship} shipInfo Information about the selected ship
 * @returns None
 */
function AddCargoShip(shipInfo) {
    //  Test to see if the browser supports the HTML template element by checking for the presence of the template element's content attribute.
    if (!("content" in document.createElement("template"))) {
        //  Find another way to add the rows to the table because the HTML template element is not supported.
        return false; //  Since templates are not supported, returning false for now.
    }


    //  ====================================================================================================
    //  *****************************  Prepare the table for receiving a ship  *****************************
    //  CargoShipOrders: Element containing all ships selected.
    const container = document.getElementById("CargoShipOrders");
    //  ShipCargoGridTemplate: Template element containing format for new cargo ship.
    const template = document.getElementById("ShipCargoGridTemplate");

    const shipPrefix = "ship" + CargoShipNumber;

    //  ship_Main: <div> that wraps everything for a cargo ship.
    const shipMainClone = template.content.getElementById("ship_Main").cloneNode(true);
    shipMainClone.id = shipPrefix + "_Main"; //*  Outermost div containing the ship components


    //  Append the new work order to the Work Order table.
    container.appendChild(shipMainClone);
    shipMainClone.setAttribute("data-guid", shipInfo.GUID);


    const shipTitle = document.getElementById("ship_Title");
    const shipDeleteButton = document.getElementById("ship_DeleteButton");
    const shipCargoGridCapacity = document.getElementById("ship_CargoGridCapacity");
    const shipCargoGridVisual = document.getElementById("ship_CargoGridVisual");
    const shipTotalMineralCount = document.getElementById("ship_TotalMineralCount");
    const shipOrders = document.getElementById("ship_Orders");
    const shipSelect = document.getElementById("ship_Select");

    shipTitle.id = shipPrefix + "_Title"; //*  Name of the ship
    shipDeleteButton.id = shipPrefix + "_DeleteButton"; //*  Button to delete this ship and all of its contents
    shipCargoGridCapacity.id = shipPrefix + "_CargoGridCapacity"; //*  Contains the #/full, format: "Cargo grid: ##/## SCU"
    shipCargoGridVisual.id = shipPrefix + "_CargoGridVisual"; //*  Boxes (svg) that represent the cargo grid
    shipTotalMineralCount.id = shipPrefix + "_TotalMineralCount"; //*  Summary of each mineral on the ship
    shipOrders.id = shipPrefix + "_Orders"; //*  Drop zone for work orders
    shipSelect.id = shipPrefix + "_Select"; //*  Indicates active ship for receiving orders


    shipTitle.innerHTML = shipInfo.ShipName;
    shipCargoGridCapacity.innerHTML = "0 / " + shipInfo.Capacity + " SCU (0%)";
    AddBoxes(shipCargoGridVisual.id, shipInfo.Capacity);

    shipSelect.addEventListener("click", (e) => {
        ChangeSelectedShip(e);
    });

    //  Fire the event to acknowledge the selection of the new ship
    ChangeSelectedShip(GenerateShipEventID(shipSelect.id));

    CargoShipNumber++;
}


//!   ****************************************************************************************************
/**
 * Insert a new cell into the specified row.
 * @param {HTMLTableRowElement} row Row to add a cell to
 * @param {string} text Text to insert
 * @param {boolean} bold True = Make inner text bold, False = Make inner text normal weight
 * @returns {HTMLTableCellElement} Reference to the inserted cell
 */
function addCell(row, text = null, bold = false) {
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


//!   ****************************************************************************************************
/**
 * Add cargo box slots to the designated ship.
 * @param {SVGElement} targetSVG SVG component that contains the visual representation of the ship's cargo grid
 * @param {Number} quantity Amount of cargo space to represent, values are integers
 * @returns None
 */
function AddBoxes(targetSVG, quantity) {
    const columnCount = 16;
    let rows = Math.floor(quantity / columnCount);
    let finalRowCount = quantity % columnCount;

    const boxList = document.getElementById(targetSVG);

    const svgWidth = columnCount * 25;
    const svgHeight = (rows + 1) * 25;

    boxList.setAttribute("width", svgWidth + "px");
    boxList.setAttribute("height", svgHeight + "px");


    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columnCount; x++) {
            boxList.appendChild(createCargoBox(x, y));
        }
    }

    if (finalRowCount == 0) { return; }

    for (let x = 0; x < finalRowCount; x++) {
        boxList.appendChild(createCargoBox(x, rows));
    }
}


//!   ****************************************************************************************************
/**
 * Create a cargo box at the specified coordinates for appending to a cargo grid.
 * @param {Number} x Horizontal position of the cargo box
 * @param {Number} y Vertical position of the cargo box
 * @returns {SVGUseElement} Cargo box to add to the grid
 */
function createCargoBox(x, y) {
    const box = document.createElementNS("http://www.w3.org/2000/svg", "use");
    box.setAttribute("href", "/img/icons.svg#CargoBox");
    box.setAttribute("x", x * 25);
    box.setAttribute("y", y * 25);
    return box;
}


//!   ****************************************************************************************************
/**
 * Fill the specified number of cargo boxes.
 * @param {SVGElement} targetSVG SVG component that contains the visual representation of the ship's cargo grid
 * @param {Number} quantity Amount of cargo space that is filled, values are integers
 */
function FillBoxes(targetSVG, quantity) {
    const boxList = document.getElementById(targetSVG);
    const boxes = boxList.children;

    for (let i = 0; i < boxes.length; i++) {
        removeClass(boxes[i], "fullCargoBox");
    };

    for (let i = 0; i < quantity; i++) {
        addClass(boxes[i], "fullCargoBox");
    }
}



//  TODO  Add archive support to orders.
//  TODO  Add deletion support to orders.
//  TODO  Update ship cargo grid summary when adding and removing work orders.
//  TODO  Add support for creating the custom cargo ship list.
//  TODO  Stylize the list boxes to better match the overall theme.
//  TODO  Create export button for refinery order data. > Export data in CSV files.





//   **********************************************************************************************
//!  Delete the selected work order.
//   TODO  Implementation Required
const DeleteOrder = (event) => {
    const orderID = this.id.split("_")[0];
    const orderHead = document.getElementById(orderID + "_Head");
    const orderBody = document.getElementById(orderID + "_Body");

    orderHead.replaceChildren();
    orderBody.replaceChildren();

    orderHead.remove();
    orderBody.remove();
}


//!   ****************************************************************************************************
/**
 * Retrieves the index of the order that contains the specified GUID.
 * @param {String} ItemGUID GUID attached to the refinery order
 * @returns {Number} Integer index of the requested order in RefineryOrders
 */
function getOrderIndex(ItemGUID) {
    for (let i = 0; i < RefineryOrders.length; i++) {
        if (ItemGUID !== RefineryOrders[i].GUID) { continue; }
        return i;
    }

    return -1;
}


//!   ****************************************************************************************************
/**
 * Retrieves the index of the ship that contains the specified GUID.
 * @param {String} guid GUID attached to the ship
 * @returns {Number} Integer index of the requested ship in SelectedShips
 */
function getShipIndex(guid) {
    for (let i = 0; i < SelectedShips.length; i++) {
        if (guid !== SelectedShips[i].GUID) { continue; }
        return i;
    }

    return -1;
}


//!   ****************************************************************************************************
/**
 * Event for the Move Order button.  Moves the order to/from refinery <> Selected ship.
 * @param {event} event Event object that holds the target ID
 * @returns None
 */
function SendOrder(event) {
    const orderID = event.target.id.split("_")[0];
    const orderGUID = document.getElementById(orderID + "_Main").dataset.guid;


    //  Searches for the order in the cargo ships, if found, moves order to the refinery and quits
    for (let i = 0; i < SelectedShips.length; i++) {
        if (SelectedShips[i].CargoGUIDs.indexOf(orderGUID) > -1) {
            const inShipGUID = SelectedShips[i].GUID;
            const oldShipIndex = i;
            const shipID = document.querySelector(`[data-guid="` + inShipGUID + `"]`).id.split("_")[0];

            RemoveFromShip(orderID, shipID, oldShipIndex);
            return;
        }
    }

    //  If the order was not on a cargo ship, then its in the refinery, move it to the active ship
    AddToShip(orderID, ActiveShipID);
}


//!   ****************************************************************************************************
/**
 * Move the selected order to the active ship.
 * @param {String} orderID ID of the element containing the order to add to a ship
 * @param {String} shipID ID of the element containing the ship to add the order to
 * @param {Boolean} newOrder True = This order is new to the specified ship, False = Ship is being repopulated after page refresh
 */
function AddToShip(orderID, shipID, newOrder = true) {
    const sendButton = document.getElementById(orderID + "_SendButtonLocation");
    sendButton.classList.remove("Hidden");
    sendButton.classList.remove("floatRight");
    sendButton.classList.add("floatLeft");


    const orderMain = document.getElementById(orderID + "_Main");
    const orderGUID = orderMain.dataset.guid;

    const selectedShipGUID = document.getElementById(shipID + "_Main").dataset.guid;
    const shipIndex = getShipIndex(selectedShipGUID);

    if (newOrder) {
        const orderSCU = Math.ceil(RefineryOrders[getOrderIndex(orderGUID)].TotalMineralYield / 100);

        //  Add the order to the ship's manifest
        SelectedShips[shipIndex].CargoGUIDs.push(orderGUID);
        SelectedShips[shipIndex].AmountFilled += orderSCU;
    }


    const activeShipOrderTable = document.getElementById(shipID + "_Orders");
    activeShipOrderTable.append(orderMain);

    UpdateShipAndRefinery(shipID, newOrder);
}


//!   ****************************************************************************************************
/**
 * Move the selected order back to the refinery.
 * @param {String} orderID ID of the element containing the order to remove from the ship
 * @param {String} shipID ID of the element containing the ship to remove the order from
 * @param {Number} oldShipIndex Integer index of the ship the order is being removed from
 */
function RemoveFromShip(orderID, shipID, oldShipIndex) {
    const sendButton = document.getElementById(orderID + "_SendButtonLocation");
    sendButton.classList.remove("floatLeft");
    sendButton.classList.add("floatRight");


    const orderMain = document.getElementById(orderID + "_Main");
    const orderGUID = orderMain.dataset.guid;

    const orderSCU = Math.ceil(RefineryOrders[getOrderIndex(orderGUID)].TotalMineralYield / 100);

    //  Everything passed, add the order to the ship's manifest
    const guidIndex = SelectedShips[oldShipIndex].CargoGUIDs.indexOf(orderGUID);
    SelectedShips[oldShipIndex].CargoGUIDs.splice(guidIndex, 1);
    SelectedShips[oldShipIndex].AmountFilled -= orderSCU;


    const order = document.getElementById(orderID + "_Main");
    const refinery = document.getElementById("WorkOrders");
    refinery.append(order);

    UpdateShipAndRefinery(shipID);
}


//!   ****************************************************************************************************
/**
 * Update the details of the provided ship.
 * @param {String} shipID ID of the element containing the ship to update
 * @param {Boolean} newOrder True = This order is new to the specified ship, False = Ship is being repopulated after page refresh
 */
function UpdateShipAndRefinery(shipID, newOrder = true) {
    const capacityLabel = document.getElementById(shipID + "_CargoGridCapacity");
    const shipGUID = document.getElementById(shipID + "_Main").dataset.guid;
    const shipIndex = getShipIndex(shipGUID);

    const amount = SelectedShips[shipIndex].AmountFilled;
    const capacity = SelectedShips[shipIndex].Capacity;
    const filledPercent = amount / capacity * 100;

    capacityLabel.innerHTML = amount + " / " + capacity + " SCU (" + filledPercent.toFixed(2) + "%)";
    FillBoxes(shipID + "_CargoGridVisual", amount);

    //  Update the move buttons
    ChangeSelectedShip(GenerateShipEventID(shipID));

    //  Save the ship manifest change to localStorage
    if (newOrder) {
        localStorage.setItem("SelectedShips", JSON.stringify(SelectedShips));
    }
}


//!   ****************************************************************************************************
/**
 * Create an ID chain for when simulating changing the active ship.
 * Called whenever orders are added/removed from ships.
 * @param {String} shipID ID of the element containing the ship to update
 * @returns {event} Pseudo event object, because the ID is all that is used
 */
function GenerateShipEventID(shipID) {
    let event = new Array();
    event["target"] = new Array();
    event.target["id"] = shipID;
    return event;
}


//!   ****************************************************************************************************
/**
 * When the active ship changes, the order buttons are updated (visible/hidden).
 * @param {event} event Event object that holds the target ID
 * @returns None
 */
function ChangeSelectedShip(event) {
    const tabBarStatus = document.querySelector('input[type="radio"][name="TabBar"]:checked');
    if (tabBarStatus.id !== "tabCargoShip") { return; }

    const hasEvent = event.target.id !== "None";
    const selectedShipID = hasEvent ? event.target.id.split("_")[0] : "None";
    const selectedShipGUID = hasEvent ? document.getElementById(selectedShipID + "_Main").dataset.guid : "None";
    const shipIndex = hasEvent ? getShipIndex(selectedShipGUID) : -1; //  typeof(CargoShipInvoice) - The ship the order is trying to be loaded onto
    ActiveShipID = hasEvent ? selectedShipID : ActiveShipID;

    const refineryOrders = Array.from(document.querySelectorAll(`[id^="order"]`))
        .filter(item => item.id.includes("_Main"));

    refineryOrders.forEach((item) => {
        if (item.parentElement.id !== "WorkOrders") { return; }

        const sendButton = document.getElementById(item.id.split("_")[0] + "_SendButtonLocation");
        if (!hasEvent) {
            sendButton.classList.add("Hidden");
            return;
        }

        const orderGUID = item.dataset.guid;
        const orderIndex = getOrderIndex(orderGUID); //  typeof(RefineryOrder) - The order (item)
        const orderSCU = Math.ceil(RefineryOrders[orderIndex].TotalMineralYield / 100);
        const remainingSCU = SelectedShips[shipIndex].Capacity - SelectedShips[shipIndex].AmountFilled;

        sendButton.classList.remove("Hidden");
        if (remainingSCU < orderSCU) {
            sendButton.classList.add("Hidden");
        }
    });
}
//?  -*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/
//+  -*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/
//+  -*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/
//?  -*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/-*/-*/-*/-*/-/*-*/-*/-*/-*/-*/





//!   ****************************************************************************************************
/**
 * Check to see if the specified element contains the specified class.
 * @param {HTMLElement} el Element to look up
 * @param {String} className Name of class to search for
 * @returns {Boolean} True = Element contains the specified class, False = Element does not contain the specified class
 */
function hasClass(el, className) {
    if (el === null) { return; }

    if (el.classList) { return el.classList.contains(className); }
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}


//!   ****************************************************************************************************
/**
 * Add a class to the element.
 * @param {HTMLElement} el Element to add the class to
 * @param {String} className Name of the class to add to the element
 * @returns None
 */
function addClass(el, className) {
    if (el === null) { return; }

    if (el.classList) { el.classList.add(className); }
    else if (!hasClass(el, className)) { el.className += " " + className; }
}


//!   ****************************************************************************************************
/**
 * Remove a class from the element.
 * @param {HTMLElement} el Element to remove the class from
 * @param {String} className Name of the class to remove
 * @returns None
 */
function removeClass(el, className) {
    if (el === null) { return; }

    if (el.classList) { el.classList.remove(className); }
    else if (hasClass(el, className)) {
        let reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}


//!   ****************************************************************************************************
//!  Customize Ship List
//   TODO  Create the custom ship list customizer





//!   ****************************************************************************************************
/**
 * Calls calculations to be performed when the refinery or refinement process method are changed.
 */
function RawMaterialCoreChange() {
    SelectedRefinery = document.getElementById("Refineries").value;
    SelectedProcessMethod = document.getElementById("processing_method").value;

    RunAllElementCalculations();
}
