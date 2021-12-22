const express = require('express');
  bodyParser = require("body-parser"),
  uuid = require("uuid");

const morgan = require("morgan");
const app = express();

let cors = require('cors');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let auth = require('./auth')(app); //(app) ensures Express is available in the auth.js file

const passport = require('passport');
require('./passport');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie; //refers to model names in models.js file
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

let myLogger = (req, res, next) => {  //middleware
  console.log(req.url);
  next();
};

let requestTime = (req, res, next) => {   //middleware
  req.requestTime = Date.now();
  next();
}

app.use(myLogger);
app.use(requestTime);

app.get('/',(req,res) => {
  let responseText = 'Welcome ';
  responseText += '<small><br>Inquiry made at: '+ req.requestTime +'</small>';
  res.send(responseText);
});

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//****GET BY TITLE
app.get('/movies/:Title', (req, res) => { //be mindful of capitalization
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
  });

//****GET BY GENRE Name
app.get('/genres/:Name', (req, res) => {
  Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
      res.json(genre.Description);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//****GET BY Director (get Dir bio, birth year, death year)
app.get('/directors/:Name', (req, res) => {
  Directors.findOne({ Name: req.params.Name })
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//*****GET Users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//****POST NEW Movie
app.post('/movies', (req, res) => {
  let newMovie = req.body;
  if(!newMovie.title){
    const message = 'Missing title in request body.';
    res.status(400).send(message);
  } else {
    newMovie.id = uuid.v4();
    movies.push(newMovie);
    res.status(201).send(newMovie);
  }
});

//USERS Endpoints
//ADD USER - registration
app.post('/users',
//input validation section
  [
    check('Username', 'Username is required').isLength({ min: 4 }),
    check('Username', 'Username contains non alphanumeric characters - not allower',).isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email is required').isEmail()
  ],
  (req, res) => {  //maybe change to 'registration'?
  //check validation
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username : req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists.');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
          .then((user) => { res.status(201).json(user); })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//EDIT USER
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }, //makes sure updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//ADD MOVIES TO FAV MOVIE LIST
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
  { new: true },
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//DELETE users
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error' + err);
    });
  });

app.get('/documentation/documentation.html', (req, res) => {
  res.sendFile('documentation/documentation.html', { root: __dirname });
})

app.get('/secreturl', (req, res) => {
  let responseText = 'Secret url end point';
  responseText += '<small>Requested at: '+ req.requestTime +'</small>';
  res.send(responseText);
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
})

//app.listen(8080, () => {
//  console.log('App listening on port 8080');
//})

const port = process.env.PORT || 8080;
applisten(port, '0.0.0.0', () => {
  console.log('Listening on port ' + port);
});
