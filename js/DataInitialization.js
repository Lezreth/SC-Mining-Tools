var Refineries = new Array();;      //  Data.json - Places where minerals can be refined.
var ProcessMethods = new Array();;  //  Data.json - Mineral process methods the refineries use.
var Minerals = new Array();;        //  Data.json - Minerals that can be processed by refineries.
var Multipliers = new Array();;     //  Data.json - Refinery process multipliers.
var Ships = new Array();;           //  Data.json - Cargo ships.

var RefineryOrders = new Array();   //  Orders in the refinery.
var RefineryMinerals = new Array(); //  Current state of all of the stats of the raw minerals before a work order is submitted.
var OrderMinerals = new Array();    //  List of all minerals in all orders
var RefineryInvoice;                //  Sum of all refinery mineral stats.

var SelectedRefinery;               //  The currently selected refinery.
var SelectedProcessMethod;          //  The currently selected refinement process.
var SelectedShips = new Array();    //  Ships selected for deliveries, may also have refinery orders on board.
var CustomShipList;                 //  List of ships the user owns.
var ActiveShipID = "None";                   //  ID of the active ship where orders will be sent to.
var HasCustomShipList = false;      //  True = User has customized the delivery ship list.
var ActiveTab = "tabRefinery";      //  The currently active application tab.
var OrderNumber = 0;                //  Used for creating unique html tag IDs for each refinery order.
var CargoShipNumber = 0;            //  Used for creating unique html tag IDs for each cargo ship.

//   **********************************************************************************************
//!  Initialize all of the dynamic data elements.
document.addEventListener("DOMContentLoaded", () => {
    GetJsonData();
});


//   **********************************************************************************************
//!  Get the supporting data and run the population functions.
function GetJsonData() {
    const requestJsonURL = "/data/Data.json";
    const requestShipURL = "/data/Ships.json";

    //  Request files in parallel and return a Promise for both of them.
    //  Promise.all - Returns a new Promise that resolves when all of its arguments resolve.
    Promise.all([GetRemoteData(requestJsonURL), GetRemoteData(requestShipURL)])
        .then(([generalData, shipData]) => {
            //  Both datasets are loaded
            PopulateRefineryLists(generalData);

            Ships = shipData;
            PopulateShipList();
        });
}

//   **********************************************************************************************
//!  Get data from the supplied URL.
async function GetRemoteData(url) {
    const response = await fetch(url);
    return await response.json();
}


//   **********************************************************************************************
//!  Populate the refinery lists.
function PopulateRefineryLists(data) {
    Refineries = data.Refineries;
    ProcessMethods = data.ProcessMethods;
    Minerals = data.Minerals;
    Multipliers = data.Multipliers;


    //  Add refineries to the refinery location dropdown.
    const refineryList = document.getElementById("Refineries");
    for (const key in Refineries) {
        let newOption = document.createElement("option");
        newOption.value = key;
        newOption.text = key + " " + Refineries[key].Name + ", " + Refineries[key].System;
        refineryList.add(newOption);
    }


    //  Add refinery process methods to the process method dropdown.
    const processMethodList = document.getElementById("processing_method");
    for (const key in ProcessMethods) {
        let newOption = document.createElement("option");
        newOption.value = key;
        newOption.text = ProcessMethods[key].Name;
        processMethodList.add(newOption);
    }


    //  Add minerals to the mineral table.
    const mineralList = document.getElementById("RefineryRawMaterials");
    for (const key in Minerals) {
        let row = addRow(mineralList);
        addCell(row, key, true).classList.add(Minerals[key].Tier);

        let newInput = document.createElement("input");
        newInput.type = "number";
        newInput.classList.add("rawSCUInput");
        newInput.id = key + "-raw-scu";
        newInput.name = "NewRefineryOrder";
        newInput.placeholder = "0 Units";
        newInput.min = "0";
        newInput.step = "1";
        newInput.addEventListener("keydown", ValidateInput);
        newInput.addEventListener("input", RunOneElementCalculations);
        addCell(row).appendChild(newInput);

        let newCheckLabel = document.createElement("label");
        newCheckLabel.classList.add("switch");

        let newCheck = document.createElement("input");
        newCheck.type = "checkbox";
        newCheck.classList.add("checkbox");
        newCheck.id = key + "-refined";

        let newCheckSpan = document.createElement("span");
        newCheckSpan.classList.add("slider");

        newCheckLabel.appendChild(newCheck);
        newCheckLabel.appendChild(newCheckSpan);
        addCell(row).appendChild(newCheckLabel);

        addCell(row, 0).id = key + "-multiplier";
        addCell(row, 0).id = key + "-refine-cost";
        addCell(row, 0).id = key + "-scu-price";
        addCell(row, 0).id = key + "-scu-yield";
        addCell(row, 0).id = key + "-refine-duration-timer";
        addCell(row, 0).id = key + "-profit";
    }

    //  Summary row
    const row = addRow(mineralList);
    addCell(row, "Invoice Summary", true).id = "RawMaterialSummary";
    const summaryRow = document.getElementById("RawMaterialSummary");
    summaryRow.colSpan = 4;
    row.classList.add("Tier1");

    addCell(row, 0, true).id = "Summary-refine-cost";
    addCell(row, "-", true).id = "Summary-scu-price";
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
        //  Initial refinery and process method selection.
        SelectedRefinery = document.getElementById("Refineries").value;
        SelectedProcessMethod = document.getElementById("processing_method").value;

        const previouslySelectedRefinery = localStorage.getItem("SelectedRefinery");
        if (previouslySelectedRefinery !== null) {
            SelectedRefinery = JSON.parse(previouslySelectedRefinery);
            document.getElementById("Refineries").value = SelectedRefinery;
        }

        const selectedProcess = localStorage.getItem("SelectedProcess");
        if (selectedProcess !== null) {
            SelectedProcessMethod = JSON.parse(selectedProcess);
            document.getElementById("processing_method").value = SelectedProcessMethod;
        }

        const minerals = localStorage.getItem("OrderMinerals");
        if (minerals !== null) {
            OrderMinerals = JSON.parse(minerals);
        }

        const orders = localStorage.getItem("RefineryOrders");
        if (orders !== null) {
            RefineryOrders = JSON.parse(orders);
            ResubmitSavedOrders();
        }

        const deliveryShips = localStorage.getItem("SelectedShips");
        if (deliveryShips !== null) {
            SelectedShips = JSON.parse(deliveryShips);
        }
    }

    ClearInputs();
    RunAllElementCalculations();
}

//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//!------------------------------------------------------------------------------------------------
//   **********************************************************************************************
//!  Populate the ship list.
function PopulateShipList() {
    //  Get the list of ships the user owns.
    const customShips = localStorage.getItem("CustomShipsList");
    if (customShips !== null) {
        CustomShipList = JSON.parse(customShips);
        HasCustomShipList = true;
    }

    const cargoShipList = document.getElementById("cargo_ships"); //  Cargo Ship DropDownList
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
        newOption.text = item.MFDCode + " " + item.Name + " | " + item.Capacity + " SCU";
        cargoShipList.add(newOption);
    });
}



//  ****************************************************************************************************
//  *********************************************  Classes  ********************************************
//  ****************************************************************************************************
class RefineryOrder {
    constructor(guid = null) {
        this.GUID = guid === null ? crypto.randomUUID() : guid;
        this.Refinery = null;
        this.Method = null;
        this.TotalYield = 0;
        this.CreatedDate = 0;
        this.ProcessingTime = 0;
        this.TotalProfit = 0;
    }
}

class Mineral {
    constructor(name) {
        this.GUID = null;
        this.Name = name;
        this.RefineCost = 0;
        this.SCUPrice = 0;
        this.MineralYield = 0;
        this.Duration = 0;
        this.Profit = 0;
    }
}

class RefinerySummary {
    constructor() {
        this.TotalRefineCost = 0;
        this.TotalPricePerSCU = 0;
        this.TotalMineralYield = 0;
        this.TotalDuration = 0;
        this.TotalProfit = 0;
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
    constructor(mfdCode, manufacturer, shipCode, name, capacity) {
        this.MFDCode = mfdCode;
        this.Manufacturer = manufacturer;
        this.ShipCode = shipCode;
        this.Name = name;
        this.Capacity = capacity;
    }
}

class CargoShipInvoice {
    constructor(guid = null) {
        this.GUID = guid === null ? crypto.randomUUID() : guid;
        this.ShipName = null;   //  Name of the ship
        this.Capacity = 0;      //  Maximum amount of cargo the ship can hold
        this.AmountFilled = 0;  //  Amount of cargo on the ship
        this.CargoGUIDs = null;      //  List of GUIDs that belong to the work orders on the ship
    }
}




/*
var Refineries = new Array();;         //  Data.json - Places where minerals can be refined.
var ProcessMethods = new Array();;     //  Data.json - Mineral process methods the refineries use.
var Minerals = new Array();;           //  Data.json - Minerals that can be processed by refineries.
var Multipliers = new Array();;        //  Data.json - Refinery process multipliers.
var Ships = new Array();;              //  Data.json - Cargo ships.
*/