const jwt = require('jsonwebtoken');
const secretKey = '7a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3q4r5s6t7u8v9w0x1y2z3a4b5c6d7e8f9g0h1i2j3k4l5m6n7o8p9q0';

const authenticationMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    
    if (!decoded) {
      return res.status(401).redirect('/login');
    }

    next();
  } catch (error) {
    res.status(401).redirect('/login');
  }
};

module.exports = authenticationMiddleware;
