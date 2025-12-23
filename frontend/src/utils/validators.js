export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const validatePassword = (password) => {
    return password.length >= 6
}

export const validateMigrationOptions = (options) => {
    const errors = {}

    if (!options.migrationType) {
        errors.migrationType = 'Migration type is required'
    }

    if (!options.outlookToken) {
        errors.outlookToken = 'Outlook token is required'
    }

    if (!options.gmailToken) {
        errors.gmailToken = 'Gmail token is required'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    }
}