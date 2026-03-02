import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    primaryColor: { type: String, default: '#4f46e5' },
    secondaryColor: { type: String, default: '#0f172a' },
    backgroundColor: { type: String, default: '#ffffff' },
    textColor: { type: String, default: '#0f172a' },
    logoUrl: { type: String, default: '' },
    darkModeEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

siteSettingsSchema.statics.getSingleton = async function () {
  const existing = await this.findOne();
  if (existing) return existing;
  return this.create({});
};

export const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

