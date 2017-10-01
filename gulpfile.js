const gulp = require('gulp');
const git = require('gulp-git');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const useref = require('gulp-useref');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const uglifyCss = require('gulp-uglifycss')
const gulpIf = require('gulp-if');
const minifyCss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');

// Compile Sass & Inject Into Browser
gulp.task('sass', function(){
  return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss','app/scss/*.scss'])
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({stream: true}));
});

// Move JS Files to app/js
gulp.task('js', function() {
    return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js', 'node_modules/jquery/dist/jquery.min.js','node_modules/popper.js/dist/umd/popper.min.js'])
        .pipe(gulp.dest("app/js"))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('concat-min-js', function() {
  return gulp.src('app/js/*.js')
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'));
});

gulp.task('concat-min-css', function() {
  return gulp.src('app/css/*.css')
  .pipe(concat('main.min.css'))
  .pipe(uglifyCss())
  .pipe(gulp.dest('dist/css'));
});

gulp.task('concat-min', ['concat-min-js', 'concat-min-css']);

// Minify js and css files
gulp.task('useRef', function() {
  return gulp.src('app/*.html')
    .pipe(useref())
    // .pipe(gulpIf('*.js', uglify()))
    // .pipe(gulpIf('*.css', minifyCss()))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', ['concat-min', 'useRef']);

gulp.task('useref', function(){
  return gulp.src('app/*.html')
    .pipe(useref())
    // Minifies only if it's a JavaScript file
    .pipe(gulpIf('*.js', uglify()))
    // Minifies only if it's a css file
    .pipe(gulpIf('*.css', uglifyCss()))
    .pipe(gulp.dest('dist'))
});

gulp.task('images', function() {
  return gulp.src('app/images/*.' + '(png|jpg|jpeg|gif|svg)')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/images'))
});

// Deploy to Heroku
gulp.task('deploy', function() {
  return git.push('heroku', 'master', function(err) {
     if(err) { console.log(err); throw err; }
  });
});

// Watch Sass & Server
gulp.task('server', ['sass'], function(){
  browserSync.init({
    server: "./app"
  });
});

gulp.task('watch', ['server', 'sass'], function() {
  gulp.watch('app/scss/*.scss',['sass'], browserSync.reload);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/*.js', browserSync.reload);
});

// Move Fonts Folder to app
gulp.task('fonts', function(){
  return gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest("app/fonts"));
});

// Move Fonts Awesome CSS to app/css
gulp.task('fa', function(){
  return gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest("app/css"));
});

//gulp.task('default', ['js', 'server', 'fa', 'fonts', 'useref', 'images']);
//gulp.task('default', ['js', 'fa', 'fonts', 'useref', 'images']);
