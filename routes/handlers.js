exports.badRequest = (res) => res.status(400).json({ error: 'Bad request.' });

exports.invalidCredentials = (res) => res.status(401).json({ error: 'Invalid credentials.' });

exports.forbidden = (res) => res.status(403).json({ error: 'Operation not allowed.' });

exports.conflict = (res) => res.status(409).json({ error: 'Already signed up.' });

exports.serverError = (res) => res.status(500).json({ error: 'Internal server error.' });
