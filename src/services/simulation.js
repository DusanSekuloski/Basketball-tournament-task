const fs = require('fs').promises;
const Group = require('./groupPhase');
const PotPhase = require('./potPhase');

class Simulation {
    constructor(filePath) {
        this.filePath = filePath;
        this.groups = [];
        this.topTeams = [];
    }

    async loadTeams() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            const parsedData = JSON.parse(data);
            this.groups = Object.entries(parsedData).map(([groupName, teams]) => new Group(groupName, teams));
        } catch (error) {
            console.error('Error reading or parsing the JSON file:', error);
        }
    }

    async simulate() {
        for (const group of this.groups) {
            await group.simulateGroupPhase();
            const topTeamsInGroup = group.rankTeamsInTheirGroup().slice(0, 3);
            this.topTeams.push(...topTeamsInGroup);
        }
        console.log('\nKonačan plasman u grupama:');
        this.groups.forEach((group) => group.updateTeamRankingsInAllGroups());

        const topTeams = this.rankTopTeams();
        await this.simulatePotPhase(topTeams);
    }

    async simulatePotPhase(topTeams) {
        const potPhase = new PotPhase(this.groups, topTeams);

        const potsStructure = potPhase.createPotsStructure();
        const quarterFinalResults = await potPhase.createQuarterFinals(potsStructure);
        const semiFinalResults = await potPhase.createSemiFinals(quarterFinalResults);
        const { finalResult, thirdPlaceResult } = await potPhase.createFinal(semiFinalResults);

        potPhase.listMedalWinners(finalResult, thirdPlaceResult);
    }

    rankTopTeams() {
        this.topTeams.sort((a, b) => {
            if (b.leaguePoints !== a.leaguePoints) {
                return b.leaguePoints - a.leaguePoints;
            }
            if (b.pointsDifferential !== a.pointsDifferential) {
                return b.pointsDifferential - a.pointsDifferential;
            }
            return b.aggregatePoints - a.aggregatePoints;
        });

        console.log('\nEkipe koje su prosle dalje:');
        this.topTeams.forEach((team, index) => {
            console.log(
                `${index + 1}. ${team.name} - ${team.leaguePoints} bod/boda / Kos razlika: ${team.pointsDifferential} / broj postignutih koseva: ${team.aggregatePoints}`
            );
        });

        if (this.topTeams.length >= 9) {
            const eliminatedTeam = this.topTeams.pop();
            console.log(`\nEliminisana ekipa: ${eliminatedTeam.name}`);
        }
        return this.topTeams;
    }
}

module.exports = Simulation;
