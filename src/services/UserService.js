const db = require('../database');
const bcrypt = require('bcrypt');

class UserService {
  static async register(userData) {
    const { username, email, password } = userData;
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash],
        function(err) {
          if (err) reject(err);
          resolve({ id: this.lastID, username, email });
        }
      );
    });
  }

  static async login(credentials) {
    const { email, password } = credentials;

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, password_hash FROM users WHERE email = ?',
        [email],
        async (err, user) => {
          if (err) reject(err);
          if (!user) reject(new Error('User not found'));

          const isValid = await bcrypt.compare(password, user.password_hash);
          if (!isValid) reject(new Error('Invalid password'));

          resolve({ id: user.id, username: user.username, email: user.email });
        }
      );
    });
  }

  static async getUserById(userId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT id, username, email, created_at FROM users WHERE id = ?',
        [userId],
        (err, user) => {
          if (err) reject(err);
          resolve(user);
        }
      );
    });
  }
}

module.exports = UserService;
