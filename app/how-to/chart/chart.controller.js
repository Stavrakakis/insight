(function()
{
    'use strict';

    function ChartController ($scope, $location, $anchorScroll, $timeout) {
        $scope.$parent.title = 'How To Guides For Charts';

        $scope.scrollTo = function (id) {
            $location.hash(id);
            $anchorScroll();
        };

        // to-do think of a better way - maybe find last loading element?
        $timeout(function(){
            Prism.highlightAll();
        }, 200);
    }


    angular.module('insightChartsControllers').controller('HowToChartController', ['$scope', '$location', '$anchorScroll', '$timeout', ChartController]);
}());