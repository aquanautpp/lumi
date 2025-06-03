const axios = require("axios");
require("dotenv").config();

const sendMessage = async (to, message) => {
  try {
    const phoneId = process.env.PHONE_ID;
    const token = process.env.TOKEN;

    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
  }
};

module.exports = sendMessage;
