describe('Chart Group Tests', function() {

    var sourceData = 
        [{'Id':1,'Forename':'Martin','Surname':'Watkins','Country':'Scotland','DisplayColour':'#38d33c','Age':1,'IQ':69,'Gender':'Male','Interests':['Ballet', 'Music', 'Climbing'],},
        {'Id':2,'Forename':'Teresa','Surname':'Knight','Country':'Scotland','DisplayColour':'#6ee688','Age':20,'IQ':103,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':3,'Forename':'Mary','Surname':'Lee','Country':'Wales','DisplayColour':'#8e6bc2','Age':3,'IQ':96,'Interests':['Triathlon', 'Music', 'Mountain Biking'],'Gender':'Female'},
        {'Id':4,'Forename':'Sandra','Surname':'Harrison','Country':'Northern Ireland','DisplayColour':'#02acd0','Age':16,'IQ':55, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':5,'Forename':'Frank','Surname':'Cox','Country':'England','DisplayColour':'#0b281c','Age':5,'IQ':105,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':6,'Forename':'Mary','Surname':'Jenkins','Country':'England','DisplayColour':'#5908e3','Age':19,'IQ':69,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':7,'Forename':'Earl','Surname':'Stone','Country':'Wales','DisplayColour':'#672542','Age':6,'IQ':60,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Male'},
        {'Id':8,'Forename':'Ashley','Surname':'Carr','Country':'England','DisplayColour':'#f9874f','Age':18,'IQ':63,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':9,'Forename':'Judy','Surname':'Mcdonald','Country':'Northern Ireland','DisplayColour':'#3ab1a8','Age':2,'IQ':70,'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':10,'Forename':'Earl','Surname':'Flores','Country':'England','DisplayColour':'#1be47c','Age':20,'IQ':93,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':11,'Forename':'Terry','Surname':'Wheeler','Country':'Wales','DisplayColour':'#2cd57b','Age':4,'IQ':87,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':12,'Forename':'Willie','Surname':'Reid','Country':'Northern Ireland','DisplayColour':'#7fcf1e','Age':7,'IQ':86,'Interests':['Climbing', 'Boxing'], 'Gender':'Male'},
        {'Id':13,'Forename':'Deborah','Surname':'Palmer','Country':'Northern Ireland','DisplayColour':'#9fd1d5','Age':5,'IQ':85,'Interests':['Climbing', 'Boxing'], 'Gender':'Female'},
        {'Id':14,'Forename':'Annie','Surname':'Jordan','Country':'England','DisplayColour':'#8f4fd1','Age':10,'IQ':100, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':15,'Forename':'Craig','Surname':'Gibson','Country':'England','DisplayColour':'#111ab4','Age':7,'IQ':106,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':16,'Forename':'Lisa','Surname':'Parker','Country':'England','DisplayColour':'#52d5cf','Age':18,'IQ':53,'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Female'},
        {'Id':17,'Forename':'Samuel','Surname':'Willis','Country':'Wales','DisplayColour':'#e2f6cc','Age':11,'IQ':98, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':18,'Forename':'Lisa','Surname':'Chapman','Country':'Northern Ireland','DisplayColour':'#1c5829','Age':7,'IQ':51, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'},
        {'Id':19,'Forename':'Ryan','Surname':'Freeman','Country':'Scotland','DisplayColour':'#6cbc04','Age':12,'IQ':96, 'Interests':['Football', 'Music', 'Kayaking'], 'Gender':'Male'},
        {'Id':20,'Forename':'Frances','Surname':'Lawson','Country':'Northern Ireland','DisplayColour':'#e739c9','Age':14,'IQ':71, 'Interests':['Triathlon', 'Music', 'Mountain Biking'], 'Gender':'Female'}];
   


    var chart,
        table,
        div = document.createElement('div'),
        dataset,
        chartGroup;

    div.id  = 'testChart';

    var createChartElement = function(){

        document.body.appendChild(div);
    };

    var removeChartElement = function(){
        document.body.removeChild(div);
    };

    beforeEach(function() {

        createChartElement();
        dataset = new insight.DataSet(sourceData);
        chartGroup = new insight.ChartGroup();
        
    });

    afterEach(function() {
        removeChartElement();
    });


    it('initializes correctly', function() {
        var expectedDimensions = [],
            expectingGroupings = [],
            expectedFilteredDims = [],
            expectedDimMap = {},
            expectedCharts = [],
            expectedTables = [];

        expect(chartGroup.dimensions).toEqual(expectedDimensions);
        expect(chartGroup.groupings).toEqual(expectingGroupings);
        expect(chartGroup.filteredDimensions).toEqual(expectedFilteredDims);
        expect(chartGroup.dimensionListenerMap).toEqual(expectedDimMap);
        expect(chartGroup.tables).toEqual(expectedTables);
        expect(chartGroup.charts).toEqual(expectedCharts);
    });


    it('can add a chart with no series', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        // When

        chartGroup.add(chart);

        // Then 
        var expectedChartList = [chart];
        var actualChartList = chartGroup.charts;

        var expectedTableList = [];
        var actualTableList = chartGroup.tables;

        expect(actualChartList).toEqual(expectedChartList);
        expect(actualTableList).toEqual(expectedTableList);
    });

    it('can add a table with no series', function() {
        
        // Given

        table = new insight.Table('testTable', '#testChart');

        // When

        chartGroup.add(table);

        // Then 
        var expectedTableList = [table];
        var actualTableList = chartGroup.tables;

        var expectedChartList = [];
        var actualChartList = chartGroup.charts;

        expect(actualTableList).toEqual(expectedTableList);
        expect(actualChartList).toEqual(expectedChartList);
    });

    it('can add a chart with a series', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});

        chart.series([series]);

        // When

        chartGroup.add(chart);

        chartGroup.draw();

        // Then 
        var expectedChartList = [chart];
        var actualChartList = chartGroup.charts;

        var expectedDimensionList = [countries.dimension];
        var actualDimensionList = chartGroup.dimensions;

        var expectedGroupingList = [countries];
        var actualGroupingList = [countries];

        var expectedDimensionMap = {'country': [chart]};        
        var actualDimensionMap = chartGroup.dimensionListenerMap;

        expect(actualChartList).toEqual(expectedChartList);
        expect(actualDimensionList).toEqual(expectedDimensionList);
        expect(actualGroupingList).toEqual(expectedGroupingList);
        expect(actualDimensionMap).toEqual(expectedDimensionMap);
    });

    it('adding multiple series doesnt duplicate dimensions and groupings', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        var series2 = new insight.ColumnSeries('columns2', countries, x, y, 'red')
                                .valueFunction(function(d){return d.value.Count + 1;});
        
        chart.series([series, series2]);

        // When

        chartGroup.add(chart);

        // Then 
        var expectedChartList = [chart];
        var actualChartList = chartGroup.charts;

        var expectedDimensionList = [countries.dimension];
        var actualDimensionList = chartGroup.dimensions;

        var expectedGroupingList = [countries];
        var actualGroupingList = [countries];

        expect(actualChartList).toEqual(expectedChartList);
        expect(actualDimensionList).toEqual(expectedDimensionList);
        expect(actualGroupingList).toEqual(expectedGroupingList);
    });

    it('drawing a ChartGroup initializes a single chart', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart.series([series]);

        // spy on the initialization of the chart, to make sure it's called
        spyOn(chart, 'init');

        // When


        chartGroup.add(chart);
        chartGroup.draw();

        // Then
        expect(chart.init).toHaveBeenCalled();

    });

    it('redrawing a ChartGroup redraws a single chart', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart.series([series]);

        // spy on the initialization of the chart, to make sure it's called
        spyOn(chart, 'init');
        spyOn(chart, 'draw');

        // When

        chartGroup.add(chart);
        chartGroup.draw();
        
        chartGroup.redraw();

        // Then

        var expectedDrawCalls = 1;
        var actualDrawCalls = chart.draw.calls.length;
        
        expect(chart.init).toHaveBeenCalled();
        expect(actualDrawCalls).toEqual(expectedDrawCalls);

    });

    it('drawing a ChartGroup initializes multiple charts', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart.series([series]);


        // second chart

        var chart2 = new insight.Chart('AnotherChart', '#testChart2');
        var x2 = new insight.Axis('Country', insight.Scales.Ordinal);
        var y2 = new insight.Axis('Values', insight.Scales.Linear);
        
        chart2.xAxis(x2);
        chart2.yAxis(y2);

        var series2 = new insight.ColumnSeries('columns', countries, x2, y2, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart2.series([series2]);

        // spy on the initialization of the chart, to make sure it's called
        spyOn(chart, 'init');
        spyOn(chart2, 'init');

        // When

        chartGroup.add(chart);
        chartGroup.add(chart2);

        chartGroup.draw();

        // Then

        var expectedDimensionMap = {'country': [chart, chart2]};        
        var actualDimensionMap = chartGroup.dimensionListenerMap;

        expect(chart.init).toHaveBeenCalled();
        expect(chart2.init).toHaveBeenCalled();
        expect(actualDimensionMap).toEqual(expectedDimensionMap);

    });

    it('redrawing a ChartGroup redraws charts and tables', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart.series([series]);

        // table

        table = new insight.Table('testTable', '#testChart', countries);        


        // spy on the initialization of the chart, to make sure it's called
        spyOn(chart, 'init');
        spyOn(chart, 'draw');
        spyOn(table, 'draw');

        // When

        chartGroup.add(chart);
        chartGroup.add(table);
        chartGroup.draw();
        
        chartGroup.redraw();        

        // Then

        var expectedDimensionMap = {'country': [chart, table]};        
        var actualDimensionMap = chartGroup.dimensionListenerMap;

        var expectedTableDrawCalls = 2;

        expect(actualDimensionMap).toEqual(expectedDimensionMap);

        expect(chart.init).toHaveBeenCalled();
        expect(table.draw).toHaveBeenCalled();
        expect(table.draw.calls.length).toEqual(expectedTableDrawCalls);

    });


    it('triggering a chart filter is handled', function() {
        
        // Given

        chart = new insight.Chart('testChart', '#testChart');

        var countries =  dataset.group('country', function(d){return d.Country;});

        var x = new insight.Axis('Country', insight.Scales.Ordinal);
        var y = new insight.Axis('Values', insight.Scales.Linear);
        
        chart.xAxis(x);
        chart.yAxis(y);

        var series = new insight.ColumnSeries('columns', countries, x, y, 'blue')
                                .valueFunction(function(d){return d.value.Count;});
        
        chart.series([series]);

        // table

        table = new insight.Table('testTable', '#testChart', countries);        


        // spy on the initialization of the chart, to make sure it's called
        spyOn(chart, 'init');
        spyOn(chart, 'draw');
        spyOn(chartGroup, 'redraw');
        spyOn(table, 'draw');
        spyOn(countries, 'recalculate');
        spyOn(countries.dimension, 'createFilterFunction').andCallThrough();
        spyOn(chart, 'highlight');
        spyOn(table, 'highlight');

        // When

        chartGroup.add(chart);
        chartGroup.add(table);
        chartGroup.draw();
        
        // filter the data set
        var filterValue = {key: 'England', value: {}};
        
        chartGroup.chartFilterHandler(series, filterValue, 'in_England');


        // Then
        var expectedGroupingList = [countries];
        var actualGroupingList = chartGroup.groupings;

        expect(actualGroupingList).toEqual(actualGroupingList);

        expect(countries.dimension.createFilterFunction).toHaveBeenCalled();
        expect(countries.recalculate).toHaveBeenCalled();
        expect(chart.highlight).toHaveBeenCalled();
        expect(chartGroup.redraw).toHaveBeenCalled();
        expect(table.highlight).toHaveBeenCalled();
    });

});