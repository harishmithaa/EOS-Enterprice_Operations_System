const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode ? err.statusCode : 500;

    res.status(statusCode);

    console.error(`Error: ${err.message}`);
    if (err.kind === 'ObjectId') {
        console.error(`Invalid ObjectId: ${err.value}`);
    }

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
