const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const prisma = require('./prisma');
const authenticationMiddleware = require('./middlewares');

const app = express();
const port = process.env.PORT || 3000;
const secretKey = '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0';


// Configurar EJS como o motor de visualização
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware para não conseguir acessar home e jogos sem login
app.use('/home', authenticationMiddleware);
app.use('/jogos', authenticationMiddleware);

// Middleware para redirecionar usuários logados
const redirectIfLoggedIn = (req, res, next) => {
  if (req.cookies?.token) {
    return res.redirect('/home');
  }
  next();
};


// Rotas
app.get('/', redirectIfLoggedIn, (req, res) => {
  res.render('index');
});

app.get('/login', redirectIfLoggedIn, (req, res) => {
  res.render('login');
});

app.get('/registro', redirectIfLoggedIn, (req, res) => {
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

app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

app.get('/home', async (req, res) => {
  // Extrai o token do cookie
  const token = req.cookies?.token

  // Verifica se o token existe
  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    // Verifica e decodifica o token
    const decoded = await jwt.verify(token, secretKey);
    const userId = decoded.userId; // Assumindo que o ID do usuário está armazenado como 'userId' no token

    // Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Se o usuário não for encontrado, limpa o cookie e redireciona para o login
      res.clearCookie('token');
      return res.status(401).redirect('/login');
    }

    // Renderiza a página home com os dados do usuário
    res.render('home', { user });

  } catch (error) {
    // Trata erros de verificação do token ou busca do usuário
    console.error('Erro na autenticação:', error.message);
    res.clearCookie('token');
    res.status(401).redirect('/login');
  }
});

app.get('/jogos', (req, res) => {
  res.render('jogos');
});

// Metodos post
app.post('/registro', async (req, res) => {
  try {
    const { name, lastName, birthdate, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).render('registro', {
        error: 'As senhas não conferem'
      });
    }

    const username = name.trim() + " " + lastName.trim();
    const age = new Date().getFullYear() - new Date(birthdate).getFullYear();

    if (age < 18) {
      return res.status(400).render('registro', {
        error: 'Você deve ter pelo menos 18 anos para se registrar'
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).render('registro', {
        error: 'Usuário ou e-mail já existe'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: username, email, password: hashedPassword },
    });

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).render('registro', {
      error: 'Erro ao registrar usuário'
    });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).render('login', { error: 'Email ou senha incorretos' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).render('login', { error: 'Email ou senha incorretos' });
  }

  const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1d' });
  await res.cookie('token', token);
  await res.redirect('/home');
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
