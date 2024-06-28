const mysql = require('mysql');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'antonio',
    password: '123456',
    database: 'usuarios',
    port: 3307,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting: ' + err.stack);
    return;
  }
  console.log('Connected to the database');

  connection.query('SELECT usuario, contraseña FROM usuarios', (error, results, fields) => {
    if (error) {
      console.error('Error in the user query: ' + error.stack);
      connection.end();
      return;
    }

    results.forEach(user => {
      bcrypt.hash(user.contraseña, 10, (err, hash) => {
        if (err) {
          console.error('Error hashing password: ' + err.stack);
          return;
        }

        connection.query('UPDATE usuarios SET contraseña = ? WHERE usuario = ?', [hash, user.usuario], (updateError, updateResults, updateFields) => {
          if (updateError) {
            console.error('Error updating password: ' + updateError.stack);
          } else {
            console.log(`Password for user ${user.usuario} updated successfully.`);
          }
        });
      });
    });

    // Termina la conexión después de un pequeño retraso para asegurar que todas las actualizaciones se completen
    setTimeout(() => {
      connection.end();
    }, 5000);
  });
});
