"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
async function chatWithDinoyoAi({ message, conversationId, history, }) {
    const serviceUrl = (process.env.AI_SERVICE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '');
    const serviceToken = process.env.AI_SERVICE_TOKEN;
    if (!serviceToken) {
        throw new Error('AI_SERVICE_TOKEN belum dikonfigurasi di backend.');
    }
    try {
        const response = await axios_1.default.post(`${serviceUrl}/ai/chat`, { message, conversation_id: conversationId, history }, {
            timeout: 45_000,
            headers: { Authorization: `Bearer ${serviceToken}` },
        });
        return response.data;
    }
    catch (error) {
        const axiosError = error;
        const status = axiosError.response?.status;
        console.error('Dinoyo AI service request failed:', status ?? 'network error');
        throw new Error('Dinoyo AI sedang tidak dapat dihubungi. Coba lagi nanti.');
    }
}
module.exports = { chatWithDinoyoAi };
