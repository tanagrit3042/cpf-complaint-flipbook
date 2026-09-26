# CPF Complaint Management Readers

This static GitHub Pages site keeps both documents available:

- `index.html`: the original 13-page portrait flipbook, powered by `page-flip@2.0.7`.
- `new.html`: the new 13-page landscape document, with page controls, thumbnails, fullscreen mode, and a link to the original PDF in `doc/`.

The two readers use relative asset paths so both routes work under the GitHub Pages project URL.

## Run locally

From this repository directory, run `npm run dev` and open
`http://localhost:5173/` for the original reader or
`http://localhost:5173/new.html` for the landscape reader.
The development server uses Python's built-in HTTP server, so no `npm install` is needed.

The original reader in `index.html` still uses every image in `pages/`, while
`new.html` uses `new-pages/`. On a phone held upright, the new reader places a
white **Click to read fullscreen** prompt over the slide. Tapping it requests
fullscreen and landscape orientation where the browser supports it.
