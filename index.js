const admin = require("firebase-admin");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const serviceAccount = require("./foreverdle-firebase-adminsdk-owboh-f14f9bad9e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://foreverdle-default-rtdb.firebaseio.com/",
});

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// CRUD endpoints

// app.get("/api/data", (req, res) => {
//   admin
//     .database()
//     .ref('data')
//     .once('value')
//     .then((snapshot) => {
//       const data = snapshot.val();
//       console.log(data);
//       console.log("Fetched All Data:", data);
//       res.json(data);
//     })
//     .catch((error) => {
//       console.error(error);
//       res.status(500).send("Error reading data");
//     });
// });

app.get("/api/data", (req, res) => {
  const id = req.query.id;
  console.log("Requested ID:", id);

  admin
    .database()
    .ref(`data/${id}`)
    .once(`value`)
    .then((snapshot) => {
      const data = snapshot.val();
      console.log(data);
      console.log("Fetched Data:", data);
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error reading data");
    });
});

app.post("/api/data", (req, res) => {
  // Assuming you have access to the user's UID through the authentication system
  const userUid = req.body.uid; // Update this based on your authentication implementation
  console.log(req.body.uid)
  const newData = req.body;

  // Save the data using the user's UID as the document ID
  const newRef = admin.database().ref("data").child(userUid);
  newRef
    .set(newData)
    .then(() => {
      res.json({ message: "Data created successfully" });
console.log(userUid);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error creating data");
    });
});



app.put("/api/data", (req, res) => {
  const id = req.query.id;
  console.log(id);
  const updatedData = req.body;
  admin
    .database()
    .ref(`data/${id}`)
    .update(updatedData)
    .then(() => {
      res.json({ message: "Data updated successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error updating data");
    });
});

app.delete("/api/data/:id", (req, res) => {
  const id = req.params.id;
  admin
    .database()
    .ref(`data/${id}`)
    .remove()
    .then(() => {
      res.json({ message: "Data deleted successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error deleting data");
    });
});

// Sign-up endpoint
app.post("/api/signup", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  admin
    .auth()
    .createUser({
      email: email,
      password: password,
      emailVerified: true,
    })
    .then((userRecord) => {
      res.json({ message: "Signup successful", user: userRecord.toJSON() });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error signing up");
    });
});

// Sign-in endpoint
app.post("/api/signin", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  admin
    .auth()
    .getUserByEmail(email)
    .then((userRecord) => {
      if (userRecord && userRecord.emailVerified) {
        if (checkPasswordFunction(password, userRecord.passwordHash)) {
          res.json({ message: "Signin successful", user: userRecord.toJSON() });
        } else {
          res.status(401).send("Invalid credentials");
        }
      } else {
        res.status(401).send("User not found or email not verified");
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error signing in");
    });
});

function checkPasswordFunction(password, hashedPassword) {
  return true; // Implement password comparison logic here
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
