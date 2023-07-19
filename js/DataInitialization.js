var ProcessMethods;     //  Data.json - Mineral process methods the refineries use.
var Minerals;           //  Data.json - Minerals that can be processed by refineries.
var Multipliers;        //  Data.json - Refinery process multipliers.
var Ships;              //  Data.json - Cargo ships.

var CustomShipList;                 //  List of ships the user owns.
var SelectedRefinery;               //  The currently selected refinery.
var RefineryOrders = new Array();   //  Orders in the refinery.
var SelectedShips;                  //  Ships selected for deliveries, may also have refinery orders on board.

var HasCustomShipList = false;  //  True = User has customized the delivery ship list.

//------------------------------------------------------------------------------------------------
//!  Initialize all of the dynamic data elements.
//
document.addEventListener("DOMContentLoaded", () => {
    //  Fetch the support data and populate the lists.
    const requestJsonURL = "/data/Data.json";
    let refineryResponse = fetch(requestJsonURL)
        .then((result) => result.json())
        .then((data) => PopulateRefineryLists(data));

    //  Fetch the ship data and populate the lists.
    const requestShipURL = "/data/Ships.json";
    let shipResponse = fetch(requestShipURL)
        .then((result) => result.json())
        .then((data) => Ships = data)
        .then(() => GetCustomShipList())
        .then(() => PopulateShipList());
});


//------------------------------------------------------------------------------------------------
//!  Populate the refinery lists.
//
const PopulateRefineryLists = (obj) => {
    ProcessMethods = obj.ProcessMethods;
    Minerals = obj.Minerals;
    Multipliers = obj.Multipliers;

    //  Add refineries to the refinery location dropdown.
    const refineryList = document.getElementById("Refineries");
    obj.Refineries.forEach(item => {
        let newOption = document.createElement("option");
        newOption.value = item.Location;
        newOption.text = item.Location + " " + item.Name + ", " + item.System;
        refineryList.add(newOption);
    });

    //  Add refinery process methods to the process method dropdown.
    const processMethodList = document.getElementById("processing_method");
    ProcessMethods.forEach(item => {
        let newOption = document.createElement("option");
        newOption.value = item.Code;
        newOption.text = item.Name;
        processMethodList.add(newOption);
    });

    //  Add minerals to the mineral table.
    const mineralList = document.getElementById("RefineryRawMaterials");
    Minerals.forEach(item => {
        let row = addRow(mineralList);
        addCell(row, item.Name, true).classList.add(item.Tier);

        let newInput = document.createElement("input");
        newInput.type = "number";
        newInput.classList.add("rawSCUInput");
        newInput.id = item.Name + "-raw-scu";
        newInput.name = "NewRefineryOrder";
        newInput.placeholder = "0 Units";
        newInput.min = "0";
        newInput.step = "1";
        newInput.addEventListener("keydown", ValidateInput);
        newInput.addEventListener("input", CalculateInitialStats);
        addCell(row).appendChild(newInput);

        let newCheckLabel = document.createElement("label");
        newCheckLabel.classList.add("switch");

        let newCheck = document.createElement("input");
        newCheck.type = "checkbox";
        newCheck.classList.add("checkbox");
        newCheck.id = item.Name + "-refined";

        let newCheckSpan = document.createElement("span");
        newCheckSpan.classList.add("slider");

        newCheckLabel.appendChild(newCheck);
        newCheckLabel.appendChild(newCheckSpan);
        addCell(row).appendChild(newCheckLabel);

        addCell(row, 0).id = item.Name + "-multiplier";
        addCell(row, 0).id = item.Name + "-refine-cost";
        addCell(row, 0).id = item.Name + "-scu-price";
        addCell(row, 0).id = item.Name + "-scu-yield";
        addCell(row, 0).id = item.Name + "-refine-duration-timer";
        addCell(row, 0).id = item.Name + "-profit";
    });

    //  Summary row
    const row = addRow(mineralList);
    addCell(row, "Invoice Summary", true).id = "RawMaterialSummary";
    const summaryRow = document.getElementById("RawMaterialSummary");
    summaryRow.colSpan = 4;
    row.classList.add("Tier1");

    addCell(row, 0, true).id = "Summary-refine-cost";
    addCell(row, 0, true).id = "Summary-scu-price";
    addCell(row, 0, true).id = "Summary-scu-yield";
    addCell(row, 0, true).id = "Summary-refine-duration-timer";
    addCell(row, 0, true).id = "Summary-profit";


    document.getElementById("Inert-refined").disabled = true;

    //  Get the saved data from LocalStorage.
    if (typeof (Storage) !== "undefined") {
        //  LocalStorage is supported.
        //  const item = localStorage.getItem("keyName");   //  Get item from LocalStorage, return type: string
        //  localStorage.setItem("keyName", "keyValue");    //  Write item to LocalStorage
        //  localStorage.removeItem("keyName");             //  Delete item from LocalStorage
        //  localStorage.clear();                           //  Delete all items from LocalStorage
        //  const item = JSON.stringify(value);             //  Convert value to Json string
        //  const item = JSON.parse(value);                 //  Convert Json string to object

        const selectedRefinery = localStorage.getItem("selectedRefinery");
        if (selectedRefinery !== null) {
            SelectedRefinery = JSON.parse(selectedRefinery);
            document.getElementById("Refineries").value = SelectedRefinery;
        }

        const orders = localStorage.getItem("refineryOrders");
        if (orders !== null) {
            RefineryOrders = JSON.parse(orders);
        }

        const deliveryShips = localStorage.getItem("selectedShips");
        if (deliveryShips !== null) {
            SelectedShips = JSON.parse(deliveryShips);
        }
    }
}

//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------
//!  Populate the ship list.
//
const PopulateShipList = () => {
    const cargoShipList = document.getElementById("cargo_ships");  //  Cargo Ship DropDownList
    cargoShipList.replaceChildren();

    let obj = null;
    if (HasCustomShipList) {
        obj = CustomShipList;
    } else {
        obj = Ships;
    }

    obj.forEach(item => {
        var newOption = document.createElement("option");
        newOption.value = item.ShipCode;
        newOption.text = item.MFDCode + " " + item.Name;
        cargoShipList.add(newOption);
    });
}


//------------------------------------------------------------------------------------------------
//!  Get the list of ships the user owns.
//
const GetCustomShipList = () => {
    const customShips = localStorage.getItem("customShipsList");
    if (customShips !== null) {
        CustomShipList = JSON.parse(customShips);
        HasCustomShipList = true;
        PopulateShipList(CustomShipList);
    }
}


//------------------------------------------------------------------------------------------------
//!  Fallback GUID Generator.
//
const uuidv4 = () => {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}






//  ****************************************************************************************************
//  *********************************************  Classes  ********************************************
//  ****************************************************************************************************
class RefineryOrder {
    constructor(location, method, minerals) {
        this.GUID = crypto.randomUUID();
        this.Location = location;
        this.Method = method;
        this.Minerals = minerals;
    }
}

class Mineral {
    constructor(name, mineralYield) {
        this.Name = name;
        this.MineralYield = mineralYield;
    }
}

class Refinery {
    constructor(name, location, system) {
        this.Name = name;
        this.Location = location;
        this.System = system;
    }
}

class ProcessingMethod {
    constructor(name, code, speed, cost, mineralYield) {
        this.Name = name;
        this.Code = code;
        this.Speed = speed;
        this.Cost = cost;
        this.MineralYield = mineralYield;
    }
}

class Ship {
    constructor(mfdcode, manufacturer, shipcode, name, capacity) {
        this.MFDCode = mfdcode;
        this.Manufacturer = manufacturer;
        this.ShipCode = shipcode;
        this.Name = name;
        this.Capacity = capacity;
    }
}
