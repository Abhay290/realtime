// import { PrismaClient } from "../generated/prisma/client.ts";
import { prisma } from "../prisma/prisma.js";
// const prisma = new PrismaClient();

const orgServices = {
    findOne: async (query) => {
        return prisma.organisation.findFirst({
            where: query
        });
    },

    createOne: async (data) => {
        return prisma.organisation.create({
            data
        });
    },
    updateOne: async (query, data) => {
        return await prisma.organisation.update({
            where: query,
            data
        })
    },
    // deletes organisation along with its users
    deleteOne: async(query) => {
        return await prisma.organisation.delete({
            where: query
        })
    }
};

export default orgServices;