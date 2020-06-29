/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 6;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9332142857142857, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.93, 500, 1500, "http:\/\/localhost:5000\/billing-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/billing-6"], "isController": false}, {"data": [0.905, 500, 1500, "http:\/\/localhost:5000\/billing-7"], "isController": false}, {"data": [0.98, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/billing-0"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/billing-1"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-4"], "isController": false}, {"data": [0.84, 500, 1500, "http:\/\/localhost:5000\/billing-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-3"], "isController": false}, {"data": [0.745, 500, 1500, "http:\/\/localhost:5000\/billing"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/billing-3"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/billing-4"], "isController": false}, {"data": [0.98, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-0"], "isController": false}, {"data": [0.98, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002-1"], "isController": false}, {"data": [0.38, 500, 1500, "Test"], "isController": true}, {"data": [0.97, 500, 1500, "http:\/\/localhost:5000\/generate_bill\/100000002"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1350, 0, 0.0, 157.75555555555584, 1, 1979, 481.8000000000002, 550.7000000000003, 1371.3500000000001, 47.56368248599514, 1209.1296396610649, 39.01020196948878], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["http:\/\/localhost:5000\/billing-5", 100, 0, 0.0, 352.61000000000007, 61, 1590, 542.5000000000001, 1107.5999999999947, 1588.329999999999, 3.7242560798480504, 133.00984192860602, 1.7766592724665748], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-6", 100, 0, 0.0, 48.61999999999998, 6, 353, 68.9, 82.94999999999999, 351.05999999999904, 3.7554453958239447, 40.60208591520204, 1.8062078685969656], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-7", 100, 0, 0.0, 336.5100000000001, 61, 1364, 543.9, 591.4999999999997, 1361.5299999999988, 3.7253660172111913, 110.85328635491562, 1.8463117712252728], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-7", 50, 0, 0.0, 226.92000000000004, 61, 1294, 298.79999999999995, 684.5499999999964, 1294.0, 2.0517871065698223, 0.6391797724568099, 0.9156901442406336], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-0", 100, 0, 0.0, 4.3, 1, 25, 6.900000000000006, 8.949999999999989, 24.869999999999933, 3.7537537537537538, 1.5102993618618619, 1.6312699418168168], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-1", 100, 0, 0.0, 4.55, 1, 15, 7.0, 8.949999999999989, 14.989999999999995, 3.7567151282918214, 24.26823298208047, 1.5591835249258048], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-4", 50, 0, 0.0, 6.4799999999999995, 2, 16, 11.0, 14.0, 16.0, 2.0567667626491155, 0.4519262906211436, 1.0163320135746607], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-2", 100, 0, 0.0, 405.9599999999999, 61, 1902, 682.3000000000002, 1368.4499999999975, 1898.7699999999984, 3.7245335021788524, 293.09605339118775, 1.8531736517188722], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-3", 50, 0, 0.0, 6.740000000000001, 2, 15, 12.0, 13.0, 15.0, 2.0564283951632807, 0.4478354805873159, 1.0061236581804722], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing", 100, 0, 0.0, 460.75999999999993, 71, 1979, 793.1000000000001, 1447.3999999999999, 1975.4499999999982, 3.713468751160459, 621.4552329737459, 13.972651463106688], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-3", 100, 0, 0.0, 7.299999999999996, 2, 22, 12.900000000000006, 14.0, 21.97999999999999, 3.7623687873885396, 2.494773834606268, 1.8021893459121863], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-6", 50, 0, 0.0, 35.419999999999995, 6, 281, 57.8, 69.29999999999994, 281.0, 2.0564283951632807, 0.5783704861396726, 0.9619425793781361], "isController": false}, {"data": ["http:\/\/localhost:5000\/billing-4", 100, 0, 0.0, 7.700000000000002, 3, 24, 13.0, 15.0, 23.97999999999999, 3.762085700312253, 18.248319993604454, 1.816749393363681], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-5", 50, 0, 0.0, 231.25999999999996, 60, 1297, 294.5, 741.5499999999959, 1297.0, 2.0514503754154187, 0.5740054312148689, 0.8834859526935543], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-0", 50, 0, 0.0, 4.219999999999999, 1, 14, 7.0, 10.449999999999996, 14.0, 2.055667475229207, 0.8270849607367512, 0.8110250585865231], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-2", 50, 0, 0.0, 220.30000000000007, 61, 1278, 296.9, 434.4499999999987, 1278.0, 2.0514503754154187, 0.6390748728100767, 0.9195466038239034], "isController": false}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002-1", 50, 0, 0.0, 3.900000000000001, 1, 13, 6.0, 7.0, 13.0, 2.0564283951632807, 13.284447103520606, 0.7731688790408818], "isController": false}, {"data": ["Test", 50, 0, 0.0, 1189.0599999999997, 688, 3447, 1969.6, 2302.499999999999, 3447.0, 1.959938849907883, 672.6260546920936, 21.700963554937086], "isController": true}, {"data": ["http:\/\/localhost:5000\/generate_bill\/100000002", 50, 0, 0.0, 267.54, 70, 1301, 308.9, 1216.3499999999995, 1301.0, 2.0495163141498605, 17.387904267092967, 7.269378176750287], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1350, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
