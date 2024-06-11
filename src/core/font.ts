export async function loadFont(alias: string, src: string) {
	const url_to_font_name = src;
	const font_name = new FontFace(alias, `url(${url_to_font_name})`);
	document.fonts.add(font_name);
	await font_name.load()
}