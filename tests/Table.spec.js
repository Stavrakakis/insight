var tableData = 
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


describe('Table Tests', function() {
    var group,
        dataset,
        table;

    beforeEach(function() {
        
        group = new insight.ChartGroup();

        dataset = new insight.DataSet(tableData);

        table = new insight.Table('Test Table', '#table', dataset);
        
        group.addTable(table);
    })


    it('returns normal dataset with no sorters', function() {

        // When
        group.addTable(group);

        // Then

        var expectedDataset = tableData;
        var actualDataset = table.dataset();

        expect(actualDataset).toBe(expectedDataset);

    });

    it('returns a full, sorted set of data', function() {
        
        
        // When

        table.ascending(function(person){ return person.Age; });


        // Then

        var actualAges = table.dataset().map(function(entry){return entry.Age; });
        var expectedAges = [1, 2, 3, 4, 5, 5, 6, 7, 7, 7, 10, 11, 12, 14, 16, 18, 18, 19, 20, 20];
        
        expect(actualAges).toEqual(expectedAges);        
    });

    it('returns a full, sorted set of data with two ascending sorts', function() {
        
        // When

        table.ascending(function(person) { return person.Age; })
             .ascending(function(person) { return person.IQ; });

        // Then

        var actualAges = table.dataset().map(function(entry){return entry.Age; });
        var actualIQs = table.dataset().map(function(entry){return entry.IQ; });
        
        var expectedAges = [1, 2, 3, 4, 5, 5, 6, 7, 7, 7, 10, 11, 12, 14, 16, 18, 18, 19, 20, 20];
        var expectedIQs = [69, 70, 96, 87, 85, 105, 60, 51, 86, 106, 100, 98, 96, 71, 55, 53, 63, 69, 93, 103];
        
        expect(actualAges).toEqual(expectedAges);  
        expect(expectedIQs).toEqual(expectedIQs);  
    });

    it('returns a full, sorted set of data with two different ordered sorts', function() {
        
        // When

        table.ascending(function(person) { return person.Age; })
             .descending(function(person) { return person.IQ; });

        // Then

        var actualAges = table.dataset().map(function(entry){return entry.Age; });
        var actualIQs = table.dataset().map(function(entry){return entry.IQ; });
        
        var expectedAges = [1, 2, 3, 4, 5, 5, 6, 7, 7, 7, 10, 11, 12, 14, 16, 18, 18, 19, 20, 20];
        var expectedIQs =[69, 70, 96, 87, 105, 85, 60, 106, 86, 51, 100, 98, 96, 71, 55, 63, 53, 69, 103, 93];

        expect(actualAges).toEqual(expectedAges);  
        expect(expectedIQs).toEqual(expectedIQs);
    });

    it('returns a truncated, sorted set of data with two sorts', function() {

        // When

        table.ascending(function(person) { return person.Age; })
             .descending(function(person) { return person.IQ; })
             .top(5);

        // Then
        
        var actualAges = table.dataset().map(function(entry){return entry.Age; });
        var actualIQs = table.dataset().map(function(entry){return entry.IQ; });

        var expectedAges = [1, 2, 3, 4, 5] ;
        var expectedIQs = [69, 70, 96, 87, 105];
        
        expect(actualAges).toEqual(expectedAges);  
        expect(expectedIQs).toEqual(expectedIQs);
    });


});