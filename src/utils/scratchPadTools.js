const fs = require('fs').promises;
const path = require('path');

// Default scratch pad file path
const SCRATCH_PAD_PATH = path.join(__dirname, '../../data/scratch_pad.json');

/**
 * Ensure the scratch pad file exists with empty object if it doesn't
 * @returns {Promise<void>}
 */
async function ensureScratchPadExists() {
  try {
    // Check if data directory exists, create if not
    const dataDir = path.dirname(SCRATCH_PAD_PATH);
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
    }

    // Check if scratch pad file exists, create if not
    try {
      await fs.access(SCRATCH_PAD_PATH);
    } catch (error) {
      await fs.writeFile(SCRATCH_PAD_PATH, JSON.stringify({}, null, 2));
    }
  } catch (error) {
    throw new Error(`Failed to ensure scratch pad exists: ${error.message}`);
  }
}

/**
 * Create scratch pad if it doesn't exist
 * @returns {Promise<Object>} Success message and status
 */
async function createScratchPad() {
  try {
    await ensureScratchPadExists();
    return {
      success: true,
      message: "Scratch pad created successfully",
      path: SCRATCH_PAD_PATH
    };
  } catch (error) {
    throw new Error(`Failed to create scratch pad: ${error.message}`);
  }
}

/**
 * Read and return the complete JSON data stored in the scratch pad
 * @returns {Promise<Object>} The complete scratch pad data
 */
async function scratchPadReadAll() {
  try {
    await ensureScratchPadExists();
    const data = await fs.readFile(SCRATCH_PAD_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read scratch pad: ${error.message}`);
  }
}

/**
 * Update a single entry in the scratch pad JSON by specifying its ID
 * @param {string} id - The unique identifier of the entry to update
 * @param {Object} updates - The key-value pairs to update in the entry
 * @returns {Promise<Object>} Updated entry and success status
 */
async function scratchPadUpdate(id, updates) {
  try {
    if (!id || typeof id !== 'string') {
      throw new Error('ID is required and must be a string');
    }
    
    if (!updates || typeof updates !== 'object') {
      throw new Error('Updates must be an object');
    }

    await ensureScratchPadExists();
    
    // Read current data
    const data = await fs.readFile(SCRATCH_PAD_PATH, 'utf8');
    const scratchPad = JSON.parse(data);
    
    // Update the specific entry
    if (scratchPad[id]) {
      scratchPad[id] = { ...scratchPad[id], ...updates };
    } else {
      scratchPad[id] = updates;
    }
    
    // Write back to file
    await fs.writeFile(SCRATCH_PAD_PATH, JSON.stringify(scratchPad, null, 2));
    
    return {
      success: true,
      message: `Entry ${id} updated successfully`,
      updatedEntry: scratchPad[id]
    };
  } catch (error) {
    throw new Error(`Failed to update scratch pad entry: ${error.message}`);
  }
}

/**
 * Completely overwrite the scratch pad JSON with a new JSON object
 * @param {Object} newData - The complete new JSON object to replace the scratch pad content
 * @returns {Promise<Object>} Success status and new data
 */
async function scratchPadOverwrite(newData) {
  try {
    if (!newData || typeof newData !== 'object') {
      throw new Error('New data must be an object');
    }

    await ensureScratchPadExists();
    
    // Write new data to file
    await fs.writeFile(SCRATCH_PAD_PATH, JSON.stringify(newData, null, 2));
    
    return {
      success: true,
      message: "Scratch pad overwritten successfully",
      newData: newData
    };
  } catch (error) {
    throw new Error(`Failed to overwrite scratch pad: ${error.message}`);
  }
}

module.exports = {
  createScratchPad,
  scratchPadReadAll,
  scratchPadUpdate,
  scratchPadOverwrite,
  ensureScratchPadExists
};
