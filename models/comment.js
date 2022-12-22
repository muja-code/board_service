'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Comment.belongsTo(models.User, {foreignKey:"user_id"});
      Comment.belongsTo(models.Post, {foreignKey:"post_id"});
    }
  }
  Comment.init({
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER
    },
    post_id: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'Comment',
    timestamps: false
  });
  return Comment;
};