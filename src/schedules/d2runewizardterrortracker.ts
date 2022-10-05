import { EmbedBuilder } from 'discord.js';

fs = require('fs');

let immunityTypes: Map<string, string> = new Map<string, string>();
immunityTypes.set('f', 'Fire');
immunityTypes.set('c', 'Cold');
immunityTypes.set('l', 'Lightning');
immunityTypes.set('p', 'Poison');
immunityTypes.set('ph', 'Physical');
immunityTypes.set('m', 'Magic');

let d2runewizardData: any = {
	'Blood Moor': { immunities: ['f', 'c'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Den of Evil': { immunities: ['f', 'c'], superUniques: ['Corpsefire'], bossPacks: { min: 0, max: 0 } },
	'Cold Plains': { immunities: ['l', 'c'], bossPacks: { min: 7, max: 9 }, superUniques: ['Bishibosh'] },
	'The Cave': {
		immunities: ['f', 'l', 'c'],
		bossPacks: { min: 6, max: 7 },
		superUniques: ['Coldcrow'],
		sparklyChest: 1,
	},
	'Burial Grounds': { immunities: ['l'], superUniques: ['Blood Raven'], bossPacks: { min: 0, max: 0 } },
	'The Crypt': { immunities: ['l'], superUniques: ['Bonebreaker'], bossPacks: { min: 4, max: 5 }, sparklyChest: 1 },
	'The Mausoleum': { immunities: ['l'], superUniques: [], bossPacks: { min: 4, max: 5 }, sparklyChest: 1 },
	'Stony Field': { immunities: ['f', 'c', 'l', 'p'], superUniques: ['Rakanishu'], bossPacks: { min: 7, max: 9 } },
	'Dark Wood': { immunities: ['f', 'c', 'p'], superUniques: ['Treehead Woodfist'], bossPacks: { min: 7, max: 9 } },
	'Black Marsh': { immunities: ['f', 'c', 'l', 'p'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'The Forgotten Tower': {
		immunities: ['f', 'l', 'ph'],
		superUniques: ['The Countess'],
		bossPacks: { min: 15, max: 20 },
	},
	Jail: { immunities: ['f', 'c', 'p', 'ph'], superUniques: ['Pitspawn Fouldog'], bossPacks: { min: 18, max: 24 } },
	'The Pit': { immunities: ['f', 'c'], superUniques: [], bossPacks: { min: 8, max: 11 }, sparklyChest: 1 },
	Cathedral: { immunities: ['f', 'l', 'ph'], superUniques: ['Bone Ash'], bossPacks: { min: 3, max: 3 } },
	Catacombs: { immunities: ['f', 'c', 'l'], superUniques: ['Andariel'], bossPacks: { min: 24, max: 32 } },
	Tristram: { immunities: ['f', 'l', 'p'], superUniques: ['Griswold'], bossPacks: { min: 5, max: 6 } },
	'Moo Moo Farm': { immunities: [], superUniques: ['The Cow King'], bossPacks: { min: 6, max: 8 } },
	Sewers: { immunities: ['f', 'c', 'p', 'm'], superUniques: ['Radament'], bossPacks: { min: 18, max: 24 } },
	'Rocky Waste': { immunities: ['f', 'c', 'l', 'm'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Stony Tomb': { immunities: ['l', 'p'], superUniques: [], bossPacks: { min: 10, max: 14 }, sparklyChest: 1 },
	'Dry Hills': { immunities: ['l', 'p'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Halls of the Dead': {
		immunities: ['f', 'c', 'l', 'p'],
		superUniques: ['Bloodwitch the Wild'],
		bossPacks: { min: 13, max: 18 },
	},
	'Far Oasis': { immunities: [], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Maggot Lair': { immunities: ['l', 'p', 'ph'], superUniques: [], bossPacks: { min: 14, max: 17 } },
	'Lost City': { immunities: ['f', 'c', 'l', 'p', 'm'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Valley of Snakes': { immunities: ['p'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Claw Viper Temple': {
		immunities: ['f', 'c', 'l', 'p', 'm'],
		superUniques: ['Fangskin'],
		bossPacks: { min: 7, max: 10 },
	},
	Harem: { immunities: ['f', 'c', 'l', 'p'], superUniques: [], bossPacks: { min: 0, max: 0 } },
	'Palace Cellar': { immunities: [], superUniques: ['Fire Eye'], bossPacks: { min: 15, max: 21 } },
	'Arcane Sanctuary': {
		immunities: ['f', 'c', 'l', 'p', 'ph'],
		superUniques: ['The Summoner'],
		bossPacks: { min: 7, max: 9 },
	},
	"Tal Rasha's Tombs": {
		immunities: ['f', 'c', 'l', 'p', 'm'],
		superUniques: ['Ancient Kaa The Soulless'],
		bossPacks: { min: 49, max: 63 },
		sparklyChest: 6,
	},
	"Tal Rasha's Chamber": { immunities: [], superUniques: ['Duriel'], bossPacks: { min: 0, max: 0 }, sparklyChest: 0 },
	'Spider Forest': { immunities: ['c', 'l', 'p'], bossPacks: { min: 10, max: 15 } },
	'Spider Cavern': {
		immunities: ['f', 'l', 'p'],
		superUniques: ['Sszark The Burning'],
		bossPacks: { min: 4, max: 5 },
	},
	'Flayer Jungle': {
		immunities: ['f', 'c', 'l', 'p', 'm'],
		superUniques: ['Stormtree'],
		bossPacks: { min: 10, max: 15 },
	},
	'Flayer Dungeon': {
		immunities: ['f', 'c', 'l', 'p', 'ph', 'm'],
		superUniques: ['Witch Doctor Endugu'],
		bossPacks: { min: 12, max: 14 },
	},
	'Lower Kurast': { immunities: ['f', 'l'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Kurast Bazaar': { immunities: ['f', 'c', 'ph'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Ruined Temple': {
		immunities: ['f', 'c', 'm'],
		superUniques: ['Battlemaid Sarina'],
		bossPacks: { min: 4, max: 4 },
	},
	'Disused Fane': { immunities: ['f', 'c', 'l', 'p', 'ph', 'm'], superUniques: [], bossPacks: { min: 4, max: 4 } },
	'Kurast Sewers': {
		immunities: ['c', 'l', 'p', 'm'],
		superUniques: ['Icehawk Riftwing'],
		bossPacks: { min: 12, max: 14 },
		sparklyChest: 1,
	},
	Travincal: {
		immunities: ['c', 'f', 'l', 'p'],
		superUniques: ['Ismail Vilehand', 'Toorc Icefist', 'Geleb Flamefinger'],
		bossPacks: { min: 6, max: 8 },
	},
	'Durance of Hate': {
		immunities: ['c', 'f', 'l', 'p'],
		superUniques: ['Wyand Voidbringer', 'Maffer Dragonhand', 'Bremm Sparkfist', 'Mephisto'],
		bossPacks: { min: 15, max: 21 },
	},
	'Outer Steppes': { immunities: ['f', 'c', 'l'], superUniques: [], bossPacks: { min: 8, max: 10 } },
	'Plains of Despair': { immunities: ['c', 'l', 'p'], superUniques: ['Izual'], bossPacks: { min: 8, max: 10 } },
	'River of Flame': {
		immunities: ['f', 'c', 'l', 'p'],
		superUniques: ['Hephasto The Armorer'],
		bossPacks: { min: 6, max: 7 },
	},
	'City of the Damned': {
		immunities: ['f', 'c', 'l', 'p'],
		superUniques: ['Hephasto The Armorer'],
		bossPacks: { min: 8, max: 10 },
	},
	'Chaos Sanctuary': {
		immunities: ['f', 'c', 'l'],
		superUniques: ['Grand Vizier of Chaos', 'Infector of Souls', 'Lord De Seis', 'Diablo'],
		bossPacks: { min: 6, max: 7 },
	},
	'Bloody Foothills': {
		immunities: ['f', 'c', 'l', 'p'],
		superUniques: ['Dac Farren', 'Shenk The Overseer'],
		bossPacks: { min: 4, max: 6 },
	},
	'Frigid Highlands': {
		immunities: ['f', 'c', 'l', 'p', 'ph', 'm'],
		superUniques: ['Eldritch the Rectifier', 'Sharptooth Slayer', 'Eyeback the Unleashed'],
		bossPacks: { min: 9, max: 11 },
	},
	'Glacial Trail': {
		immunities: ['f', 'c', 'l', 'p', 'ph'],
		superUniques: ['Bonesaw Breaker'],
		bossPacks: { min: 7, max: 9 },
	},
	'Crystalline Passage': { immunities: ['f', 'c', 'p', 'ph'], superUniques: [], bossPacks: { min: 7, max: 9 } },
	'Frozen River': {
		immunities: ['f', 'c', 'l', 'p', 'ph', 'm'],
		bossPacks: { min: 6, max: 8 },
		superUniques: ['Frozenstein'],
	},
	'Arreat Plateau': {
		immunities: ['f', 'c', 'l', 'p'],
		bossPacks: { min: 9, max: 11 },
		superUniques: ['Thresh Socket'],
	},
	"Nihlathak's Temple": { immunities: ['c'], bossPacks: { min: 0, max: 0 }, superUniques: ['Pindleskin'] },
	'Halls of Anguish': { immunities: ['f', 'c', 'l', 'p'], bossPacks: { min: 6, max: 7 }, superUniques: [] },
	'Halls of Pain': { immunities: ['f', 'c', 'l', 'p', 'ph', 'm'], bossPacks: { min: 6, max: 7 }, superUniques: [] },
	'Halls of Vaught': {
		immunities: ['f', 'c', 'l', 'p', 'ph'],
		bossPacks: { min: 0, max: 0 },
		superUniques: ['Nihlathak'],
	},
	"Ancient's Way": { immunities: [], superUniques: [], bossPacks: { min: 0, max: 0 } },
	'Icy Cellar': {
		immunities: ['c', 'l', 'p', 'ph'],
		bossPacks: { min: 6, max: 8 },
		superUniques: ['Snapchip Shatter'],
		sparklyChest: !0,
	},
	'Worldstone Keep': {
		immunities: ['f', 'c', 'l', 'p', 'ph', 'm'],
		bossPacks: { min: 18, max: 24 },
		superUniques: ['Snapchip Shatter'],
	},
	'Throne of Destruction': {
		immunities: ['f', 'c', 'l', 'p', 'ph', 'm'],
		bossPacks: { min: 4, max: 5 },
		superUniques: [
			'Colenzo The Annihilator',
			'Achmel The Cursed',
			'Bartuc The Bloody',
			'Ventar The Unholy',
			'Lister The Tormentor',
		],
	},
	'Worldstone Chamber': { immunities: ['c'], bossPacks: { min: 0, max: 0 }, superUniques: ['Baal'] },
};

let lastReport = 0;

function parse2runewizardTrackerData(data: string) {
	let json = JSON.parse(data);
	if (lastReport === json.terrorZone.lastUpdate.seconds) {
		return;
	}
	lastReport = json.terrorZone.lastUpdate.seconds;
	let zones = json.terrorZone.zone.replace(', and ', ', ').replace(' and ', ', ').replace(' and', '').split(', ');
	// console.log('Zones: ' + zones.toString());
	let zoneData = {
		immunities: Array<string>(),
		bossPacks: {
			min: 0,
			max: 0,
		},
		superUniques: Array<string>(),
	};
	zones.map((zone: any) => {
		if (d2runewizardData[zone] !== undefined) {
			if (d2runewizardData[zone].immunities !== undefined) {
				zoneData.immunities = [...zoneData.immunities, ...d2runewizardData[zone].immunities];
			}
			zoneData.bossPacks.min += d2runewizardData[zone].bossPacks.min;
			zoneData.bossPacks.max += d2runewizardData[zone].bossPacks.max;
			if (d2runewizardData[zone].superUniques !== undefined) {
				zoneData.superUniques = [...zoneData.superUniques, ...d2runewizardData[zone].superUniques];
			}
		} else {
			global.logger.error('Zone not found: "' + zone + '" (full: ' + json.terrorZone.zone + ')');
		}
	});
	// console.dir(zoneData);

	let embed = new EmbedBuilder()
		.setColor(0x0099ff)
		.setTitle(json.terrorZone.zone)
		.setURL('https://d2runewizard.com/terror-zone-tracker')
		.setAuthor({
			name: json.terrorZone.lastReportedBy.displayName,
			iconURL: 'https://d2runewizard.com/icons/favicon-32x32.png',
			url: `https://d2runewizard.com/profile/${json.terrorZone.lastReportedBy.uid}`,
		})
		.setDescription(
			`Reported about <t:${json.terrorZone.lastUpdate.seconds}:R> at <t:${json.terrorZone.lastUpdate.seconds}:T>`
		)
		.addFields(
			{ name: 'Zones', value: json.terrorZone.zone + '.', inline: true },
			{ name: 'Boss packs', value: zoneData.bossPacks.min + ' - ' + zoneData.bossPacks.max, inline: true },
			{ name: '\u200B', value: '\u200B', inline: true },
			{
				name: 'Immunities',
				value: zoneData.immunities.map((a) => immunityTypes.get(a)).join(', ') + '.',
				inline: true,
			},
			{ name: 'Super unique(s)', value: zoneData.superUniques.join(', ') + '.', inline: true },
			{ name: '\u200B', value: '\u200B', inline: true }
		);
	global.bot.channels.cache.get('1022906593400078449').send({ embeds: [embed] });
}

function d2runewizardTracker() {
	let https = require('https');

	let options = {
		host: 'd2runewizard.com',
		path: '/api/terror-zone',
	};

	var request = https.request(options, function (res: any) {
		var data = '';
		res.on('data', function (chunk: any) {
			data += chunk;
		});
		res.on('end', function () {
			parse2runewizardTrackerData(data);
		});
	});
	request.on('error', function (e: any) {
		console.log(e.message);
	});
	request.end();
}

setInterval(d2runewizardTracker, 1000 * 10);
