// Simple fs shim using expo-file-system
import * as FileSystem from 'expo-file-system';

// Basic implementation of Node's fs module using Expo's FileSystem
const fs = {
  readFile: async (path, options, callback) => {
    try {
      // Handle different argument patterns
      if (typeof options === 'function') {
        callback = options;
        options = { encoding: 'utf8' };
      }
      
      const encoding = options.encoding || 'utf8';
      const content = await FileSystem.readAsStringAsync(path, { encoding });
      callback(null, content);
    } catch (error) {
      callback(error);
    }
  },
  
  writeFile: async (path, data, options, callback) => {
    try {
      // Handle different argument patterns
      if (typeof options === 'function') {
        callback = options;
        options = { encoding: 'utf8' };
      }
      
      await FileSystem.writeAsStringAsync(path, data);
      callback(null);
    } catch (error) {
      callback(error);
    }
  },
  
  mkdir: async (path, options, callback) => {
    try {
      // Handle different argument patterns
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      
      await FileSystem.makeDirectoryAsync(path, { intermediates: true });
      callback(null);
    } catch (error) {
      callback(error);
    }
  },
  
  // Add more methods as needed for your application
  
  // Synchronous versions (simplified)
  readFileSync: (path, options) => {
    console.warn('readFileSync is not fully supported in this environment');
    return '';
  },
  
  writeFileSync: (path, data, options) => {
    console.warn('writeFileSync is not fully supported in this environment');
  },
  
  // Add stubs for other methods your app might use
  existsSync: () => false,
  statSync: () => ({ isDirectory: () => false }),
};

export default fs;