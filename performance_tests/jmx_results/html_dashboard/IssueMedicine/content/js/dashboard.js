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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9351351351351351, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.985, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-1"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-0"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-3"], "isController": false}, {"data": [0.805, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-1"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-0"], "isController": false}, {"data": [0.88, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-7"], "isController": false}, {"data": [0.715, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-6"], "isController": false}, {"data": [0.21, 500, 1500, "Test"], "isController": true}, {"data": [0.94, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-5"], "isController": false}, {"data": [0.94, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/search_patient_pharmacy-4"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-6"], "isController": false}, {"data": [0.97, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-4"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-3"], "isController": false}, {"data": [0.96, 500, 1500, "http:\/\/localhost:5000\/assign_medicines\/100000004-7"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 0, 0.0, 185.74777777777766, 1, 1731, 445.0, 605.9499999999998, 1341.95, 38.56784727132481, 753.5332098626557, 32.851302200509956], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-2", 100, 0, 0.0, 299.5199999999999, 62, 1299, 295.0, 302.84999999999997, 1297.5699999999993, 2.33633942339143, 0.7278244883416662, 1.138509152609691], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-1", 100, 0, 0.0, 4.24, 1, 15, 6.0, 7.0, 14.93999999999997, 2.3515579071134627, 15.190972222222223, 0.9759883891828337], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-0", 100, 0, 0.0, 4.360000000000001, 1, 12, 6.0, 9.0, 12.0, 2.351502610167897, 0.9461123783097398, 1.0861921236420071], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-3", 100, 0, 0.0, 7.249999999999998, 2, 33, 12.0, 13.0, 32.83999999999992, 3.4553056217822467, 2.2911645675685017, 1.6551048901212813], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-2", 100, 0, 0.0, 475.36000000000007, 60, 1682, 1067.0000000000018, 1359.6999999999985, 1681.5599999999997, 3.425244048638466, 269.54396086658676, 1.7042596120911115], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-1", 100, 0, 0.0, 3.959999999999999, 1, 7, 6.0, 7.0, 7.0, 3.448870494912916, 22.27956867563373, 1.4314159768925676], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-0", 100, 0, 0.0, 4.180000000000001, 1, 28, 6.0, 6.949999999999989, 27.849999999999923, 3.446018126055343, 1.3864838554050796, 1.5513812071401496], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-7", 100, 0, 0.0, 397.5299999999999, 63, 1367, 558.7, 1099.9999999999998, 1366.5899999999997, 3.424540255470703, 101.90181040460944, 1.6972208785658025], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy", 100, 0, 0.0, 572.4300000000001, 76, 1731, 1311.3000000000002, 1572.7499999999982, 1730.61, 3.4130857708454214, 571.1864366104645, 12.895731296289975], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-6", 100, 0, 0.0, 51.029999999999994, 7, 356, 66.0, 76.89999999999998, 353.5799999999988, 3.4502984508159957, 37.302982567367074, 1.6594452998309352], "isController": false}, {"data": ["Test", 50, 0, 0.0, 1934.0000000000002, 1157, 4611, 2586.2, 3261.099999999999, 4611.0, 1.9269307846462156, 677.6658786322645, 29.543763006782797], "isController": true}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-5", 100, 0, 0.0, 396.7099999999999, 62, 1638, 548.5000000000002, 1267.9999999999986, 1635.7399999999989, 3.423953982058481, 122.28551335770048, 1.633399922105047], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004", 100, 0, 0.0, 394.56999999999994, 76, 1345, 908.4000000000016, 1251.599999999999, 1344.5899999999997, 2.336011960381237, 19.830004029620632, 9.08170274831807], "isController": false}, {"data": ["http:\/\/localhost:5000\/search_patient_pharmacy-4", 100, 0, 0.0, 7.6499999999999995, 2, 28, 13.0, 14.0, 27.87999999999994, 3.4550668555436546, 16.759098702622396, 1.6684868750647823], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-6", 100, 0, 0.0, 43.19, 9, 67, 54.0, 55.0, 66.90999999999995, 2.349679268779812, 0.660847294344322, 1.1909018950163304], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-5", 100, 0, 0.0, 329.94000000000005, 59, 1295, 309.5, 1117.55, 1294.4499999999998, 2.3365577830739754, 0.6652800656572737, 1.0975432555259592], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-4", 100, 0, 0.0, 7.03, 2, 18, 11.0, 13.0, 17.97999999999999, 2.351447315822889, 0.5166754356056152, 1.2537990570696262], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-3", 100, 0, 0.0, 7.11, 2, 22, 11.0, 13.0, 21.949999999999974, 2.351502610167897, 0.5120948067064854, 1.242346593848469], "isController": false}, {"data": ["http:\/\/localhost:5000\/assign_medicines\/100000004-7", 100, 0, 0.0, 337.3999999999999, 62, 1329, 306.0, 1129.5499999999977, 1328.4999999999998, 2.336612379372386, 0.7279095205271398, 1.1340784692852304], "isController": false}]}, function(index, item){
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
