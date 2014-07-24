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
                spyOn(chart, 'draw');
                spyOn(chart, 'addClipPath');

                chart.init();
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

                    expect(chart.draw).toHaveBeenCalledWith(false);

                });

                it('initZoom if zoomable', function() {

                    testInit(function() {
                        var axis = new insight.Axis('', insight.Scales.Time);

                        chart.zoomable(axis);
                        spyOn(chart, 'initZoom');

                    });

                    expect(chart.initZoom).toHaveBeenCalled();

                });

                it('no initZoom if not zoomable', function() {

                    testInit(function() {

                        spyOn(chart, 'initZoom');

                    });

                    expect(chart.initZoom).not.toHaveBeenCalled();

                });

            });
        });
    });

    describe('autosize margins', function() {

        var chart;
        var xAxis;
        var yAxis;

        //Set up tests
        beforeEach(function() {
            chart = new insight.Chart('asda', 'asdads', 'ada');

            xAxis = new insight.Axis('', insight.Scales.Linear);
            yAxis = new insight.Axis('', insight.Scales.Linear);

            chart.addXAxis(xAxis);
            chart.addYAxis(yAxis);
        });

        it('margins are 0 when no series on chart', function() {
            //Given:
            chart.series([]);

            //When:
            chart.calculateLabelMargin();

            //Then:
            expect(chart.margin()).toEqual({"top":0,"left":0,"right":0,"bottom":0});
        });

        it('margins are 0 when series has no data', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis, 'silver');
            chart.series([series]);

            //When:
            chart.calculateLabelMargin();

            //Then:
            //15pts for the x-axis label height
            expect(chart.margin()).toEqual({"top":0, "left":0, "right":0, "bottom":0});

        });

        it('bottom margins are expanded when x-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis, 'silver');
            series.maxLabelDimensions = function() {
                return maxDimensions = {
                    "maxKeyWidth": 5,
                    "maxValueWidth": 0,
                    "maxKeyHeight": 10,
                    "maxValueHeight": 0
                };
            };

            chart.series([series]);

            //When:
            chart.calculateLabelMargin();

            //Then:
            expect(chart.margin()).toEqual({"top":0, "left":0, "right":0, "bottom":10});

        });

        it('left margins are expanded when y-axis has labels', function() {
            //Given:
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis, 'silver');
            series.maxLabelDimensions = function() {
                return maxDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 5,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 10
                };
            };

            chart.series([series]);

            //When:
            chart.calculateLabelMargin();

            //Then:
            expect(chart.margin()).toEqual({"top":0, "left":5, "right":0, "bottom":0});

        });

        it('right margins are expanded when y-axis is reversed', function() {
            //Given:
            yAxis = new insight.Axis('', insight.Scales.Linear).reversed(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis, 'silver');
            series.maxLabelDimensions = function() {
                return maxDimensions = {
                    "maxKeyWidth": 0,
                    "maxValueWidth": 5,
                    "maxKeyHeight": 0,
                    "maxValueHeight": 10
                };
            };

            chart.series([series]);
            chart.yAxis(yAxis);

            //When:
            chart.calculateLabelMargin();

            //Then:
            expect(chart.margin()).toEqual({"top":0, "left":0, "right":5, "bottom":0});
        });

        it('top margins are expanded when x-axis is reversed', function() {
            //Given:
            xAxis = new insight.Axis('', insight.Scales.Linear).reversed(true);
            var series = new insight.Series('testSeries', new insight.DataSet([]), xAxis, yAxis, 'silver');
            series.maxLabelDimensions = function() {
                return maxDimensions = {
                    "maxKeyWidth": 5,
                    "maxValueWidth":0,
                    "maxKeyHeight": 10,
                    "maxValueHeight": 0
                };
            };

            chart.series([series]);
            chart.xAxis(xAxis);

            //When:
            chart.calculateLabelMargin();

            //Then:
            expect(chart.margin()).toEqual({"top":10, "left":0, "right":0, "bottom":0});
        });
    });
});
