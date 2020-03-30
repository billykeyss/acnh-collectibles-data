"use strict";
window.value = {};

let dataSizeText = $(".data-size");

getFileObject(FILENAME, FILEPATH, function (fileObject) {
    Papa.parse(fileObject, {
        complete: function (results) {
            let data = parseCSVData(results);
            window.value.data = data;
            window.value.currentSort = DESC_PRICE;
            changeHemisphere(NORTHERN);
            applyFilter("All");
        }
    });
});

$(".dd-button").click(function () {
    applyDateFilter($(".month-text").text());
});

window.onclick = function(event) {
    if (!event.target.matches('.dd-input')) {
        $(".dd-input").prop("checked", false);
    }
};

addMonthPickerFunctionality();
addRadioGroupFunctionality(".btn-group-catch");
addRadioGroupFunctionality(".btn-group-hemisphere");
addRadioGroupFunctionality(".btn-group-type");
addRadioGroupFunctionality(".btn-group-sort");

/**
 * Adds month picker functionality
 */
function addMonthPickerFunctionality() {
    const d = new Date();
    $(".month-text").text(MONTH_NAMES[d.getMonth()]);

    document.getElementById("list").addEventListener("click", function (e) {
        $(".month-text").text(e.target.innerHTML);
        applyDateFilter(e.target.innerHTML);
    });
}

/**
 * Adds radio group functionality for specified button group
 * @param buttonGroupClassName of the radio button group
 */
function addRadioGroupFunctionality(buttonGroupClassName) {
    let buttonGroup = $(buttonGroupClassName).children();
    for (let i = 0; i < buttonGroup.length; i++) {
        buttonGroup[i].addEventListener("click", function () {
            let current = $(buttonGroupClassName + " .btn--stripe-active")[0];
            current.classList.remove("btn--stripe-active");
            this.className += " btn--stripe-active";
        });
    }
}

/**
 * Change hemisphere data format
 * @param hemisphere to be changed to;
 */
function changeHemisphere(hemisphere) {
    if (window.value.hemisphere === hemisphere) {
        // Already displaying this hemisphere data
        return;
    }
    window.value.hemisphere = hemisphere;
    if (isNorthernHemisphere()) {
        $("body").css('background-color', NORTHERN_HEMISPHERE_BACKGROUND_COLOR);
    } else if (isSouthernHemisphere()) {
        $("body").css('background-color', SOUTHERN_HEMISPHERE_BACKGROUND_COLOR);
    }
    populateDataSource(window.value.data);
}

/**
 * Sorts the table based on specified sort type
 * @param sort type, can be:
 * ASC_NAME, ASC_PRICE, DESC_NAME, DESC_PRICE
 */
function sortTable(type) {
    let data = window.value.data;
    data = sortData(data, type);
    populateDataSource(data);
}

function applyDateFilter(month) {
    if (!month) return;

    let shouldInclude = false;
    if (month === "AllMonths") {
        shouldInclude = true;
    }

    window.value.currentMonth = month;
    let monthIndex = MONTH_NAMES.indexOf(month) + 1;
    let tempData = JSON.parse(JSON.stringify(window.value.data));
    tempData = _.filter(tempData, function (o) {
        if (isNorthernHemisphere()) {
            if (o.northStartMonth1 === -1) return true;
            if (o.northStartMonth1 <= monthIndex && o.northEndMonth1 >= monthIndex) return true;
            if (o.northStartMonth2 <= monthIndex && o.northEndMonth2 >= monthIndex) return true;
            if (o.northStartMonth1 >= monthIndex && o.northEndMonth1 >= monthIndex && o.northEndMonth1 <= o.northStartMonth1) return true;
            if (o.northStartMonth2 >= monthIndex && o.northEndMonth2 >= monthIndex && o.northEndMonth2 <= o.northStartMonth2) return true;
        } else if (isSouthernHemisphere()) {
            if (o.southStartMonth1 === -1) return true;
            if (o.southStartMonth1 <= monthIndex && o.southEndMonth1 >= monthIndex) return true;
            if (o.southStartMonth2 <= monthIndex && o.southEndMonth2 >= monthIndex) return true;
            if (o.southStartMonth1 >= monthIndex && o.southEndMonth1 >= monthIndex && o.southEndMonth1 <= o.southStartMonth1) return true;
            if (o.southStartMonth2 >= monthIndex && o.southEndMonth2 >= monthIndex && o.southEndMonth2 <= o.southStartMonth2) return true;
        }
        return shouldInclude;
    });

    tempData = sortData(tempData, window.value.currentSort);
    populateDataSource(tempData);

    if (window.value.currentFilter) {
        applyFilter(window.value.currentFilter)
    } else {
        dataSizeText.text("Currently Displaying: " + tempData.length + " items.");
    }
}

function sortData(data, sortType) {
    let sortedData = {};
    switch (sortType) {
        case ASC_PRICE:
            sortedData = _.sortBy(data, "price");
            break;
        case DESC_PRICE:
            sortedData = _.sortBy(data, "price").reverse();
            break;
        case ASC_NAME:
            sortedData = _.sortBy(data, "name");
            break;
        case DESC_NAME:
            sortedData = _.sortBy(data, "name").reverse();
            break;
        default:
    }
    return sortedData;
}

function populateDataSource(data, type = "All") {
    let table = $(".custom-table");
    let headerData = window.value.headerData;
    table.empty();
    table.append("<div class=\"row header\">" +
        "<div class=\"cell\">" + headerData.image + "</div>" +
        "<div class=\"cell\">" + headerData.name + "</div>" +
        "<div class=\"cell\">" + (window.value.hemisphere === NORTHERN ? headerData.northernDate : headerData.southernDate) + "</div>" +
        "<div class=\"cell\">" + headerData.time + "</div>" +
        "<div class=\"cell\">" + headerData.price + "</div>" +
        "<div class=\"cell\">" + headerData.type + "</div>" +
        "<div class=\"cell\">" + headerData.size + "</div>" +
        "<div class=\"cell\">" + headerData.location + "</div></div>");


    for (let i = 0; i < data.length; i++) {
        let shouldAppend = type === "All" || type === data[i].type;

        if (shouldAppend) {
            table.append(
                "<div class=\"row\">" +
                "<div class=\"cell\"><img src=" + data[i].image + "></div>" +
                "<div class=\"cell\">" + data[i].name + "</div>" +
                "<div class=\"cell\">" + (window.value.hemisphere === NORTHERN ? data[i].northernDate : data[i].southernDate) + "</div>" +
                "<div class=\"cell\">" + data[i].time + "</div>" +
                "<div class=\"cell\">" + data[i].price + "</div>" +
                "<div class=\"cell\">" + data[i].type + "</div>" +
                "<div class=\"cell\">" + data[i].size + "</div>" +
                "<div class=\"cell\">" + data[i].location + "</div></div>");
        }
    }
}

function applyFilter(str) {
    // Declare variables
    let filter, table, tr, td, i, txtValue;
    if (!str) {
        str = $(".form-control").val();
    }

    if (str === "All") {
        window.value.currentFilter = "";
    } else {
        window.value.currentFilter = str;
    }

    filter = str.toUpperCase();
    table = $(".custom-table");
    tr = table.children();

    let count = 0;
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
        td = tr[i];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue.toUpperCase().indexOf(window.value.currentFilter) > -1 || str === "All") {
                tr[i].style.display = "";
                count += 1;
            } else {
                tr[i].style.display = "none";
            }
        }
    }

    window.value.currentDataSize = count;
    dataSizeText.text("Currently Displaying: " + window.value.currentDataSize + " items.");
}

/**
 * Check if user is currently selected to northern hemisphere
 * @returns {boolean} true if northern hemisphere is selected
 */
function isNorthernHemisphere() {
    return window.value.hemisphere === NORTHERN;
}

/**
 * Check if user is currently selected to southern hemisphere
 * @returns {boolean} true if southern hemisphere is selected
 */
function isSouthernHemisphere() {
    return window.value.hemisphere === SOUTHERN;
}