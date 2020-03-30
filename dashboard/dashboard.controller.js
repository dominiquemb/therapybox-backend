const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const randomColor = require('randomcolor');
const csv = require('csvtojson');

// routes
router.get('/:id/clothes', getClothes);
router.get('/sportslosers', getSportsLosers);
router.get('/sportsnews', getSportsHeadline);

module.exports = router;

const baseHeaders = {
	clothes: {
		uri: 'https://therapy-box.co.uk/hackathon/clothing-api.php?username=swapnil',
	}
};

async function getSportsHeadline(req, res, next) {
	// some dummy data for the dashboard preview
	res.json({
		headline: "Turkey's former goalkeeper Rustu Recber in hospital with coronavirus",
		summary: "The ex-Barcelona and Fenerbahce keeper, 46, won 120 caps and was one of the players of the tournament when Turkey reached the 2002 World Cup semi-finals."
	});
}

async function getSportsLosers(req, res, next) {
	const { query } = req;
	let { team } = query;
	let teamStatus = false;

	if (team) {
		team = team.toLowerCase();

		try {
			csv()
				.fromFile('./assets/I1.csv')
				.then((jsonObj)=>{
					let losingTeams = [];
					for (let [index, teamRow] of Object.entries(jsonObj)) {
						let { HomeTeam, AwayTeam, FTR: winner } = teamRow;
						let losingTeam = false;
						homeTeamLowercase = HomeTeam.toLowerCase();
						awayTeamLowercase = AwayTeam.toLowerCase();

						if (team === homeTeamLowercase) {
							teamStatus = 'H';
						} else if (team === awayTeamLowercase) {
							teamStatus = 'A';
						}

						if (winner === teamStatus) {
							if (teamStatus === 'H') {
								losingTeam = AwayTeam;
							} else if (teamStatus === 'A') {
								losingTeam = HomeTeam;
							}
							if (losingTeams.indexOf(losingTeam) == -1) {
								losingTeams.push(losingTeam);
							};
						}
					}
					res.json(losingTeams);
				});
		} catch (err) {
			res.status(400).json({messages: err});
		}
	} else {
		res.status(400).json({messages: "There was an error fetching sports teams."});
	}
}

async function getClothes(req, res, next) {
	let options = {};
	options.method = 'GET';
	options.uri = baseHeaders.clothes.uri;
	await rp(options)
		.then(function(resp) {
			const clothes = {};
			const percentages = [];
			let total = 0;
			const { payload } = JSON.parse(resp);

			if (payload) {
				for (let item of payload) {
					const { clothe } = item;

					if (!clothes[clothe]) {
						clothes[clothe] = 1;
					} else {
						clothes[clothe] += 1;
					}
				}

				for (let [index, count] of Object.entries(clothes)) {
					total += count;
				}

				for (let [item, number] of Object.entries(clothes)) {
					percentages.push({
						title: item,
						color: randomColor(),
						value: parseFloat(((number/total)*100).toFixed(2))
					});
				}
			}

			res.json(percentages);
		})
		.catch(function(err) {
			res.status(400).json({ message: err })
		});
}