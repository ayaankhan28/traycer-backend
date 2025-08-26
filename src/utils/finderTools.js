const fs = require('fs');
const path = require('path');

/**
 * Search for a string in a specific file and return matching lines with line numbers
 * @param {string} filePath - Path to the file to search
 * @param {string} searchString - String to search for
 * @returns {Promise<Array>} Array of [lineNumber, lineContent] tuples
 */
async function searchInFile(filePath, searchString) {
  const results = [];

  return new Promise((resolve) => {
    try {
      const stream = fs.createReadStream(filePath, { encoding: "utf-8" });
      const readline = require('readline');
      const rl = readline.createInterface({ input: stream });

      let lineNum = 0;
      rl.on("line", (line) => {
        lineNum++;
        if (line.toLowerCase().includes(searchString)) {
          results.push([lineNum, line.trim()]);
        }
      });

      rl.on("close", () => resolve(results));
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      resolve([]); // skip unreadable files
    }
  });
}

/**
 * Recursively search for a string in all files within a directory
 * @param {string} rootFolder - Root directory to search in
 * @param {string} searchString - String to search for
 * @returns {Promise<Object>} Object mapping file paths to arrays of [lineNumber, lineContent] tuples
 */
async function grepLikeSearch(rootFolder, searchString) {
  const matches = {};
  // Convert search string to lowercase for case-insensitive comparison
  const searchStringLower = searchString.toLowerCase();

  async function walk(dir) {
    try {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        // Skip hidden files and common directories that shouldn't be searched
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === '.git' ||
            entry.name === 'dist' ||
            entry.name === 'build') {
          continue;
        }
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else {
          // Only search in text-based files
          const ext = path.extname(entry.name).toLowerCase();
          const textExtensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt', '.py', '.html', '.css', '.scss', '.sql'];
          
          if (textExtensions.includes(ext) || ext === '') {
            // Pass both original and lowercase search strings to handle case-insensitive search
            const result = await searchInFile(fullPath, searchStringLower);
            if (result.length > 0) {
              matches[fullPath] = result;
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error walking directory ${dir}:`, error);
    }
  }

  await walk(rootFolder);
  return matches;
}

/**
 * Search for text in files within a specified directory
 * @param {string} directoryPath - Directory to search in
 * @param {string} searchQuery - Text to search for
 * @returns {Promise<Object>} Search results
 */
async function searchInDirectory(directoryPath, searchQuery) {
  try {
    // Validate inputs
    if (!directoryPath || !searchQuery) {
      throw new Error('Both directory path and search query are required');
    }

    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`Directory does not exist: ${directoryPath}`);
    }

    const stats = fs.statSync(directoryPath);
    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${directoryPath}`);
    }

    // Perform the search
    const results = await grepLikeSearch(directoryPath, searchQuery);
    
    // Format results for better readability
    const formattedResults = {};
    for (const [filePath, occurrences] of Object.entries(results)) {
      const relativePath = path.relative(directoryPath, filePath);
      formattedResults[relativePath] = occurrences.map(([lineNum, line]) => ({
        line: lineNum,
        content: line
      }));
    }

    return {
      success: true,
      searchQuery,
      directory: directoryPath,
      totalFiles: Object.keys(results).length,
      results: formattedResults
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      searchQuery,
      directory: directoryPath
    };
  }
}

module.exports = {
  searchInDirectory,
  searchInFile,
  grepLikeSearch
};
