'use strict'

var gulp = require('gulp');
var webpack = require('gulp-webpack');

const path = './client_side_storage_examples/client.js';
const watchpath = './client_side_storage_examples/**/*.js'
const watchTypes = './client_side_storage_examples/types/**/*.js'
const destination = './client/'

// Places the client.js file transpiled from TypeScript into the client folder

gulp.task('client:script', () => {
    gulp.src(path)
            .pipe(gulp.dest('./client/'));
})

// Watches the result from the transpiled ts file

gulp.task('watch:client:script', () => {
    gulp.watch(watchpath, ['build:bundle'])
    gulp.watch(watchTypes, ['build:bundle']);
})


// Builds the file with the correct dependencies

gulp.task('build:bundle', () => {
    return gulp.src(path)
        .pipe (webpack(require('./webpack.config.js')))
        .pipe(gulp.dest(destination))
})
