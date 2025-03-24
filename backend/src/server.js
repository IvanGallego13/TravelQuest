require("dotenv").config();
const express = require("express");
const cors = require("cors");


const chatRoutes = require("./routes/chat"); // Verifica que este archivo existe

const app = express();
app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
