import { City, closestCity, Coordinates, fuzzySearch } from './index';

const Paris: Coordinates = {
    lat: 48.864716,
    lon: 2.349014,
};

const NewYork: Coordinates = {
    lat: 40.730610,
    lon: -73.935242,
};

const SanFrancisco: Coordinates = {
    lat: 37.733795,
    lon: -122.446747,
};

const ExactMatchTokyo: Coordinates = {
    lat: 35.685,
    lon: 139.7514,
};

describe('GeoLoc', function () {

    describe('closestCity', function() {

        it('should return Paris', function () {

            const result: City = closestCity(Paris);

            expect(result.name).toEqual('Paris');
            expect(result.country).toEqual('France');

        });

        it('should return NewYork', function () {

            const result: City = closestCity(NewYork);

            expect(result.name).toEqual('New York');
            expect(result.country).toEqual('United States');

        });

        it('should return SanFrancisco', function () {

            const result: City = closestCity(SanFrancisco);

            expect(result.name).toEqual('San Francisco');
            expect(result.country).toEqual('United States');

        });

        it('should return Tokyo', function () {

            const result: City = closestCity(ExactMatchTokyo);

            expect(result.name).toEqual('Tokyo');
            expect(result.country).toEqual('Japan');

        });

        it('should return an empty city', function () {

            const result: City = closestCity({
                lon: -100.8834,
                lat: 61.1333,
            });

            expect(result.name).toEqual('Fort McMurray');
            expect(result.country).toEqual('Canada');

        });

    });

    describe('fuzzySearch', function() {

        it('should return results for "Paris"', function() {

            const results = fuzzySearch('Paris', 10);


            expect(results.map((r: any) => r.city.name)).toEqual([
                'Paris',
                'Pariset',
                'Petit Paris',
                'Paraisopolis',
                'Paraiso',
                'Paraiso',
                'Cormeilles-en-Parisis',
                'Le Touquet-Paris-Plage',
                'Kampong Pasir Ris',
                'Petit Paradis',
            ]);

        });

        it('should return results for "Nice"', function() {

            const results = fuzzySearch('Nice', 5);


            expect(results.map((r: any) => r.city.name)).toEqual([
                "Nice",
                "Nibaliw Central",
                "Paniceiro",
                "Saint-Nicolas en Foret",
                "Nagasaka-nichome",
            ]);

        });

        it('should return results for "Strasbourg"', function() {

            const results = fuzzySearch('Strasbourg', 3);


            expect(results.map((r: any) => r.city.name)).toEqual([
                "Strasbourg",
            ]);

        });

    });


});
