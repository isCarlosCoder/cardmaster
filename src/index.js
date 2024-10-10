const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configurar EJS como o motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para não conseguir acessar home e jogos sem login
app.use((req, res, next) => {
  req.isAuthenticated = () => {
    return false;
  };

  if (req.path === '/home' || req.path === '/jogos') {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/login');
    }
  } else {
    next();
  }
});

// Rotas
app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/registro', (req, res) => {
  res.render('registro');
});

app.get('/confirmacao', (req, res) => {
  res.render('confirmacao');
});

app.get('/termos-de-servicos', (req, res) => {
  res.render('termos-de-servicos');
});

app.get('/politica-de-privacidade', (req, res) => {
  res.render('politica-de-privacidade');
});

app.get('/suporte', (req, res) => {
  res.render('suporte');
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.get('/jogos', (req, res) => {
  res.render('jogos');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
