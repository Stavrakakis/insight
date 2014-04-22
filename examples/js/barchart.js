
$(document).ready(function(){

    d3.json('revenuereport.json', function(data){

        var exampleGroup = new ChartGroup("Example Group");

        data.forEach(function(item){
            item.Date = new Date(item.Date);
        });

        var dataset = new Group(data);

        var dateRange =  function () {
            return [new Date(2013,11,1), new Date(2014,12,30)];
        };

        var yearBarChart = new BarChart('Yearly Revenue', "#barChart", {}, dataset)
                                        .width(500)
                                        .height(300)
                                        .margin({ top: 20, left: 65, bottom: 80, right: 0 })
                                        .barColor('#ACC3EE')
                                        .tooltipFormat(InsightFormatters.currencyFormatter)
                                        .tooltipLabel('Current')
                                        .setXAxis(d3.time.scale())
                                        .setXAxisRange(function (axis) { return axis.range; })
                                        .zoomable(true)
                                        .yAxisFormat(InsightFormatters.currencyFormatter)
                                        .xAxisFormat(InsightFormatters.dateFormatter)
                                        .keyAccessor(function(d){ return d.Date; })
                                        .xRange(dateRange)
                                        .valueAccessor(function (d) { return d.CurrentRevenue + d.RenewalRevenue; });

        
        var timeBarWidth = function (d) {

            var nextMonth = d3.time.day.floor(d3.time.month.offset(d.Date, 1));
            var now = d.Date;
            
            var width = Math.floor(this.x(nextMonth) - this.x(now));
            
            return width - 5;
        };

        yearBarChart._barWidthFunction = timeBarWidth.bind(yearBarChart);

        exampleGroup.addChart(yearBarChart);
        exampleGroup.initCharts();
    });
});