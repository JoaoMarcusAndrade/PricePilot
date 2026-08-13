import User from "../models/User.js";
import bcrypt from "bcrypt";

interface userDTO {
    name: string,
    picture: string,
    email: string,
    telephone: string,
    pass: string

}

export async function getUser(userId: number) {
    try {
        const existingUser = await User.findByPk(userId);

        if (!existingUser) {
            throw new Error("Usuário não encontrado");
        }
        return existingUser;
    } catch (error: any) {
        throw new Error(`Falha ao buscar: ${error.message}`);
    }
}

export async function createNewUser(data: userDTO) {
    const existingUser = await User.findOne({
        where: { email: data.email }
    });

    if (existingUser) {
        throw new Error("Já existe um usuário com este email.");
    }

    const hashedPassword = await bcrypt.hash(data.pass, 10);

    console.log("DADOS PARA CRIAR:", {
    ...data,
    pass: hashedPassword
    });

    const user = await User.create({
        ...data,
        pass: hashedPassword
    });

    return user;
}

export async function loginUser(email: number, pass: string) {
    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new Error("Email ou senha inválidos.");
    }

    if (await bcrypt.compare(user.pass, pass)){
        throw new Error("Email ou senha inválidos.")
    }

    return (user);
}

export async function editUser(userId: number, data: userDTO) {
    try {
        const user = await User.findByPk(userId);

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