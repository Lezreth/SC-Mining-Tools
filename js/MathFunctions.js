
//------------------------------------------------------------------------------------------------
//!  Calculates additional data that relies on raw SCU.
//
const CalculateInitialStats = () => {
    const material = this.id.split("-")[0];
    const rawSCU = this.value;

    document.getElementById(material + "-scu-yield").innerHTML = Math.round(rawSCU * 0.95);


    // let totalRefineCost = CalculateRawMaterialSummary("-refine-cost");
    // let totalSCUPrice = CalculateRawMaterialSummary("-scu-price");
    let totalSCUYield = CalculateRawMaterialSummary("-scu-yield");
    // let totalDuration = CalculateRawTimeSummary();
    // let totalProfit = CalculateRawMaterialSummary("-profit");

    // document.getElementById("Summary-refine-cost").innerHTML = totalRefineCost;
    // document.getElementById("Summary-scu-price").innerHTML = totalSCUPrice;
    document.getElementById("Summary-scu-yield").innerHTML = totalSCUYield;
    // document.getElementById("Summary-refine-duration-timer").innerHTML = totalDuration;
    // document.getElementById("Summary-profit").innerHTML = totalProfit;
}

//------------------------------------------------------------------------------------------------
//!  Calculates the total amount of minerals the refinery will produce of each type.
//
const CalculateTotalYield = (Minerals) => {
    let totalYield = 0;
    Minerals.forEach(item => { totalYield += item.MineralYield; });
    return totalYield;
}



//------------------------------------------------------------------------------------------------
//!  Sums up the values in the supplied column.
//
const CalculateRawMaterialSummary = (ItemID) => {
    let total = 0;
    document.querySelectorAll("[id$=" + ItemID + "]").forEach(item => {
        total += parseInt(item.innerHTML, 10); console.log(item.innerHTML);
    });

    return total;
}

//------------------------------------------------------------------------------------------------
//!  Sums up the time values in the duration column.
//
const CalculateRawTimeSummary = () => {
    let total = 0;
    document.querySelectorAll(`[id$="-refine-duration-timer"]`).forEach(item => {
        let seconds = ConvertTimeToSeconds(item.innerHTML);
        total += seconds;
    });

    return ConvertSecondsToTime(total);
}

//------------------------------------------------------------------------------------------------
//!  Converts the time display format to seconds.
//
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

//------------------------------------------------------------------------------------------------
//!  Converts seconds to time display format.
//
const ConvertSecondsToTime = (seconds) => {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;

    if (hours > 0) { hours += "h"; } else { hours = ""; }
    if (minutes > 0) { minutes += "m"; } else { minutes = ""; }
    if (seconds > 0) { seconds += "s" } else { seconds = ""; }
    return Array(hours, minutes, seconds).filter(Boolean).join(", ");
}
