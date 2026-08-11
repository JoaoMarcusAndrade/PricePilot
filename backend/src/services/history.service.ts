import Chat from "../models/Chat"

interface userDTO {
    user: string,
    picture: string,
    email: string,
    telephone: string,
    pass: string

}

export async function getHistory(userId: number) {
    try {
        const userHistory = await Chat.findAll({
            where: {
                userId: userId
            }
        });

        return userHistory;
    } catch (error: any) {
        throw new Error(`Falha ao buscar: ${error.message}`);
    }
}

export async function addNewChat(data: userDTO) {
    const existingUser = await User.findOne({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("Já existe um usuário com este email.");
    }

    const user = await User.create({
        data
    } as any);

    return user;
}

export async function editChat(userId: number, data: userDTO) {
    try {
        const user = await History.(userId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        await user.update(data)

        return(user);
    } catch (error: any) {
        throw new Error(`Falha ao editar usuário: ${error.message}`);
    }
}

export async function deleteAcount(userId: number) {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            throw new Error("Usuário não encontrado");
        }

        await user.destroy();
    } catch (error: any) {
        throw new Error(`Falha ao deletar usuário: ${error.message}`);
    }
}