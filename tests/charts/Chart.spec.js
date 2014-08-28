describe('Chart', function() {
    
    describe('constructor', function() {

        it('sets name', function() {

            var chart = new insight.Chart('somename', 'asdads', 'ada');

            expect(chart.name).toBe('somename');

        });

        it('sets element', function() {

            var chart = new insight.Chart('somename', 'somelement', 'ada');

            expect(chart.element).toBe('somelement');

        });

    });

    describe('defaults', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart();
        });

        it('selectedItems empty', function() {

            expect(chart.selectedItems).toEqual([]);

        });

        it('container null', function() {

            expect(chart.container).toBeNull();

        });

        it('height 300', function() {

            expect(chart.height()).toBe(300);

        });

        it('width 300', function() {

            expect(chart.width()).toBe(300);

        });

        it('minWidth 300', function() {

            expect(chart.minWidth()).toBe(300);

        });

        it('maxWidth 300', function() {

            expect(chart.maxWidth()).toBe(300);

        });

        it('margin {0,0,0,0}', function() {

            expect(chart.margin()).toEqual({
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            });

        });

        it('series empty', function() {

            expect(chart.series()).toEqual([]);

        });

        it('axes empty', function() {

            expect(chart.xAxes()).toEqual([]);
            expect(chart.yAxes()).toEqual([]);

        });

        it('title empty', function() {

            expect(chart.title()).toBe('');

        });
    });

    describe('gets and sets', function() {

        var chart;

        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');
        });

        it('title', function() {

            var result = chart.title('Test Chart');

            expect(chart.title()).toBe('Test Chart');
            expect(result).toBe(chart);
        });

        it('width', function() {

            var result = chart.width(123);

            expect(chart.width()).toBe(123);
            expect(result).toBe(chart);
        });

        it('maxWidth', function() {

            var result = chart.width(220);

            expect(chart.maxWidth()).toBe(220);
            expect(result).toBe(chart);
        });

        it('setting width sets maxWidth', function() {

            chart.maxWidth(300);
            var result = chart.width(123);

            expect(chart.maxWidth()).toBe(123);
            expect(result).toBe(chart);
        });

        it('setting width sets maxWidth if dontSetMaxWidth false', function() {

            chart.maxWidth(300);
            var result = chart.width(123, false);

            expect(chart.maxWidth()).toBe(123);
            expect(result).toBe(chart);
        });

        it('setting width doesn\'t set maxWidth if dontSetMaxWidth true', function() {

            chart.maxWidth(300);
            var result = chart.width(123, true);

            expect(chart.maxWidth()).toBe(300);
            expect(result).toBe(chart);
        });

        it('setting maxWidth doesn\'t set width', function() {

            chart.width(250);
            var result = chart.maxWidth(450);

            expect(chart.width()).toBe(250);
            expect(result).toBe(chart);
        });

        it('height', function() {

            var result = chart.height(500);

            expect(chart.height()).toBe(500);
            expect(result).toBe(chart);
        });

        it('margin', function() {

            var result = chart.margin({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });

            expect(chart.margin()).toEqual({
                top: 1,
                left: 2,
                right: 3,
                bottom: 4
            });
            expect(result).toBe(chart);
        });

        it('series', function() {

            var s = {};
            var result = chart.series(s);

            expect(chart.series()).toBe(s);
            expect(result).toBe(chart);
        });

        it('autoMargin', function() {

            var result = chart.autoMargin(true);

            expect(chart.autoMargin()).toBe(true);
            expect(result).toBe(chart);
        });

    });

    describe('addAxis', function() {

        it('adds to axes', function() {

            var chart = new insight.Chart();

            expect(chart.xAxes()).toEqual([]);

            var a = {};

            chart.addXAxis(a);

            expect(chart.xAxes()[0]).toBe(a);

        });

    });

    describe('init', function() {

        describe('with no arguments', function() {
            var chart, reald3;

            var testInit = function(setup) {

                if(arguments.length){
                    setup();
                }
                
                d3 = new D3Mocks();

                // prevent calling through to functions that are not being tested
                spyOn(chart, 'calculateLabelMargin');
                spyOn(chart, 'draw').andCallThrough();
                spyOn(chart, 'addClipPath').andCallThrough();
                spyOn(insight.Utils, 'getElementStyles').andReturn({});

                chart.draw();
            };

            beforeEach(function(){

                reald3 = d3;  

                chart = new insight.Chart('ChartName');                

            });

            afterEach(function() {

                d3 = reald3;

            });

            describe('sets chart div', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['div'].attrs['class']).toEqual(insight.Constants.ContainerClass);

                });

                it('position', function() {

                    testInit();

                    expect(d3.elements['div'].styles['position']).toEqual('relative');

                });

                it('display', function() {

                    testInit();

                    expect(d3.elements['div'].styles['display']).toEqual('inline-block');

                });

            });

            describe('sets chart svg', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['svg'].attrs['class']).toEqual(insight.Constants.ChartSVG);

                });

            });

            describe('sets chart g', function() {

                it('class', function() {

                    testInit();

                    expect(d3.elements['g'].attrs['class']).toEqual(insight.Constants.PlotArea);

                });

            });

            describe('calls', function() {

                it('addClipPath', function() {

                    testInit();

                    expect(chart.addClipPath).toHaveBeenCalled();

                });

                it('draw', function() {

                    testInit();

                    expect(chart.draw).toHaveBeenCalledWith();

                });
               

            });
        });
    });

    describe('autosize margins', function() {

        var chart,
            xAxis,
            yAxis,
            textElement,
            styles,
            measurer,
            minimalMargins = 10;

        //Set up tests
        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');
            measurer = new insight.MarginMeasurer();
            xAxis = new insight.Axis('', insight.Scales.Linear);
            yAxis = new insight.Axis('', insight.Scales.Linear);

            styles = {'font-size': '10px', 'font-family': 'Helvetica', 'line-height': '18px'};

            chart.addXAxis(xAxis);
            chart.addYAxis(yAxis);

        });

        it('margins are set to minimal value when no series on chart', function() {
            //Given:
            chart.series([]);
            
            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });
        });

        it('margins are set to minimal value when series has no data', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 0,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 0
            };
            
            chart.series([series]);

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });

        it('bottom margins are expanded when x-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 15,
                    "maxValueWidth": 0,
                    "maxKeyHeight": 20,
                    "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":20
            });

        });

        it('left margins are expanded when y-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var expectedDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 15,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 20
                };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":15,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });

        it('right margins are expanded when y-axis is reversed', function() {
            //Given:
            yAxis = new insight.Axis('', insight.Scales.Linear).hasReversedPosition(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);
            
            var maxDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 15,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 20
                };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(maxDimensions);

            chart.series([series]);
            chart.yAxis(yAxis);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":15,
                "bottom":minimalMargins
            });
        });

        it('top margins are expanded when x-axis is reversed', function() {
            //Given:
            xAxis = new insight.Axis('', insight.Scales.Linear).hasReversedPosition(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);

            var maxDimensions = {
                "maxKeyWidth": 15,
                "maxValueWidth":0,
                "maxKeyHeight": 20,
                "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(maxDimensions);


            chart.series([series]);
            chart.xAxis(xAxis);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":20,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });
        });

        it('margins are not expanded for margins smaller than minimal value', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis);

            var expectedDimensions = {
                "maxKeyWidth": 5,
                "maxValueWidth": 0,
                "maxKeyHeight": 8,
                "maxValueHeight": 0
            };

            spyOn(measurer, 'seriesLabelDimensions').andReturn(expectedDimensions);

            chart.series([series]);

            //When:
            chart.calculateLabelMargin(measurer, styles);

            //Then:
            expect(chart.margin()).toEqual({
                "top":minimalMargins,
                "left":minimalMargins,
                "right":minimalMargins,
                "bottom":minimalMargins
            });

        });
    });

    describe('xAxis', function() {
        it("returns empty array when no axis set", function () {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');

            //When:
            var axes = chart.xAxes();

            //Then:
            expect(axes).toEqual([]);
        });

        it("Adding x-axis adds to the axis array", function () {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxis(xAxis);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it("Adding x-axis twice only adds to the axis array once", function () {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxis(xAxis);
            chart.xAxis(xAxis);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it("Adding x-axes adds to the axis array", function () {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxes([xAxis]);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it("Adding x-axes twice only adds to the axis array once", function () {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var xAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.xAxes([xAxis]);
            chart.xAxes([xAxis]);

            //Then:
            expect(chart.xAxes()).toEqual([xAxis]);
        });

        it('Adding x-axis updates axis direction to "h"', function() {

            //Given:
            var chart = new insight.Chart('somename', 'somelement', 'ada');
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            // When
            chart.xAxis(axis);
            var observedResult = axis.direction;

            //Then:
            expect(observedResult).toBe('h');

        });
    });

    describe('yAxis', function() {

        it("Adding y-axis adds to the axis array", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var yAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.yAxis(yAxis);

            //Then:
            expect(chart.yAxes()).toEqual([yAxis]);
        });

        it("Adding y-axis twice only adds to the axis array once", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var yAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.yAxis(yAxis);
            chart.yAxis(yAxis);

            //Then:
            expect(chart.yAxes()).toEqual([yAxis]);
        });

        it("Adding y-axes adds to the axis array", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var yAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.yAxes([yAxis]);

            //Then:
            expect(chart.yAxes()).toEqual([yAxis]);
        });

        it("Adding y-axes twice only adds to the axis array once", function() {
            //Given:
            var chart = new insight.Chart('asda', 'asdads', 'ada');
            var yAxis = new insight.Axis('', insight.Scales.Linear);

            //When:
            chart.yAxes([yAxis]);
            chart.yAxes([yAxis]);

            //Then:
            expect(chart.yAxes()).toEqual([yAxis]);
        });

        it('Adding y-axis updates axis direction to "v"', function() {

            //Given:
            var chart = new insight.Chart('somename', 'somelement', 'ada');
            var axis = new insight.Axis('Value Axis', insight.Scales.Linear);

            // When
            chart.yAxis(axis);
            var observedResult = axis.direction;

            //Then:
            expect(observedResult).toBe('v');
        });
    });

    describe('resizeWidth', function() {

        var chart, element;

        beforeEach(function() {

            spyOn(insight.Utils, 'getElementStyles').andReturn({});

            element = document.createElement('div');
            element.id = 'testElement';
            document.body.appendChild(element);

            chart = new insight.Chart('name', '#testElement');
            chart.draw();

            spyOn(chart, 'resizeChart');
            spyOn(chart, 'draw');
        });

        afterEach(function() {

            element.parentNode.removeChild(element);

        });

        it('sets width if less than current width and greater than minimum width', function() {

            // Arrange
            chart.width(750);
            chart.minWidth(150);

            // Act
            chart.resizeWidth(200);

            // Assert
            expect(chart.width()).toBe(200);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width to minimum if less than current width and less than minimum width', function() {

            // Arrange
            chart.width(750);
            chart.minWidth(150);

            // Act
            chart.resizeWidth(10);

            // Assert
            expect(chart.width()).toBe(150);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width if greater than current width and less than maximum width', function() {

            // Arrange
            chart.width(180);
            chart.maxWidth(800);

            // Act
            chart.resizeWidth(300);

            // Assert
            expect(chart.width()).toBe(300);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('sets width to maximum if greater than current width and greater than maximum width', function() {

            // Arrange
            chart.width(100);
            chart.maxWidth(150);

            // Act
            chart.resizeWidth(360);

            // Assert
            expect(chart.width()).toBe(150);
            expect(chart.draw).toHaveBeenCalled();

        });

        it('doesn\'t resize or redraw if chart width is minimum and greater than window width', function() {

            // Arrange
            chart.width(100);
            chart.minWidth(100);

            // Act
            chart.resizeWidth(50);

            // Assert
            expect(chart.width()).toBe(100);
            expect(chart.draw).not.toHaveBeenCalled();

        });

        it('doesn\'t resize or redraw if chart width is maximum and less than window width', function() {

            // Arrange
            chart.width(120);
            chart.maxWidth(120);

            // Act
            chart.resizeWidth(500);

            // Assert
            expect(chart.width()).toBe(120);
            expect(chart.draw).not.toHaveBeenCalled();

        });

    });

    describe('calculatePlotAreaSize', function() {
        var chart,
            dataSet;

        beforeEach(function() {
            var data = [
                { key:'a', value:0,  date: new Date(2014, 0,  1) },
                { key:'b', value:3,  date: new Date(2014, 0,  3) },
                { key:'c', value:12, date: new Date(2014, 0,  2) },
                { key:'d', value:20, date: new Date(2014, 0, 14) },
                { key:'e', value:13, date: new Date(2013, 4, 15) }
            ];

            dataSet = new insight.DataSet(data);

            chart = new insight.Chart('test', '#test', 'ada')
                .width(300)
                .height(400);
        });

        describe('for a vertical column series', function() {

            beforeEach(function() {
                var x = new insight.Axis('Key Axis', insight.Scales.Ordinal);
                var y = new insight.Axis('Value Axis', insight.Scales.Linear);
                chart.addXAxis(x);
                chart.addYAxis(y);

                var series = new insight.ColumnSeries('chart', dataSet, x, y);
            });

            it('calculates bounds with zero margin', function () {

                //Given:
                chart.margin({top: 0, left: 0, right: 0, bottom: 0});

                //When:
                var plotSizeResult = chart.calculatePlotAreaSize();
                var expectedResult = [300, 400];

                //Then:
                expect(plotSizeResult).toEqual(expectedResult);
            });

            it('calculates bounds with a margin', function () {

                //Given:
                chart.margin({top: 50, left: 0, right: 0, bottom: 100});

                //When:
                var plotSizeResult = chart.calculatePlotAreaSize();
                var expectedResult = [300, 250];

                //Then:
                expect(plotSizeResult).toEqual(expectedResult);
            });
        });

        describe('for a horizontal row series', function() {

            beforeEach(function() {
                var x = new insight.Axis('Key Axis', insight.Scales.Linear);
                var y = new insight.Axis('Value Axis', insight.Scales.Ordinal);
                chart.addXAxis(x);
                chart.addYAxis(y);

                var series = new insight.RowSeries('chart', dataSet, x, y);
            });

            it('calculates bounds with no margin', function () {

                //Given:
                chart.margin({top: 0, left: 0, right: 0, bottom: 0});

                //When:
                var plotSizeResult = chart.calculatePlotAreaSize();
                var expectedResult = [300, 400];

                //Then:
                expect(plotSizeResult).toEqual(expectedResult);
            });

            it('calculates bounds with a margin', function () {

                //Given:
                chart.margin({top: 0, left: 100, right: 10, bottom: 0});

                //When:
                var plotSizeResult = chart.calculatePlotAreaSize();
                var expectedResult = [190, 400];

                //Then:
                expect(plotSizeResult).toEqual(expectedResult);
            });
        });

    });
});
