.PHONY: *

pretty:
	npx prettier --ignore-path ../.prettierignore --write .

css:
	npx @tailwindcss/cli -i ./input.css -o ./output.css --watch
