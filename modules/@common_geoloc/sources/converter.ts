const inputFile = process.argv[2];
const outputFile = process.argv[3];
import fs from 'fs';
import { Database } from 'sqlite3';

const config = {
    densityThreshold: 2500,
    fields: [
        'city_ascii',
        'country',
        'lat',
        'lng',
        'city',
        'admin_name',
        'population',
        'id'
    ],
    densities: [
        {
            country: 'France',
            density: 250
        }
    ]
};

const db = new Database(inputFile);

const getCountryCities = (country: string, density: number): Promise<any[]> => new Promise((ok, ko) => {
    db.all(`select * from worldcities where cast(density as int) > ? and country = ?;`, [
        density,
        country
    ], (err: Error, row: any[]) => {
        if (err) {
            ko(err)
        } else {
            ok(row);
        }
    });
});

const getRestOfTheWorldCountries = (): Promise<any[]> => new Promise((ok, ko) => {
    db.all(`select * from worldcities where cast(density as int) > ? and country not in (?);`, [
        config.densityThreshold,
        config.densities.map(data => data.country).join(',')
    ], (err: Error, row: any[]) => {
        if (err) {
            ko(err);
        } else {
            ok(row);
        }
    });
});

const sortCities = (cities: any[]) => cities.sort((lcity, rcity) => {
    if (parseInt(rcity.ranking, 10) === parseInt(lcity.ranking, 10)) {
        return parseFloat(rcity.density) - parseFloat(lcity.density)
    }
    return parseInt(lcity.ranking, 10) - parseInt(rcity.ranking, 10)
});

const removeDuplicates = (cities: any[]) => cities.filter((city: any, idx: number): boolean => {
    return cities.findIndex((scity: any): boolean => {
        return city.id === scity.id
    }) === idx;
});

const outputFormat = (cities: any[]) => {
    const res = {
        keys: [
            ...config.fields
        ],
        cities: []
    };

    res.cities = cities.map((city: any) => {
        const ret = [];

        for (const field of config.fields) {
            if (field === 'id' || field === 'population') {
                ret.push(parseInt(city[field], 10))
            } else if (field === 'lat' || field === 'lng') {
                ret.push(parseFloat(city[field]))
            } else {
                ret.push(city[field])
            }
        }

        return ret;
    });

    return res;

};

const main = async () => {

    let totalCities = [];

    for (const country of config.densities) {

        const cities = await getCountryCities(country.country, country.density);
        console.log('Recovered cities for', country.country);

        totalCities = [
            ...totalCities,
            ...cities
        ]
    }

    const restOfTheWorldCities = await getRestOfTheWorldCountries();
    console.log('Recovered cities for the rest of the world');

    totalCities = [
        ...totalCities,
        ...restOfTheWorldCities,
    ];

    console.log(`Starting cleaning and processing process on ${totalCities.length} cities`)
    const sortedCities = sortCities(totalCities);
    console.log('Sorted cities');
    const filteredCities = removeDuplicates(sortedCities);
    console.log('Filtered cities');
    const formattedCities = outputFormat(filteredCities);
    console.log('Formatted cities');
    console.log(`Finished cleaning and processing process on ${formattedCities.cities.length} cities`);
    const encodedResult = JSON.stringify(formattedCities);
    console.log('Encoded cities');

    fs.writeFileSync(outputFile, encodedResult);

};

main()
    .then(() => {
        db.close();
        console.log('finished')
    });

//
// console.log(parsed);
