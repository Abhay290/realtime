import express from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import 'dotenv/config';
import userServices from '../services/users.js';
import auth from '../middleware/auth.js'
import orgServices from '../services/org.js';
var router = express.Router();

// signup for admin
router.post('/signup', async function (req, res, next) {
  const validationSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().required().allow("male","female","others"),
    age: Joi.number().required(),
    role: Joi.string().default('admin'),
    permissions: Joi.string().allow('[]'),
    orgName: Joi.string().required(),
  })
  try {
    const validatedBody = await validationSchema.validateAsync(req.body);
    const existingEmail = await userServices.findOne({
      email: validatedBody.email
    })
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
        error: true,
        data: null
      })
    }
    const existingOrg = await orgServices.findOne({
      orgName: validatedBody.orgName
    })
    if (existingOrg && existingOrg.orgName.toLowerCase() === validatedBody.orgName.toLowerCase()) {
      return res.status(400).json({
        message: "Organisation name already exists",
        error: true,
        data: null
      })
    }
    const orgCreated = await orgServices.createOne({
      orgName: validatedBody.orgName
    })
    validatedBody.organisationId = orgCreated.id
    validatedBody.isActive = "true"
    delete validatedBody.orgName
    const result = await userServices.createOne(validatedBody);

    return res.status(200).json({
      message: "User created successfully",
      error: false,
      data: result
    })

  } catch (error) {
    console.log(`Error while signing up in CATCH : ${error}`)
    await orgServices.deleteOne({
      orgName:req.body.orgName
    })
    return next(error)
  }
});

// login for any role
router.post('/login', async function (req, res, next) {
  const validationSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  })
  try {
    const validatedBody = await validationSchema.validateAsync(req.body);
    const existingUser = await userServices.findOne({ email: validatedBody.email, password: validatedBody.password })
    if (!existingUser) {
      return res.status(404).json({
        message: `Email or password is incorrect or user does not exist`,
        error: true,
        data: null
      })
    }
    delete existingUser.password
    const token = jwt.sign(existingUser, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY
    })
    existingUser.token = token

    return res.status(200).json({
      message: "Login successfull",
      error: false,
      data: existingUser
    })
  } catch (error) {
    console.log(`Error in login CATCH : ${error}`)
    return next(error)

  }
});

// currently updates any user (manage the updation via permissions)
router.put('/updateUser', auth, async (req, res, next) => {
  const validationSchema = Joi.object({
    id: Joi.number().required(),
    email: Joi.string().required(),
    age: Joi.number().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().required()
  })
  try {
    const validatedBody = await validationSchema.validateAsync(req.body);
    const existingUser = await userServices.findOne({
      id: validatedBody.id
    })
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found",
        error: true,
        data: null
      })

    }
    const { id, ...validatedBodyWithoutId } = validatedBody
    // console.log(validatedBodyWithoutId,'validatedBodyWithoutId')
    const updatedUser = await userServices.updateOne({
      id: id
    },
      validatedBodyWithoutId
    )
    // console.log(updatedUser,'====updated')
    if (updatedUser) {
      delete updatedUser.password
      return res.status(200).json({
        message: "User updated successfully",
        error: false,
        data: updatedUser
      })
    } else {
      return res.status(400).json({
        message: "User not updated",
        error: true,
        data: null
      })
    }
  } catch (error) {
    console.log(`Error in updating user CATCH : ${error}`)
    return next(error)
  }
});

// currently deletes any user (manage the deletion via permissions)
router.delete('/deleteUser', auth, async (req, res, next) => {
  const validationSchema = Joi.object({
    id: Joi.number().required()
  })

  try {
    const validatedQuery = await validationSchema.validateAsync(req.query);
    const userExistsCheck = await userServices.findOne({
      id: validatedQuery.id
    })
    if (!userExistsCheck) {
      return res.status(404).json({
        message: "Cannot delete this user because it doesnt exist",
        error: true,
        data: null
      })
    }
    const result = await userServices.deleteOne({ id: validatedQuery.id })

    return res.status(200).json({
      message: "User deleted successfully",
      error: false,
      data: null
    })
  } catch (error) {
    console.log(`Error while deleting user in CATCH : ${error}`)
    return next(error)
  }
});

export default router;
