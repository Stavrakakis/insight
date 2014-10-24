describe('Legend', function() {

    var chart,
        lineSeries,
        markerSeries,
        columnSeries,
        div;

    function setupDiv() {
        div = document.createElement('div');
        div.id  = 'testChart';
        document.body.appendChild(div);
    }

    function destroyDiv() {
        document.body.removeChild(div);
        div = null;
    }

    function mockTextMeasurer() {

        // the fakeMeasurer object will stand in for the canvas.getContext('2d') return value
        var fakeMeasurer = {
            measureText: function (text) {
                return { width: text.length };
            }
        };

        // replace the chart's measureCanvas object with a fake that will return our fakeMeasurer
        chart.measureCanvas = {
            getContext: function() { return fakeMeasurer; }
        };

    }

    beforeEach(function() {

        setupDiv();

        chart = new insight.Chart('test', '#testChart')
            .width(550)
            .height(450);

        var x = new insight.Axis('ValueAxis', insight.scales.linear)
            .tickLabelOrientation('lr');

        var y = new insight.Axis('KeyAxis', insight.scales.linear)
            .tickLabelOrientation('lr')
            .shouldShowGridlines(true);

        chart.addXAxis(x);
        chart.addYAxis(y);

        var data = new insight.DataSet([
            {"key": 1, "value": 1},
            {"key": 2, "value": 2},
            {"key": 3, "value": 3}
        ]);

        lineSeries = new insight.LineSeries('line', data, x, y);
        markerSeries = new insight.MarkerSeries('marker', data, x, y);
        columnSeries = new insight.ColumnSeries('column', data, x, y);


        mockTextMeasurer();

        chart.draw();

    });

    afterEach(function() {

        destroyDiv();

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

        // expected width from the fake text measurer plus a hard-coded value
        var expectedWidth = (lineSeries.name.length + 25) + '';

        expect(chart.legendBox.attr('width')).toEqual(expectedWidth);
        expect(chart.legendBox.attr('height')).toEqual('60');
        expect(chart.legendItems.attr('width')).toEqual(expectedWidth);
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
            return [
                item["attributes"]["x"].value,
                item["attributes"]["y"].value,
                item["attributes"]["width"].value,
                item["attributes"]["height"].value
            ];
        });

        // expected width from the fake text measurer
        var expectedWidth = lineSeries.name.length + '';

        var expectedPositions = [['20','14',expectedWidth,'20'],
                                 ['20','34',expectedWidth,'20'],
                                 ['20','54',expectedWidth,'20']];
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

    it('legend items contain series names by default', function() {

        //Given:
        chart.series([lineSeries, markerSeries, columnSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allTextElements = chart.legendItems.selectAll('text')[0];
        var allTexts = allTextElements.map(function(item) {
            return item.textContent;
        });

        expect(allTexts).toEqual(["line", "marker", "column"]);
    });

    it('legend items contain series titles', function() {

        //Given:
        lineSeries.title('I');
        markerSeries.title('love');
        columnSeries.title('tests');

        chart.series([lineSeries, markerSeries, columnSeries]);
        var legend = new insight.Legend();
        chart.legend(legend);

        //When:
        legend.draw(chart);

        //Then:
        var allTextElements = chart.legendItems.selectAll('text')[0];
        var allTexts = allTextElements.map(function(item) {
            return item.textContent;
        });

        expect(allTexts).toEqual(["I", "love", "tests"]);
    });
});