# Fonts for generated images

The site's own typefaces, as TTF, for `app/share-image/route.tsx`.
`ImageResponse` reads TTF, OTF or WOFF only — not the WOFF2 that `next/font`
serves the pages — so these are the one copy of the fonts kept in the repo.

| File                            | Face                           | Source       |
| ------------------------------- | ------------------------------ | ------------ |
| `PlayfairDisplay-SemiBold.ttf`  | Playfair Display, 600          | Google Fonts |
| `PlayfairDisplay-Italic.ttf`    | Playfair Display, 400 italic   | Google Fonts |
| `DMSans-Medium.ttf`             | DM Sans, 500                   | Google Fonts |

Both families are licensed under the SIL Open Font License 1.1
(<https://openfontlicense.org>), which permits bundling them with software.
Copyright: Playfair Display — © 2017 The Playfair Display Project Authors
(<https://github.com/clauseggers/Playfair-Display>); DM Sans — © 2014 The DM
Sans Project Authors (<https://github.com/googlefonts/dm-fonts>). Each file's
own metadata carries its copyright notice and a link to the licence.
