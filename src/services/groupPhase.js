const Team = require('./team');

class Group {
    constructor(groupName, teams) {
        this.groupName = groupName;
        this.teams = teams.map((team) => new Team(team.Team, team.ISOCode, team.FIBARanking));
        this.matchHistory = [];
    }

    async simulateGroupPhase() {
        console.log(`\nGrupa ${this.groupName}:`);
        const matchups = this.#generateMatchups();
        let matchCounter = 0;
        let roundCounter = 1;
        console.log(`Grupna faza - ${roundCounter}. kolo`);
        for (const [team1, team2] of matchups) {
            const team1Forfeits = Math.random() < 0.1;
            const team2Forfeits = !team1Forfeits && Math.random() < 0.1;
            const result = await this.#simulateGroupPhaseMatch(team1, team2, team1Forfeits, team2Forfeits);
            console.log(`\t${team1.name} - ${team2.name}  (${result})`);
            matchCounter++;

            if (matchCounter % 2 === 0 && roundCounter < 3) {
                roundCounter++;
                console.log(`\n Grupna faza - ${roundCounter}. kolo`);
            }
        }
    }

    #generateMatchups() {
        const matches = [];
        const numRounds = this.teams.length - 1;

        for (let round = 0; round < numRounds; round++) {
            for (let i = 0; i < this.teams.length / 2; i++) {
                const team1 = this.teams[i];
                const team2 = this.teams[this.teams.length - 1 - i];
                matches.push([team1, team2]);
            }
            this.teams.splice(1, 0, this.teams.pop());
        }
        return matches;
    }

    #simulateGroupPhaseMatch(team1, team2, team1Forfeits = false, team2Forfeits = false) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let score1, score2;

                if (team1Forfeits) {
                    score1 = 0;
                    score2 = 0;
                    team2.wins += 1;
                    team2.leaguePoints += 2;
                    team1.losses += 1;
                } else if (team2Forfeits) {
                    score1 = 0;
                    score2 = 0;
                    team1.wins += 1;
                    team1.leaguePoints += 2;
                    team2.losses += 1;
                } else {
                    score1 = Math.floor(Math.random() * 101);
                    score2 = Math.floor(Math.random() * 101);
                    team1.aggregatePoints += score1;
                    team1.pointsAllowed += score2;
                    team1.pointsDifferential += score1 - score2;
                    team2.aggregatePoints += score2;
                    team2.pointsAllowed += score1;
                    team2.pointsDifferential += score2 - score1;

                    while (score1 === score2) {
                        score1 = Math.floor(Math.random() * 101);
                        score2 = Math.floor(Math.random() * 101);
                    }

                    if (score1 > score2) {
                        team1.wins += 1;
                        team2.losses += 1;
                        team1.leaguePoints += 2;
                        team2.leaguePoints += 1;
                    } else if (score1 < score2) {
                        team2.wins += 1;
                        team1.losses += 1;
                        team2.leaguePoints += 2;
                        team1.leaguePoints += 1;
                    }
                }
                this.matchHistory.push({
                    team1: team1,
                    team2: team2,
                    team1Score: score1,
                    team2Score: score2,
                });

                resolve(`${score1} : ${score2}`);
            }, 50);
        });
    }

    updateTeamRankingsInAllGroups() {
        const rankedTeams = this.rankTeamsInTheirGroup();
        console.log(`\tGrupa ${this.groupName} (Ime - pobede/porazi/bodovi/postignuti koševi/primljeni koševi/koš razlika)::`);
        rankedTeams.forEach((team, index) => {
            console.log(
                `\t\t${index + 1}. ${team.name} - ${team.wins} / ${team.losses} / ${team.leaguePoints} / ${team.aggregatePoints} / ${team.pointsAllowed} / ${team.pointsDifferential}`
            );
        });
    }
    rankTeamsInTheirGroup() {
        return this.teams.slice().sort((a, b) => {
            // 1. Sort by league points
            if (b.leaguePoints !== a.leaguePoints) {
                return b.leaguePoints - a.leaguePoints;
            }

            // 2. If league points are the same, and there are only two teams involved, rank by head-to-head result
            const teamsWithSamePoints = this.#teamsWithSameLeaguePoints(a, b);
            if (teamsWithSamePoints.length === 2) {
                return this.#headToHeadResult(a, b);
            }

            // 3. If 3 teams have the same number of league points, sort by points differential
            if (b.pointsDifferential !== a.pointsDifferential) {
                return b.pointsDifferential - a.pointsDifferential;
            }
        });
    }

    #teamsWithSameLeaguePoints(a, b) {
        return this.teams.filter((team) => team.leaguePoints === a.leaguePoints && team.leaguePoints === b.leaguePoints);
    }

    #headToHeadResult(teamA, teamB) {
        const match = this.matchHistory.find(
            (match) => (match.team1 === teamA && match.team2 === teamB) || (match.team1 === teamB && match.team2 === teamA)
        );

        if (
            (match.team1 === teamA && match.team1Score > match.team2Score) ||
            (match.team2 === teamA && match.team2Score > match.team1Score)
        ) {
            return -1; // teamA wins
        }

        return 1; // teamB wins
    }
}

module.exports = Group;
