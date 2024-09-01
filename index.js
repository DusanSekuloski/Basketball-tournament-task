const Simulation = require('./src/services/simulation');

(async () => {
    const simulation = new Simulation('./src/data/groups.json');
    await simulation.loadTeams();
    await simulation.simulate();
})();
