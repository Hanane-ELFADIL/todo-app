const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

let users = [];
let tasks = [];

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Format du token invalide" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
}

app.get("/", (req, res) => {
  res.json({ message: "Backend TODO LIST en marche" });
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires" });
    }

    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: "Cet email existe déjà" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword
    };

    users.push(newUser);

    res.status(201).json({
      message: "Inscription réussie",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ message: "Utilisateur introuvable" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Connexion réussie",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/me", authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.id);

  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé" });
  }

  res.json({
    id: user.id,
    name: user.name,
    email: user.email
  });
});

app.post("/api/tasks", authMiddleware, (req, res) => {
  const { text, priority, date } = req.body;

  if (!text) {
    return res.status(400).json({ message: "La tâche est obligatoire" });
  }

  const newTask = {
    id: Date.now().toString(),
    userId: req.user.id,
    text,
    priority: priority || "medium",
    date: date || "",
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);

  res.status(201).json({
    message: "Tâche ajoutée",
    task: newTask
  });
});

app.get("/api/tasks", authMiddleware, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks);
});

app.put("/api/tasks/:id", authMiddleware, (req, res) => {
  const task = tasks.find(
    t => t.id === req.params.id && t.userId === req.user.id
  );

  if (!task) {
    return res.status(404).json({ message: "Tâche introuvable" });
  }

  const { text, priority, date, done } = req.body;

  if (text !== undefined) task.text = text;
  if (priority !== undefined) task.priority = priority;
  if (date !== undefined) task.date = date;
  if (done !== undefined) task.done = done;

  res.json({
    message: "Tâche modifiée",
    task
  });
});

app.delete("/api/tasks/:id", authMiddleware, (req, res) => {
  const taskIndex = tasks.findIndex(
    t => t.id === req.params.id && t.userId === req.user.id
  );

  if (taskIndex === -1) {
    return res.status(404).json({ message: "Tâche introuvable" });
  }

  tasks.splice(taskIndex, 1);

  res.json({ message: "Tâche supprimée" });
});

app.post("/api/logout", authMiddleware, (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});