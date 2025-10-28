//server.js
require('dotenv').config(); // โหลดค่าจาก .env

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // สำหรับเข้ารหัส password
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ใช้ค่าจาก .env
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Route ทดสอบการเชื่อมต่อ
app.get('/ping', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW() AS now');
    res.json({ status: 'ok', time: rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ GET users (ดึงทั้งหมด)
app.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM tbl_users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// ✅ GET /users/:id (ดึงข้อมูลรายคน)
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM tbl_users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Query failed' });
  }
});

// ✅ POST /users (เพิ่มผู้ใช้ใหม่)
app.post('/users', async (req, res) => {
  const { firstname, fullname, lastname, username, password, status } = req.body;

  try {
    if (!password) return res.status(400).json({ error: 'Password is required' });

    // เข้ารหัส password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO tbl_users (firstname, fullname, lastname, username, password, status) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, fullname, lastname, username, hashedPassword, status]
    );

    res.json({
      id: result.insertId,
      firstname, 
      fullname, 
      lastname, 
      username,  
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// ✅ PUT /users/:id (แก้ไขข้อมูลผู้ใช้)
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const  {firstname, fullname, lastname, username, password, status } = req.body;

  try {
    // ดึงข้อมูลเก่าเพื่อตรวจสอบก่อน
    const [existing] = await db.query('SELECT * FROM tbl_users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // ถ้ามี password ใหม่ให้ hash
    let hashedPassword = existing[0].password;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }
    

    const [result] = await db.query(
      'UPDATE tbl_users SET firstname = ?, fullname = ?, lastname = ?, username = ?, password = ?, status = ? WHERE id = ?',
      [firstname, fullname, lastname, username, hashedPassword, status, id]
    );

    res.json({
      message: 'User updated successfully',
      id,
      firstname, 
      fullname, 
      lastname, 
      username, 
      password, 
      status
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ✅ DELETE /users/:id (ลบข้อมูลผู้ใช้)
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM tbl_users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // รีเซ็ตค่า AUTO_INCREMENT ให้เรียงใหม่
    await db.query('ALTER TABLE tbl_users AUTO_INCREMENT = 1');

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ✅ เริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
