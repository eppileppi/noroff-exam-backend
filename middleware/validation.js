const validateParticipant = (req, res, next) => {
    const { email, firstname, lastname, dob, work, home } = req.body;

    // Helper to validate email format
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Helper to validate date format (YYYY-MM-DD)
    const isValidDate = (dateString) => {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;
        const date = new Date(dateString);
        const timestamp = date.getTime();
        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
        return dateString === date.toISOString().split('T')[0];
    };

    const errors = [];

    if (!email || !isValidEmail(email)) {
        errors.push('Invalid or missing email address');
    }
    if (!firstname || typeof firstname !== 'string' || firstname.trim() === '') {
        errors.push('Invalid or missing first name');
    }
    if (!lastname || typeof lastname !== 'string' || lastname.trim() === '') {
        errors.push('Invalid or missing last name');
    }
    if (!dob || !isValidDate(dob)) {
        errors.push('Invalid or missing date of birth (format: YYYY-MM-DD)');
    }

    // Validate nested objects if they exist (assuming strictly required based on "All properties must be provided")
    if (!work || typeof work !== 'object') {
        errors.push('Missing work details');
    } else {
        if (!work.companyname || typeof work.companyname !== 'string') errors.push('Invalid or missing company name');
        if (!work.salary || typeof work.salary !== 'number') errors.push('Invalid or missing salary');
        if (!work.currency || typeof work.currency !== 'string') errors.push('Invalid or missing currency');
    }

    if (!home || typeof home !== 'object') {
        errors.push('Missing home details');
    } else {
        if (!home.country || typeof home.country !== 'string') errors.push('Invalid or missing country');
        if (!home.city || typeof home.city !== 'string') errors.push('Invalid or missing city');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors
        });
    }

    next();
};

module.exports = { validateParticipant };
