describe('Legend', function() {
    var chart;
    var lineSeries;

    var div = document.createElement('div');
    div.id  = 'testChart';

    var createChartElement = function(){

        document.body.appendChild(div);
    };

    var removeChartElement = function(){
        document.body.removeChild(div);
    };

    beforeEach(function() {

        createChartElement();

        var chartGroup = new insight.ChartGroup();

        chart = new insight.Chart('test', '#testChart')
            .width(550)
            .height(450);

        var x = new insight.Axis('ValueAxis', insight.Scales.Linear)
            .tickOrientation('lr');

        var y = new insight.Axis('KeyAxis', insight.Scales.Linear)
            .tickOrientation('lr')
            .showGridlines(true);

        chart.addXAxis(x);
        chart.addYAxis(y);

        var data = new insight.DataSet([
            {"key": 1, "value": 1},
            {"key": 2, "value": 2},
            {"key": 3, "value": 3}
        ]);

        lineSeries = new insight.LineSeries('line', data, x, y);

        chartGroup.add(chart);

        chartGroup.draw();
        removeChartElement();
    });

    it('legend size is 0,0 when no series on the chart', function() {

        //Given:
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        expect(chart.legendBox.attr('width')).toEqual('0');
        expect(chart.legendBox.attr('height')).toEqual('0');
        expect(chart.legendItems.attr('width')).toEqual('0');
        expect(chart.legendItems.attr('height')).toEqual('0');
    });

    it('legend size closely wraps the series boxes on the chart', function() {

        //Given:
        chart.series([lineSeries, lineSeries, lineSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        expect(chart.legendBox.attr('width')).toEqual('45');
        expect(chart.legendBox.attr('height')).toEqual('60');
        expect(chart.legendItems.attr('width')).toEqual('45');
        expect(chart.legendItems.attr('height')).toEqual('60');
    });

    it('legend items position series blobs', function() {

        //Given:
        chart.series([lineSeries, lineSeries, lineSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allRects = chart.legendItems.selectAll('rect')[0];
        var allPositions = allRects.map(function(item) {
            return [item["attributes"]["x"].value,
                item["attributes"]["y"].value,
                item["attributes"]["width"].value,
                item["attributes"]["height"].value];
        });

        var expectedPositions = [['5','5','10','10'],
                                 ['5','25','10','10'],
                                 ['5','45','10','10']];
        expect(allPositions).toEqual(expectedPositions);
    });

    it('legend items position series names', function() {

        //Given:
        chart.series([lineSeries, lineSeries, lineSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allRects = chart.legendItems.selectAll('text')[0];
        var allPositions = allRects.map(function(item) {
            return [item["attributes"]["x"].value,
                item["attributes"]["y"].value,
                item["attributes"]["width"].value,
                item["attributes"]["height"].value];
        });

        var expectedPositions = [['20','14','20','20'],
                                 ['20','34','20','20'],
                                 ['20','54','20','20']];
        expect(allPositions).toEqual(expectedPositions);
    });

    it('legend blobs contain series colours', function() {

        //Given:
        lineSeries.color = d3.functor(d3.rgb(128, 0, 128));
        chart.series([lineSeries, lineSeries, lineSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allTextElements = chart.legendItems.selectAll('rect')[0];
        var allTexts = allTextElements.map(function(item) {
            return d3.rgb(item["style"]["fill"]);
        });

        expect(allTexts).toEqual([d3.rgb(128, 0, 128), d3.rgb(128, 0, 128), d3.rgb(128, 0, 128)]);
    });

    it('legend items contain series names', function() {

        //Given:
        chart.series([lineSeries, lineSeries, lineSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allTextElements = chart.legendItems.selectAll('text')[0];
        var allTexts = allTextElements.map(function(item) {
            return item.textContent;
        });

        expect(allTexts).toEqual(["line", "line", "line"]);
    });
});