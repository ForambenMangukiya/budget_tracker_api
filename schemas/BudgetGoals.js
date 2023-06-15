const mongoose = require("mongoose");

const BudgetGoals = new mongoose.Schema({
  _id: { type: String },
  y_saving_goal: { type: String },
  m_limit_bills: { type: String },
  m_limit_car: { type: String },
  m_limit_clothes: { type: String },
  m_limit_communication: { type: String },
  m_limit_eating_out: { type: String },
  m_limit_entertainment: { type: String },
  m_limit_food: { type: String },
  m_limit_gifts: { type: String },
  m_limit_health: { type: String },
  m_limit_house: { type: String },
  m_limit_pets: { type: String },
  m_limit_sports: { type: String },
  m_limit_taxi: { type: String },
  m_limit_toiletry: { type: String },
  m_limit_transport: { type: String },
});
