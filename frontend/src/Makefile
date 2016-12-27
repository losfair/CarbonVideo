all:
	browserify -t babelify -o ../build/bundle.js index.js
	uglifyjs -o ../build/bundle.min.js ../build/bundle.js -m
