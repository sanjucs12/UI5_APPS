
const cds = require('@sap/cds');

module.exports = function () {
    this.on('TEST_Entity', async (req) => {
        console.log('bande elli')
        return `Received: Entity}`;
    });
    this.on('testFunction', async (req) => {
        console.log('bande')
        return `Received: Function`;
    });
};
