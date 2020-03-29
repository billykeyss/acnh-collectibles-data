(function ($) {
    "use strict";
    // window.setInterval(function(){
    //     $(".current-time").text(this.formatDate(new Date(), true));
    // }, 500);
    window.value = {};

    getFileObject('data.csv', '/data/data.csv', function (fileObject) {
        Papa.parse(fileObject, {
            complete: function (results) {
                let data = parseCSVData(results);
                window.value.data = data;
                window.value.hemisphere = "northern";
                changeHemisphere(window.value.hemisphere);
            }
        });
    });
    let hemisphereButtons = $(".btn-group-hemisphere").children();
    for (let i = 0; i < hemisphereButtons.length; i++) {
        hemisphereButtons[i].addEventListener("click", function () {
            let current = $(".btn-group-hemisphere .btn--stripe-active")[0];
            current.classList.remove("btn--stripe-active");
            this.className += " btn--stripe-active";
        });
    }

    let typeButtons = $(".btn-group-type").children();
    for (let i = 0; i < typeButtons.length; i++) {
        typeButtons[i].addEventListener("click", function () {
            let current = $(".btn-group-type .btn--stripe-active")[0];
            current.classList.remove("btn--stripe-active");
            this.className += " btn--stripe-active";
        });
    }

    let sortButtons = $(".btn-group-sort").children();
    for (let i = 0; i < sortButtons.length; i++) {
        sortButtons[i].addEventListener("click", function () {
            let current = $(".btn-group-sort .btn--stripe-active")[0];
            current.classList.remove("btn--stripe-active");
            this.className += " btn--stripe-active";
        });
    }

})(jQuery);

function changeHemisphere(hemisphere) {
    if (hemisphere === "northern") {
        $("body").css('background-color', "#c5fadc");
    } else {
        $("body").css('background-color', "#c4d3f6");
    }
    window.value.hemisphere = hemisphere;
    populateDataSource(window.value.data);
}

function parseCSVData(results) {
    let data = [];

    window.value.headerData = {
        name: results.data[0][0],
        northernDate: results.data[0][2],
        southernDate: results.data[0][1],
        time: results.data[0][4],
        price: results.data[0][5],
        type: results.data[0][6],
        size: results.data[0][13],
        image: results.data[0][14],
        location: results.data[0][3]
    };

    for (let index = 1; index < results.data.length; index++) {
        data.push({
            name: results.data[index][0],
            northernDate: results.data[index][2],
            southernDate: results.data[index][1],
            time: results.data[index][4],
            price: parseInt(results.data[index][5]),
            type: results.data[index][6],
            size: results.data[index][13],
            image: results.data[index][14],
            location: results.data[index][3]
        })
    }

    return data;
}

function sortTableByPrice(type) {
    let data = window.value.data;
    switch (type) {
        case "ascPrice":
            data = _.sortBy(data, "price");
            break;
        case "descPrice":
            data = _.sortBy(data, "price").reverse();
            break;
        case "ascName":
            data = _.sortBy(data, "name");
            break;
        case "descName":
            data = _.sortBy(data, "name").reverse();
            break;
        default:
    }
    populateDataSource(data);
}

function getSortFunction() {
    return function (item1, item2) {
        return parseInt(item1.price) > parseInt(item2.price);
    }
}

function populateDataSource(data, type = "All") {
    let table = $(".custom-table");
    let headerData = window.value.headerData;
    table.empty();
    table.append("<div class=\"row header\">" +
        "<div class=\"cell\">" + headerData.image + "</div>" +
        "<div class=\"cell\">" + headerData.name + "</div>" +
        "<div class=\"cell\">" + (window.value.hemisphere === "northern" ? headerData.northernDate : headerData.southernDate) + "</div>" +
        "<div class=\"cell\">" + headerData.time + "</div>" +
        "<div class=\"cell\">" + headerData.price + "</div>" +
        "<div class=\"cell\">" + headerData.type + "</div>" +
        "<div class=\"cell\">" + headerData.size + "</div>" +
        "<div class=\"cell\">" + headerData.location + "</div></div>");


    for (let i = 0; i < data.length; i++) {
        let shouldApend = type === "All" || type === data[i].type;

        if (shouldApend) {
            table.append(
                "<div class=\"row\">" +
                "<div class=\"cell\"><img src=" + data[i].image + "></div>" +
                "<div class=\"cell\">" + data[i].name + "</div>" +
                "<div class=\"cell\">" + (window.value.hemisphere === "northern" ? data[i].northernDate : data[i].southernDate) + "</div>" +
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
    let input, filter, table, tr, td, i, txtValue;
    if (!str) {
        str = $(".form-control").val();
    }
    filter = str.toUpperCase();
    table = $(".custom-table");
    tr = table.children();

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 1; i < tr.length; i++) {
        td = tr[i];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
