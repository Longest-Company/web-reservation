export default function inputNumberWithComma(str) {
	return String(str).replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}
