//------------------------------------------------------------------------------------------------
//!  Validates the raw mineral input fields, allowing only positive numbers,
//!  and calls for calculations to be processed.
//
const ValidateInput = (e) => {
    //  Positive numeric only enforcement.
    if ((e.key == '-' || e.key == '+' || e.key == '.' || e.key == 'e' || e.key == 'E')) {
        e.preventDefault();
        return false;
    }

    //  Prevents toggling the refine switch for inert material.
    let material = this.id.split("-")[0];
    if (material.includes("Inert")) { return; }

    //  Toggles the refine switch to ON.
    if (e.key >= '0' && e.key <= '9') {
        document.getElementById(material + "-refined").checked = true;
    }
}


const ValidateRawMinerals = () => {
    const mineralList = new Array();
    Array.from(document.querySelectorAll(`[id$="-refined"]`))
        .filter(item => (item.checked === true))
        .forEach(item => {
            let mID = item.id.split("-")[0];
            let mYield = Number(document.getElementById(mID + "-scu-yield").innerHTML);
            mineralList.push(new Mineral(mID, mYield));
        });

    //  Validate the minerals, ensure there is something to refine.
    if (mineralList.length == 0) { console.log("No Minerals Selected"); return false; }

    let mineralsValid = true;
    mineralList.forEach(item => {
        if (document.getElementById(item.Name + "-raw-scu").value == 0) {
            mineralsValid = false;
        }
    });
    if (!mineralsValid) { console.log("Selected minerals are zero"); return false; }

    return true;
}