import Joi from "joi";
import express from 'express'
import hierarchyServices from "../services/hierarchy.js";
const router = express.Router()

// crate an hierarchy

router.post('/createHierarchy', async (req, res, next) => {
    const validationSchema = Joi.object({
        hierarchyName: Joi.string().required(),
        organisationId: Joi.string().required(),
        hierarchyJson: Joi.string().required(),
    })
    try {
        const validatedBody = await validationSchema.validateAsync(req.body);
        const existingHierarchyName = await hierarchyServices.findOne({
            hierarchyName: validatedBody.hierarchyName
        })
        if (existingHierarchyName) {
            return res.status(400).json({
                message: "Hierarchy name already exists. Try different name",
                error: true,
                data: null
            })
        }
        const result = await hierarchyServices.createOne(validatedBody)

        return res.status(200).json({
            message: "Hierarchy created successfully",
            error: false,
            data: result
        })
    } catch (error) {
        console.log(`Error while creating hierarchy : ${error}`)
        return next(error)
    }
})




export default router