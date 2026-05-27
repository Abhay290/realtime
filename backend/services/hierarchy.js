// import { PrismaClient } from "../generated/prisma/client.ts";
import { prisma } from "../prisma/prisma.js";
// const prisma = new PrismaClient();

const hierarchyServices = {
    findOne: async (query) => {
        return prisma.hierarchy.findFirst({
            where: query
        });
    },

    createOne: async (data) => {
        return prisma.hierarchy.create({
            data
        });
    },
    updateOne: async (query, data) => {
        return await prisma.hierarchy.update({
            where: query,
            data
        })
    },
    deleteOne: async(query) => {
        return await prisma.hierarchy.delete({
            where: query
        })
    }
};

export default hierarchyServices;