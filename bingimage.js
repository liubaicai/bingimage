
var Sequelize = require('sequelize');

const operatorsAliases = {}

const seq = new Sequelize('sqlite://db/db.sqlite', { operatorsAliases });

const bingImage = seq.define('bing_images', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    startDate: {
        type: Sequelize.STRING,
        allowNull: true
    },
    fullStartDate: {
        type: Sequelize.STRING,
        allowNull: true
    },
    endDate: {
        type: Sequelize.STRING,
        allowNull: true
    },
    url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    urlBase: {
        type: Sequelize.STRING,
        allowNull: false
    },
    copyright: {
        type: Sequelize.STRING,
        allowNull: true
    },
    copyrightLink: {
        type: Sequelize.STRING,
        allowNull: true
    },
    downloadCount: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    }
}, {
    timestamps: true
});

bingImage.sync();

module.exports = bingImage;