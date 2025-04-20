.PHONY: *

pretty:
	npx prettier "!output.css" --write .

css:
	npx @tailwindcss/cli -i ./input.css -o ./output.css --watch
