const gulp        = require('gulp');
const gulpLoadPlugins  = require('gulp-load-plugins');
const plugins = gulpLoadPlugins()
const NwBuilder   = require('nw-builder');

const appDirectory = './app';


gulp.task('copy', gulp.series(function(done) {
    gulp.src([
        './package.json',
        './index.html',
        './script.js',
        './node_modules/clippy.js/build/clippy.css',
        './style.css'
    ])
        .pipe(gulp.dest(appDirectory))
        .on('end', done);
}));

gulp.task('third-party-scripts', gulp.series(function(done) {
    gulp.src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/clippy.js/build/clippy.js'
    ])
        .pipe(plugins.concat('third-party.js'))
        .pipe(gulp.dest(appDirectory))
    .on('end', done);
}));


const zip = function(directoryName, callback) {
    gulp.src(`./dist/clippy.desktop/${directoryName}/**/*`)
        .pipe(plugins.zip(`clippy.desktop-${directoryName}.zip`))
        .pipe(gulp.dest('./dist'))
        .on('end', callback);
};

gulp.task('compile', gulp.series('copy', 'third-party-scripts'));

gulp.task('build', gulp.series('compile', () => new NwBuilder({
    appName: 'clippy.desktop',
    files: ['./app/**/*'],
    platforms: ['osx32', 'osx64', 'win32', 'win64', 'linux32', 'linux64'],
    version: '0.12.3',
    buildDir: 'dist'
}).build()));


gulp.task('zip-win32', gulp.series('build', done => zip('win32', done)));
gulp.task('zip-win64', gulp.series('build', done => zip('win64', done)));
gulp.task('zip-osx32', gulp.series('build', done => zip('osx32', done)));
gulp.task('zip-osx64', gulp.series('build', done => zip('osx64', done)));
gulp.task('zip-linux32', gulp.series('build', done => zip('linux32', done)));
gulp.task('zip-linux64', gulp.series('build', done => zip('linux64', done)));

gulp.task('release', gulp.series('zip-win32', 'zip-win64', 'zip-osx32', 'zip-osx64', 'zip-linux32', 'zip-linux64'));


gulp.task('default', gulp.series('release'));
