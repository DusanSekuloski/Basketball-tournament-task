class PotPhase {
    constructor(groups, topTeams) {
        this.groups = groups;
        this.topTeams = topTeams;
        this.matchHistory = this.#collectMatchHistory();
    }

    #collectMatchHistory() {
        const history = [];
        for (const group of this.groups) {
            history.push(...group.matchHistory);
        }
        return history;
    }

    createPotsStructure() {
        const { potD, potE, potF, potG } = this.#arrangePots();
        const potsStructure = [];

        for (const teamD of potD) {
            let opponent = potG.find((teamG) => !this.#teamsHavePlayedBefore(teamD, teamG));

            if (opponent) {
                potsStructure.push({ team1: teamD, opponent });
                potG.splice(potG.indexOf(opponent), 1);
            } else {
                opponent = potG.shift();
                potsStructure.push({ team1: teamD, opponent });
            }
        }

        for (const teamE of potE) {
            let opponent = potF.find((teamF) => !this.#teamsHavePlayedBefore(teamE, teamF));

            if (opponent) {
                potsStructure.push({ team1: teamE, opponent });
                potF.splice(potF.indexOf(opponent), 1);
            } else {
                opponent = potF.shift();
                potsStructure.push({ team1: teamE, opponent });
            }
        }

        console.log('\nEliminaciona faza:');
        potsStructure.forEach((matchup) => {
            console.log(`${matchup.team1.name} - ${matchup.opponent.name}`);
        });

        return potsStructure;
    }

    #teamsHavePlayedBefore(team1, team2) {
        return this.matchHistory.some(
            (match) => (match.team1 === team1 && match.team2 === team2) || (match.team1 === team2 && match.team2 === team1)
        );
    }

    #arrangePots() {
        const potD = this.topTeams.slice(0, 2);
        const potE = this.topTeams.slice(2, 4);
        const potF = this.topTeams.slice(4, 6);
        const potG = this.topTeams.slice(6, 8);

        console.log('\nSesiri:');
        console.log('\n\tSesir D:', potD.map((team) => team.name).join(', '));
        console.log('\n\tSesir E:', potE.map((team) => team.name).join(', '));
        console.log('\n\tSesir F:', potF.map((team) => team.name).join(', '));
        console.log('\n\tSesir G:', potG.map((team) => team.name).join(', '));

        return { potD, potE, potF, potG };
    }

    createQuarterFinals(potsStructure) {
        console.log('\nČetvrtfinale');
        const quarterFinalResults = this.#simulatePhaseMatches(potsStructure);
        return quarterFinalResults;
    }

    createSemiFinals(quarterFinalResults) {
        console.log('\nPolufinale');
        const semiFinalMatches = [
            { team1: quarterFinalResults[0].winner, opponent: quarterFinalResults[1].winner },
            { team1: quarterFinalResults[2].winner, opponent: quarterFinalResults[3].winner },
        ];
        const semiFinalResults = this.#simulatePhaseMatches(semiFinalMatches);
        return semiFinalResults;
    }

    #simulatePhaseMatches(matches) {
        const results = [];
        for (const match of matches) {
            results.push(this.#simulateMatch(match.team1, match.opponent));
        }
        return results;
    }

    createFinal(semiFinalResults) {
        const finalMatch = { team1: semiFinalResults[0].winner, opponent: semiFinalResults[1].winner };
        const thirdPlaceMatch = { team1: semiFinalResults[0].loser, opponent: semiFinalResults[1].loser };

        console.log('\nFinale:');
        const finalResult = this.#simulateMatch(finalMatch.team1, finalMatch.opponent);

        console.log('\nUtakmica za treće mesto:');
        const thirdPlaceResult = this.#simulateMatch(thirdPlaceMatch.team1, thirdPlaceMatch.opponent);

        return { finalResult, thirdPlaceResult };
    }

    #simulateMatch(team1, team2) {
        let score1, score2;

        // Simulate scores to make sure no team has a score of 0
        do {
            score1 = Math.floor(Math.random() * 101);
            score2 = Math.floor(Math.random() * 101);
        } while (score1 === score2 || score1 === 0 || score2 === 0);

        let result;

        if (score1 > score2) {
            result = team1;
        } else {
            result = team2;
        }

        console.log(`${team1.name} - ${team2.name} (${score1} : ${score2})`);
        return { winner: result, loser: result === team1 ? team2 : team1 };
    }

    listMedalWinners(finalResult, thirdPlaceResult) {
        console.log('\nMedalje:');
        console.log(`1: ${finalResult.winner.name}`);
        console.log(`2: ${finalResult.loser.name}`);
        console.log(`3: ${thirdPlaceResult.winner.name}`);
    }
}

module.exports = PotPhase;
