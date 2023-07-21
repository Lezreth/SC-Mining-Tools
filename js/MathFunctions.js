//   **********************************************************************************************
//!  Calculates additional data that relies on raw SCU.
function CalculateInitialStats() {
    const material = this.id.split("-")[0];
    const rawSCU = this.value;


    //  TODO  Replace hard coded numbers
    RefineryMinerals[material].RefineCost = Math.round(rawSCU * 0.25);
    RefineryMinerals[material].SCUPrice = Math.round(rawSCU * 27);
    RefineryMinerals[material].MineralYield = Math.round(rawSCU * 0.95);
    RefineryMinerals[material].Duration = Math.round(rawSCU * 50);
    RefineryMinerals[material].Profit = Math.round(RefineryMinerals[material].SCUPrice * RefineryMinerals[material].MineralYield);


    document.getElementById(material + "-refine-cost").innerHTML = RefineryMinerals[material].RefineCost;
    document.getElementById(material + "-scu-price").innerHTML = RefineryMinerals[material].SCUPrice;
    document.getElementById(material + "-scu-yield").innerHTML = RefineryMinerals[material].MineralYield;
    document.getElementById(material + "-refine-duration-timer").innerHTML = RefineryMinerals[material].Duration;
    document.getElementById(material + "-profit").innerHTML = RefineryMinerals[material].Profit;


    RefineryInvoice = new RefinerySummary();
    for (let key of Object.keys(RefineryMinerals)) {
        RefineryInvoice.TotalRefineCost += RefineryMinerals[key].RefineCost;
        RefineryInvoice.TotalPricePerSCU += RefineryMinerals[key].SCUPrice;
        RefineryInvoice.TotalMineralYield += RefineryMinerals[key].MineralYield;
        RefineryInvoice.TotalDuration += RefineryMinerals[key].Duration;
        RefineryInvoice.TotalProfit += RefineryMinerals[key].Profit;
    }


    document.getElementById("Summary-refine-cost").innerHTML = RefineryInvoice.TotalRefineCost;
    document.getElementById("Summary-scu-price").innerHTML = RefineryInvoice.TotalPricePerSCU;
    document.getElementById("Summary-scu-yield").innerHTML = RefineryInvoice.TotalMineralYield;
    document.getElementById("Summary-refine-duration-timer").innerHTML = RefineryInvoice.TotalDuration;
    document.getElementById("Summary-profit").innerHTML = RefineryInvoice.TotalProfit;
}



//   **********************************************************************************************
//!  Sums up the time values in the duration column.
const CalculateRawTimeSummary = () => {
    let total = 0;
    document.querySelectorAll(`[id$="-refine-duration-timer"]`).forEach(item => {
        let seconds = ConvertTimeToSeconds(item.innerHTML);
        total += seconds;
    });

    return ConvertSecondsToTime(total);
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
