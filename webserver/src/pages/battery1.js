// All the containers we need to update the battery information
const chargingIcon = document.querySelector(".charging_icon");
const batteryLevel = document.querySelector(".battery_level");
const chargingBar = document.querySelector(".charging_bar");
const dischargingTime = document.querySelector(".discharging_time");
const otherInfo = document.querySelector(".other_info");

const bat_level = 0.01;
const bat_isCharging = false;
const bat_dischargingTime = 600;

// Getting battery it returns a propmise
navigator.getBattery().then((battery) => {
    /* Update all the battery information which is a combination of multiple functions */
    function updateAllBatteryInfo() {
        updateChargeInfo();
        updateLevelInfo();
        updateDischargingInfo();
    }

    //   Running as the promise returns battery
    updateAllBatteryInfo();

    //   Updating the battery Level container and the charging bar width
    function updateLevelInfo() {
        batteryLevel.textContent = `${parseInt(bat_level * 100)}%`;
        chargingBar.style.width = `${parseInt(bat_level * 100)}%`;
    }

    function updateChargeInfo() {
      /* if chargin
          - changing the Animation Iteration Count to infinite
          - showing the charging Icon
          - Hiding the other information
      else 
          - changing the Animation Iteration Count to initial
          - hiding the charging Icon
          - showing the other information */

        bat_isCharging
            ? ((chargingBar.style.animationIterationCount = "infinite"),
                (chargingIcon.style.display = "inline-flex"),
                (otherInfo.style.display = "none"))
            : ((chargingIcon.style.display = "none"),
                (otherInfo.style.display = "inline-flex"),
                (chargingBar.style.animationIterationCount = "initial"));
    }

    //   updating the Discharging Information
    function updateDischargingInfo() {
        const dischargeTime = parseInt(bat_dischargingTime / 60) ? true : false;
        dischargeTime
            ? ((dischargingTime.textContent = `${parseInt(
                battery.dischargingTime / 60
            )} minutes`),
                (otherInfo.style.display = "flex"))
            : (otherInfo.style.display = "none");
    }
});
