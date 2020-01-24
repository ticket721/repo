export default {
    name: "Justice Woman WorldWide 2020",
    description: "Justice Concert",
    tags: ["french", "electro", "disco"],
    dates: [
        {
            name: 'La Cigale',
            eventBegin: new Date(Date.now() + 24 * 60 * 60 * 1000),
            eventEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            location: {
                label: '120 Boulevard de Rochechouart, 75018 Paris',
                lat: 48.882301,
                lon: 2.340150
            }
        },
        {
            name: 'Bataclan',
            eventBegin: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            eventEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            location: {
                label: '50 Boulevard Voltaire, 75011 Paris',
                lat: 48.863110,
                lon: 2.370870
            }
        }
    ]
}
