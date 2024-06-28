const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express(); 
app.use(cors());
app.use(bodyParser.json());

const SECRET_KEY = 'your_secret_key'; 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'antonio',
    password: '123456',
    database: 'usuarios',
    port: 3307,
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

app.post('/register', (req, res) => {
    const { usuario, contraseña } = req.body;
    const hashedPassword = bcrypt.hashSync(contraseña, 8);

    const query = 'INSERT INTO usuarios (usuario, contraseña) VALUES (?, ?)';
    db.query(query, [usuario, hashedPassword], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(201).send({ message: 'User registered successfully' });
    });
});

app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;
    const query = 'SELECT * FROM usuarios WHERE usuario = ?';
    db.query(query, [usuario], (err, results) => {
        if (err) {
            console.error('Error en la consulta de usuario:', err);
            return res.status(500).send({ message: 'Server error' });
        } else if (results.length > 0) {
            const user = results[0];
            console.log('Usuario encontrado:', user);
            const passwordIsValid = bcrypt.compareSync(contraseña, user.contraseña);
            if (!passwordIsValid) {
                console.log('Contraseña inválida');
                return res.status(401).send({ message: 'Invalid credentials' });
            }
            const token = jwt.sign({ id: user.id }, SECRET_KEY, {
                expiresIn: 86400, // 24 hours
            });
            console.log('Token generado:', token); // Verifica que el token se genera
            res.status(200).send({ message: 'Login successful', token });
        } else {
            console.log('Usuario no encontrado');
            res.status(404).send({ message: 'User not found' });
        }
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).send({ message: 'No token provided' });

    const bearerToken = token.split(' ')[1]; // Obtener el token sin el prefijo Bearer

    jwt.verify(bearerToken, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(500).send({ message: 'Failed to authenticate token' });
        req.userId = decoded.id;
        next();
    });
};

app.get('/usuarios', verifyToken, (req, res) => {
    const query = 'SELECT * FROM usuarios';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});

app.get('/productos', verifyToken, (req, res) => {
    const query = 'SELECT * FROM productos';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});

app.post('/productos', verifyToken, (req, res) => {
    const { nombre, precio } = req.body;
    const query = 'INSERT INTO productos (nombre, precio) VALUES (?, ?)';
    db.query(query, [nombre, precio], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(201).send({ message: 'Product added successfully' });
    });
});

app.delete('/productos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM productos WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).send({ message: 'Product deleted successfully' });
    });
});

// Endpoints para Cajas
app.get('/cajas', verifyToken, (req, res) => {
    const query = 'SELECT * FROM cajas';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});

app.post('/cajas', verifyToken, (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO cajas (nombre) VALUES (?)';
    db.query(query, [nombre], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(201).send({ message: 'Caja added successfully' });
    });
});

app.put('/cajas/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const query = 'UPDATE cajas SET nombre = ? WHERE id = ?';
    db.query(query, [nombre, id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).send({ message: 'Caja updated successfully' });
    });
});

app.delete('/cajas/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM cajas WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).send({ message: 'Caja deleted successfully' });
    });
});

// Endpoints para Categorias
app.get('/categorias', verifyToken, (req, res) => {
    const query = 'SELECT * FROM categorias';
    db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).json(results);
    });
});

app.post('/categorias', verifyToken, (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO categorias (nombre) VALUES (?)';
    db.query(query, [nombre], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(201).send({ message: 'Categoria added successfully' });
    });
});

app.put('/categorias/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const query = 'UPDATE categorias SET nombre = ? WHERE id = ?';
    db.query(query, [nombre, id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).send({ message: 'Categoria updated successfully' });
    });
});

app.delete('/categorias/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM categorias WHERE id = ?';
    db.query(query, [id], (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Server error' });
        }
        res.status(200).send({ message: 'Categoria deleted successfully' });
    });
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
