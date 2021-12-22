const jwtSecret = 'your_jwt_secret'; //must be same key used in JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport.js'); //local passport file

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //Username being encoded in the JWT
    expiresIn: '7d', //This specifies that the token expires in 7 days
    algorithm: 'HS256' //This is the algorithm used to 'sign' or encode the value of the JWT
  });
};

/* POST login. */
module.exports = (router) => {
   //You need to initiate passport middleware before the routes registration. From version 0.5.0 you have to add following lines for express!!
  router.use(passport.initialize());
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
