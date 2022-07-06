module.exports = {
	name: "ready",
	once: true,
	execute(client) {
		client.user.setActivity(
			{
				"name": "ephec.be",
				"type": "WATCHING",
			}
		);
		console.log("Activity defined as WATCHING EPHEC.BE.");
	},
};