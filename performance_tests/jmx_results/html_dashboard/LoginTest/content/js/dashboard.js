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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.932, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.43, 500, 1500, "LoginTest"], "isController": true}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-6"], "isController": false}, {"data": [0.85, 500, 1500, "http:\/\/localhost:5000\/login-1"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-4"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/login-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/login-0"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-3"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/login-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-0"], "isController": false}, {"data": [0.88, 500, 1500, "http:\/\/localhost:5000\/login-6"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/index-1"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/login-3"], "isController": false}, {"data": [0.955, 500, 1500, "http:\/\/localhost:5000\/login-4"], "isController": false}, {"data": [0.75, 500, 1500, "http:\/\/localhost:5000\/login"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 0, 0.0, 164.949166666667, 1, 3026, 491.0, 562.95, 1287.99, 34.326906573602606, 980.5778094427599, 33.02512121688884], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["LoginTest", 50, 0, 0.0, 1107.82, 736, 3832, 1858.7, 1951.0499999999997, 3832.0, 1.9695895375403767, 675.1563669443788, 22.73875733672103], "isController": true}, {"data": ["http:\/\/localhost:5000\/index-6", 50, 0, 0.0, 73.74000000000001, 62, 285, 72.0, 136.79999999999964, 285.0, 1.721644514840576, 0.5363326174161559, 0.9028545942083878], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-1", 100, 0, 0.0, 445.44000000000005, 65, 3010, 624.8000000000001, 676.95, 2994.699999999992, 2.8933510792199524, 227.68751627509982, 1.4396116942017245], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-4", 50, 0, 0.0, 69.84, 59, 262, 70.0, 73.35, 262.0, 1.7282499740762505, 0.49167361567177076, 0.8793146840759047], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-2", 100, 0, 0.0, 8.430000000000003, 2, 24, 13.0, 14.949999999999989, 24.0, 2.917578409919767, 1.937454412837345, 1.7665025528811087], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-5", 50, 0, 0.0, 11.499999999999998, 7, 43, 15.0, 21.39999999999995, 43.0, 1.7317216776919615, 0.4870467218508641, 0.9453441580369203], "isController": false}, {"data": ["http:\/\/localhost:5000\/index", 50, 0, 0.0, 83.41999999999999, 68, 294, 86.9, 144.89999999999964, 294.0, 1.7212296464594306, 13.943506553581878, 7.021070540293986], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-2", 50, 0, 0.0, 9.059999999999999, 3, 20, 14.0, 17.89999999999999, 20.0, 1.7319616197305068, 0.37886660431604835, 1.2025631949495998], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-0", 100, 0, 0.0, 7.530000000000001, 2, 47, 11.800000000000011, 15.0, 46.7999999999999, 2.9124799767001606, 19.956460699723316, 1.6524910805300712], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-3", 50, 0, 0.0, 9.04, 2, 19, 14.899999999999999, 17.449999999999996, 19.0, 1.7320216156297632, 0.38057115577802414, 1.20937056169461], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-5", 100, 0, 0.0, 57.66, 9, 323, 74.70000000000002, 81.89999999999998, 320.77999999999884, 2.911631969719027, 31.479177281991557, 1.4003698682486534], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-0", 50, 0, 0.0, 5.420000000000001, 1, 15, 7.0, 13.0, 15.0, 1.7322616407982263, 11.214025797706485, 1.0065387463622506], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-6", 100, 0, 0.0, 382.80000000000007, 64, 1142, 560.0, 581.4499999999998, 1136.8499999999974, 2.893434796446862, 86.09805172376377, 1.4340021085906078], "isController": false}, {"data": ["http:\/\/localhost:5000\/index-1", 50, 0, 0.0, 71.18, 59, 285, 72.0, 73.89999999999999, 285.0, 1.7282499740762505, 0.5383903727835194, 0.9096940781514637], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-3", 100, 0, 0.0, 8.610000000000005, 3, 24, 13.0, 14.949999999999989, 23.989999999999995, 2.917578409919767, 14.151964806710431, 1.7764747447118892], "isController": false}, {"data": ["http:\/\/localhost:5000\/login-4", 100, 0, 0.0, 390.11999999999995, 61, 1458, 488.70000000000005, 603.6499999999999, 1456.7299999999993, 2.894104708708361, 103.36820654140017, 1.3806349123086274], "isController": false}, {"data": ["http:\/\/localhost:5000\/login", 100, 0, 0.0, 512.2000000000002, 78, 3026, 687.8000000000001, 1300.55, 3010.669999999992, 2.8872527789808, 483.16658320701606, 10.777855222318465], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
