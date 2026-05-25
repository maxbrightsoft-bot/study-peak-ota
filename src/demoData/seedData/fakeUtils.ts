import {
    randNumber,
    randFloat,
    randBoolean,
    randFullName,
    randCity,
    randPhoneNumber,
    randSentence,
    randAlphaNumeric,
    seed
} from '@ngneat/falso';

/**
 * Wrapper for @ngneat/falso to maintain the faker.js API surface
 * used in fakerSeed.ts without needing massive refactoring.
 */
export const faker = {
    seed: (s: number) => seed(String(s)),
    number: {
        int: (opts: { min: number, max: number }) => randNumber({ min: opts.min, max: opts.max }),
        float: (opts: { min: number, max: number, fractionDigits?: number }) => randFloat({ min: opts.min, max: opts.max, fraction: opts.fractionDigits ?? 1 })
    },
    datatype: {
        boolean: (opts?: { probability: number }) => {
            if (opts && opts.probability !== undefined) {
                // Use randNumber to respect falso's internal seed
                return randNumber({ min: 0, max: 100 }) < (opts.probability * 100);
            }
            return randBoolean();
        }
    },
    person: {
        fullName: () => randFullName()
    },
    location: {
        city: () => randCity()
    },
    phone: {
        number: () => randPhoneNumber()
    },
    lorem: {
        sentence: () => randSentence()
    },
    string: {
        alphanumeric: (length: number) => {
            // randAlphaNumeric returns an array of strings
            return randAlphaNumeric({ length }).join('');
        }
    },
    commerce: {
        isbn: () => `978-${randNumber({min: 10, max: 99})}-${randNumber({min: 100, max: 999})}-${randNumber({min: 1000, max: 9999})}-${randNumber({min: 0, max: 9})}`
    },
    helpers: {
        shuffle: <T>(arr: T[]): T[] => {
            const shuffled = [...arr];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = randNumber({ min: 0, max: i });
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
    }
};
