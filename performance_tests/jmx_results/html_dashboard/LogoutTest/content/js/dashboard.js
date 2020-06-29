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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.855, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/logout-4"], "isController": false}, {"data": [0.93, 500, 1500, "http:\/\/localhost:5000\/logout-5"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/logout-6"], "isController": false}, {"data": [0.77, 500, 1500, "http:\/\/localhost:5000\/logout-7"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/logout-0"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/logout-1"], "isController": false}, {"data": [0.55, 500, 1500, "Test"], "isController": true}, {"data": [0.75, 500, 1500, "http:\/\/localhost:5000\/logout-2"], "isController": false}, {"data": [1.0, 500, 1500, "http:\/\/localhost:5000\/logout-3"], "isController": false}, {"data": [0.55, 500, 1500, "http:\/\/localhost:5000\/logout"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 450, 0, 0.0, 243.44444444444463, 2, 2117, 549.9000000000001, 601.5999999999999, 1424.8600000000001, 18.049093534413604, 1308.9171295924916, 13.681745598026634], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["http:\/\/localhost:5000\/logout-4", 50, 0, 0.0, 9.54, 3, 16, 13.0, 14.0, 16.0, 2.052545155993432, 19.461094647988507, 0.9601261032430214], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-5", 50, 0, 0.0, 435.43999999999994, 316, 1691, 537.9, 584.9499999999999, 1691.0, 2.0260140200170182, 144.14250855990923, 0.8032829024676851], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-6", 50, 0, 0.0, 69.94000000000001, 47, 355, 76.0, 82.44999999999999, 355.0, 2.047166721257779, 43.69021633434327, 0.8516533430232558], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-7", 50, 0, 0.0, 457.9800000000001, 316, 606, 547.6, 556.5999999999999, 606.0, 2.0257677659833075, 119.92782569281258, 0.8467076209383356], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-0", 50, 0, 0.0, 6.06, 2, 26, 7.0, 8.449999999999996, 26.0, 2.0463288859785544, 1.0471448596218385, 0.7733684364000982], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-1", 50, 0, 0.0, 5.420000000000001, 2, 9, 7.0, 8.449999999999996, 9.0, 2.0482569333497196, 13.259663292163369, 0.9221156701896686], "isController": false}, {"data": ["Test", 50, 0, 0.0, 620.6999999999999, 411, 2117, 677.7, 1424.3, 2117.0, 2.000400080016003, 652.8089992998599, 6.823630351070213], "isController": true}, {"data": ["http:\/\/localhost:5000\/logout-2", 50, 0, 0.0, 576.6199999999999, 403, 2022, 660.5, 1412.25, 2022.0, 2.0131255787736038, 316.21209347445347, 0.845355467649072], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout-3", 50, 0, 0.0, 9.3, 3, 15, 13.0, 13.449999999999996, 15.0, 2.0524609006198435, 2.2749444552768767, 0.9540736217725052], "isController": false}, {"data": ["http:\/\/localhost:5000\/logout", 50, 0, 0.0, 620.6999999999999, 411, 2117, 677.7, 1424.3, 2117.0, 2.005454837157067, 654.4585647962458, 6.840872799013317], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 450, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
