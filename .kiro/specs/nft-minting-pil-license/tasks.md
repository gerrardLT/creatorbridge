# Implementation Plan

## 1. Database Schema and Types

- [ ] 1.1 Update Prisma schema with license fields
  - Add `licenseType`, `mintingFee`, `commercialRevShare`, `licenseTermsId`, `tokenId`, `spgNftContract` to IPAsset model
  - Run `npx prisma db push` to apply changes
  - _Requirements: 1.3, 2.5_

- [ ] 1.2 Create license type definitions
  - Create `lib/types/license.ts` with `LicenseType` enum and interfaces
  - Define `LicenseConfig`, `PILTermsConfig`, `MintAndRegisterParams`, `MintAndRegisterResult`
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 1.3 Add Story Protocol constants
  - Create `lib/constants/story-protocol.ts` with contract addresses for Aeneid testnet
  - Include WIP_TOKEN_ADDRESS, ROYALTY_POLICY_LAP, PIL_TEMPLATE addresses
  - _Requirements: 3.5_

## 2. Story Protocol Service Enhancement

- [ ] 2.1 Implement license terms mapping function
  - Create `getLicenseTermsFromType(type, mintingFee?, revShare?)` function
  - Map NON_COMMERCIAL to PIL terms with commercialUse=false
  - Map COMMERCIAL_USE to PIL terms with commercialUse=true, derivativesAllowed=false
  - Map COMMERCIAL_REMIX to PIL terms with commercialUse=true, derivativesAllowed=true
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 2.2 Write property test for license terms mapping
  - **Property 1: License type maps to correct PIL terms**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [ ] 2.3 Implement SPG collection creation function
  - Create `createSPGCollection(name, symbol)` using `client.nftClient.createNFTCollection`
  - Return `spgNftContract` address and `txHash`
  - _Requirements: 1.2_

- [ ] 2.4 Implement mint and register with license function
  - Create `mintAndRegisterIPWithLicense(params)` function
  - Use `client.ipAsset.registerIpAsset` with `nft: { type: 'mint', spgNftContract }`
  - Include `licenseTermsData` with PIL flavor based on license type
  - Return `ipId`, `tokenId`, `txHash`, `licenseTermsIds`
  - _Requirements: 1.1, 2.2, 2.3, 2.4_

- [ ] 2.5 Write property test for successful registration data persistence
  - **Property 5: Successful registration persists all required data**
  - **Validates: Requirements 1.3, 2.5**

## 3. Validation Utilities

- [ ] 3.1 Implement pricing validation functions
  - Create `validateMintingFee(fee: string): boolean` - accepts positive numbers only
  - Create `validateRevShare(share: number): boolean` - accepts 0-100 only
  - Create `convertToStoryFormat(fee: string): bigint` using `parseEther`
  - _Requirements: 3.3, 3.4, 3.5_

- [ ] 3.2 Write property tests for pricing validation
  - **Property 2: Pricing validation**
  - **Validates: Requirements 3.3, 3.4**

- [ ] 3.3 Write property test for pricing conversion round-trip
  - **Property 3: Pricing conversion to Story Protocol format**
  - **Validates: Requirements 3.5**

## 4. Metadata Construction

- [ ] 4.1 Implement metadata construction function
  - Create `constructIPMetadata(title, description, imageUrl)` function
  - Generate `ipMetadataURI`, `ipMetadataHash`, `nftMetadataURI`, `nftMetadataHash`
  - Use `toHex` for hash generation
  - _Requirements: 4.2, 4.3_

- [ ] 4.2 Write property test for metadata completeness
  - **Property 4: Metadata construction completeness**
  - **Validates: Requirements 4.2, 4.3**

## 5. Checkpoint - Ensure core services work

- [ ] 5. Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

## 6. API Route Enhancement

- [ ] 6.1 Update IP creation API route
  - Modify `POST /api/ip` to accept `licenseType`, `mintingFee`, `commercialRevShare`, `walletAddress`
  - Call `mintAndRegisterIPWithLicense` when Story Protocol is configured
  - Store all returned data (`ipId`, `tokenId`, `txHash`, `licenseTermsIds`) in database
  - _Requirements: 1.1, 1.3, 2.5_

- [ ] 6.2 Update database operations
  - Modify `createIPAsset` to accept and store license fields
  - Update `findIPAssetById` to return license information
  - _Requirements: 1.3, 5.1, 5.2, 5.3_

## 7. Frontend Components

- [ ] 7.1 Create LicenseSelector component
  - Create `components/LicenseSelector.tsx`
  - Display three options: Non-Commercial, Commercial Use, Commercial Remix
  - Show description for each license type
  - Style with Tailwind to match existing dark theme
  - _Requirements: 2.1_

- [ ] 7.2 Create PricingForm component
  - Create `components/PricingForm.tsx`
  - Show minting fee input when Commercial Use or Commercial Remix selected
  - Show revenue share input (0-100) when Commercial Remix selected
  - Include real-time validation feedback
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 7.3 Update Create page
  - Integrate LicenseSelector and PricingForm into `/app/create/page.tsx`
  - Update form submission to include license data
  - Add loading state during blockchain transaction
  - Handle and display transaction errors
  - _Requirements: 1.1, 1.4, 1.5, 4.4_

- [ ] 7.4 Write property test for license display
  - **Property 6: License display matches stored type**
  - **Validates: Requirements 5.1, 5.2, 5.3**

## 8. IP Asset Display Enhancement

- [ ] 8.1 Create LicenseBadge component
  - Create `components/LicenseBadge.tsx`
  - Display badge based on license type (Non-Commercial, Commercial, Commercial Remix)
  - Use appropriate colors for each type
  - _Requirements: 5.1_

- [ ] 8.2 Update IPCard component
  - Add LicenseBadge to IPCard
  - Show minting fee for Commercial licenses
  - Show revenue share for Commercial Remix licenses
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8.3 Update IP detail page
  - Display full license terms information
  - Show all pricing details
  - Add link to Story Protocol explorer for on-chain verification
  - _Requirements: 5.4_

## 9. License Purchase Enhancement

- [ ] 9.1 Update license purchase API
  - Modify `POST /api/license` to use Story Protocol `mintLicenseTokens`
  - Pass correct `licenseTermsId` from IP asset
  - Create transaction records for both buyer and creator
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 9.2 Write property test for purchase records
  - **Property 7: Purchase creates complete records**
  - **Validates: Requirements 6.2, 6.4**

- [ ] 9.3 Update purchase UI
  - Show license price before purchase
  - Handle insufficient funds error
  - Display transaction confirmation
  - _Requirements: 6.1, 6.3_

## 10. Final Checkpoint

- [ ] 10. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.
