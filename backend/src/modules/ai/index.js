const routes = require("./routes/ai.routes");
const controller = require("./controller/ai.controller");
const service = require("./service/chat.service");
const repository = require("./repository/ai-session.repository");

module.exports = {
  routes,
  controller,
  service,
  repository,
};
