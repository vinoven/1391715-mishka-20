const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const sync = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
};

exports.styles = styles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
        imagemin.optipng({ optimizationLevel: 3 }),
        imagemin.mozjpeg({ quality: 85, progressive: true }),
        imagemin.svgo()
      ])
    );
};

exports.images = images;


// WebP Generation

const generateWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
  .pipe(webp({ quality: 90 }))
  .pipe(gulp.dest("source/img"))
};

exports.generateWebp = generateWebp;


// SVG

const sprite = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

// Copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico",
    "source/*.html"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

// Del

const clean = () => {
  return del("build");
};

exports.clean = clean;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build",
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
};

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
};

exports.default = gulp.series(styles, server, watcher);

// Build

const build = gulp.series(
  generateWebp,
  clean,
  copy,
  styles,
  sprite
);

exports.build = build;


// Start

const start = gulp.series(
  build,
  server,
  watcher
);

exports.start = start;

// TODO

// 1. Установить del +++++
// 2. Разобраться с imagemin ++++++
// 3. Проверить сборку спрайта в build +++++
// 4. Перенос HTML в build ++++
// 5. Перенос изображений в build +++++
// 6. Пути background-image в build
// 7. Изменить путь к файлу стилей на build в html +++
// 8. Поправить таск build ++++
// 9. Изменить use для svg в html, т.к. поменяются id
// 10. Првоерить client dependencies
