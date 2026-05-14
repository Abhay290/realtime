// import { PrismaClient } from "../generated/prisma/client.ts";
import { prisma } from "../prisma/prisma.js";
// const prisma = new PrismaClient();

const userServices = {
    findOne: async (query) => {
        return prisma.user.findFirst({
            where: query
        });
    },

    createOne: async (data) => {
        return prisma.user.create({
            data
        });
    },
    updateOne: async (query, data) => {
        return await prisma.user.update({
            where: query,
            data
        })
    },
    deleteOne: async(query) => {
        return await prisma.user.delete({
            where: query
        })
    }
};

export default userServices;