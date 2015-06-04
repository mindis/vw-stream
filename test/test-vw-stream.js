var Logger = require('..').Logger;
var VowpalWabbitStream = require('..').VowpalWabbitStream;

function assertEqualish(test, actual, expected, tol, message) {
    var checkedTol = (typeof(tol) == 'undefined') ? 0.01 : tol;
    if (Math.abs(actual - expected) > checkedTol) {
        test.fail(actual, expected, message, '==');
    }
    else {
        test.ok(true, message);  // for the expect(n) count
    }
}

exports.testOnePrediction = function(test) {
    test.expect(1);
    var vw = new VowpalWabbitStream();
    vw.on('data', function(predObj) {
        test.ok(predObj.pred >= 0);
        test.done();
    });

    vw.write({
        resp: 1.0,
        featMap: {
            foo: 123,
            bar: null
        }
    });
    vw.end();
};

var exDataRows = [
    { boxOffice: 85.09999847, prodCost: 8.5, promCost: 5.099999905, bookSales: 4.699999809 },
    { boxOffice: 106.3000031, prodCost: 12.89999962, promCost: 5.800000191, bookSales: 8.800000191 },
    { boxOffice: 50.20000076, prodCost: 5.199999809, promCost: 2.099999905, bookSales: 15.10000038 },
    { boxOffice: 130.6000061, prodCost: 10.69999981, promCost: 8.399998665, bookSales: 12.19999981 },
    { boxOffice: 54.79999924, prodCost: 3.099999905, promCost: 2.900000095, bookSales: 10.60000038 },
    { boxOffice: 30.29999924, prodCost: 3.5, promCost: 1.200000048, bookSales: 3.5 },
    { boxOffice: 79.40000153, prodCost: 9.199999809, promCost: 3.700000048, bookSales: 9.699999809 },
    { boxOffice: 91, prodCost: 9, promCost: 7.599999905, bookSales: 5.900000095 },
    { boxOffice: 135.3999939, prodCost: 15.10000038, promCost: 7.699999809, bookSales: 20.79999924 },
    { boxOffice: 89.30000305, prodCost: 10.19999981, promCost: 4.5, bookSales: 7.900000095 }
];

function getTestExamples() {
    var exs = [];
    for (var i=0; i < exDataRows.length; i++) {
        var exDataRow = exDataRows[i];
        var ex = { resp: exDataRow.boxOffice };
        var exFeatMap = exDataRow;
        delete exFeatMap.boxOffice;
        ex.featMap = exFeatMap;
        exs.push(ex);
    }
    return exs;
}

exports.testPrediction = function(test) {
    test.expect(1);

    var exs = getTestExamples();
    var vw = new VowpalWabbitStream();
    vw.on('data', function(predObj) {
        var ex = predObj.ex;
        Logger.debug("Prediction vs. actual box-office:", predObj.pred, predObj.ex.resp, vw.getAverageLoss());
        if (ex == exs[exs.length - 1]) {
            Logger.debug("Last one!");
            assertEqualish(test, vw.getAverageLoss(), 7906.92);
            test.done();
        }
    });

    for (var i=0; i < exs.length; i++) {
        vw.write(exs[i]);
    }
    vw.end();
};
