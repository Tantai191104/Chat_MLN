import axiosClient from "@/app/lib/axios";

export const createChat = async (content: string) => {
    const res = await axiosClient.post('/chats/new/messages', { content });
    return res;
}

export const getChats = async () => {
    const res = await axiosClient.get('/chats');
    return res;
}

export const getChatById = async (chatId: string) => {  
    const res = await axiosClient.get(`/chats/${chatId}/messages`);
    return res;
}

export const sendMessage = async (chatId: string, content: string) => {
    const res = await axiosClient.post(`/chats/${chatId}/messages`, { content });
    return res;
}