import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
export const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_NUMBER;
export const usingTwilio = accountSid && authToken && twilioNumber;

export const twilioClient = usingTwilio ? twilio(accountSid, authToken) : null;
