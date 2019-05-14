/**
 * Shorten a String for specified length.
 * **WARNING** `IT IS ALWAYS A BAD IDEA TO ADD CUSTOM METHODS TO PROTOTYPES...`
 * @since 0.4.0
 * @param {number} length Length to shorten the text to
 * @param {boolean} [displayTicks = true] Whether to display the ticks(...) or not at the last of shortened text
 * @returns {string}
 */
function shorten(length, displayTicks = true) {
	if (!length || length < this.length) return String(this);
	const formattedText = splitText(this, length - 3);
	return displayTicks ? formattedText.length < length - 3 ? `${formattedText}...` : `${formattedText.slice(0, length - 3)}...` : formattedText;
}

function splitText(str, length, char = ' ') {
	const charPos = str.substring(0, length).lastIndexOf(char);
	const pos = charPos === -1 ? length : charPos;
	return str.substring(0, pos);
}

String.prototype.shorten = shorten;
