import jwt from 'jsonwebtoken';
import 'dotenv/config'

export default async function authentication(req, res, next) {
    try {
        const token = req.headers['authorization'];
        if(!token){
            return res.status(404).json({
                message:"Token not found, Please login again",
                error:true,
                data:null
            })
        }
        const decode = jwt.decode(token)
        // console.log(decode,'====>token decoded')
       const currentUnixTimeStamp = Math.floor(Date.now() / 1000);
       if(currentUnixTimeStamp > decode.exp){
        return res.status(400).json({
            message:"Session expired, login again",
            error:true,
            data:null
        })
       }

        next()
    } catch (error) {
        console.log(`Error in auth function : ${error}`)
        return next(error)
    }
}
