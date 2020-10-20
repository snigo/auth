exports.badRequest = (res) => res.status(400).json({ error: 'Bad request.' });

exports.invalidCredentials = (res) => res.status(401).json({ error: 'Invalid credentials.' });

exports.conflict = (res) => res.status(409).json({ error: 'Already signed up.' });

exports.serverError = (res) => res.status(500).json({ error: 'Internal server error.' });
