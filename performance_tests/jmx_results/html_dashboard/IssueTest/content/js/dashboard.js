<<<<<<< HEAD
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9464864864864865, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-3"], "isController": false}, {"data": [0.86, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-2"], "isController": false}, {"data": [0.96, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-4"], "isController": false}, {"data": [0.88, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-1"], "isController": false}, {"data": [0.975, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-3"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-4"], "isController": false}, {"data": [0.96, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002"], "isController": false}, {"data": [0.3, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-0"], "isController": false}, {"data": [0.77, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis"], "isController": false}, {"data": [0.975, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-1"], "isController": false}, {"data": [0.98, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 0, 0.0, 164.5300000000001, 1, 1445, 431.9000000000001, 546.9499999999998, 1287.0, 43.747721472839956, 854.7414251427876, 37.19458242192247], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-3", 100, 0, 0.0, 6.67, 2, 21, 13.0, 14.0, 20.949999999999974, 3.3259054777663217, 2.2053611517610667, 1.5931217156683406], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-2", 100, 0, 0.0, 448.1700000000001, 254, 1433, 660.3000000000001, 1140.4999999999995, 1432.0499999999995, 3.297391763115376, 259.4828350150031, 1.6406456086985193], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-5", 100, 0, 0.0, 379.81000000000006, 251, 1299, 493.6, 695.4499999999991, 1298.4199999999996, 3.297391763115376, 117.77079057028389, 1.5730233166815049], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-4", 100, 0, 0.0, 6.740000000000003, 2, 23, 12.0, 13.0, 22.929999999999964, 3.326016097917914, 16.133126912459257, 1.6061669535355552], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-7", 100, 0, 0.0, 409.31000000000006, 257, 1338, 555.2, 659.4499999999996, 1337.5399999999997, 3.296087544085171, 98.0795268672336, 1.6335590123273676], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-6", 100, 0, 0.0, 62.24000000000003, 27, 360, 67.9, 240.44999999999828, 359.2999999999996, 3.3231423634188486, 35.92823154825203, 1.5982886855310383], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-1", 100, 0, 0.0, 3.7399999999999998, 1, 13, 6.0, 7.949999999999989, 12.969999999999985, 2.9046968948790193, 18.76422847619601, 1.2055626760972493], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-2", 100, 0, 0.0, 249.6599999999999, 59, 1289, 295.0, 599.4499999999964, 1287.3999999999992, 2.8830906732016723, 0.898150317139974, 1.4049435995387054], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-3", 100, 0, 0.0, 6.24, 2, 16, 12.0, 12.0, 16.0, 2.904865649963689, 0.6326025780682644, 1.534699527959332], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-4", 100, 0, 0.0, 6.14, 2, 15, 10.900000000000006, 12.0, 15.0, 2.904865649963689, 0.6382761437908497, 1.5488834422657953], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002", 100, 0, 0.0, 293.77000000000004, 68, 1301, 333.20000000000005, 1113.699999999998, 1300.93, 2.880350250590472, 24.448772970793247, 11.154325115934096], "isController": false}, {"data": ["Test", 50, 0, 0.0, 1646.3600000000001, 1089, 3193, 2456.8, 2635.2999999999993, 3193.0, 1.872308556450103, 658.4597629189291, 28.65326893372028], "isController": true}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-0", 100, 0, 0.0, 3.53, 1, 11, 6.0, 6.0, 10.989999999999995, 2.9046125246892065, 1.168652695480423, 1.2977150684036252], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis", 100, 0, 0.0, 529.3999999999999, 270, 1445, 1193.2000000000003, 1300.75, 1444.0199999999995, 3.2866627226713994, 550.0346896979557, 12.421274156971013], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-5", 100, 0, 0.0, 258.3299999999999, 59, 1290, 308.6, 864.7499999999941, 1289.97, 2.8819274330672355, 0.8185349361653074, 1.3537178665091214], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-6", 100, 0, 0.0, 42.100000000000016, 6, 282, 58.900000000000006, 68.79999999999995, 281.91999999999996, 2.9002320185614847, 0.8156902552204177, 1.4699418140951277], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-1", 100, 0, 0.0, 4.1000000000000005, 1, 14, 7.0, 8.0, 14.0, 3.3211557622052474, 21.454536491198937, 1.3784093739621388], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-7", 100, 0, 0.0, 247.63, 61, 1294, 297.0, 300.95, 1293.94, 2.884338044418806, 0.8985389025093741, 1.3999179766368617], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-0", 100, 0, 0.0, 3.9599999999999995, 1, 31, 6.0, 8.0, 30.809999999999903, 3.319171534784918, 1.3354479221986193, 1.497516844795539], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1800, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
=======
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9464864864864865, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-3"], "isController": false}, {"data": [0.86, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-2"], "isController": false}, {"data": [0.96, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-4"], "isController": false}, {"data": [0.88, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-1"], "isController": false}, {"data": [0.975, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-3"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-4"], "isController": false}, {"data": [0.96, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002"], "isController": false}, {"data": [0.3, 500, 1500, "Test"], "isController": true}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-0"], "isController": false}, {"data": [0.77, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis"], "isController": false}, {"data": [0.975, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-1"], "isController": false}, {"data": [0.98, 500, 1500, "http:\/\/localhost:5000\/refer_test\/100000002-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_diagnosis-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 0, 0.0, 164.5300000000001, 1, 1445, 431.9000000000001, 546.9499999999998, 1287.0, 43.747721472839956, 854.7414251427876, 37.19458242192247], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-3", 100, 0, 0.0, 6.67, 2, 21, 13.0, 14.0, 20.949999999999974, 3.3259054777663217, 2.2053611517610667, 1.5931217156683406], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-2", 100, 0, 0.0, 448.1700000000001, 254, 1433, 660.3000000000001, 1140.4999999999995, 1432.0499999999995, 3.297391763115376, 259.4828350150031, 1.6406456086985193], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-5", 100, 0, 0.0, 379.81000000000006, 251, 1299, 493.6, 695.4499999999991, 1298.4199999999996, 3.297391763115376, 117.77079057028389, 1.5730233166815049], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-4", 100, 0, 0.0, 6.740000000000003, 2, 23, 12.0, 13.0, 22.929999999999964, 3.326016097917914, 16.133126912459257, 1.6061669535355552], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-7", 100, 0, 0.0, 409.31000000000006, 257, 1338, 555.2, 659.4499999999996, 1337.5399999999997, 3.296087544085171, 98.0795268672336, 1.6335590123273676], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-6", 100, 0, 0.0, 62.24000000000003, 27, 360, 67.9, 240.44999999999828, 359.2999999999996, 3.3231423634188486, 35.92823154825203, 1.5982886855310383], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-1", 100, 0, 0.0, 3.7399999999999998, 1, 13, 6.0, 7.949999999999989, 12.969999999999985, 2.9046968948790193, 18.76422847619601, 1.2055626760972493], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-2", 100, 0, 0.0, 249.6599999999999, 59, 1289, 295.0, 599.4499999999964, 1287.3999999999992, 2.8830906732016723, 0.898150317139974, 1.4049435995387054], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-3", 100, 0, 0.0, 6.24, 2, 16, 12.0, 12.0, 16.0, 2.904865649963689, 0.6326025780682644, 1.534699527959332], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-4", 100, 0, 0.0, 6.14, 2, 15, 10.900000000000006, 12.0, 15.0, 2.904865649963689, 0.6382761437908497, 1.5488834422657953], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002", 100, 0, 0.0, 293.77000000000004, 68, 1301, 333.20000000000005, 1113.699999999998, 1300.93, 2.880350250590472, 24.448772970793247, 11.154325115934096], "isController": false}, {"data": ["Test", 50, 0, 0.0, 1646.3600000000001, 1089, 3193, 2456.8, 2635.2999999999993, 3193.0, 1.872308556450103, 658.4597629189291, 28.65326893372028], "isController": true}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-0", 100, 0, 0.0, 3.53, 1, 11, 6.0, 6.0, 10.989999999999995, 2.9046125246892065, 1.168652695480423, 1.2977150684036252], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis", 100, 0, 0.0, 529.3999999999999, 270, 1445, 1193.2000000000003, 1300.75, 1444.0199999999995, 3.2866627226713994, 550.0346896979557, 12.421274156971013], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-5", 100, 0, 0.0, 258.3299999999999, 59, 1290, 308.6, 864.7499999999941, 1289.97, 2.8819274330672355, 0.8185349361653074, 1.3537178665091214], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-6", 100, 0, 0.0, 42.100000000000016, 6, 282, 58.900000000000006, 68.79999999999995, 281.91999999999996, 2.9002320185614847, 0.8156902552204177, 1.4699418140951277], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-1", 100, 0, 0.0, 4.1000000000000005, 1, 14, 7.0, 8.0, 14.0, 3.3211557622052474, 21.454536491198937, 1.3784093739621388], "isController": false}, {"data": ["http:\/\/localhost:5000\/refer_test\/100000002-7", 100, 0, 0.0, 247.63, 61, 1294, 297.0, 300.95, 1293.94, 2.884338044418806, 0.8985389025093741, 1.3999179766368617], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_diagnosis-0", 100, 0, 0.0, 3.9599999999999995, 1, 31, 6.0, 8.0, 30.809999999999903, 3.319171534784918, 1.3354479221986193, 1.497516844795539], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1800, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
>>>>>>> c7fdb0cd86dd150d4a51d49a9980e7d4e2245e1d
