const fs = require("fs/promises");
const path = require("path");

// Create path
function createPath(filePath) {
	return path.join(__dirname, filePath);
}

// Read file
async function readFile(filePath) {
	return JSON.parse(await fs.readFile(createPath(filePath), { encoding: "utf-8" }));
}

// Write file
function writeFile(filePath, fileContent) {
	return fs.writeFile(createPath(filePath), JSON.stringify(fileContent), { encoding: "utf-8", flag: "w" });
}

module.exports = {
	readFile,
	writeFile,
};
