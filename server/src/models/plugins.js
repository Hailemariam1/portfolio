/**
 * Shared schema behaviour: expose `id` instead of `_id` in JSON and never
 * leak password hashes through an API response.
 */
export function applyApiTransforms(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.passwordHash;
      return ret;
    }
  });
  schema.set('toObject', { virtuals: true });
}

export const mediaSchemaDefinition = {
  url: { type: String, required: true, trim: true },
  publicId: { type: String, default: '', trim: true },
  alt: { type: String, default: '', trim: true }
};
