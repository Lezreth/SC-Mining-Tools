//   **********************************************************************************************
//!  Runs element calculations on all of the elements in the refinery table.
function RunAllElementCalculations() {
    const speedElement = document.getElementById("processSpeed");
    const costElement = document.getElementById("processCost");
    const yieldElement = document.getElementById("processYield");

    speedElement.innerHTML = ProcessMethods[SelectedProcessMethod].Speed;
    costElement.innerHTML = ProcessMethods[SelectedProcessMethod].Cost;
    yieldElement.innerHTML = ProcessMethods[SelectedProcessMethod].Yield;


    const mineralList = document.getElementById("RefineryRawMaterials");
    const inputs = mineralList.querySelectorAll("input[type=number]");

    for (const input of inputs) {
        const material = input.id.split("-")[0];
        const rawSCU = input.value;
        let bonus = Minerals[material].Bonus[SelectedRefinery];

        document.getElementById(material + "-multiplier").innerHTML = (bonus ? bonus : 0) + "%";
        document.getElementById(material + "-scu-price").innerHTML = Minerals[material].Price.toLocaleString();

        if (!(input.value > 0)) { continue; }

        CalculateInitialStats(material, rawSCU);
    }
}

//   **********************************************************************************************
//!  Runs element calculations on the currently selected element.
function RunOneElementCalculations() {
    const material = this.id.split("-")[0];
    const rawSCU = this.value;

    CalculateInitialStats(material, rawSCU);
}


//   **********************************************************************************************
//!  Calculates additional data that relies on raw SCU.
function CalculateInitialStats(material, rawSCU) {
    //  Refinery bonus for the selected material
    const bonus = Minerals[material].Bonus[SelectedRefinery];


    //  Find the multipliers
    const mineralPricePerSCU = Minerals[material].Price;
    const refineryCostMultiplier = Multipliers.Cost[ProcessMethods[SelectedProcessMethod].Cost];
    const refinerySpeedMultiplier = Multipliers.Speed[ProcessMethods[SelectedProcessMethod].Speed];
    const refineryYieldMultiplier = Multipliers.Yield[ProcessMethods[SelectedProcessMethod].Yield];


    //  TODO  Confirm Refinery Values
    //!     Refinery Values Confirmed
    //?             Speed   Cost    Yield
    //? Very Low    Y       N/A     N/A
    //? Low         N       Y       Y
    //? Moderate    N       N       Y
    //? High        N       N       Y


    //  Calculate the stats for the mineral
    let RefineCost = Math.round(rawSCU * refineryCostMultiplier);
    let MineralYield = Math.round(rawSCU * ((bonus ? bonus : 0) + 1) * refineryYieldMultiplier);
    let Duration = Math.round(rawSCU * refinerySpeedMultiplier);
    let Profit = Math.round(MineralYield / 100 * mineralPricePerSCU);


    //  Store the stats
    RefineryMinerals[material].RefineCost = RefineCost;
    RefineryMinerals[material].MineralYield = MineralYield;
    RefineryMinerals[material].Duration = Duration;
    RefineryMinerals[material].Profit = Profit;


    //  Display the stats for the mineral
    document.getElementById(material + "-refine-cost").innerHTML = RefineCost.toLocaleString();
    document.getElementById(material + "-scu-yield").innerHTML = MineralYield.toLocaleString();
    document.getElementById(material + "-refine-duration-timer").innerHTML = ConvertSecondsToTime(RefineryMinerals[material].Duration);
    document.getElementById(material + "-profit").innerHTML = Profit.toLocaleString();


    //  Calculate the totals for each stat
    RefineryInvoice = new RefinerySummary();
    for (let key of Object.keys(RefineryMinerals)) {
        RefineryInvoice.TotalRefineCost += RefineryMinerals[key].RefineCost;
        RefineryInvoice.TotalMineralYield += RefineryMinerals[key].MineralYield;
        RefineryInvoice.TotalDuration += RefineryMinerals[key].Duration;
        RefineryInvoice.TotalProfit += RefineryMinerals[key].Profit;
    }


    //  Display the stat totals
    document.getElementById("Summary-refine-cost").innerHTML = RefineryInvoice.TotalRefineCost;
    document.getElementById("Summary-scu-yield").innerHTML = RefineryInvoice.TotalMineralYield;
    document.getElementById("Summary-refine-duration-timer").innerHTML = ConvertSecondsToTime(RefineryInvoice.TotalDuration);
    document.getElementById("Summary-profit").innerHTML = RefineryInvoice.TotalProfit;
}


//   **********************************************************************************************
//!  Converts the time display format to seconds.
const ConvertTimeToSeconds = (timeString) => {
    const parts = timeString.split(',');
    let seconds = 0;
    parts.forEach(item => {
        if (item.includes("h")) { seconds += parseInt(item, 10) * 3600; }
        else if (item.includes("m")) { seconds += parseInt(item, 10) * 60; }
        else if (item.includes("s")) { seconds += parseInt(item, 10); }
    });

    return seconds;
}

//   **********************************************************************************************
//!  Converts seconds to time display format.
const ConvertSecondsToTime = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;

    if (hours > 0) { hours += "h"; } else { hours = ""; }
    if (minutes > 0) { minutes += "m"; } else { minutes = ""; }
    if (seconds > 0) { seconds += "s" } else { seconds = ""; }
    return Array(hours, minutes, seconds).filter(Boolean).join(", ");
}
