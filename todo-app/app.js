const { request, response } = require('express');
const express = require('express');
const app = express();
const { User, Todo } = require("./models");
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const connectEnsureLogin = require('connect-ensure-login');
const session = require('express-session');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const flash = require("connect-flash");
// Middleware setup
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.set("views", path.join(__dirname, "views"));
// Correct session configuration
app.use(session({
  secret: "my_secret_session_key_dont_see",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));
app.use(flash());
app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});
// Passport setup
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      return done(null, false, { message: 'Incorrect credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return done(null, false, { message: 'Incorrect password' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then(user => {
      done(null, user);
    })
    .catch(error => {
      done(error, null);
    });
});

// Routes and logic
app.get("/", async (req, res) => {
  res.render("index", { title: "Todo application" });
});

// Simple endpoint to test the API
app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log(request.user);
  const loggedinuser=request.user.id;
  const allTodos = await Todo.getTodos(loggedinuser);
  if (request.accepts('html')) {
    response.render("todos", { allTodos });
  } else {
    response.json({ allTodos });
  }
});

// Create a new To-Do
app.post('/todos', connectEnsureLogin.ensureLoggedIn(), async (request, response) => {
  console.log("Creating a todo", request.body);
  
  try {
    const todo = await Todo.create({
      title: request.body.title,
      dueDate: request.body.dueDate,
      userId: request.user.id,
      completed: false
    });
    
    request.flash('success', 'Todo created successfully!');
    return response.redirect('/todos');
  } catch (error) {
    console.log("Error creating todo:", error);

    if (error.name === 'SequelizeValidationError') {
      const errorMessages = error.errors.map(err => err.message);
      request.flash('error', errorMessages);
      return response.redirect('/todos'); // Redirect to the same page to show flash messages
    }

    return response.status(422).json({ error: "Failed to create todo." });
  }
});



// Update a To-Do's completion status
app.put("/todos/:id", async (request, response) => {
  console.log("Updating completion status of todo with ID:", request.params.id);
  try {
    const todo = await Todo.findByPk(request.params.id);
    if (!todo) {
      return response.status(404).json({ error: "Todo not found" });
    }

    const updatedTodo = await todo.update({ completed: request.body.completed });
    return response.json(updatedTodo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Delete a To-Do
app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(),async (request, response) => {
  try {
    const rowsDeleted = await Todo.destroy({
      where: { id: request.params.id,userId:request.user.id }
    });
    if (rowsDeleted === 0) {
      return response.status(404).json({ error: "Todo not found" });
    }
    return response.json({ success: true });
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

// Signup page
app.get("/signup", (request, response) => {
  response.render("signup", { title: "Signup" });
});

// User registration
app.post("/users", async (req, res) => {
  try {
    const hashedPwd = await bcrypt.hash(req.body.password, saltRounds);
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPwd
    });
    
    req.login(user, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error logging in after signup");
      }
      return res.redirect("/");
    });
  } catch (error) {
    console.error(error);
    res.status(422).json(error);
  }
});

// Login page
app.get("/login", (req, res) => {
  res.render('login', { title: "Login" });
});

// Login endpoint
app.post(
  "/session",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  function (request, response) {
    console.log(request.user);
    response.redirect("/todos");
  }
);
app.get("/signout",(req,res,next)=>{
  req.logout((err)=>{
    if(err) { return next(err);}
    res.redirect("/")
  })
})
module.exports = app; 