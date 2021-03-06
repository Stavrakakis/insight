/**
 * Created by tferguson on 13/11/2014.
 */

describe('SimpleChart', function() {

    var data = [
        { "name": "Hancock Campbell", "age": 39, "weight": 78, "eyeColor": "blue" },
        { "name": "Sybil Nielsen", "age": 27, "weight": 49, "eyeColor": "green" },
        { "name": "Pierce Rice", "age": 29, "weight": 53, "eyeColor": "green" },
        { "name": "Ferguson Dotson", "age": 34, "weight": 65, "eyeColor": "green" },
        { "name": "Alicia Byrd", "age": 33, "weight": 54, "eyeColor": "blue" },
        { "name": "Dean Fisher", "age": 23, "weight": 64,"eyeColor": "green" },
        { "name": "Mckinney Harvey", "age": 31, "weight": 93, "eyeColor": "blue" },
        { "name": "Lakisha Battle", "age": 33, "weight": 81, "eyeColor": "brown" },
        { "name": "Levine Franklin", "age": 37, "weight": 78, "eyeColor": "blue" },
        { "name": "Kathrine Lewis", "age": 27, "weight": 80, "eyeColor": "blue" },
        { "name": "Jefferson Everett", "age": 34, "weight": 59, "eyeColor": "brown" },
        { "name": "Moss Vasquez", "age": 39, "weight": 44, "eyeColor": "green" }
    ];

    beforeEach(function() {

        realInsight = {
            Axis: insight.Axis,
            ColumnSeries: insight.ColumnSeries
        };


        insight.Axis = function(name, scale) {

            var tickLabelOrientation;

            this.title = function() {
                return name;
            };

            this.scale = function() {
                return scale;
            };

            this.addSeries = function () {
            };

            this.tickLabelOrientation = function(direction){
                if (!arguments.length) {
                    return tickLabelOrientation;
                }

                tickLabelOrientation = direction;
                return this;
            };

            return this;

        };

        insight.ColumnSeries = function(name, data, xAxis, yAxis){

            var keyFunc;
            var valFunc;
            var radFunc;
            var groupKeyFunc;

            this.name = name;
            this.x = xAxis;
            this.y = yAxis;
            this.keyFunction = function(func) {
                if (!arguments.length) {
                    return keyFunc;
                }
                keyFunc = func;

                return this
            };

            this.valueFunction = function(func){
                if (!arguments.length) {
                    return valFunc;
                }
                valFunc = func;

                return this
            };

            this.radiusFunction = function(func) {
                if (!arguments.length) {
                    return radFunc;
                }
                radFunc = func;

                return this
            };

            this.groupKeyFunction  = function(func) {
                if (!arguments.length) {
                    return this.keyFunction();
                }
                this.keyFunction(func);

                return this
            };

            return this;

        };

        options = {
            xAxisScale: insight.scales.ordinal,
            xAxisName: 'name',
            yAxisScale: insight.scales.linear,
            yAxisName: 'age',
            seriesType: insight.ColumnSeries
        };

        simpleChart = new insight.SimpleChart(data, '#chart', 'name', 'age', options);
    });

    afterEach(function() {

        insight.Axis = realInsight.Axis;
        insight.ColumnSeries = realInsight.ColumnSeries;
    });


    it('returns a chart object', function() {

        var xAxis = new insight.Axis('name', insight.scales.ordinal);
        var yAxis = new insight.Axis('age', insight.scales.linear);
        var series = new insight.ColumnSeries('series', new insight.DataSet(data), xAxis, yAxis);

        expect(simpleChart.build() instanceof insight.Chart).toBe(true);
    });

    //Defaults
    it('has an x-axis with xAxisName name and xAxisScale scale', function() {

        expect(simpleChart.build().xAxis().title()).toBe('name');
        expect(simpleChart.build().xAxis().scale()).toBe(insight.scales.ordinal);
    });

    it('has a y-axis with yAxisName name and yAxisScale scale', function() {

        expect(simpleChart.build().yAxis().title()).toBe('age');
        expect(simpleChart.build().yAxis().scale()).toBe(insight.scales.linear);
    });

    it('has a series of type seriesType', function() {

        expect(simpleChart.build().series()[0] instanceof insight.ColumnSeries).toBe(true);
    });

    it('defaults tick labels on x-axis to display vertically', function() {

        expect(simpleChart.build().xAxis().tickLabelOrientation()).toBe('tb');
    });

    it('defaults chart width and height to 500px', function() {

        expect(simpleChart.build().width()).toBe(500);
        expect(simpleChart.build().height()).toBe(500);
    });

    //Setters
    it('can set xAxisScale and yAxisScale', function() {

        simpleChart.xAxisScale(insight.scales.linear);
        simpleChart.yAxisScale(insight.scales.time);

        expect(simpleChart.build().xAxis().scale()).toBe(insight.scales.linear);
        expect(simpleChart.build().yAxis().scale()).toBe(insight.scales.time);
    });

    it('sets a radiusFunction if a radiusProperty is supplied', function() {

        options.radiusProperty = function() {};

        expect(simpleChart.build().series()[0].radiusFunction()).toBeTruthy();
    });

    it('sets the keyFunction to the grouping key property if and only if a groupingProperty is supplied', function() {

        var testObj = {key: true, name: 'Bob'};

        expect(simpleChart.build().series()[0].keyFunction()(testObj)).toBe('Bob');

        options.groupingProperty = 'count';

        expect(simpleChart.build().series()[0].keyFunction()(testObj)).toBe(true);
    });

    it('sets the valueFunction to the relevant groupingProperty when it is supplied', function() {

        var testObj = {
            value: {
                count: 2,
                age: {
                    mean: 4
                }
            },
            age: 23
        };

        expect(simpleChart.build().series()[0].valueFunction()(testObj)).toBe(23);

        options.groupingProperty = 'count';

        expect(simpleChart.build().series()[0].valueFunction()(testObj)).toBe(2);

        options.groupingProperty = 'mean';

        expect(simpleChart.build().series()[0].valueFunction()(testObj)).toBe(4);
    });


});