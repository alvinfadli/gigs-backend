function resJSON(res, status, data, message) {
  res.status(status).json({
    status: status >= 200 && status < 300 ? "success" : "error",
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}
module.exports = {
  resJSON,
};
