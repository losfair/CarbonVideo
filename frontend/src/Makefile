development:
	browserify -t babelify -o ../build/bundle.js index.js
	cp ../build/bundle.js ../../web/js/bundle.min.js

production:
	NODE_ENV=production browserify -t babelify -o ../build/bundle.js index.js
	uglifyjs -o ../build/bundle.min.js ../build/bundle.js -m
	cp ../build/bundle.min.js ../../web/js/bundle.min.js
