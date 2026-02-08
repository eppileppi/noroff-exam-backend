const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { validateParticipant } = require('../middleware/validation');

// Helper to handle database errors
const handleDbError = (res, error) => {
    console.error(error);
    res.status(500).json({ error: 'Database operation failed' });
};

// POST /participants/add
router.post('/add', validateParticipant, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { email, firstname, lastname, dob, work, home } = req.body;

        // Check if participant exists
        const [existing] = await connection.execute('SELECT id FROM participants WHERE email = ?', [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res.status(409).json({ error: 'Participant with this email already exists' });
        }

        // Insert Participant
        const [result] = await connection.execute(
            'INSERT INTO participants (email, firstname, lastname, dob) VALUES (?, ?, ?, ?)',
            [email, firstname, lastname, dob]
        );
        const participantId = result.insertId;

        // Insert Work
        await connection.execute(
            'INSERT INTO work (participant_id, companyname, salary, currency) VALUES (?, ?, ?, ?)',
            [participantId, work.companyname, work.salary, work.currency]
        );

        // Insert Home
        await connection.execute(
            'INSERT INTO home (participant_id, country, city) VALUES (?, ?, ?)',
            [participantId, home.country, home.city]
        );

        await connection.commit();
        res.status(201).json({ message: 'Participant added successfully' });
    } catch (error) {
        await connection.rollback();
        handleDbError(res, error);
    } finally {
        connection.release();
    }
});

// GET /participants - List all participants
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM participants');
        res.json({ participants: rows });
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /participants/details - Personal details of all participants
router.get('/details', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT firstname, lastname, email FROM participants');
        res.json({ participants: rows });
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /participants/details/:email - Personal details of specific participant
router.get('/details/:email', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT firstname, lastname, dob FROM participants WHERE email = ?',
            [req.params.email]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Participant not found' });
        res.json({ details: rows[0] });
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /participants/work/:email - Work details of specific participant
router.get('/work/:email', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT w.companyname, w.salary, w.currency 
             FROM work w 
             JOIN participants p ON w.participant_id = p.id 
             WHERE p.email = ?`,
            [req.params.email]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Participant or work details not found' });
        res.json({ work: rows[0] });
    } catch (error) {
        handleDbError(res, error);
    }
});

// GET /participants/home/:email - Home details of specific participant
router.get('/home/:email', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT h.country, h.city 
             FROM home h 
             JOIN participants p ON h.participant_id = p.id 
             WHERE p.email = ?`,
            [req.params.email]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Participant or home details not found' });
        res.json({ home: rows[0] });
    } catch (error) {
        handleDbError(res, error);
    }
});

// DELETE /participants/:email
router.delete('/:email', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [rows] = await connection.execute('SELECT id FROM participants WHERE email = ?', [req.params.email]);
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Participant not found' });
        }
        const participantId = rows[0].id;

        // Delete from Work & Home first (though CASCADE should handle it, explicit is safer in some contexts/drivers)
        // Actually the table definition has ON DELETE CASCADE, so deleting participant is enough.
        await connection.execute('DELETE FROM participants WHERE id = ?', [participantId]);

        await connection.commit();
        res.json({ message: 'Participant deleted successfully' });
    } catch (error) {
        await connection.rollback();
        handleDbError(res, error);
    } finally {
        connection.release();
    }
});

// PUT /participants/:email
router.put('/:email', validateParticipant, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const emailParam = req.params.email;
        const { email, firstname, lastname, dob, work, home } = req.body;

        // Check if participant exists
        const [rows] = await connection.execute('SELECT id FROM participants WHERE email = ?', [emailParam]);
        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Participant not found' });
        }
        const participantId = rows[0].id;

        // Update Participant
        // Note: Can we update email? If so, we need to check if new email collisions. 
        // The requirements say "updates the participant of the provided email". 
        // Usually ID is immutable. Email acts as ID here.
        // If email in body != email in param, and email in body exists -> conflict.
        if (email !== emailParam) {
            const [existing] = await connection.execute('SELECT id FROM participants WHERE email = ? AND id != ?', [email, participantId]);
            if (existing.length > 0) {
                await connection.rollback();
                return res.status(409).json({ error: 'New email already in use' });
            }
        }

        await connection.execute(
            'UPDATE participants SET email = ?, firstname = ?, lastname = ?, dob = ? WHERE id = ?',
            [email, firstname, lastname, dob, participantId]
        );

        // Update Work
        await connection.execute(
            'UPDATE work SET companyname = ?, salary = ?, currency = ? WHERE participant_id = ?',
            [work.companyname, work.salary, work.currency, participantId]
        );

        // Update Home
        await connection.execute(
            'UPDATE home SET country = ?, city = ? WHERE participant_id = ?',
            [home.country, home.city, participantId]
        );

        await connection.commit();
        res.json({ message: 'Participant updated successfully' });
    } catch (error) {
        await connection.rollback();
        handleDbError(res, error);
    } finally {
        connection.release();
    }
});

module.exports = router;
