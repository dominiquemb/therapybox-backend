const express = require('express');
const router = express.Router();
const rp = require('request-promise');
const randomColor = require('randomcolor');

// routes
router.get('/:id/clothes', getClothes);

module.exports = router;

const baseHeaders = {
	clothes: {
		uri: 'https://therapy-box.co.uk/hackathon/clothing-api.php?username=swapnil',
	}
};

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