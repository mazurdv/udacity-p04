'use strict';


// This is not a normal require, because our gulp-help tool (which provides the
// nice task descriptions on the command-line) requires changing the function
// signature of gulp tasks to include the task description.
var gulp = require('gulp-help')(require('gulp'));

// Gulp / Node utilities
var u = require('gulp-util');
var log = u.log;
var c = u.colors;
var del = require('del');
var spawn = require('child_process').spawn;
var sequence = require('run-sequence');

// Basic workflow plugins
var prefix = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var bs = require('browser-sync');
var reload = bs.reload;

// Performance workflow plugins
var concat = require('gulp-concat');
var mincss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var uncss = require('gulp-uncss');
var uglify = require('gulp-uglify');
var critical = require('critical');

// Performance testing plugins
var psi = require('psi');
var ngrok = require('ngrok');

// -----------------------------------------------------------------------------
// Performance test: PageSpeed Insights
//
// Initializes a public tunnel so the PageSpeed service can access your local
// site, then it tests the site. This task outputs the standard PageSpeed results.
//
// The task will output a standard exit code based on the result of the PSI test
// results. 0 is success and any other number is a failure. To learn more about
// bash-compatible exit status codes read this page:
//
// http://tldp.org/LDP/abs/html/exit-status.html
// -----------------------------------------------------------------------------
gulp.task('psi', 'Performance: PageSpeed Insights', function() {
    // Set up a public tunnel so PageSpeed can see the local site.
    return ngrok.connect(8080, function (err_ngrok, url) {
        log(c.cyan('ngrok'), '- serving your site from', c.yellow(url));

        // Run PageSpeed once the tunnel is up.
        psi.output(url, {
            strategy: 'mobile',
            threshold: 80
        }, function (err_psi, data) {
            // Log any potential errors and return a FAILURE.
            if (err_psi) {
                log(err_psi);
                process.exit(1);
            }

            // Kill the ngrok tunnel and return SUCCESS.
            process.exit(0);
        });
    });
});

// -----------------------------------------------------------------------------
// Minify SVGs and compress images
//
// It's good to maintain high-quality, uncompressed assets in your codebase.
// However, it's not always appropriate to serve such high-bandwidth assets to
// users, in order to reduce mobile data plan usage.
// -----------------------------------------------------------------------------
gulp.task('imagemin', 'Minifies and compresses images on the example site', function() {
    return gulp.src('views/_images/**/*')
        .on('data', function(file){
            console.log(file.path);
        })
        .pipe(imagemin({
            progressive: true,
            optimizationLevel: 7,
        }))
        .pipe(gulp.dest('views/images'));
});

var imageResize = require('gulp-image-resize');

gulp.task('resize', 'Resize images', function () {
    gulp.src('views/_images/**/*')
        .pipe(imageResize({
            width : 100,
            height : 75,
            crop : true,
            upscale : false
        }))
        .pipe(gulp.dest('views/images'));
});