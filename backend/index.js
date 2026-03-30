require('dotenv').config();
const fs = require('node:fs');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const users = require('./users.json');
const path = require('node:path');

const app = express();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
const router = express.Router();
app.use('/api', router);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const HTTPS_ENABLED = process.env.HTTPS_ENABLED || false;

if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');

let organizers = [{
    name: 'Unit1',
    data: [[[]]],
}];

try {
    organizers = JSON.parse(fs.readFileSync('./storage.json', { encoding: 'utf8' }));
}
catch (e) {
    console.log("empty");
}

function requireAuth(req, res, next) {
    try {
        const payload = jwt.verify(req.cookies.token, JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (!user || !bcrypt.compareSync(password, user))
        return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ username: username }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('token', token, {
        httpOnly: true,
        secure: HTTPS_ENABLED === 'true',
        sameSite: 'Strict',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.json({ ok: true });
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ ok: true });
});

router.get('/organizers', requireAuth, (req, res) => {
    res.json(organizers);
});

router.post('/organizers', requireAuth, (req, res) => {
    organizers = req.body.organizers;
    fs.writeFileSync('./storage.json', JSON.stringify(req.body.organizers), { encoding: 'utf8' });
    res.sendStatus(200);
});

router.get('/me', requireAuth, (req, res) => {
    res.json({ username: req?.user?.username });
});

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});