const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
    ImagePath: String,
    Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

//hashing functions
userSchema.statics.hashPassword = (password) => {
  return bcryptjs.hashSync(password, 10);
}

userSchema.methods.validatePassword = function(password) {
  return bcryptjs.compareSync(password, this.Password);
};

let directorSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Biography: { type: String, required: true },
  Birthday: Date
});

let genreSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Description: { type: String, required: true }
});

let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);
let Movie = mongoose.model('Movie', movieSchema); //in Mongo model will be in collection with lowercase and plural (db.movies)
let User = mongoose.model('User', userSchema);



module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Genre = Genre;
module.exports.Director = Director;
