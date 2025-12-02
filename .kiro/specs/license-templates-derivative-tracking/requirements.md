# Requirements Document

## Introduction

This feature adds two key differentiating capabilities to CreatorBridge: License Templates for creators to save and reuse custom authorization configurations, and Derivative Work Tracking to visualize the IP lineage and relationship graph on Story Protocol.

## Glossary

- **License_Template**: A saved configuration of license terms that creators can reuse when registering new IP assets
- **Derivative_IP**: An IP asset that is created based on another IP asset (parent IP) under its license terms
- **IP_Lineage**: The hierarchical relationship between parent IPs and their derivative works
- **Relationship_Graph**: A visual representation showing connections between original IPs and their derivatives
- **PIL_Terms**: Programmable IP License terms defined by Story Protocol
- **Creator**: A user who registers and owns IP assets on the platform

## Requirements

### Requirement 1: License Template Creation

**User Story:** As a creator, I want to save my license configurations as reusable templates, so that I can quickly apply consistent terms to my future IP registrations.

#### Acceptance Criteria

1. WHEN a creator configures license terms during IP registration THEN the System SHALL provide an option to save the configuration as a named template
2. WHEN a creator saves a license template THEN the System SHALL store the template name, license type, minting fee, revenue share percentage, and any custom PIL parameters
3. WHEN a creator has saved templates THEN the System SHALL display a template selector on the IP creation page
4. WHEN a creator selects a saved template THEN the System SHALL populate all license fields with the template values
5. IF a creator attempts to save a template with a duplicate name THEN the System SHALL prompt for confirmation to overwrite

### Requirement 2: License Template Management

**User Story:** As a creator, I want to manage my saved license templates, so that I can update or remove templates that are no longer needed.

#### Acceptance Criteria

1. WHEN a creator visits their profile page THEN the System SHALL display a list of their saved license templates
2. WHEN a creator edits a template THEN the System SHALL update the stored configuration
3. WHEN a creator deletes a template THEN the System SHALL remove it from storage and confirm the deletion
4. WHEN displaying templates THEN the System SHALL show template name, license type, and pricing summary

### Requirement 3: Derivative IP Registration

**User Story:** As a creator, I want to register my work as a derivative of an existing IP, so that the lineage is tracked on-chain and royalties flow correctly.

#### Acceptance Criteria

1. WHEN a creator registers a derivative IP THEN the System SHALL require selection of the parent IP
2. WHEN registering a derivative THEN the System SHALL verify the creator holds a valid license for the parent IP
3. WHEN a derivative is registered THEN the System SHALL call Story Protocol registerDerivative to establish on-chain relationship
4. WHEN a derivative registration succeeds THEN the System SHALL store the parent-child relationship in the database
5. IF the parent IP does not allow derivatives THEN the System SHALL prevent derivative registration and display an error

### Requirement 4: Derivative Relationship Query

**User Story:** As a user, I want to see all derivatives of an IP asset, so that I can understand how the IP has been used and remixed.

#### Acceptance Criteria

1. WHEN viewing an IP detail page THEN the System SHALL display a count of derivative works
2. WHEN a user requests derivative information THEN the System SHALL query Story Protocol for on-chain derivative data
3. WHEN derivatives exist THEN the System SHALL display a list of derivative IPs with links to their detail pages
4. WHEN an IP is a derivative THEN the System SHALL display its parent IP information

### Requirement 5: IP Lineage Graph Visualization

**User Story:** As a user, I want to see a visual graph of IP relationships, so that I can understand the complete lineage and derivative tree.

#### Acceptance Criteria

1. WHEN viewing an IP with derivatives or parents THEN the System SHALL provide a graph visualization option
2. WHEN rendering the graph THEN the System SHALL display nodes for each IP with title and thumbnail
3. WHEN rendering the graph THEN the System SHALL display directed edges from parent to child IPs
4. WHEN a user clicks a node in the graph THEN the System SHALL navigate to that IP's detail page
5. WHEN the lineage tree is deep THEN the System SHALL support zoom and pan interactions

### Requirement 6: Royalty Flow Tracking

**User Story:** As a creator, I want to see how royalties flow through my IP's derivative tree, so that I can understand my earnings from derivative works.

#### Acceptance Criteria

1. WHEN viewing an IP with derivatives THEN the System SHALL display the configured revenue share percentage
2. WHEN derivatives have generated revenue THEN the System SHALL show accumulated royalties from the derivative tree
3. WHEN displaying royalty information THEN the System SHALL query Story Protocol royalty data

