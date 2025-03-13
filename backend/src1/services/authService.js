const admin = require("firebase-admin");
admin.initializeApp();

async function verifyUser(token) {
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error("Invalid token");
    }
}

module.exports = { verifyUser };
