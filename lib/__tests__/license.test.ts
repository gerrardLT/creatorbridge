import * as fc from 'fast-check';
import { LicenseType } from '../types/license';
import { getLicenseTermsFromType, constructIPMetadata } from '../license-utils';
import { 
  validateMintingFee, 
  validateRevShare, 
  convertToStoryFormat,
  convertFromStoryFormat 
} from '../validation';
import { parseEther, formatEther } from 'viem';

describe('License Terms Mapping', () => {
  /**
   * **Feature: nft-minting-pil-license, Property 1: License type maps to correct PIL terms**
   * **Validates: Requirements 2.2, 2.3, 2.4**
   */
  it('should map NON_COMMERCIAL to correct PIL terms', () => {
    fc.assert(
      fc.property(fc.constant(LicenseType.NON_COMMERCIAL), (licenseType) => {
        const terms = getLicenseTermsFromType(licenseType);
        
        expect(terms.commercialUse).toBe(false);
        expect(terms.derivativesAllowed).toBe(true);
        expect(terms.commercialRevShare).toBe(0);
        expect(terms.defaultMintingFee).toBe(BigInt(0));
      }),
      { numRuns: 100 }
    );
  });

  it('should map COMMERCIAL_USE to correct PIL terms', () => {
    fc.assert(
      fc.property(
        fc.constant(LicenseType.COMMERCIAL_USE),
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        (licenseType, fee) => {
          const feeStr = fee.toFixed(6);
          const terms = getLicenseTermsFromType(licenseType, feeStr);
          
          expect(terms.commercialUse).toBe(true);
          expect(terms.derivativesAllowed).toBe(false);
          expect(terms.commercialRevShare).toBe(0);
          expect(terms.defaultMintingFee > BigInt(0)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should map COMMERCIAL_REMIX to correct PIL terms', () => {
    fc.assert(
      fc.property(
        fc.constant(LicenseType.COMMERCIAL_REMIX),
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        fc.integer({ min: 0, max: 100 }),
        (licenseType, fee, revShare) => {
          const feeStr = fee.toFixed(6);
          const terms = getLicenseTermsFromType(licenseType, feeStr, revShare);
          
          expect(terms.commercialUse).toBe(true);
          expect(terms.derivativesAllowed).toBe(true);
          expect(terms.commercialRevShare).toBe(revShare);
          expect(terms.defaultMintingFee > BigInt(0)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly map all license types', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(LicenseType)),
        fc.float({ min: Math.fround(0.001), max: Math.fround(10), noNaN: true }),
        fc.integer({ min: 0, max: 100 }),
        (licenseType, fee, revShare) => {
          const feeStr = fee.toFixed(6);
          const terms = getLicenseTermsFromType(licenseType, feeStr, revShare);
          
          // All license types should return valid terms
          expect(typeof terms.commercialUse).toBe('boolean');
          expect(typeof terms.derivativesAllowed).toBe('boolean');
          expect(typeof terms.commercialRevShare).toBe('number');
          expect(typeof terms.defaultMintingFee).toBe('bigint');
          
          // Verify mapping rules
          if (licenseType === LicenseType.NON_COMMERCIAL) {
            expect(terms.commercialUse).toBe(false);
          } else {
            expect(terms.commercialUse).toBe(true);
          }
          
          if (licenseType === LicenseType.COMMERCIAL_USE) {
            expect(terms.derivativesAllowed).toBe(false);
          }
          
          if (licenseType === LicenseType.COMMERCIAL_REMIX) {
            expect(terms.derivativesAllowed).toBe(true);
            expect(terms.commercialRevShare).toBe(revShare);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Pricing Validation', () => {
  /**
   * **Feature: nft-minting-pil-license, Property 2: Pricing validation**
   * **Validates: Requirements 3.3, 3.4**
   */
  it('should accept only positive minting fees', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.000001), max: Math.fround(1000000), noNaN: true }),
        (fee) => {
          const feeStr = fee.toString();
          expect(validateMintingFee(feeStr)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject non-positive minting fees', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000000, max: 0, noNaN: true }),
        (fee) => {
          const feeStr = fee.toString();
          expect(validateMintingFee(feeStr)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject invalid minting fee strings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('', '  ', 'abc', 'NaN', 'Infinity', '-Infinity', null, undefined),
        (fee) => {
          expect(validateMintingFee(fee as string)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should accept revenue share between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        (share) => {
          expect(validateRevShare(share)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject revenue share outside 0-100 range', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.integer({ min: -1000, max: -1 }),
          fc.integer({ min: 101, max: 1000 })
        ),
        (share) => {
          expect(validateRevShare(share)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject non-integer revenue share', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.1), max: Math.fround(99.9), noNaN: true }).filter(n => !Number.isInteger(n)),
        (share) => {
          expect(validateRevShare(share)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Pricing Conversion', () => {
  /**
   * **Feature: nft-minting-pil-license, Property 3: Pricing conversion to Story Protocol format**
   * **Validates: Requirements 3.5**
   */
  it('should round-trip convert valid fees', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.000001), max: Math.fround(1000), noNaN: true }),
        (fee) => {
          // Use fixed precision to avoid floating point issues
          const feeStr = fee.toFixed(6);
          const bigintFee = convertToStoryFormat(feeStr);
          const backToStr = convertFromStoryFormat(bigintFee);
          
          // Compare as numbers with tolerance for floating point
          const original = parseFloat(feeStr);
          const converted = parseFloat(backToStr);
          
          expect(Math.abs(original - converted)).toBeLessThan(0.0000001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should convert to correct bigint format', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        (fee) => {
          const feeStr = fee.toFixed(6);
          const bigintFee = convertToStoryFormat(feeStr);
          const expected = parseEther(feeStr);
          
          expect(bigintFee).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Metadata Construction', () => {
  /**
   * **Feature: nft-minting-pil-license, Property 4: Metadata construction completeness**
   * **Validates: Requirements 4.2, 4.3**
   */
  it('should construct metadata with all required fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.webUrl(),
        (title, description, imageUrl) => {
          const metadata = constructIPMetadata(title, description, imageUrl);
          
          // Check all required fields exist
          expect(metadata).toHaveProperty('ipMetadataURI');
          expect(metadata).toHaveProperty('ipMetadataHash');
          expect(metadata).toHaveProperty('nftMetadataURI');
          expect(metadata).toHaveProperty('nftMetadataHash');
          
          // Check types
          expect(typeof metadata.ipMetadataURI).toBe('string');
          expect(typeof metadata.ipMetadataHash).toBe('string');
          expect(typeof metadata.nftMetadataURI).toBe('string');
          expect(typeof metadata.nftMetadataHash).toBe('string');
          
          // Check hash format (should start with 0x)
          expect(metadata.ipMetadataHash.startsWith('0x')).toBe(true);
          expect(metadata.nftMetadataHash.startsWith('0x')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should include image URL in metadata', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 500 }),
        fc.webUrl(),
        (title, description, imageUrl) => {
          const metadata = constructIPMetadata(title, description, imageUrl);
          
          // Image URL should be in the metadata URIs
          expect(metadata.ipMetadataURI).toBe(imageUrl);
          expect(metadata.nftMetadataURI).toBe(imageUrl);
        }
      ),
      { numRuns: 100 }
    );
  });
});
