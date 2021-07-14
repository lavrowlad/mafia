const fs            = require('fs')
const { src, dest } = require('gulp');
const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
const fileInclude   = require('gulp-file-include');
const del           = require('del');
const scss          = require('gulp-sass');
const autoprefixer  = require('gulp-autoprefixer');
const groupMedia    = require('gulp-group-css-media-queries');
const cleanCss      = require('gulp-clean-css');
const rename        = require('gulp-rename');
const uglify        = require('gulp-uglify-es').default;
const imagemin      = require('gulp-imagemin');
const webp          = require('gulp-webp');
const webphtml      = require('gulp-webp-html');
const webpcss       = require('gulp-webp-css');
const svgSprite     = require('gulp-svg-sprite');
const ttf2woff      = require('gulp-ttf2woff');
const ttf2woff2     = require('gulp-ttf2woff2');
const fonter        = require('gulp-fonter');


const projectFolder = require('path').basename(__dirname);
const sourceFolder  = "src";
const path = {
  build: { 
    html:  projectFolder + "/",
    css:   projectFolder + "/css/",
    js:    projectFolder + "/js/",
    img:   projectFolder + "/img/",
    fonts: projectFolder + "/fonts"
  },
  src: {
    html:  [sourceFolder + "/*.html", "!" + sourceFolder + "/_*.html"],
    css:   sourceFolder + "/scss/index.scss",
    js:    sourceFolder + "/js/index.js",
    img:   sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
    fonts: sourceFolder + "/fonts/*.ttf"
  },
  watch: {
    html:  sourceFolder + "/**/*.html",
    css:   sourceFolder + "/scss/**/*.scss",
    js:    sourceFolder + "/js/**/*.js",
    img:   sourceFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}"
  },
  clean: "./" + projectFolder + "/"
}


/* Запуск проекта в браузере */
function BrowserSync(params) {
  browserSync.init({
    server: {
      baseDir: "./" + projectFolder + "/"
    },
    port: 3000,
    notify: false
  });
}

/* Сборка файлов (HTML, CSS/SCSS, JS, images, fonts) */
function Html () {
  return src( path.src.html )
    .pipe( fileInclude() )
    .pipe( webphtml() )
    .pipe( dest(path.build.html) )
    .pipe( browserSync.stream() );
}

function Css () {
  return src( path.src.css )
    .pipe( scss({
      outputStyle: 'expanded'
    }) )
    .pipe( groupMedia() )
    .pipe( autoprefixer({
      overrideBrowserlist: ["last 5 versions"],
      cascade: true
    }) )
    .pipe( webpcss() )
    .pipe( dest(path.build.css) )
    .pipe( cleanCss() )
    .pipe( rename({
      extname: ".min.css"
    }) )
    .pipe( dest(path.build.css) )
    .pipe( browserSync.stream() );
}

function JavaScript() {
  return src( path.src.js )
    .pipe( fileInclude() )
    .pipe( dest(path.build.js) )
    .pipe( uglify() )
    .pipe( rename({
      extname: ".min.js"
    }) )
    .pipe( dest(path.build.js) )
    .pipe( browserSync.stream() );
}

function Images () {
  return src( path.src.img )
    .pipe( webp({
      quality: 70
    }) )
    .pipe( dest(path.build.img) )
    .pipe( src(path.src.img) )
    .pipe( imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      interlaced: true,
      optimizationLevel: 3 // 0 to 7
    }) )
    .pipe( dest(path.build.img) )
    .pipe( browserSync.stream() );
  }
  function Fonts (params) {
    src( path.src.fonts )
      .pipe( ttf2woff() )
      .pipe( dest(path.build.fonts) )
    
    return src( path.src.fonts )
      .pipe( ttf2woff2() )
      .pipe( dest(path.build.fonts) )
}


/* GULP Tasks */
gulp.task('svgSprite', () => {
  return gulp.src( [sourceFolder + '/iconsprite/*.svg'] )
    .pipe( svgSprite({
      mode: {
        stack: {
          sprite: "../icons/icons.svg",
          example: true
        }
      }
    }) )
    .pipe( dest(path.build.img) )
})
gulp.task('otf2ttf', () => {
  return src( [sourceFolder + '/fonts/*.otf'] )
    .pipe( fonter({
      formats: ['ttf']
    }) )
    .pipe( dest(sourceFolder + '/fonts/') )
})


/* Подключение шрифтов в стилях (автоматически) */
function FontsStyle() {
  const file_content = fs.readFileSync( sourceFolder + '/scss/fonts.scss' );

  if (file_content == '') {
    fs.writeFile( sourceFolder + '/scss/fonts.scss', '', cb );
    return fs.readdir( path.build.fonts, (err, items) => {
      if (items) {
        let c_fontname;
        for (var i = 0; i < items.length; i++) {
          let fontname = items[i].split('.');
          fontname = fontname[0];

          if(c_fontname != fontname) {
            fs.appendFile(
              sourceFolder + '/scss/fonts.scss',
              '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n',
               cb);
          }

          c_fontname = fontname;
        }
      }
    } );
  }
}
function cb() {

}

/* Мониторинг файлов на изменения */
function WatchFiles (params) {
  gulp.watch( [path.watch.html], Html       );
  gulp.watch( [path.watch.css],  Css        );
  gulp.watch( [path.watch.js],   JavaScript );
  gulp.watch( [path.watch.img],  Images     );
}

function Clean(params) {
  return del(path.clean);
}


/* Запуск GULP */
let build = gulp.series( Clean, gulp.parallel( Html, Css, JavaScript, Images, Fonts ), FontsStyle );
let watch = gulp.parallel( build, WatchFiles, BrowserSync );


exports.Html       = Html;
exports.Css        = Css;
exports.JavaScript = JavaScript;
exports.Images     = Images;
exports.Fonts      = Fonts;
exports.FontsStyle = FontsStyle;
exports.build      = build;
exports.watch      = watch;
exports.default    = watch;
