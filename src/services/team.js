class Team {
    constructor(name, isoCode, fibaRanking) {
        this.name = name;
        this.isoCode = isoCode;
        this.fibaRanking = fibaRanking;
        this.wins = 0;
        this.losses = 0;
        this.leaguePoints = 0;
        this.aggregatePoints = 0;
        this.pointsAllowed = 0;
        this.pointsDifferential = 0;
    }
}

module.exports = Team;
