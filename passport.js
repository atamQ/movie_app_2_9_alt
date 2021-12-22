const passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy, //one passport strategy for HTTP auth
  Models = require('./models.js'),
  passportJWT = require('passport-jwt'); //associate passportJWT with passport-JWT package

//for validating input
const { check, validationResult } = require('express-validator');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy, //declare JWTStrategy as str. for passportJWT
  ExtractJWT = passportJWT.ExtractJwt;

  passport.use(new LocalStrategy({
    usernameField: 'Username',
    passwordField: 'Password'
  }, (username, password, callback) => {
    console.log(username + '  ' + password);
    Users.findOne({ Username: username }, (error, user) => {
      if (error) {
        console.log(error);
        return callback(error);
      }

      if (!user) {
        console.log('incorrect username');
        return callback(null, false, {message: 'Incorrect username or password.'});
      }

      if (!user.validatePassword(password)) {
        console.log('incorrect password');
        return callback(null, false, {message: 'Incorrect password' });
      }

      console.log('finished');
      return callback(null, user);
    });
  }));

  passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'your_jwt_secret'
  }, (jwtPayload, callback) => {
    return Users.findById(jwtPayload._id)
      .then((user) => {
        return callback(null, user);
      })
      .catch((error) => {
        return callback(error)
      });
  }));
