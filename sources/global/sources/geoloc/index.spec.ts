import { City, closestCity, Coordinates } from './index';

const Paris: Coordinates = {
    lat: 48.864716,
    lon: 2.349014,
};

const Rome: Coordinates = {
    lat: 41.902782,
    lon: 12.496366,
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

    it('should return Paris', function () {

        const result: City = closestCity(Paris);

        expect(result.name).toEqual('Paris');
        expect(result.country).toEqual('France');

    });
    
    it('should return Rome', function () {

        const result: City = closestCity(Rome);

        expect(result.name).toEqual('Rome');
        expect(result.country).toEqual('Italy');

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

        expect(result.name).toEqual('Ennadai');
        expect(result.country).toEqual('Canada');

    });

});
