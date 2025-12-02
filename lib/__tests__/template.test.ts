import * as fc from 'fast-check';
import { LicenseType } from '@/lib/types/license';
import { PILCustomTerms, CreateTemplateParams } from '@/lib/types/template';

// Mock template storage for testing (simulates database behavior)
class MockTemplateStore {
  private templates: Map<string, any> = new Map();
  private userTemplates: Map<string, Set<string>> = new Map();
  private counter = 0;

  create(params: CreateTemplateParams) {
    const id = `template_${++this.counter}`;
    const template = {
      id,
      userId: params.userId,
      name: params.name,
      licenseType: params.licenseType,
      mintingFee: params.mintingFee || null,
      commercialRevShare: params.commercialRevShare || null,
      customTerms: params.customTerms || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.templates.set(id, template);
    
    if (!this.userTemplates.has(params.userId)) {
      this.userTemplates.set(params.userId, new Set());
    }
    this.userTemplates.get(params.userId)!.add(id);
    
    return template;
  }

  getById(id: string) {
    return this.templates.get(id) || null;
  }

  getByUser(userId: string) {
    const ids = this.userTemplates.get(userId) || new Set();
    return Array.from(ids).map(id => this.templates.get(id)).filter(Boolean);
  }

  update(id: string, params: Partial<CreateTemplateParams>) {
    const template = this.templates.get(id);
    if (!template) return null;
    
    const updated = {
      ...template,
      ...params,
      updatedAt: new Date(),
    };
    this.templates.set(id, updated);
    return updated;
  }

  delete(id: string) {
    const template = this.templates.get(id);
    if (!template) return false;
    
    this.templates.delete(id);
    this.userTemplates.get(template.userId)?.delete(id);
    return true;
  }

  clear() {
    this.templates.clear();
    this.userTemplates.clear();
    this.counter = 0;
  }
}

// Generators
const licenseTypeArb = fc.constantFrom(
  LicenseType.NON_COMMERCIAL,
  LicenseType.COMMERCIAL_USE,
  LicenseType.COMMERCIAL_REMIX
);

const mintingFeeArb = fc.option(
  fc.float({ min: Math.fround(0.001), max: Math.fround(1000), noNaN: true }).map(n => n.toFixed(4)),
  { nil: undefined }
);

const revShareArb = fc.option(
  fc.integer({ min: 0, max: 100 }),
  { nil: undefined }
);

const customTermsArb: fc.Arbitrary<PILCustomTerms | undefined> = fc.option(
  fc.record({
    territories: fc.option(fc.array(fc.string({ minLength: 2, maxLength: 3 }), { minLength: 0, maxLength: 5 })),
    channels: fc.option(fc.array(fc.constantFrom('web', 'mobile', 'print', 'broadcast'), { minLength: 0, maxLength: 4 })),
    attribution: fc.option(fc.boolean()),
    aiTraining: fc.option(fc.boolean()),
  }).map(obj => {
    const result: PILCustomTerms = {};
    if (obj.territories) result.territories = obj.territories;
    if (obj.channels) result.channels = obj.channels;
    if (obj.attribution !== null && obj.attribution !== undefined) result.attribution = obj.attribution;
    if (obj.aiTraining !== null && obj.aiTraining !== undefined) result.aiTraining = obj.aiTraining;
    return Object.keys(result).length > 0 ? result : undefined;
  }),
  { nil: undefined }
).map(v => v ?? undefined);

const templateParamsArb = fc.record({
  userId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
  licenseType: licenseTypeArb,
  mintingFee: mintingFeeArb,
  commercialRevShare: revShareArb,
  customTerms: customTermsArb,
});

describe('License Template Properties', () => {
  let store: MockTemplateStore;

  beforeEach(() => {
    store = new MockTemplateStore();
  });

  /**
   * Property 1: Template persistence round-trip
   * For any valid license template configuration, saving and then loading 
   * the template should return an equivalent configuration with all fields preserved.
   * **Validates: Requirements 1.2, 2.2**
   */
  test('Property 1: Template persistence round-trip', () => {
    fc.assert(
      fc.property(templateParamsArb, (params) => {
        // Create template
        const created = store.create(params);
        
        // Load template
        const loaded = store.getById(created.id);
        
        // Verify all fields are preserved
        expect(loaded).not.toBeNull();
        expect(loaded!.userId).toBe(params.userId);
        expect(loaded!.name).toBe(params.name);
        expect(loaded!.licenseType).toBe(params.licenseType);
        expect(loaded!.mintingFee).toBe(params.mintingFee || null);
        expect(loaded!.commercialRevShare).toBe(params.commercialRevShare || null);
        
        // Custom terms comparison (handle undefined vs null)
        if (params.customTerms) {
          expect(loaded!.customTerms).toEqual(params.customTerms);
        } else {
          expect(loaded!.customTerms).toBeNull();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 3: Template list completeness
   * For any user with saved templates, querying their templates should return 
   * all templates they have created, with no duplicates and no missing entries.
   * **Validates: Requirements 2.1, 2.4**
   */
  test('Property 3: Template list completeness', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            licenseType: licenseTypeArb,
            mintingFee: mintingFeeArb,
            commercialRevShare: revShareArb,
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (userId, templateConfigs) => {
          // Create unique names
          const uniqueNames = new Set<string>();
          const uniqueConfigs = templateConfigs.filter(config => {
            if (uniqueNames.has(config.name)) return false;
            uniqueNames.add(config.name);
            return true;
          });

          // Create templates
          const createdIds = uniqueConfigs.map(config => 
            store.create({ userId, ...config }).id
          );

          // Query user's templates
          const userTemplates = store.getByUser(userId);

          // Verify completeness
          expect(userTemplates.length).toBe(createdIds.length);
          
          // Verify no duplicates
          const returnedIds = userTemplates.map(t => t.id);
          const uniqueReturnedIds = new Set(returnedIds);
          expect(uniqueReturnedIds.size).toBe(returnedIds.length);

          // Verify all created templates are present
          createdIds.forEach(id => {
            expect(returnedIds).toContain(id);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 4: Template deletion removes data
   * For any template that is deleted, subsequent queries for that template 
   * should return not found, and it should not appear in the user's template list.
   * **Validates: Requirements 2.3**
   */
  test('Property 4: Template deletion removes data', () => {
    fc.assert(
      fc.property(templateParamsArb, (params) => {
        // Create template
        const created = store.create(params);
        const templateId = created.id;
        const userId = created.userId;

        // Verify it exists
        expect(store.getById(templateId)).not.toBeNull();
        expect(store.getByUser(userId).some(t => t.id === templateId)).toBe(true);

        // Delete template
        const deleted = store.delete(templateId);
        expect(deleted).toBe(true);

        // Verify it's gone
        expect(store.getById(templateId)).toBeNull();
        expect(store.getByUser(userId).some(t => t.id === templateId)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 2: Template field population
   * For any saved template, selecting it should provide all license fields 
   * with values matching the template's stored values.
   * **Validates: Requirements 1.4**
   */
  test('Property 2: Template field population', () => {
    fc.assert(
      fc.property(templateParamsArb, (params) => {
        // Create and save template
        const created = store.create(params);
        
        // Simulate "selecting" the template (loading for form population)
        const selected = store.getById(created.id);
        
        // Verify all form-relevant fields are available and correct
        expect(selected).not.toBeNull();
        
        // These are the fields that would populate a form
        const formFields = {
          licenseType: selected!.licenseType,
          mintingFee: selected!.mintingFee,
          commercialRevShare: selected!.commercialRevShare,
          customTerms: selected!.customTerms,
        };

        // Verify form fields match original params
        expect(formFields.licenseType).toBe(params.licenseType);
        expect(formFields.mintingFee).toBe(params.mintingFee || null);
        expect(formFields.commercialRevShare).toBe(params.commercialRevShare || null);
        
        if (params.customTerms) {
          expect(formFields.customTerms).toEqual(params.customTerms);
        }
      }),
      { numRuns: 100 }
    );
  });
});
