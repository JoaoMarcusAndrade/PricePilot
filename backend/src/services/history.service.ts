import Chat from "../models/Chat.js";

interface createChatDTO {
    name: string;
    content: string;
}

interface updateChatDTO {
    name?: string;
    content?: string;
}

export async function getHistory(userId: number) {
    try {
        // The chat endpoint can reuse this ordered history as context for an AI conversation.
        const userHistory = await Chat.findAll({
            where: {
                userId
            },
            order: [["createdAt", "ASC"]]
        });

        return userHistory;
    } catch (error: any) {
        throw new Error(`Falha ao buscar histórico: ${error.message}`);
    }
}

export async function addNewChat(
    data: createChatDTO,
    userId: number
) {
    try {
        const chat = await Chat.create({
            name: data.name,
            content: data.content,
            userId
        });

        return chat;
    } catch (error: any) {
        throw new Error(`Falha ao criar novo chat: ${error.message}`);
    }
}

export async function editChat(
    chatId: number,
    data: updateChatDTO
) {
    try {
        const chat = await Chat.findByPk(chatId);

        if (!chat) {
            throw new Error("Chat não encontrado");
        }

        await chat.update(data);

        return chat;
    } catch (error: any) {
        throw new Error(`Falha ao editar conversa: ${error.message}`);
    }
}

export async function deleteChat(chatId: number) {
    try {
        const chat = await Chat.findByPk(chatId);

        if (!chat) {
            throw new Error("Chat não encontrado");
        }

        await chat.destroy();

        return;
    } catch (error: any) {
        throw new Error(`Falha ao deletar chat: ${error.message}`);
    }
}
