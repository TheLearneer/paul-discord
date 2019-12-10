function shorten(length, displayTicks = true) {
	if (!length || length > this.toString().length) return String(this);
	const formattedText = splitText(this.toString(), length - 3);
	return displayTicks ? formattedText.length < length - 3 ? `${formattedText}...` : `${formattedText.slice(0, length - 3)}...` : formattedText;
}

function splitText(str, length, char = ' ') {
	const charPos = str.substring(0, length).lastIndexOf(char);
	const pos = charPos === -1 ? length : charPos;
	return str.substring(0, pos);
}

String.prototype.shorten = shorten;
