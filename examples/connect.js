$(document)
    .ready(function()
    {

        d3.json('datasets/appstore.json', function(data)
        {
            data.forEach(function(d)
            {
                d.releaseDate = new Date(d.releaseDate);
            });

            var chartGroup = new insight.ChartGroup();

            var dataset = new insight.DataSet(data);

            var genres = dataset.group('genre', function(d)
                {
                    return d.primaryGenreName;
                })
                .count(['supportedDevices']);

            var languageGroup = dataset.group('languages', function(d)
                {
                    return d.languageCodesISO2A;
                }, true)
                .count(['languageCodesISO2A']);

            var chart = new insight.Chart('Chart 1', '#genreCount')
                .width(800)
                .height(350);

            var xScale = new insight.Axis('Genre', insight.Scales.Ordinal)
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var yScale = new insight.Axis('Apps', insight.Scales.Linear)
                .tickSize(5);

            chart.xAxis(xScale);
            chart.yAxis(yScale);

            var series = new insight.ColumnSeries('genre', genres, xScale, yScale, '#ACC3EE')
                .valueFunction(function(d)
                {
                    return d.value.Count;
                })
                .tooltipFormat(function(value)
                {
                    return value + " Apps";
                })
                .top(10);

            chart.series([series]);

            var languageChart = new insight.Chart('Chart 2', '#languages')
                .width(1200)
                .height(400);

            var lxScale = new insight.Axis('Language', insight.Scales.Ordinal)
                .tickSize(5)
                .tickPadding(0)
                .tickOrientation('tb')
                .ordered(true);

            var lyScale = new insight.Axis('AppsSupported', insight.Scales.Linear);

            languageChart.xAxis(lxScale);
            languageChart.yAxis(lyScale);

            var lSeries = new insight.ColumnSeries('languages', languageGroup, lxScale, lyScale, '#ACC3EE')
                .valueFunction(function(d)
                {
                    return d.value;
                })
                .top(10);

            languageChart.series([lSeries]);

            chartGroup.add(chart)
                .add(languageChart);

            chartGroup.draw();
        });
    });
