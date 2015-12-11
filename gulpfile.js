var autoprefixer = require("gulp-autoprefixer");
var eslint = require("gulp-eslint");
var gulp = require("gulp");
var gutil = require("gulp-util");
var merge = require('merge-stream');
var minifyCss = require("gulp-minify-css");
var nodemon = require("gulp-nodemon");
var sass = require("gulp-sass");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");
var webpack = require("webpack");

var isDev = process.env.GULP_ENV === "development";

var dirs = {
  src: "./client",
  js: "./client/js",
  styles: "./client/css",
  fonts: [
    ["./client/fonts", ""],
    ["./node_modules/font-awesome/fonts", ""]
  ],
  img: [
    ["./client/img", ""],
    ["./node_modules/deck-of-cards/example/faces", "cards"]
  ],
  dist: "./dist",
  imgDist: "./img",
  fontsDist: "./fonts",
  node_modules: "./node_modules"
};

var files = {
  mainJs: "main.jsx",
  mainJsDist: "main.js",
  mainSass: "main.scss",
  mainCssDist: "main.css",
  index: "index.html"
};

var webpackConfig = {
  entry: dirs.js + "/" + files.mainJs,
  output: {
    path: dirs.dist,
    filename: files.mainJsDist
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: "json-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ["", ".jsx", ".js"]
  }
};

gulp.task("webpack", function (callback) {
  if (isDev) {
    webpackConfig.devtool = "source-map";
    webpackConfig.module.preLoaders = [
      {
        test: /\.js$/,
        loader: "source-map-loader",
        exclude: /node_modules/
      }
    ];
  }

  webpack(webpackConfig, function (err) {
    if (err) console.error(err.stack);
    callback();
  });
});

gulp.task("eslint", function () {
  return gulp.src([dirs.js + "/**/*.?(js|jsx)"])
      .pipe(eslint())
      .pipe(eslint.formatEach("stylish", process.stderr));
});

gulp.task("sass", function () {
  return gulp.src(dirs.styles + "/" + files.mainSass)
      .pipe(isDev ? sourcemaps.init() : gutil.noop())
      .pipe(sass({
        includePaths: [dirs.styles, dirs.node_modules]
      }).on("error", sass.logError))
      .pipe(autoprefixer())
      .pipe(isDev ? sourcemaps.write(".") : gutil.noop())
      .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-css", ["sass"], function () {
  return gulp.src(dirs.dist + "/" + files.mainCssDist)
      .pipe(minifyCss())
      .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-js", ["webpack"], function () {
  return gulp.src(dirs.dist + "/" + files.mainJsDist)
      .pipe(uglify())
      .pipe(gulp.dest(dirs.dist));
});

gulp.task("images", function () {
  var streams = dirs.img.map(function(entry) {
    return gulp.src(entry[0] + "/**/*.*")
        .pipe(gulp.dest(dirs.dist + "/" + dirs.imgDist + "/" + entry[1]));
  });
  return merge(streams);
});

gulp.task("fonts", function () {
  var streams = dirs.fonts.map(function(entry) {
    return gulp.src(entry[0] + "/**/*.*")
        .pipe(gulp.dest(dirs.dist + "/" + dirs.fontsDist + "/" + entry[1]));
  });
  return merge(streams);
});

gulp.task("index", function () {
  return gulp.src(dirs.src + "/" + files.index)
      .pipe(gulp.dest(dirs.dist));
});

gulp.task("client:watch", function () {
  gulp.watch("./config.json", ["eslint", "webpack"]);
  gulp.watch(dirs.styles + "/**/*", ["sass"]);
  gulp.watch(dirs.js + "/**/*.?(js|jsx)", ["eslint", "webpack"]);
  gulp.watch(dirs.img[0][0] + "/**/*.*", ["images"]);
  gulp.watch(dirs.fonts[0][0] + "/**/*.*", ["fonts"]);
  gulp.watch(dirs.src + "/" + files.index, ["index"]);
});

gulp.task('server:run', ["client:build"], function () {
  var monitor = nodemon({
    nodeArgs: ["-r", "babel-register"],
    script: 'server/main.js',
    ext: 'js',
    ignore: ['*'],
    env: { NODE_ENV: process.env.GULP_ENV }
  });

  // without this, a bug in gulp-nodemon requires the user to send Ctrl+C twice
  // See https://github.com/JacksonGariety/gulp-nodemon/issues/33
  process.once('SIGINT', function () {
    monitor.once('exit', function () {
      process.exit();
    });
  });

  return monitor;
});

var clientTasks = ["eslint", "webpack", "sass", "images", "fonts", "index"];
if (process.env.GULP_ENV === "production") {
  clientTasks.push("minify-css", "minify-js");
}

gulp.task("client:build", clientTasks);
gulp.task("client", ["client:build", "client:watch"]);
gulp.task("server", ["client", "server:run"]);

gulp.task("default", ["client:build"]);
