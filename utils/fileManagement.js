import fs from 'fs';
import path from 'path';

const ACTIVE_FILES_PATH = path.join(process.cwd(), 'data', 'activeFiles.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(ACTIVE_FILES_PATH))) {
    fs.mkdirSync(path.dirname(ACTIVE_FILES_PATH), { recursive: true });
}

// Initialize active files from storage
function loadActiveFiles() {
    try {
        if (fs.existsSync(ACTIVE_FILES_PATH)) {
            const data = fs.readFileSync(ACTIVE_FILES_PATH, 'utf8');
            return new Set(JSON.parse(data));
        }
    } catch (error) {
        console.error('Error loading active files:', error);
    }
    return new Set();
}

// Save active files to storage
function saveActiveFiles(files) {
    try {
        fs.writeFileSync(ACTIVE_FILES_PATH, JSON.stringify(Array.from(files)), 'utf8');
    } catch (error) {
        console.error('Error saving active files:', error);
    }
}

// In-memory store of active files
let activeFiles = loadActiveFiles();

/**
 * Add a file to the active files list
 * @param {string} fileName - Name of the file to add
 */
export function addFileToActive(fileName) {
    activeFiles.add(fileName);
    saveActiveFiles(activeFiles);
    console.log('Added file to active files:', fileName);
    console.log('Current active files:', Array.from(activeFiles));
}

/**
 * Remove a file from the active files list
 * @param {string} fileName - Name of the file to remove
 */
export function removeFileFromActive(fileName) {
    activeFiles.delete(fileName);
    saveActiveFiles(activeFiles);
    console.log('Removed file from active files:', fileName);
    console.log('Current active files:', Array.from(activeFiles));
}

/**
 * Get list of active files
 * @returns {Array<string>} Array of active file names
 */
export function getActiveFiles() {
    return Array.from(activeFiles);
}

/**
 * Check if a file is active
 * @param {string} fileName - Name of the file to check
 * @returns {boolean} True if file is active
 */
export function isFileActive(fileName) {
    return activeFiles.has(fileName);
}

/**
 * Clear all active files
 */
export function clearActiveFiles() {
    activeFiles = new Set();
    saveActiveFiles(activeFiles);
    console.log('Cleared all active files');
}
