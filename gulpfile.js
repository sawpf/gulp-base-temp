'use strict';

const gulp = require('gulp');
const { src, dest, series, parallel, watch } = require('gulp');

const dartSass = require('gulp-sass')(require('sass'));

const del = require('del');
const bs = require('browser-sync');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');

const $ = require('gulp-load-plugins')();
const pug = require('gulp-pug'); // Pug
const htmlbeautify = require('gulp-html-beautify'); // HTML整形

const pj = {
    src: `./src`,
    dest: `./dist`
}

const paths = {
    clean: {
		src: `${pj.dest}/**`,
	},

    pug: {
        src: [`${pj.src}/pug/**.pug`, `!${pj.src}/pug/_*`],
        dest: `${pj.dest}/`
    },

	image: {
		src: `${pj.src}/img/**`,
		dest: `${pj.dest}/img`,
	},

    scss: {
        src: `${pj.src}/scss/**.scss`,
        dest: `${pj.dest}/css`
    },

    watch: {
		src: [`${pj.src}/**`],
	},
}

const bsOptions = {
    server: {
        baseDir: `${pj.dest}`,
    },
    notify: false,
    open: false,
    reloadOnRestart: true,
}

const clean = (done) => {
	del(paths.clean.src);

	done();
};

const dev = (done) => {
    // pug
    src(paths.pug.src)
        .pipe(pug())
        .pipe(htmlbeautify({
            eol: '\n',
            indent_size: 2,
            indent_char: ' ',
            indent_with_tabs: false,
            end_with_newline: true,
            preserve_newlines: true,
            max_preserve_newlines: 2,
            indent_inner_html: true,
            brace_style: 'collapse',
            indent_scripts: 'normal',
            wrap_line_length: 0,
            wrap_attributes: 'auto'
        }))
        .pipe(dest(paths.pug.dest));

    // sass
	src(paths.scss.src) // コンパイル
        .pipe($.plumber())
        .pipe($.sassGlobUseForward())
        .pipe(dartSass())
        .pipe($.autoprefixer())
        .pipe(dest(paths.scss.dest));

    // image
	src(paths.image.src) // 圧縮、コピー
        .pipe($.plumber())
        .pipe($.changed(paths.image.dest))
        .pipe(
            $.imagemin([
                pngquant({
                    quality: [0.6, 0.7],
                    speed: 1,
                }),
                mozjpeg({ quality: 65 }),
                $.imagemin.svgo(),
                $.imagemin.optipng(),
                $.imagemin.gifsicle({
                    optimizationLevel: 3,
                }),
            ])
        )
        .pipe(dest(paths.image.dest));

    done();
}

const bsInit = (done) => {
    bs.init(bsOptions);

	done();
};

const bsReload = (done) => {
	bs.reload();

	done();
};

const watchTask = (done) => {
	watch(paths.watch.src, series(dev, bsReload));

	done();
};

exports.clean = clean;
exports.development = series(dev, bsInit, bsReload, watchTask);
