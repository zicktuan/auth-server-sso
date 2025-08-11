const validateEmail = (email) => {
    if (!email) {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test();
}

module.exports = {validateEmail};