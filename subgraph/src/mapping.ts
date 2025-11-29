import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { IPAsset, License, User } from "../generated/schema";

// Event: IPRegistered(indexed address ipId, indexed uint256 chainId, indexed address tokenContract, uint256 tokenId, string name, string uri, uint256 registrationDate)
export function handleIPRegistered(event: any): void {
  let id = event.params.ipId.toHexString();
  
  let ipAsset = new IPAsset(id);
  ipAsset.ipId = event.params.ipId;
  ipAsset.chainId = event.params.chainId;
  ipAsset.tokenContract = event.params.tokenContract;
  ipAsset.tokenId = event.params.tokenId;
  ipAsset.owner = event.transaction.from;
  ipAsset.name = event.params.name;
  ipAsset.registrationDate = event.params.registrationDate;
  ipAsset.blockNumber = event.block.number;
  ipAsset.transactionHash = event.transaction.hash;
  ipAsset.save();

  // Update user stats
  let userId = event.transaction.from.toHexString();
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.address = event.transaction.from;
    user.ownedIPs = [];
    user.licenses = [];
    user.totalIPsRegistered = BigInt.fromI32(0);
    user.totalLicensesPurchased = BigInt.fromI32(0);
  }
  user.totalIPsRegistered = user.totalIPsRegistered.plus(BigInt.fromI32(1));
  
  let ownedIPs = user.ownedIPs;
  ownedIPs.push(id);
  user.ownedIPs = ownedIPs;
  
  user.save();
}

// Event: LicenseTokensMinted(indexed address caller, indexed address licensorIpId, indexed uint256 licenseTermsId, uint256 amount, address receiver)
export function handleLicenseMinted(event: any): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  
  let license = new License(id);
  license.licenseTokenId = event.logIndex;
  license.licensorIpId = event.params.licensorIpId;
  license.licenseTermsId = event.params.licenseTermsId;
  license.amount = event.params.amount;
  license.receiver = event.params.receiver;
  license.mintedAt = event.block.timestamp;
  license.blockNumber = event.block.number;
  license.transactionHash = event.transaction.hash;
  
  // Link to IP Asset if exists
  let ipAssetId = event.params.licensorIpId.toHexString();
  let ipAsset = IPAsset.load(ipAssetId);
  if (ipAsset != null) {
    license.ipAsset = ipAssetId;
  }
  
  license.save();

  // Update user stats
  let userId = event.params.receiver.toHexString();
  let user = User.load(userId);
  if (user == null) {
    user = new User(userId);
    user.address = event.params.receiver;
    user.ownedIPs = [];
    user.licenses = [];
    user.totalIPsRegistered = BigInt.fromI32(0);
    user.totalLicensesPurchased = BigInt.fromI32(0);
  }
  user.totalLicensesPurchased = user.totalLicensesPurchased.plus(BigInt.fromI32(1));
  
  let licenses = user.licenses;
  licenses.push(id);
  user.licenses = licenses;
  
  user.save();
}
