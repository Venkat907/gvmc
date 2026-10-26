const mongoose = require('mongoose');

const datasetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Dataset title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Dataset description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Water Supply',
        'Waste Management',
        'Roads and Infrastructure',
        'Public Health',
        'Transportation',
        'Revenue and Taxation',
        'Environment',
        'Urban Planning',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: 'https://gvmc.gov.in',
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    fileFormat: {
      type: String,
      required: [true, 'File format is required'],
      enum: ['CSV', 'JSON', 'XLSX'],
      uppercase: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    license: {
      type: String,
      default: 'Government Open Data License - India (GODL) / CC-BY-4.0',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'published',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    isDemoData: {
      type: Boolean,
      default: true,
    },
    columns: {
      type: [String],
      default: [],
    },
    sampleRows: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    totalRows: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
datasetSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    this.slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
  }
  next();
});

// Text index for search
datasetSchema.index({
  title: 'text',
  description: 'text',
  keywords: 'text',
  department: 'text',
});

module.exports = mongoose.model('Dataset', datasetSchema);
