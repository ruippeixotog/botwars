const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync");
const cleanCss = require("gulp-clean-css");
const eslint = require("gulp-eslint");
const gulp = require("gulp");
const gutil = require("gulp-util");
const historyApiFallback = require("connect-history-api-fallback");
const merge = require("merge-stream");
const nodemon = require("gulp-nodemon");
const path = require("path");
const proxyMiddleware = require("proxy-middleware");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify");
const url = require("url");
const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");

process.env.NODE_ENV = process.env.NODE_ENV || process.env.GULP_ENV;

const isDev = process.env.GULP_ENV !== "production";

const dirs = {
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
  nodeModules: "./node_modules"
};

const files = {
  mainJs: "main.jsx",
  mainJsDist: "main.js",
  mainSass: "main.scss",
  mainCssDist: "main.css",
  index: "index.html"
};

const webpackConfig = {
  entry: [
    path.resolve(dirs.js + "/" + files.mainJs)
  ],
  output: {
    path: path.resolve(dirs.dist),
    filename: files.mainJsDist,
    publicPath: "/"
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [{ loader: "babel-loader" }],
        exclude: /node_modules/
      },
      !isDev ? {} : {
        test: /\.js$/,
        enforce: "pre",
        loader: "source-map-loader",
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.EnvironmentPlugin(["NODE_ENV"])
  ],
  resolve: {
    extensions: [".jsx", ".js"]
  }
};

gulp.task("webpack", function (callback) {
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
      includePaths: [dirs.styles, dirs.nodeModules]
    }).on("error", sass.logError))
    .pipe(autoprefixer())
    .pipe(isDev ? sourcemaps.write(".") : gutil.noop())
    .pipe(gulp.dest(dirs.dist))
    .pipe(browserSync.stream());
});

gulp.task("minify-css", ["sass"], function () {
  return gulp.src(dirs.dist + "/" + files.mainCssDist)
    .pipe(cleanCss())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("minify-js", ["webpack"], function () {
  return gulp.src(dirs.dist + "/" + files.mainJsDist)
    .pipe(uglify())
    .pipe(gulp.dest(dirs.dist));
});

gulp.task("images", function () {
  const streams = dirs.img.map(function (entry) {
    return gulp.src(entry[0] + "/**/*.*")
      .pipe(gulp.dest(dirs.dist + "/" + dirs.imgDist + "/" + entry[1]));
  });
  return merge(streams);
});

gulp.task("fonts", function () {
  const streams = dirs.fonts.map(function (entry) {
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

gulp.task("client:browsersync", function () {
  if (isDev) {
    webpackConfig.entry = ["webpack/hot/dev-server", "webpack-hot-middleware/client"]
      .concat(webpackConfig.entry);

    webpackConfig.module.rules[0].use = [{ loader: "react-hot-loader" }]
      .concat(webpackConfig.module.rules[0].use);

    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
    webpackConfig.devtool = "eval";
  }

  const proxyConfig = url.parse("http://localhost:3000/api");
  proxyConfig.route = "/api";

  const compiler = webpack(webpackConfig);

  browserSync.init({
    port: 3001,
    ui: { port: 3002 },
    ghostMode: false,
    server: {
      baseDir: path.resolve(dirs.dist),

      middleware: [
        proxyMiddleware(proxyConfig),
        webpackDevMiddleware(compiler, {
          publicPath: webpackConfig.output.publicPath,
          stats: { colors: true, chunkModules: false }
        }),
        webpackHotMiddleware(compiler),
        historyApiFallback()
      ]
    }
  });
});

gulp.task("client:watch-nowebpack", function () {
  gulp.watch("./config.json", ["eslint"]);
  gulp.watch(dirs.styles + "/**/*", ["sass"]);
  gulp.watch(dirs.js + "/**/*.?(js|jsx)", ["eslint"]);
  gulp.watch(dirs.img[0][0] + "/**/*.*", ["images"]);
  gulp.watch(dirs.fonts[0][0] + "/**/*.*", ["fonts"]);
  gulp.watch(dirs.src + "/" + files.index, ["index"]);
});

gulp.task("server:run", function () {
  const monitor = nodemon({
    nodeArgs: ["-r", "@babel/register"],
    script: "server/main.js",
    ext: "js",
    ignore: ["*"],
    env: { NODE_ENV: process.env.GULP_ENV }
  });

  // without this, a bug in gulp-nodemon requires the user to send Ctrl+C twice
  // See https://github.com/JacksonGariety/gulp-nodemon/issues/33
  process.once("SIGINT", function () {
    monitor.once("exit", function () {
      process.exit();
    });
  });

  return monitor;
});

const clientTasks = ["eslint", "webpack", "sass", "images", "fonts", "index"];
if (!isDev) clientTasks.push("minify-css", "minify-js");

gulp.task("client:build", clientTasks);
gulp.task("client", ["client:build", "client:watch"]);
gulp.task("server", ["client", "server:run"]);

gulp.task("client:hotload",
  clientTasks.filter(task => task !== "webpack").concat(
    ["client:browsersync", "client:watch-nowebpack"]));

gulp.task("server:hotload", ["client:hotload", "server:run"]);

gulp.task("default", ["client:build"]);
