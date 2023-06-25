// Create and send token , then save in cookie.
const sendToken = (user, statusCode, res) => {
    // Create JWT token
    const token = user.getJwtToken();

    // Options for the cookie
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + process.env.COOKIE_EXPIRES_TIME);

    const options = {
        expires: expirationDate,
        httpOnly: true
    };

    // TODO: Enable in production.
    // if(process.env.NODE_ENV === 'production') {
    //     options.secure = true;
    // }

    // Set the cookie with the token and send the response
    res.cookie('token', token, options); // Set the cookie
    res.status(statusCode).json({
        success: true,
        token
    });
}

module.exports = sendToken;