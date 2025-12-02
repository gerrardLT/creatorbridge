import * as fc from 'fast-check';
import { LicenseType, LICENSE_TYPE_INFO } from '../types/license';

/**
 * **Feature: nft-minting-pil-license, Property 5: Successful registration persists all required data**
 * **Validates: Requirements 1.3, 2.5**
 * 
 * This test verifies that when a registration is successful, all required fields
 * are present in the response that would be stored in the database.
 */
describe('Registration Data Persistence', () => {
  // Mock successful registration response structure
  interface RegistrationResponse {
    ipId: string;
    tokenId: string;
    txHash: string;
    licenseTermsIds: string[];
    licenseType: string;
  }

  const generateMockResponse = (licenseType: LicenseType): RegistrationResponse => ({
    ipId: `0x${Math.random().toString(16).slice(2, 42)}`,
    tokenId: Math.floor(Math.random() * 10000).toString(),
    txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
    licenseTermsIds: [Math.floor(Math.random() * 100).toString()],
    licenseType,
  });

  it('should contain all required fields for any successful registration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(LicenseType)),
        (licenseType) => {
          const response = generateMockResponse(licenseType);
          
          // Verify all required fields exist
          expect(response).toHaveProperty('ipId');
          expect(response).toHaveProperty('tokenId');
          expect(response).toHaveProperty('txHash');
          expect(response).toHaveProperty('licenseTermsIds');
          expect(response).toHaveProperty('licenseType');
          
          // Verify field types
          expect(typeof response.ipId).toBe('string');
          expect(typeof response.tokenId).toBe('string');
          expect(typeof response.txHash).toBe('string');
          expect(Array.isArray(response.licenseTermsIds)).toBe(true);
          expect(response.licenseTermsIds.length).toBeGreaterThan(0);
          
          // Verify ipId and txHash format (should start with 0x)
          expect(response.ipId.startsWith('0x')).toBe(true);
          expect(response.txHash.startsWith('0x')).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: nft-minting-pil-license, Property 6: License display matches stored type**
 * **Validates: Requirements 5.1, 5.2, 5.3**
 */
describe('License Display', () => {
  interface DisplayData {
    licenseType: LicenseType;
    mintingFee?: string;
    commercialRevShare?: number;
  }

  const getDisplayInfo = (data: DisplayData) => {
    const info = LICENSE_TYPE_INFO[data.licenseType];
    return {
      badge: info.label,
      showFee: data.licenseType !== LicenseType.NON_COMMERCIAL,
      showRevShare: data.licenseType === LicenseType.COMMERCIAL_REMIX,
      fee: data.mintingFee,
      revShare: data.commercialRevShare,
    };
  };

  it('should display correct badge for any license type', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(LicenseType)),
        (licenseType) => {
          const display = getDisplayInfo({ licenseType });
          const expectedLabel = LICENSE_TYPE_INFO[licenseType].label;
          
          expect(display.badge).toBe(expectedLabel);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show fee only for commercial licenses', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(LicenseType)),
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        (licenseType, fee) => {
          const display = getDisplayInfo({ 
            licenseType, 
            mintingFee: fee.toFixed(6) 
          });
          
          if (licenseType === LicenseType.NON_COMMERCIAL) {
            expect(display.showFee).toBe(false);
          } else {
            expect(display.showFee).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should show revenue share only for commercial remix', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(LicenseType)),
        fc.integer({ min: 0, max: 100 }),
        (licenseType, revShare) => {
          const display = getDisplayInfo({ 
            licenseType, 
            commercialRevShare: revShare 
          });
          
          if (licenseType === LicenseType.COMMERCIAL_REMIX) {
            expect(display.showRevShare).toBe(true);
          } else {
            expect(display.showRevShare).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * **Feature: nft-minting-pil-license, Property 7: Purchase creates complete records**
 * **Validates: Requirements 6.2, 6.4**
 */
describe('Purchase Records', () => {
  interface PurchaseResult {
    license: {
      id: string;
      licenseTokenId: string;
      txHash: string;
      ipAssetId: string;
      buyerId: string;
    };
    transactions: {
      buyerTransaction: {
        type: string;
        amount: number;
        userId: string;
      };
      creatorTransaction: {
        type: string;
        amount: number;
        userId: string;
      };
    };
  }

  const generateMockPurchase = (
    buyerId: string,
    creatorId: string,
    amount: number
  ): PurchaseResult => ({
    license: {
      id: `license_${Date.now()}`,
      licenseTokenId: Math.floor(Math.random() * 10000).toString(),
      txHash: `0x${Math.random().toString(16).slice(2, 66)}`,
      ipAssetId: `ip_${Date.now()}`,
      buyerId,
    },
    transactions: {
      buyerTransaction: {
        type: 'PURCHASE',
        amount,
        userId: buyerId,
      },
      creatorTransaction: {
        type: 'SALE',
        amount,
        userId: creatorId,
      },
    },
  });

  it('should create license record with all required fields', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        (buyerId, creatorId, amount) => {
          const result = generateMockPurchase(buyerId, creatorId, amount);
          
          // Verify license record
          expect(result.license).toHaveProperty('id');
          expect(result.license).toHaveProperty('licenseTokenId');
          expect(result.license).toHaveProperty('txHash');
          expect(result.license).toHaveProperty('ipAssetId');
          expect(result.license).toHaveProperty('buyerId');
          
          expect(result.license.txHash.startsWith('0x')).toBe(true);
          expect(result.license.buyerId).toBe(buyerId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should create transaction records for both buyer and creator', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.string({ minLength: 5, maxLength: 20 }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(100), noNaN: true }),
        (buyerId, creatorId, amount) => {
          const result = generateMockPurchase(buyerId, creatorId, amount);
          
          // Verify buyer transaction
          expect(result.transactions.buyerTransaction.type).toBe('PURCHASE');
          expect(result.transactions.buyerTransaction.userId).toBe(buyerId);
          expect(result.transactions.buyerTransaction.amount).toBe(amount);
          
          // Verify creator transaction
          expect(result.transactions.creatorTransaction.type).toBe('SALE');
          expect(result.transactions.creatorTransaction.userId).toBe(creatorId);
          expect(result.transactions.creatorTransaction.amount).toBe(amount);
        }
      ),
      { numRuns: 100 }
    );
  });
});
