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

On a phone, the new document is designed for landscape viewing. The portrait
view has an **Open landscape fullscreen** button; browsers that support screen
orientation locking will rotate after the button is tapped.
