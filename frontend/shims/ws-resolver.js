// This is a simple resolver for the 'ws' module
// It helps Metro bundler handle the 'ws' module which is often used in web sockets

module.exports = {
  resolveRequest: (context, moduleName, platform) => {
    // If the request is for the 'ws' module, return null to ignore it
    if (moduleName === 'ws') {
      return {
        filePath: require.resolve('./empty-module.js'),
        type: 'sourceFile',
      };
    }
    
    // For all other modules, let Metro handle it
    return context.resolveRequest(context, moduleName, platform);
  },
};