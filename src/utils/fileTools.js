const fs = require('fs').promises;
const path = require('path');

/**
 * Lists all files and directories in a given path
 * @param {string} directoryPath - The path to list contents from
 * @returns {Promise<Array<{name: string, type: string, path: string}>>}
 */
async function listDirectory(directoryPath) {
  try {
    const items = await fs.readdir(directoryPath, { withFileTypes: true });
    const contents = await Promise.all(
      items.map(async (item) => {
        const itemPath = path.join(directoryPath, item.name);
        return {
          name: item.name,
          type: item.isDirectory() ? 'directory' : 'file',
          path: itemPath
        };
      })
    );
    return {
      success: true,
      data: contents
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to list directory: ${error.message}`
    };
  }
}

/**
 * Reads and returns the content of a file
 * @param {string} filePath - The path to the file to read
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
async function readFileContent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return {
      success: true,
      data: content
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read file: ${error.message}`
    };
  }
}

// Export the functions that correspond to the tools
module.exports = {
  listDirectory,
  readFileContent
};
