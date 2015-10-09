
build: components index.js
	@component build --dev

components: component.json
	@component install --dev

doc:
	@component build --dev -c
	@rm -fr .gh-pages
	@mkdir .gh-pages
	@cp -r build .gh-pages/
	@cp example.html .gh-pages/index.html
	@ghp-import .gh-pages -n -p
	@rm -fr .gh-pages

test:
	@webpack example/example.js example/bundle.js -w -d
	@open example.html

clean:
	rm -fr build components template.js

.PHONY: clean
