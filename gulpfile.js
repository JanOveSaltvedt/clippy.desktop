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
        './clippy.css',
        './node_modules/clippy.js/agents/**/*',
        './style.css'
    ])
        .pipe(gulp.dest(appDirectory))
        .on('end', done);
}));

gulp.task('third-party-scripts', gulp.series(function(done) {
    gulp.src([
        './node_modules/jquery/dist/jquery.js',
        './node_modules/clippy.js/build/clippy.js',
        './node_modules/socket.io-client/dist/socket.io.js'
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


gulp.task('zip-linux64', gulp.series('build', done => zip('linux64', done)));

gulp.task('release', gulp.series('zip-linux64'));


gulp.task('default', gulp.series('release'));
