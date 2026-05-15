module.exports = {
  // OpenAI-compatible relay settings. Keep secrets in .env, not in this file.
  baseUrl: process.env.IMAGE_RELAY_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.IMAGE_RELAY_API_KEY || '',
  editPath: process.env.IMAGE_RELAY_EDIT_PATH || '/images/edits',
  model: process.env.IMAGE_RELAY_MODEL || 'gpt-image-2',

  // Generation defaults.
  size: process.env.IMAGE_RELAY_SIZE || '1024x1024',
  outputFormat: process.env.IMAGE_RELAY_OUTPUT_FORMAT || 'png',
  quality: process.env.IMAGE_RELAY_QUALITY || '',
  background: process.env.IMAGE_RELAY_BACKGROUND || 'auto',
  n: Number(process.env.IMAGE_RELAY_N || 1),
  timeoutMs: Number(process.env.IMAGE_RELAY_TIMEOUT_MS || 150000),

  // Upload limit for the source image sent to the relay.
  maxInputBytes: Number(process.env.IMAGE_RELAY_MAX_INPUT_MB || 20) * 1024 * 1024
};
