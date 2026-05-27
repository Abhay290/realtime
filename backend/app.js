import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors'
import 'dotenv/config';
import usersRouter from './routes/users.js';
import hierarchyRouter from './routes/hierarchy.js'
import authentication from './middleware/auth.js';
var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors({
  origin: '*'
}))

app.use('/users', usersRouter);
app.use('/hierarchy',authentication,hierarchyRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  return res.json({
    message: err.message,
    error: true,
    data: null
  })
});


app.listen(process.env.PORT, () => {
  console.log(`Server started on port : ${process.env.PORT}`)
})


export default app
