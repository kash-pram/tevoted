// Karma configuration
// Generated on Mon Feb 08 2016 16:07:34 GMT-0800 (PST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine-jquery','jasmine'],


    // list of files / patterns to load in the browser
    files: [
        'bower_components/angular/angular.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'app/*.js',
        'bower_components/lodash/lodash.js',
        'app/components/**/*.js',
        'app/config/**/*.js',
        'tests/*.js',
        'tests/json/**.json',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/angular-animate/angular-animate.js',
        'bower_components/jquery/dist/jquery.js',
        'bower_components/Chart.js/Chart.js',
        'bower_components/angular-google-maps/dist/angular-google-maps.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/ngtoast/dist/ngToast.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.js',
        'bower_components/angular-smart-table/dist/smart-table.js',
        'bower_components/angular-bootstrap/ui-bootstrap.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'bower_components/moment/moment.js',
        'bower_components/angular-moment/angular-moment.js',
        'bower_components/angular-simple-logger/dist/angular-simple-logger.js',
        'bower_components/ng-csv/build/ng-csv.min.js',
        'bower_components/angular-chart.js/dist/angular-chart.js',
        'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js',
        'bower_components/ui-leaflet/dist/ui-leaflet.js',
        'bower_components/ngSweetAlert2/SweetAlert.js',
        'bower_components/angular-simple-rbac/dist/angular-simple-rbac.js',
        'bower_components/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
        'bower_components/d3/d3.js',
        'bower_components/nvd3/build/nv.d3.js',
        'bower_components/angular-nvd3/dist/angular-nvd3.js',
        'bower_components/sails.io.js/dist/sails.io.js',
        'bower_components/angular-sails/dist/angular-sails.js',
        'bower_components/gm.datepickerMultiSelect/src/gm.datepickerMultiSelect.js',
        'app/assets/js/custom-utils.js',
        'bower_components/angular-dragdrop/src/angular-dragdrop.min.js',
        'bower_components/jquery-ui/jquery-ui.min.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
