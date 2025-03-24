const express = require("express");
const router = express.Router();
const getChatResponse = require("../utils/chatgpt");

router.post("/", async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Mensaje requerido" });

    const response = await getChatResponse(message);
    res.json({ response });
});

module.exports = router;
